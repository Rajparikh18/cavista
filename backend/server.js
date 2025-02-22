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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);

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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
