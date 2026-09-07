






const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'udyamone_secure_jwt_secret_key_2026';

async function authMiddleware(req, res, next) {
  try {
    const rawHeader = req.headers.authorization || req.headers.Authorization || req.header?.('Authorization') || '';
    let token = null;

    if (rawHeader.startsWith('Bearer ')) {
      token = rawHeader.slice(7).trim();
    } else if (rawHeader.startsWith('bearer ')) {
      token = rawHeader.slice(7).trim();
    } else if (rawHeader.length > 20 && !rawHeader.includes(' ')) {
      token = rawHeader.trim();
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const userId = decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await User.findById(userId).select('-passwordHash');
        }
      } catch {
        // Non-ObjectId fallback
      }
      if (!user && decoded.email) {
        user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-passwordHash');
      }
    } else {
      const { memoryUsers } = require('../controllers/authController');
      user = (memoryUsers || []).find(u => 
        (u._id ? u._id.toString() : u.id) === String(userId) ||
        (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
      );
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    req.user = {
      id: user._id ? user._id.toString() : user.id,
      _id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || null,
      role: user.role || 'user',
      verificationStatus: user.verificationStatus || 'not_verified'
    };

    next();
  } catch {
    return res.status(500).json({ success: false, message: 'Internal authentication error' });
  }
}

module.exports = authMiddleware;

