"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const ChatApp = () => {
  const { communityId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/communities/${communityId}/messages`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    const newSocket = io("http://localhost:5000", {
      auth: { token: user.token },
    });

    newSocket.emit("joinCommunity", communityId);
    newSocket.on("newMessage", (message) => setMessages((prev) => [...prev, message]));
    setSocket(newSocket);

    return () => {
      newSocket.emit("leaveCommunity", communityId);
      newSocket.close();
    };
  }, [communityId, user.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit("sendMessage", { communityId, content: input.trim() });
      setInput("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="h-96 overflow-y-auto p-4 border-b border-gray-300">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-3 p-3 rounded-lg ${msg.sender._id === user._id ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-gray-900"}`}
          >
            <span className="block text-xs font-medium">{msg.sender.username}</span>
            <span>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-l-lg"
        />
        <button onClick={sendMessage} className="bg-red-600 text-white px-4 py-2 rounded-r-lg">Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
