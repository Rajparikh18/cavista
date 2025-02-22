import express from 'express';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (role !== 'doctor' && role !== 'patient') {
      res.status(400);
      throw new Error('Invalid role');
    }

    const Model = role === 'doctor' ? Doctor : Patient;
    
    const userExists = await Model.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await Model.create({
      username,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const Model = role === 'doctor' ? Doctor : Patient;
    const user = await Model.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password or role');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await Patient.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


export default router;
