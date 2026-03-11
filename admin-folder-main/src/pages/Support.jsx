import { useState, useRef, useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { X, Phone, Paperclip, Send, MessageSquare, Headphones, CheckCircle } from "lucide-react";
import api from "../utils/api";
import socket from "../utils/socket";
import toast from "react-hot-toast";

import { useLocation, useNavigate } from "react-router-dom";

export default function Support() {
  const [activeTab, setActiveTab] = useState("Open");
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);

  const location = useLocation();
  const navigate = useNavigate(); // Import navigate
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const messagesRef = useRef(null);

  useEffect(() => {
    // 1. Optimize Socket Connection
    const token = localStorage.getItem('admin_token');
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.context = { token }; // Ensure context is updated
        socket.on('connect_error', () => { setTimeout(() => socket.connect(), 2000) }); // Retry logic
        socket.connect();
      }
    }

    const loadData = async () => {
      setLoading(true);
      await fetchTickets();
      setLoading(false);
    };
    loadData();

    // Socket listeners
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    const handleNewTicket = (newTicket) => {
      setTickets(prev => {
        if (prev.find(t => t._id === newTicket._id)) return prev;
        return [newTicket, ...prev];
      });
      toast('New support ticket raised!', { icon: '🎫' });
    };

    const handleUpdateTicket = (updatedTicket) => {
      setTickets(prev => {
        // Remove existing version if any, and add updated one to top
        const filtered = prev.filter(t => t._id !== updatedTicket._id);
        return [updatedTicket, ...filtered];
      });

      // Update active view if open
      setCurrentTicket(prev => {
        if (prev && prev._id === updatedTicket._id) {
          setMessages(updatedTicket.messages);
          return updatedTicket;
        }
        return prev;
      });
    };

    socket.on('support:new_ticket', handleNewTicket);
    socket.on('support:update', handleUpdateTicket);

    return () => {
      socket.off('support:new_ticket', handleNewTicket);
      socket.off('support:update', handleUpdateTicket);
      // Do not disconnect socket on unmount to keep it alive for dashboard
    };
  }, []);

  const handleError = (msg) => toast.error(msg);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/support');
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (ticket = null) => {
    if (!ticket) {
      // NEW Ticket Mode
      setIsCreating(true);
      setCurrentTicket({
        description: '',
        status: 'New'
      });
      setMessages([]);
    } else {
      setIsCreating(false);
      setCurrentTicket(ticket);
      setMessages(ticket.messages || []);
      // Mark as read or fetch latest?
      // Re-fetch to be sure
      // api.get(`/support/${ticket._id}`) ... 
    }
    setInput("");
    setShowModal(true);
  };

  const closeModal = () => {
    setCurrentTicket(null);
    setMessages([]);
    setShowModal(false);
    setIsCreating(false);
    setInput("");
    // fetchTickets(); // Removed redundant refetch to improve speed
  };

  useEffect(() => {
    // scroll to bottom on messages change
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (location.state?.ticketId && tickets.length > 0) {
      const target = tickets.find(t => t._id === location.state.ticketId);
      if (target) {
        // Only open if not already open matching this ticket
        if (!currentTicket || currentTicket._id !== target._id) {
          openModal(target);
        }
        // Clean up the state so refreshing/closing doesn't reopen it
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [tickets, location, navigate]);


  const handleCreateTicket = async () => {
    if (!input.trim()) return;
    try {
      const { data } = await api.post('/support', { description: input });
      toast.success("Ticket Created");
      // Add to list optimistically instead of refetching
      setTickets(prev => [data.ticket || data, ...prev]);
      closeModal();
    } catch (err) {
      toast.error("Failed to create ticket");
    }
  };

  const sendMessage = async () => {
    if (!input?.trim()) return;

    if (isCreating) {
      handleCreateTicket();
      return;
    }

    // Add optimistic message
    const tempMsg = {
      id: Date.now(),
      from: 'admin',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, tempMsg]);
    const txt = input;
    setInput('');

    try {
      const { data } = await api.post(`/support/${currentTicket._id}/message`, { text: txt, from: 'admin' });
      // The socket listener 'support:update' will handle updating the messages state
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleResolve = async () => {
    if (!currentTicket) return;
    try {
      await api.put(`/support/${currentTicket._id}/resolve`);
      toast.success("Ticket marked as Resolved");
      // Update local state optimistically
      setTickets(prev => prev.map(t => t._id === currentTicket._id ? { ...t, status: 'Resolved' } : t));
      closeModal();
    } catch (err) {
      toast.error("Failed to resolve ticket");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <PageWrapper>
      <div className="px-4 sm:px-6 py-6 space-y-6 animate-page">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Support</h1>
          </div>
          <button
            onClick={() => openModal()}
            className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg 
                       hover:bg-gray-900 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            Raise a Ticket
          </button>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {["Open", "Resolved"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-6 sm:px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                ${activeTab === tab
                  ? "bg-black text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 hover:text-black"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-8 w-1/6 bg-gray-100 rounded-md"></div>
                    <div className="h-8 w-1/4 bg-gray-100 rounded-md"></div>
                    <div className="h-8 w-1/3 bg-gray-100 rounded-md"></div>
                    <div className="h-8 w-1/6 bg-gray-100 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Ticket Id</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Raised By</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Description</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Ticket Created</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Latest Update</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {tickets.filter(t => activeTab === "Open" ? t.status !== "Resolved" : t.status === "Resolved")
                    .map(ticket => (
                      <tr
                        key={ticket._id}
                        onClick={() => openModal(ticket)}
                        className="hover:bg-blue-50/30 cursor-pointer transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-blue-600 font-bold">
                          #{ticket._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{ticket.raisedBy}</td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{ticket.description || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="block font-medium text-gray-900">{ticket.date}</span>
                          <span className="text-xs text-gray-400">{ticket.time}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold border
                        ${ticket.status === "Open"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                              : "bg-green-50 text-green-700 border-green-100"}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs text-nowrap">
                          {ticket.update}
                        </td>
                      </tr>
                    ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                        No tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* MODERN CHAT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-0 sm:p-4">
            <div className="bg-white w-full max-w-[500px] h-full sm:h-[80vh] sm:max-h-[700px] flex flex-col rounded-none sm:rounded-3xl shadow-2xl animate-scaleIn overflow-hidden relative">

              {/* HEADER */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-xl text-gray-900">{isCreating ? 'New Request' : 'Support Chat'}</h2>
                  {currentTicket?._id && <p className="text-xs text-gray-500 font-medium mt-1">Ticket ID: {currentTicket._id}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {!isCreating && currentTicket?.status !== 'Resolved' && (
                    <button
                      onClick={handleResolve}
                      className="p-2 hover:bg-green-50 text-green-600 rounded-full transition-colors title='Mark as Resolved'"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* TICKET CARD (Context) */}
              <div className="px-6 py-4 bg-white border-b border-gray-50 shadow-sm z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Headphones size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{currentTicket?.description || "Describe your issue..."}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${currentTicket?.status === 'Open' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <p className="text-xs text-gray-500">{currentTicket?.status || 'Draft'}</p>
                  </div>
                </div>
              </div>

              {/* CHAT AREA */}
              <div ref={messagesRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white no-scrollbar">
                {isCreating ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <MessageSquare size={48} className="mb-4 text-blue-300" />
                    <p className="text-lg font-bold text-gray-500">How can we help?</p>
                    <p className="text-sm text-gray-400">Describe your issue below to start a ticket.</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <MessageSquare size={64} className="mb-4 text-gray-300" />
                    <p className="text-lg font-bold text-gray-400">No messages yet</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id || Math.random()} className={`flex gap-3 ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      {m.from !== 'admin' && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 mt-1">
                          USR
                        </div>
                      )}

                      <div className={`group relative px-5 py-3.5 rounded-3xl max-w-[75%] 
                        ${m.from === 'admin'
                          ? 'bg-black text-white rounded-tr-sm shadow-md'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        } active:scale-[0.98] transition-all`}>
                        <p className="text-sm leading-relaxed">{m.text}</p>
                        <span className={`text-[9px] font-medium absolute -bottom-5 ${m.from === 'admin' ? 'right-1 text-gray-400' : 'left-1 text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                          {m.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* INPUT AREA */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="bg-gray-50 rounded-full px-2 py-2 flex items-center border border-transparent focus-within:border-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">

                  <input
                    placeholder={isCreating ? "Desribe issue to create ticket..." : "Type your message..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-sm px-4 text-gray-900 placeholder:text-gray-400"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className={`h-10 px-5 rounded-full font-bold text-sm flex items-center gap-2 transition-all
                      ${input.trim()
                        ? 'bg-black text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <span>{isCreating ? 'Create' : 'Send'}</span>
                    <Send size={14} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
