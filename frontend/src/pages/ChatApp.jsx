// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { io } from "socket.io-client";
// import { useAuth } from "../context/AuthContext";

// const REPLIES_PER_PAGE = 5;

// function ChatApp() {
//   const { communityId } = useParams();
//   const { user } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [socket, setSocket] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [expandedReplies, setExpandedReplies] = useState({});
//   const [replyInputs, setReplyInputs] = useState({});
//   const [visibleReplies, setVisibleReplies] = useState({});
//   const [communityDetails, setCommunityDetails] = useState(null);
//   const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
//   const [newPostContent, setNewPostContent] = useState("");

//   // Fetch community details
//   useEffect(() => {
//     const fetchCommunityDetails = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:5000/api/communities/${communityId}`,
//           { headers: { Authorization: `Bearer ${user.token}` } }
//         );
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         setCommunityDetails(data);
//       } catch (error) {
//         console.error("Error fetching community details:", error);
//       }
//     };

//     fetchCommunityDetails();
//   }, [communityId, user.token]);

//   // Fetch messages
//   const fetchMessages = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/communities/${communityId}/messages`,
//         { headers: { Authorization: `Bearer ${user.token}` } }
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();
//       setMessages(data);
//       console.log("Messages fetched successfully:", data);
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();

//     // Socket.io setup
//     const newSocket = io("http://localhost:5000", { auth: { token: user.token } });

//     newSocket.emit("joinCommunity", communityId);
//     newSocket.on("newMessage", (message) => {
//       setMessages((prev) => [...prev, message]);
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.emit("leaveCommunity", communityId);
//       newSocket.close();
//     };
//   }, [communityId, user.token]);

//   // Handle like functionality
//   const handleLike = async (messageId) => {
//     try {
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === messageId
//             ? { ...msg, hasLiked: !msg.hasLiked, Likes: msg.hasLiked ? msg.Likes - 1 : msg.Likes + 1 }
//             : msg
//         )
//       );

//       await fetch(
//         `http://localhost:5000/api/communities/${communityId}/messages/${messageId}/like`,
//         { method: "POST", headers: { Authorization: `Bearer ${user.token}` } }
//       );
//     } catch (error) {
//       console.error("Error toggling like:", error);
//     }
//   };

//   // Fetch replies for a message
//   const fetchReplies = async (messageId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/communities/${communityId}/messages/${messageId}/replies`,
//         { headers: { Authorization: `Bearer ${user.token}` } }
//       );
//       if (!response.ok) throw new Error("Failed to fetch replies");

//       const replies = await response.json();
//       setMessages((prev) =>
//         prev.map((msg) => (msg._id === messageId ? { ...msg, Replies: replies } : msg))
//       );
//     } catch (error) {
//       console.error("Error fetching replies:", error);
//     }
//   };

//   // Toggle replies visibility
//   const toggleReplies = (messageId) => {
//     setExpandedReplies((prev) => {
//       const newState = { ...prev, [messageId]: !prev[messageId] };
//       if (newState[messageId]) {
//         fetchReplies(messageId);
//         setVisibleReplies((prev) => ({ ...prev, [messageId]: REPLIES_PER_PAGE }));
//       }
//       return newState;
//     });
//   };

//   // Submit a reply
//   const submitReply = async (messageId) => {
//     const content = replyInputs[messageId]?.trim();
//     if (!content) return;

//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/communities/${communityId}/messages/${messageId}/replies`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${user.token}`,
//           },
//           body: JSON.stringify({ content }),
//         }
//       );

//       if (response.ok) {
//         setReplyInputs((prev) => ({ ...prev, [messageId]: "" }));
//         fetchReplies(messageId);
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error("Error submitting reply:", error);
//     }
//   };

//   // Handle create post
//   const handleCreatePost = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/communities/${communityId}/messages`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${user.token}`,
//           },
//           body: JSON.stringify({ content: newPostContent }),
//         }
//       );

