import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user = await Doctor.findById(decoded.id).select('-password');
      if (!user) {
        user = await Patient.findById(decoded.id).select('-password');
      }
      
      if (!user) {
        res.status(401);
        throw new Error('Not authorized');
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Not authorized for this role');
    }
    next();
  };
};
