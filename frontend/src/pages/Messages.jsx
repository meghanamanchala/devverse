// ===============================
// Messages.jsx — DevVerse Styled Chat UI
// ===============================

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../hooks/useSocket";
import MessageBubble from "../components/Chat/MessageBubble";
import api from "../app/api";
import { useAuth } from "@clerk/clerk-react";
import { UserRound, Send, Search } from "lucide-react";

// Simple initials fallback
const getInitials = (name = "") => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  const socket = useSocket();
  const user = useSelector((state) => state.auth.user);
  const { getToken } = useAuth();
  const messagesEndRef = useRef(null);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      if (!user?.clerkId) return;
      try {
        const token = await getToken();
        const res = await api.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users.filter((u) => u.clerkId !== user.clerkId));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
    fetchUsers();
  }, [user, getToken]);

  // Fetch messages for selected user
  useEffect(() => {
    async function fetchMessages() {
      if (!selectedUser || !user?.clerkId) return;
      try {
        const token = await getToken();
        const res = await api.get(`/messages/${selectedUser.clerkId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && Array.isArray(res.data.messages)) {
          setMessages(res.data.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        setMessages([]);
      }
    }
    fetchMessages();
  }, [selectedUser, user, getToken]);

  // Socket events
  useEffect(() => {
    if (!socket || !selectedUser) return;

    socket.on("receiveMessage", (msg) => {
      if (
        (msg.sender === user.clerkId && msg.receiver === selectedUser.clerkId) ||
        (msg.sender === selectedUser.clerkId && msg.receiver === user.clerkId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", ({ sender, receiver, isTyping }) => {
      if (sender === selectedUser.clerkId && receiver === user.clerkId) {
        setIsTyping(isTyping);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
    };
  }, [socket, selectedUser, user]);

  // Scroll bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!typing && selectedUser) {
      setTyping(true);
      socket.emit("typing", {
        sender: user.clerkId,
        receiver: selectedUser.clerkId,
        isTyping: true,
      });
    }
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setTyping(false);
      if (selectedUser) {
        socket.emit("typing", {
          sender: user.clerkId,
          receiver: selectedUser.clerkId,
          isTyping: false,
        });
      }
    }, 1000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === "" || !selectedUser) return;
    socket.emit("sendMessage", {
      sender: user.clerkId,
      receiver: selectedUser.clerkId,
      text: input,
    });
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0a0f1c] via-[#0b1628] to-[#0d1b33] text-white">
      {/* Sidebar */}
      <aside className="w-80 border-r border-[#223a5e]/60 bg-[#101a2c]/80 backdrop-blur-xl flex flex-col shadow-lg">
        <div className="p-6 border-b border-[#223a5e]/40">
          <h2 className="text-xl font-bold text-gray-100 tracking-wide">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {users.length === 0 && (
            <div className="text-gray-400 text-center mt-10">No users found</div>
          )}
          {users.map((u) => (
            <div
              key={u.clerkId}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center gap-3 px-6 py-4 cursor-pointer border-b border-[#223a5e]/10 transition-all duration-150 ${
                selectedUser?.clerkId === u.clerkId
                  ? "bg-[#1a2740]/80 shadow-inner"
                  : "hover:bg-[#1a2740]/40"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-[#16223a] border-2 border-[#24456c] flex items-center justify-center overflow-hidden">
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    className="w-full h-full rounded-full object-cover"
                    alt={u.username || u.name}
                  />
                ) : (
                  <UserRound className="text-gray-300 w-7 h-7" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-100 text-base">
                  {u.username || u.name || u.email}
                </p>
                {u.isOnline && (
                  <p className="text-xs text-green-400">Online</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-[#101a2c]/80 to-[#1a2740]/80">
        {/* Header */}
        <div className="h-20 border-b border-[#223a5e]/40 bg-[#101a2c]/80 backdrop-blur-xl flex items-center px-8 shadow-md">
          {selectedUser ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#16223a] border-2 border-[#24456c] flex items-center justify-center overflow-hidden">
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    className="w-full h-full rounded-full object-cover"
                    alt={selectedUser.username || selectedUser.name}
                  />
                ) : (
                  <UserRound className="text-gray-300 w-8 h-8" />
                )}
              </div>
              <p className="font-bold text-lg text-gray-100">
                {selectedUser.username || selectedUser.name}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">Select a user to chat</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
          {selectedUser &&
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === user.clerkId ? "justify-end" : "justify-start"
                }`}
              >
                <MessageBubble message={msg} isOwn={msg.sender === user.clerkId} />
              </div>
            ))}

          {selectedUser && messages.length === 0 && (
            <div className="text-gray-400 text-center mt-10">
              No messages yet. Say hi!
            </div>
          )}

          {isTyping && (
            <p className="text-gray-400 text-sm px-2">{selectedUser?.name} is typing…</p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {selectedUser && (
          <form
            onSubmit={handleSend}
            className="p-6 border-t border-[#223a5e]/40 bg-[#101a2c]/80 backdrop-blur-xl flex items-center gap-4 shadow-inner"
          >
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 px-5 py-4 bg-[#0e1c2f]/60 border border-[#1d3557]/40 rounded-2xl text-gray-200 placeholder-gray-400 outline-none focus:border-[#2f6ccb] focus:ring-[#2f6ccb]/40 focus:ring-2 text-base"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 rounded-2xl bg-gradient-to-br from-[#2d67b8] to-[#1b3a78] shadow-lg hover:scale-[1.07] active:scale-95 transition disabled:opacity-50"
            >
              <Send size={22} className="text-white" />
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Messages;