//       if (response.ok) {
//         console.log("Post created successfully");
//         // Close the modal
//         setIsCreatePostModalOpen(false);
//         // Clear the input
//         setNewPostContent("");
//         // Re-fetch posts to reflect the new post
//         await fetchMessages();
//         // Force a page reload if fetchMessages doesn't update the UI
//         window.location.reload();
//       } else {
//         console.error("Failed to create post:", response.statusText);
//       }
//     } catch (error) {
//       console.error("Error creating post:", error);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center bg-gray-100 min-h-screen py-8">
//       <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
//         {/* Community Header */}
//         {communityDetails && (
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">{communityDetails.name}</h1>
//             <p className="text-gray-600 mt-2">{communityDetails.description}</p>
//             <p className="text-gray-500 text-sm mt-2">
//               {communityDetails.members.length} members
//             </p>
//           </div>
//         )}

//         {/* Create Post Button */}
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-900">Posts</h2>
//           <button
//             onClick={() => setIsCreatePostModalOpen(true)}
//             className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
//           >
//             + Create Post
//           </button>
//         </div>

//         {/* Create Post Modal */}
//         {isCreatePostModalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//             <div className="bg-white p-6 rounded-lg w-full max-w-md">
//               <h3 className="text-lg font-bold mb-4">Create a New Post</h3>
//               <textarea
//                 value={newPostContent}
//                 onChange={(e) => setNewPostContent(e.target.value)}
//                 className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
//                 placeholder="Write your post..."
//                 rows={4}
//               />
//               <div className="flex justify-end mt-4">
//                 <button
//                   onClick={() => setIsCreatePostModalOpen(false)}
//                   className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-600 mr-2"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCreatePost}
//                   className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700"
//                 >
//                   Post
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Posts Section */}
//         {messages.map((msg) => (
//           <div key={msg._id} className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-bold text-gray-700">{msg.sender.username}</span>
//               <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
//             </div>

//             <p className="text-gray-800 mt-2">{msg.content}</p>

//             <div className="flex items-center mt-3 space-x-4">
//               <button
//                 className={`text-sm flex items-center space-x-1 ${
//                   msg.hasLiked ? "text-red-600" : "text-gray-500"
//                 }`}
//                 onClick={() => handleLike(msg._id)}
//               >
//                 <span>{msg.hasLiked ? "❤️" : "🤍"}</span>
//                 <span>{msg.Likes || 0}</span>
//               </button>

//               <button
//                 className="text-sm text-red-600 hover:underline"
//                 onClick={() => toggleReplies(msg._id)}
//               >
//                 💬 {msg.Replies?.length || 0} Replies
//               </button>
//             </div>

//             {expandedReplies[msg._id] && (
//               <div className="mt-4 border-l-2 border-red-400 pl-4">
//                 {msg.Replies?.slice(0, visibleReplies[msg._id]).map((reply) => (
//                   <div key={reply._id} className="mb-2">
//                     <div className="text-xs text-gray-600">{reply.sender?.username || "Unknown User"}</div>
//                     <p className="text-gray-700">{reply.content}</p>
//                   </div>
//                 ))}

//                 {msg.Replies?.length > visibleReplies[msg._id] && (
//                   <button
//                     onClick={() =>
//                       setVisibleReplies((prev) => ({
//                         ...prev,
//                         [msg._id]: prev[msg._id] + REPLIES_PER_PAGE,
//                       }))
//                     }
//                     className="text-sm text-red-600 hover:underline mt-2"
//                   >
//                     See More Replies
//                   </button>
//                 )}

//                 <div className="mt-2">
//                   <input
//                     value={replyInputs[msg._id] || ""}
//                     onChange={(e) =>
//                       setReplyInputs((prev) => ({ ...prev, [msg._id]: e.target.value }))
//                     }
//                     className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
//                     placeholder="Write a reply..."
//                   />
//                   <button
//                     onClick={() => submitReply(msg._id)}
//                     className="mt-2 bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
//                   >
//                     Reply
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default ChatApp;



