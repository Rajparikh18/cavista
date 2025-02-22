"use client"

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import "./ChatApp.css";
import Message from "../../../backend/models/Message.js";


function ChatApp() {
  const { communityId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [visibleReplies, setVisibleReplies] = useState({});
  const [username, setUsername] = useState("");
  const REPLIES_PER_PAGE = 5;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/communities/${communityId}/messages`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
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

    newSocket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leaveCommunity", communityId);
      newSocket.close();
    };
  }, [communityId, user.token]);

  const handleLike = async (messageId) => {
    try {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? { ...msg, hasLiked: !msg.hasLiked, Likes: msg.hasLiked ? msg.Likes - 1 : msg.Likes + 1 }
            : msg
        )
      );

      await fetch(
        `http://localhost:5000/api/communities/${communityId}/messages/${messageId}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const fetchReplies = async (messageId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/communities/${communityId}/messages/${messageId}/replies`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch replies");
      }
  
      const replies = await response.json(); // This now includes populated sender usernames
  
      // Update state with new replies
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, Replies: replies } : msg
        )
      );
  
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };
  

  const toggleReplies = async (messageId) => {
    setExpandedReplies((prev) => {
      const newState = { ...prev, [messageId]: !prev[messageId] };
      if (newState[messageId]) {
        fetchReplies(messageId);
        setVisibleReplies((prev) => ({
          ...prev,
          [messageId]: REPLIES_PER_PAGE,
        }));
      }
      return newState;
    });
  };

  const submitReply = async (messageId) => {
    try {
      console.log("enterend 121 line number");
      const content = replyInputs[messageId];
      if (!content?.trim()) return;

      const response = await fetch(
        `http://localhost:5000/api/communities/${communityId}/messages/${messageId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        // Clear the input field
        setReplyInputs((prev) => ({ ...prev, [messageId]: "" }));
        
        // Fetch updated replies
        fetchReplies(messageId);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleReplySubmit = async (e, messageId) => {
    e.preventDefault(); // Prevent form submission
    await submitReply(messageId);
    window.location.reload();
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg._id} className="post">
            <div className="post-header">
              <span className="author">{msg.sender.username}</span>
              <span className="timestamp">{new Date(msg.createdAt).toLocaleString()}</span>
            </div>
            <div className="post-content">{msg.content}</div>
            <div className="post-actions">
              <button className={`like-button ${msg.hasLiked ? "liked" : ""}`} onClick={() => handleLike(msg._id)}>
                <span className="like-icon">{msg.hasLiked ? "❤️" : "🤍"}</span>
                <span className="like-count">{msg.Likes || 0}</span>
              </button>
              <button className="reply-button" onClick={() => toggleReplies(msg._id)}>
                💬 {msg.Replies?.length || 0} Replies
              </button>
            </div>
            {expandedReplies[msg._id] && (
              <div className="replies show">
                {msg.Replies?.slice(0, visibleReplies[msg._id]).map((reply) => (
                  <div key={reply._id} className="reply">
                    {console.log("reply", reply)}
                    <div className="reply-header">
                      <span className="reply-author">
                        {reply.sender?.username || "Unknown User"}
                      </span>
                      <span className="reply-timestamp">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="reply-content">{reply.content}</div>
                  </div>
                ))}
                {msg.Replies?.length > visibleReplies[msg._id] && (
                  <button onClick={() => setVisibleReplies((prev) => ({
                    ...prev,
                    [msg._id]: prev[msg._id] + REPLIES_PER_PAGE,
                  }))}>See More Replies</button>
                )}
                <div className="reply-form">
                  <form onSubmit={(e) => handleReplySubmit(e, msg._id)}>
                    <input 
                      value={replyInputs[msg._id] || ""} 
                      onChange={(e) => setReplyInputs((prev) => ({ 
                        ...prev, 
                        [msg._id]: e.target.value 
                      }))} 
                      placeholder="Write a reply..." 
                    />
                    <button type="submit">Reply</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatApp;
