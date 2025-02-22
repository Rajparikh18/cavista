import express from 'express';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import Community from '../models/Community.js';
import Message from '../models/Message.js';

const router = express.Router();

// Create new community
router.post('/', protect, checkRole(['patient']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const community = await Community.create({
      name,
      description,
      members: [req.user._id],
      createdBy: req.user._id
    });
    res.status(201).json(community);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all communities
router.get('/', protect, checkRole(['patient']), async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('members', 'username')
      .populate('createdBy', 'username');
    res.json(communities);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Join community
router.post('/:id/join', protect, checkRole(['patient']), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (!community.members.includes(req.user._id)) {
      community.members.push(req.user._id);
      await community.save();
    }
    
    res.json(community);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get community messages
router.get('/:id/messages', protect, checkRole(['patient']), async (req, res) => {
  try {
    const messages = await Message.find({ community: req.params.id })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
