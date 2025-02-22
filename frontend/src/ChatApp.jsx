import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './ChatApp.css';

function ChatApp() {
  const { communityId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/communities/${communityId}/messages`,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Set up Socket.IO connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: user.token
      }
    });

    newSocket.emit('joinCommunity', communityId);

    newSocket.on('newMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveCommunity', communityId);
      newSocket.close();
    };
  }, [communityId, user.token]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit('sendMessage', {
        communityId,
        content: input.trim()
      });
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div 
            key={msg._id} 
            className={`message ${msg.sender._id === user._id ? 'own-message' : ''}`}
          >
            <span className="sender">{msg.sender.username}:</span>
            <span className="content">{msg.content}</span>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatApp;
