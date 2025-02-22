import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateCommunityModal from '../components/CreateCommunityModal';
import io from 'socket.io-client';
import './Communities.css';

const Communities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchCommunities();
    setupSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupSocket = () => {
    socketRef.current = io('http://localhost:5000', {
      auth: { token: user.token }
    });

    socketRef.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/communities', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      setCommunities(data);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const createCommunity = async (communityData) => {
    try {
      const response = await fetch('http://localhost:5000/api/communities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(communityData)
      });
      
      if (response.ok) {
        fetchCommunities();
      }
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  const joinCommunity = async (communityId) => {
    try {
      await fetch(`http://localhost:5000/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSelectedCommunity(communityId);
      socketRef.current.emit('joinCommunity', communityId);
      fetchMessages(communityId);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const fetchMessages = async (communityId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/communities/${communityId}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedCommunity) {
      socketRef.current.emit('sendMessage', {
        communityId: selectedCommunity,
        content: newMessage
      });
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-4 gap-4">
      <div className="col-span-1 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Communities</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
          >
            Create
          </button>
        </div>
        <div className="space-y-2">
          {communities.map(community => (
            <div
              key={community._id}
              onClick={() => joinCommunity(community._id)}
              className={`p-2 cursor-pointer rounded transition-colors ${
                selectedCommunity === community._id 
                  ? 'bg-blue-100' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <h3 className="font-semibold">{community.name}</h3>
              <p className="text-sm text-gray-600">{community.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-3 bg-white p-4 rounded-lg shadow">
        {selectedCommunity ? (
          <>
            <div className="h-[calc(100vh-300px)] overflow-y-auto mb-4 space-y-2 p-4">
              {messages.map(message => (
                <div 
                  key={message._id} 
                  className={`p-2 rounded-lg max-w-[80%] ${
                    message.sender._id === user._id
                      ? 'ml-auto bg-blue-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-600">
                    {message.sender.username}
                  </div>
                  <div className="mt-1">{message.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a message..."
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a community to start chatting
          </div>
        )}
      </div>

      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateCommunity={createCommunity}
      />
    </div>
  );
};

export default Communities;