"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const REPLIES_PER_PAGE = 5;

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
  const [communityDetails, setCommunityDetails] = useState(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch community details
  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/communities/${communityId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCommunityDetails(data);
      } catch (error) {
        console.error("Error fetching community details:", error);
      }
    };

    fetchCommunityDetails();
  }, [communityId, user.token]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/communities/${communityId}/messages`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Socket.io setup
    const newSocket = io("http://localhost:5000", { auth: { token: user.token } });

    newSocket.emit("joinCommunity", communityId);
    
    // Listen for new messages and replies
    newSocket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("newReply", ({ messageId, reply }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, Replies: [...(msg.Replies || []), reply] }
            : msg
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leaveCommunity", communityId);
      newSocket.close();
    };
  }, [communityId, user.token]);

  // Handle like functionality
  const handleLike = async (messageId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/communities/${communityId}/messages/${messageId}/like`,
        { method: "POST", headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, hasLiked: !msg.hasLiked, Likes: msg.hasLiked ? msg.Likes - 1 : msg.Likes + 1 }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Fetch replies for a message
  const fetchReplies = async (messageId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/communities/${communityId}/messages/${messageId}/replies`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch replies");

      const replies = await response.json();
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, Replies: replies } : msg))
      );
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  // Toggle replies visibility
  const toggleReplies = (messageId) => {
    setExpandedReplies((prev) => {
      const newState = { ...prev, [messageId]: !prev[messageId] };
      if (newState[messageId]) {
        fetchReplies(messageId);
        setVisibleReplies((prev) => ({ ...prev, [messageId]: REPLIES_PER_PAGE }));
      }
      return newState;
    });
  };

  // Submit a reply
  const submitReply = async (messageId) => {
    const content = replyInputs[messageId]?.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    try {
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
        const newReply = await response.json();
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, Replies: [...(msg.Replies || []), newReply] }
              : msg
          )
        );
        setReplyInputs((prev) => ({ ...prev, [messageId]: "" }));
        
        // Emit socket event for real-time updates
        socket?.emit("newReply", { messageId, reply: newReply });
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/communities/${communityId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ content: newPostContent }),
        }
      );

      if (response.ok) {
        const newPost = await response.json();
        setMessages((prev) => [...prev, newPost]);
        setNewPostContent("");
        setIsCreatePostModalOpen(false);
        
        // Emit socket event for real-time updates
        socket?.emit("newMessage", newPost);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-8">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        {/* Community Header */}
        {communityDetails && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{communityDetails.name}</h1>
            <p className="text-gray-600 mt-2">{communityDetails.description}</p>
            <p className="text-gray-500 text-sm mt-2">
              {communityDetails.members.length} members
            </p>
          </div>
        )}

        {/* Create Post Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Posts</h2>
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            + Create Post
          </button>
        </div>

        {/* Create Post Modal */}
        {isCreatePostModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Create a New Post</h3>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="Write your post..."
                rows={4}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsCreatePostModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-600 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Section */}
        {messages.map((msg) => (
          <div key={msg._id} className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">{msg.sender.username}</span>
              <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
            </div>

            <p className="text-gray-800 mt-2">{msg.content}</p>

            <div className="flex items-center mt-3 space-x-4">
              <button
                className={`text-sm flex items-center space-x-1 ${
                  msg.hasLiked ? "text-red-600" : "text-gray-500"
                }`}
                onClick={() => handleLike(msg._id)}
              >
                <span>{msg.hasLiked ? "❤️" : "🤍"}</span>
                <span>{msg.Likes || 0}</span>
              </button>

              <button
                className="text-sm text-red-600 hover:underline"
                onClick={() => toggleReplies(msg._id)}
              >
                💬 {msg.Replies?.length || 0} Replies
              </button>
            </div>

            {expandedReplies[msg._id] && (
              <div className="mt-4 border-l-2 border-red-400 pl-4">
                {msg.Replies?.slice(0, visibleReplies[msg._id]).map((reply) => (
                  <div key={reply._id} className="mb-2">
                    <div className="text-xs text-gray-600">{reply.sender?.username || "Unknown User"}</div>
                    <p className="text-gray-700">{reply.content}</p>
                  </div>
                ))}

                {msg.Replies?.length > visibleReplies[msg._id] && (
                  <button
                    onClick={() =>
                      setVisibleReplies((prev) => ({
                        ...prev,
                        [msg._id]: prev[msg._id] + REPLIES_PER_PAGE,
                      }))
                    }
                    className="text-sm text-red-600 hover:underline mt-2"
                  >
                    See More Replies
                  </button>
                )}

                <div className="mt-2">
                  <input
                    value={replyInputs[msg._id] || ""}
                    onChange={(e) =>
                      setReplyInputs((prev) => ({ ...prev, [msg._id]: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="Write a reply..."
                  />
                  <button
                    onClick={() => submitReply(msg._id)}
                    className="mt-2 bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                  >
                    Reply
                  </button>
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