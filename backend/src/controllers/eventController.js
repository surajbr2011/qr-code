const Event = require('../models/Event');

const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ isActive: true }).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, type } = req.body;
        const event = new Event({ title, description, date, time, type });
        const createdEvent = await event.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('event:new', createdEvent);
        }

        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            event.isActive = false;
            await event.save();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEvents, createEvent, deleteEvent };
