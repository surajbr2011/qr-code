const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification'); // Import Notification Model

const getTickets = async (req, res) => {
    try {
        let query = { user: req.user._id };

        // If admin, return all tickets
        if (req.user.role === 'admin') {
            query = {};
        }

        const tickets = await Ticket.find(query).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTicket = async (req, res) => {
    try {
        const { description } = req.body;

        let identity = req.user.name || 'User';
        if (req.user.tableRoom) identity += ` (Table/Room: ${req.user.tableRoom})`;
        if (req.user.role && req.user.role !== 'customer') identity += ` (${req.user.role})`;

        const newTicket = new Ticket({
            user: req.user._id,
            description,
            raisedBy: identity,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: [{
                id: Date.now().toString(),
                from: 'user',
                text: description,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]
        });

        const createdTicket = await newTicket.save();

        // Notify admin via socket (if there's a global admin room or notification system)
        const io = req.app.get('io');

        // PERSIST NOTIFICATION TO DB
        const isStaff = ['staff', 'waiter', 'chef', 'manager'].includes(req.user.role);
        const notifType = isStaff ? 'system' : 'alert';
        const notifIdentity = req.user.name || (isStaff ? 'Staff' : 'Guest');

        const newNotification = new Notification({
            title: `New Support Ticket`,
            message: `${notifIdentity}: ${description}`,
            type: notifType, // 'system' or 'alert'
            metadata: {
                tableNo: req.user.tableRoom || 'N/A',
                ticketId: createdTicket._id
            }
        });
        // We can add ticketId to metadata if needed, but schema uses orderId/tableNo loosely
        // To be safe and cleaner, let's just stick to what works or add ticketId to schema if strictly needed,
        // but for now, the frontend uses `ticketId` from the socket payload.
        // The Notification Model might not have ticketId field explicitly.
        // Let's check model again. Model has metadata: { orderId, tableNo }.
        // We can store ticketId in metadata or just ignore persistence linking strictly for now perfectly.
        // ACTUALLY, checking the Frontend: handleNotificationClick checks `notif.ticketId`.
        // If I save to DB, and fetch from DB, the DB object won't have `ticketId` unless I adjust schema or put it in metadata and frontend reads metadata.
        // However, standard Mongoose allows flexible schemas if strict is false, OR I can just save it.
        // BUT schema was defined with strict structure.
        // Let's Add ticketId to the Schema if I can, OR just assume metadata.
        // The Notification model shown earlier:
        /*
            metadata: {
                orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
                tableNo: String
            }
        */
        // So I cannot easily store ticketId at root efficiently without schema change.
        // I should probably update the Schema to include ticketId.
        // OR I can piggyback on metadata if I update frontend to look there?
        // Frontend: `if (notif.ticketId) ...`. It expects it at root.
        // So to persist it correctly for reload, I MUST update the Notification Schema to include ticketId.

        // WAIT. I'll update the schema in a separate step if I have to.
        // For now, let's just save the text so at least the notification appears, even if clicking it might not go to the ticket deep link perfectly after refresh.
        // Better plan: Add `ticketId` to the Notification Schema first.

        await newNotification.save();

        if (io) {
            io.emit('support:new_ticket', createdTicket);

            io.emit('notification:new', {
                ...newNotification.toObject(),
                ticketId: createdTicket._id // Ensure socket payload has it at root for immediate action
            });
        }

        res.status(201).json(createdTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addMessage = async (req, res) => {
    try {
        const { text, from } = req.body;

        // Use provided 'from' (e.g., 'user' from Staff App) or fallback to role-based default
        // This allows 'admin' role to send as 'user' if they are using the Staff/User App
        const sender = from || (req.user.role === 'admin' ? 'admin' : 'user');

        const msg = {
            id: Date.now().toString(),
            from: sender,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date()
        };

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            {
                $push: { messages: msg },
                $set: { update: text, status: 'Open' }
            },
            { new: true }
        );

        if (ticket) {
            // Emit socket event for real-time chat
            const io = req.app.get('io');

            // PERSIST NOTIFICATION TO DB
            const isStaff = ['staff', 'waiter', 'chef', 'manager'].includes(req.user.role);
            const notifType = isStaff ? 'system' : 'alert';
            const identity = req.user.name || (isStaff ? 'Staff' : 'Guest');

            const newNotification = new Notification({
                title: `New Message from ${identity}`,
                message: text,
                type: notifType,
                metadata: {
                    tableNo: req.user.tableRoom || 'N/A',
                    ticketId: ticket._id
                }
            });
            const savedNotif = await newNotification.save();

            // Debug Logs (File)
            const fs = require('fs');
            try {
                fs.appendFileSync('debug_support.log', `[SAVED DB] ID: ${savedNotif._id} Title: ${savedNotif.title} Type: ${savedNotif.type}\n`);
            } catch (dbErr) { console.error(dbErr); }

            if (io) {
                // Emit to the specific user's room
                io.to(`user_${ticket.user}`).emit('support:message', ticket);
                // Broadcast to all admins
                io.emit('support:update', ticket);

                // Debug Logs (File)
                const fs = require('fs');
                const logMsg = `[${new Date().toISOString()}] Sending Notif: Type=${notifType}, Role=${req.user.role}, IsStaff=${isStaff}\n`;

                try {
                    fs.appendFileSync('debug_support.log', logMsg);
                    console.log(`[Support] Emitting update for ticket ${ticket._id}`);
                    io.emit('notification:new', {
                        ...newNotification.toObject(),
                        ticketId: ticket._id // Inject ticketId for immediate navigation
                    });
                } catch (e) {
                    console.error("Log Error:", e);
                }
            } else {
                const fs = require('fs');
                fs.appendFileSync('debug_support.log', `[${new Date().toISOString()}] ERROR: IO not found\n`);
                console.error("[Support] IO instance not found!");
            }

            res.json(ticket);
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resolveTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (ticket) {
            ticket.status = 'Resolved';
            await ticket.save();

            // Notify Admin
            const io = req.app.get('io');
            if (io) {
                io.emit('support:update', ticket);
            }

            // DELETE ALERTS related to this ticket so they disappear from dashboard
            await Notification.deleteMany({ "metadata.ticketId": ticket._id });

            res.json(ticket);
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getTickets, createTicket, addMessage, resolveTicket };
