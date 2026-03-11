import { useState, useRef, useEffect } from "react";
import PageWrapper from "../../components/PageWrapper";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiPhone, FiMic, FiSmile, FiImage, FiSend, FiMessageSquare } from "react-icons/fi";
import api from "../../utils/api";
import socket from "../../utils/socket";
import { toast } from "react-hot-toast";

export default function Support() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Force socket reconnection to ensure we are authenticated
    const token = localStorage.getItem("staff_token");
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      } else {
        // If already connected, we might need to reconnect to update auth if it changed
        // But simpler is to always reconnect on this page to be safe
        socket.disconnect().connect();
      }
    }

    fetchActiveTicket();
  }, []);

  const fetchActiveTicket = async () => {
    try {
      const { data } = await api.get('/support');
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

  useEffect(() => {
    const handleMessage = (updatedTicket) => {
      console.log("Socket Update Ticket:", updatedTicket);
      if (activeTicket && activeTicket._id === updatedTicket._id) {
        setMessages(updatedTicket.messages);
      } else if (!activeTicket) {
        setActiveTicket(updatedTicket);
        setMessages(updatedTicket.messages);
      }
    };

    socket.on('support:message', handleMessage);
    return () => socket.off('support:message');
  }, [activeTicket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    try {
      let ticketId = activeTicket?._id;
      const text = inputText;
      setInputText("");

      if (!ticketId) {
        const { data } = await api.post('/support', { description: text });
        setActiveTicket(data);
        setMessages(data.messages || []);
        toast.success("Support Ticket Created");
      } else {
        const { data } = await api.post(`/support/${ticketId}/message`, { text, from: 'user' }); // From 'user' perspective (Staff is a user here)
        console.log("Message Sent Response:", data);
        setMessages(data.messages);
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate generic image upload
      const newMessage = {
        id: Date.now(),
        text: `Sent an image: ${file.name}`,
        sender: "support",
        isImage: true
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  return (
    <PageWrapper className="pb-24 bg-white min-h-screen max-w-[430px] mx-auto">
      {/* HEADER */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="">
            <FiChevronLeft size={28} className="text-black" />
          </button>
          <h1 className="text-xl font-bold text-black">Support</h1>
        </div>
        <button className="p-1">
          <FiPhone size={24} className="text-black" />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="px-4 py-4 space-y-3 pb-32 flex flex-col">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading chat...</p>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
            <FiMessageSquare size={40} className="mb-2 opacity-20" />
            <p>Need help? Message Admin.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.from === 'user';
            return (
              <div
                key={i}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 text-sm font-medium rounded-2xl ${isMe
                    ? "bg-[#E5E7EB] text-black rounded-tr-sm" // Right side
                    : "bg-black text-white rounded-tl-sm" // Left side
                    }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-[70px] left-1/2 -translate-x-1/2 w-full max-w-[420px] px-4 z-20">
        <div className="bg-white border border-gray-200 rounded-2xl flex items-center px-3 py-2 shadow-sm gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 bg-transparent outline-none text-sm text-black placeholder-gray-400"
          />

          <button className="text-gray-500 hover:text-black transition-colors">
            <FiMic size={20} />
          </button>
          <button className="text-gray-500 hover:text-black transition-colors">
            <FiSmile size={20} />
          </button>
          <button onClick={handleFileClick} className="text-gray-500 hover:text-black transition-colors">
            <FiImage size={20} />
          </button>

          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2 rounded-full transition-all ${inputText.trim() ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
          >
            <FiSend size={18} />
          </button>
        </div>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Spacer for layout */}
      <div className="h-4"></div>
    </PageWrapper>
  );
}
