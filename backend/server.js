import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import Message from './models/Message.js';
import jwt from 'jsonwebtoken';
import Patient from './models/Patient.js';
import fileUpload from 'express-fileupload';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());


app.use(fileUpload({ useTempFiles: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/upload', uploadRoutes);
// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Patient.findById(decoded.id).select('-password');
    if (!user || user.role !== 'patient') {
      throw new Error('Not authorized');
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Video Conference rooms storage
const videoRooms = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.username);

  socket.on('joinCommunity', (communityId) => {
    socket.join(communityId);
  });

  socket.on('leaveCommunity', (communityId) => {
    socket.leave(communityId);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const message = await Message.create({
        community: data.communityId,
        sender: socket.user._id,
        content: data.content
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username');

      io.to(data.communityId).emit('newMessage', populatedMessage);
    } catch (error) {
      console.error('Message error:', error);
    }
  });

  // Video Conference handlers
  socket.on('join-video-room', (roomCode) => {
    console.log(`User ${socket.user.username} joining room ${roomCode}`);
    
    socket.join(roomCode);
    const room = io.sockets.adapter.rooms.get(roomCode);
    const roomParticipants = room ? room.size : 0;
    
    console.log(`Room ${roomCode} now has ${roomParticipants} participants`);
    
    if (!videoRooms.has(roomCode)) {
        videoRooms.set(roomCode, new Set());
    }
    videoRooms.get(roomCode).add(socket.user.username);
    
    const participants = Array.from(videoRooms.get(roomCode));
    
    io.in(roomCode).emit('room-joined', { 
        roomCode, 
        participants,
        participantCount: roomParticipants,
        userId: socket.user._id
    });
  });

  socket.on('video-offer', ({ offer, roomCode }) => {
    console.log(`Relaying video offer from ${socket.user.username} in room ${roomCode}`);
    socket.to(roomCode).emit('video-offer', offer);
  });

  socket.on('video-answer', ({ answer, roomCode }) => {
    console.log(`Relaying video answer from ${socket.user.username} in room ${roomCode}`);
    socket.to(roomCode).emit('video-answer', answer);
  });

  socket.on('ice-candidate', ({ candidate, roomCode }) => {
    console.log(`Relaying ICE candidate from ${socket.user.username} in room ${roomCode}`);
    socket.to(roomCode).emit('ice-candidate', candidate);
  });

  socket.on('leave-video-room', (roomCode) => {
    socket.leave(roomCode);
    
    // Remove user from room storage
    if (videoRooms.has(roomCode)) {
      videoRooms.get(roomCode).delete(socket.user.username);
      if (videoRooms.get(roomCode).size === 0) {
        videoRooms.delete(roomCode);
      } else {
        // Notify remaining participants
        const participants = Array.from(videoRooms.get(roomCode));
        io.to(roomCode).emit('participant-left', {
          username: socket.user.username,
          participants
        });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
