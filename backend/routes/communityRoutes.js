// import express from 'express';
// import { protect, checkRole } from '../middleware/authMiddleware.js';
// import Community from '../models/Community.js';
// import Message from '../models/Message.js';

// const router = express.Router();

// // Create new community
// router.post('/', protect, checkRole(['patient']), async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const community = await Community.create({
//       name,
//       description,
//       members: [req.user._id],
//       createdBy: req.user._id
//     });
//     res.status(201).json(community);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Get all communities
// router.get('/', protect, checkRole(['patient']), async (req, res) => {
//   try {
//     const communities = await Community.find()
//       .populate('members', 'username')
//       .populate('createdBy', 'username');
//     res.json(communities);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Join community
// router.post('/:id/join', protect, checkRole(['patient']), async (req, res) => {
//   try {
//     const community = await Community.findById(req.params.id);
//     if (!community) {
//       return res.status(404).json({ message: 'Community not found' });
//     }
    
//     if (!community.members.includes(req.user._id)) {
//       community.members.push(req.user._id);
//       await community.save();
//     }
    
//     res.json(community);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Get community messages
// router.get('/:id/messages', protect, checkRole(['patient']), async (req, res) => {
//   try {
//     const messages = await Message.find({ community: req.params.id })
//       .populate('sender', 'username')
//       .sort({ createdAt: 1 });
//     res.json(messages);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });
// //send messages
// router.post('/:id/messages', protect, checkRole(['patient']), async (req, res) => {
//   try {
//     const { content } = req.body;
//     const message = await Message.create({
//       community: req.params.id,
//       sender: req.user._id,
//       content
//     });

//     const populatedMessage = await Message.findById(message._id)
//       .populate('sender', 'username');

//     // Emit the new message to all users in the community
//     req.app.get('io').to(req.params.id).emit('newMessage', populatedMessage);

//     res.status(201).json(populatedMessage);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// export default router;


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
      .populate('likedBy', '_id')
      .sort({ createdAt: 1 });
      
    const messagesWithUserLikeStatus = messages.map(msg => ({
      ...msg.toObject(),
      hasLiked: msg.likedBy.some(id => id.equals(req.user._id))
    }));
    
    res.json(messagesWithUserLikeStatus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//send messages
router.post('/:id/messages', protect, checkRole(['patient']), async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.create({
      community: req.params.id,
      sender: req.user._id,
      content
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username');

    // Emit the new message to all users in the community
    req.app.get('io').to(req.params.id).emit('newMessage', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like a message
router.post('/:id/messages/:messageId/like', protect, checkRole(['patient']), async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const userLikedIndex = message.likedBy.indexOf(req.user._id);
    if (userLikedIndex === -1) {
      message.likedBy.push(req.user._id);
      message.Likes += 1;
    } else {
      message.likedBy.pull(req.user._id);
      message.Likes -= 1;
    }
    
    await message.save();
    
    req.app.get('io').to(req.params.id).emit('messageLiked', {
      messageId: message._id,
      likes: message.Likes,
      likedBy: message.likedBy
    });
    
    res.json({ likes: message.Likes, hasLiked: userLikedIndex === -1 });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a reply to a message
router.post('/:id/messages/:messageId/replies', protect, checkRole(['patient']), async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const reply = {
      content,
      sender: req.user._id,
      createdAt: new Date()
    };
    
    message.Replies.push(reply);
    await message.save();
    
    // Populate the sender information for the new reply
    const populatedMessage = await Message.findById(message._id)
      .populate({
        path: 'Replies.sender',
        select: 'username'
      });
    
    const populatedReply = populatedMessage.Replies[populatedMessage.Replies.length - 1];
    
    // Emit to all clients in the community
    req.app.get('io').to(req.params.id).emit('newReply', {
      messageId: message._id,
      reply: populatedReply
    });
    
    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get replies for a message
router.get('/:id/messages/:messageId/replies', protect, checkRole(['patient']), async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
      .populate({
        path: 'Replies.sender',
        select: 'username'
      });
      
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(message.Replies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get('/communities/:communityId/messages/:messageId/replies', async (req, res) => {
  try {
      const { messageId } = req.params;

      // Find the message and populate the sender's username in replies
      const messageWithReplies = await Message.findById(messageId)
          .populate('Replies.sender', 'username');

      if (!messageWithReplies) {
          return res.status(404).json({ error: "Message not found" });
      }

      res.json(messageWithReplies.Replies); // Send only replies
  } catch (error) {
      console.error("Error fetching replies:", error);
      res.status(500).json({ error: "Server error" });
  }
});
// Get community details by ID
router.get('/:id', protect, checkRole(['patient']), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members', 'username')
      .populate('createdBy', 'username');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new post in a community
// router.post('/:id/messages', protect, checkRole(['patient']), async (req, res) => {
//   try {
//     const { content } = req.body;
//     const message = await Message.create({
//       community: req.params.id,
//       sender: req.user._id,
//       content
//     });

//     const populatedMessage = await Message.findById(message._id)
//       .populate('sender', 'username');

//     // Emit the new message to all users in the community
//     req.app.get('io').to(req.params.id).emit('newMessage', populatedMessage);

//     res.status(201).json(populatedMessage);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

export default router;