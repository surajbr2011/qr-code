import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import {
  FiArrowLeft,
  FiPhone,
  FiMic,
  FiSmile,
  FiImage,
  FiSend,
  FiX,
  FiMessageSquare
} from "react-icons/fi";
import api from "../utils/api";
import socket from "../utils/socket";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const emojis = ["😀", "😂", "😍", "😢", "😡", "👍", "🙏", "🎉", "❤️"];

export default function Support() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const { theme, isAvengerMode } = useTheme();

  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing ticket on mount
  useEffect(() => {
    // Force socket reconnection to ensure we are authenticated
    const token = localStorage.getItem("token");
    if (token) {
      socket.auth = { token };
      // Always reconnect to ensure we are in the correct room
      socket.disconnect().connect();
    }
    fetchActiveTicket();
  }, []);

  const fetchActiveTicket = async () => {
    try {
      // Get all tickets for user
      const { data } = await api.get('/support');
      // Find the most recent open ticket, or just the last one
      const openTicket = data.find(t => t.status !== 'Resolved') || data[data.length - 1];

      if (openTicket) {
        setActiveTicket(openTicket);
        setMessages(openTicket.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  // Socket Listener for real-time messages
  useEffect(() => {
    const handleNewMessage = (updatedTicket) => {
      console.log("Real-time Support Update:", updatedTicket);
      if (activeTicket && activeTicket._id === updatedTicket._id) {
        setMessages(updatedTicket.messages);
      } else if (!activeTicket) {
        setActiveTicket(updatedTicket);
        setMessages(updatedTicket.messages);
      }
    };

    socket.on('support:message', handleNewMessage);

    return () => {
      socket.off('support:message', handleNewMessage);
    };
  }, [activeTicket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 🎤 VOICE INPUT */
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported");
    const recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.onresult = (e) => setMessage(e.results[0][0].transcript);
    recog.start();
  };

  /* 🖼️ IMAGE */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  /* 🔗 SEND + BACKEND */
  const sendMessage = async () => {
    if (!message && !image) return;

    try {
      let ticketId = activeTicket?._id;
      let newMessages = [...messages];

      // Optimistic UI
      const tempMsg = {
        text: message,
        image,
        type: "sent",
        createdAt: new Date()
      };

      setMessages([...newMessages, tempMsg]);
      setMessage("");
      setImage(null);

      if (!ticketId) {
        // CREATE NEW TICKET
        const { data } = await api.post('/support', { description: message }); // Use first message as description
        setActiveTicket(data);
        ticketId = data._id;
        toast.success("Support Ticket Created");
        // The backend might return the initial message in the ticket object
        if (data.messages) setMessages(data.messages);
      } else {
        // ADD MESSAGE TO EXISTING TICKET
        const { data } = await api.post(`/support/${ticketId}/message`, { text: tempMsg.text, from: 'user' });
        // Update with server state (including admin replies if any)
        setMessages(data.messages);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  return (
    <PageWrapper className={`h-screen flex flex-col max-w-[430px] mx-auto transition-colors duration-500 ${theme.bg}`}>

      {/* HEADER */}
      <header className={`h-14 border-b px-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-500 ${theme.headerBg} ${theme.border}`}>
        <FiArrowLeft onClick={() => navigate(-1)} className={`cursor-pointer text-xl ${theme.text}`} />
        <div className="flex flex-col items-center">
          <h1 className={`text-sm font-bold ${theme.text}`}>Support Chat</h1>
          {activeTicket && <span className={`text-[10px] ${theme.textSec}`}>Ticket #{activeTicket._id.slice(-4)}</span>}
        </div>
        <FiPhone className={`text-xl ${theme.text}`} />
      </header>

      {/* CHAT */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isAvengerMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        {loading ? (
          <div className={`text-center mt-10 ${theme.textSec}`}>Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className={`text-center mt-20 flex flex-col items-center ${theme.textSec}`}>
            <FiMessageSquare size={40} className="mb-2 opacity-20" />
            <p>Start a conversation with us!</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${m.from === 'admin' || m.type === 'received' // Handle both backend and mock conventions just in case
                ? (isAvengerMode
                  ? "bg-slate-800 text-slate-200 mr-auto rounded-tl-none border border-slate-700"
                  : "bg-white text-gray-800 mr-auto rounded-tl-none border border-gray-100")
                : (isAvengerMode
                  ? "bg-red-900 text-white ml-auto rounded-tr-none shadow-red-900/20"
                  : "bg-black text-white ml-auto rounded-tr-none")
                }`}
            >
              {m.text}
              {m.image && (
                <img src={m.image} alt="" className="mt-2 rounded-lg w-full" />
              )}
              <p className={`text-[9px] mt-1 text-right opacity-60 ${m.from === 'admin' ? (isAvengerMode ? 'text-slate-400' : 'text-gray-400') : 'text-gray-300'}`}>
                {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* EMOJI PICKER */}
      {showEmoji && (
        <div className={`grid grid-cols-5 gap-2 p-3 border-t ${theme.headerBg} ${theme.border}`}>
          {emojis.map((e) => (
            <button
              key={e}
              onClick={() => {
                setMessage((p) => p + e);
                setShowEmoji(false);
              }}
              className={`text-xl p-2 rounded ${isAvengerMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {image && (
        <div className={`px-3 pb-2 ${theme.headerBg}`}>
          <div className="relative w-32">
            <img src={image} className="rounded-lg border" />
            <FiX
              className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow cursor-pointer text-black"
              onClick={() => setImage(null)}
            />
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className={`border-t px-3 py-3 flex items-center gap-3 ${theme.headerBg} ${theme.border}`}>
        <div className={`flex-1 flex items-center rounded-full px-4 py-2 border transition-all 
            ${isAvengerMode
            ? 'bg-slate-800 border-slate-700 focus-within:border-slate-500 focus-within:bg-slate-800'
            : 'bg-gray-100 border-gray-100 focus-within:border-gray-300 focus-within:bg-white'}`}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 bg-transparent border-none outline-none text-sm min-w-0 ${theme.text}`}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <FiMic className={`${theme.textSec} cursor-pointer hover:text-gray-600 ml-2`} onClick={startVoice} />
        </div>

        <div className={`flex items-center gap-3 ${theme.textSec}`}>
          <FiSmile className={`cursor-pointer text-xl ${isAvengerMode ? 'hover:text-slate-200' : 'hover:text-gray-700'}`} onClick={() => setShowEmoji(!showEmoji)} />
          <FiImage className={`cursor-pointer text-xl ${isAvengerMode ? 'hover:text-slate-200' : 'hover:text-gray-700'}`} onClick={() => fileRef.current.click()} />
          <button
            onClick={sendMessage}
            disabled={!message && !image}
            className={`p-2.5 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:shadow-none
                ${isAvengerMode
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/30'
                : 'bg-orange-500 text-white hover:bg-orange-600'}`}
          >
            <FiSend />
          </button>
        </div>

        <input type="file" hidden ref={fileRef} onChange={handleImage} />
      </div>
    </PageWrapper>
  );
}
