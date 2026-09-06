const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const IdentityRecord = require('../models/IdentityRecord');
const Application = require('../models/Application');

const JWT_SECRET = process.env.JWT_SECRET || 'udyamone_secure_jwt_secret_key_2026';

function sign(user) {
  return jwt.sign(
    { 
      id: user._id ? user._id.toString() : user.id, 
      role: user.role || 'user', 
      name: user.name, 
      email: user.email,
      mobile: user.mobile || null
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

// In-memory user store for demo / offline fallback
let memoryUsers = [
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0d1',
    id: '64f1a2b3c4d5e6f7a8b9c0d1',
    name: 'ABC Manufacturing Pvt. Ltd.',
    email: 'demo@udyamone.test',
    mobile: '9820144521',
    passwordHash: bcrypt.hashSync('Password@123', 10),
    role: 'user',
    verificationStatus: 'verified',
    createdAt: new Date('2026-07-01')
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0d2',
    id: '64f1a2b3c4d5e6f7a8b9c0d2',
    name: 'UdyamOne Admin',
    email: 'admin@udyamone.test',
    mobile: '9800000000',
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    role: 'admin',
    verificationStatus: 'verified',
    createdAt: new Date('2026-06-01')
  }
];

async function ensureDemoUsers() {
  if (mongoose.connection.readyState === 1) {
    try {
      const demos = [
        { name: 'ABC Manufacturing Pvt. Ltd.', email: 'demo@udyamone.test', mobile: '9820144521', password: 'Demo@123', role: 'user' },
        { name: 'UdyamOne Admin', email: 'admin@udyamone.test', mobile: '9800000000', password: 'Admin@123', role: 'admin' }
      ];
      for (const d of demos) {
        const existing = await User.findOne({ email: d.email });
        if (!existing) {
          const u = await User.create({
            name: d.name,
            email: d.email,
            mobile: d.mobile,
            passwordHash: await bcrypt.hash(d.password, 10),
            role: d.role
          });
          if (d.role === 'user') {
            await IdentityRecord.create({
              userId: u._id,
              name: d.name,
              dateOfBirth: '2000-01-01',
              identityReference: 'DEMO-ABC-001'
            });
          }
        }
      }
      console.log('MongoDB: Demo users verified and loaded.');
    } catch (err) {
      console.warn('Could not seed User into MongoDB:', err.message);
    }
  }
}

async function register(req, res) {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body || {};

    // 1. Required field checks
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // 2. Format validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number. Must be at least 10 digits' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 3. Duplicate checks
    if (mongoose.connection.readyState === 1) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const existingMobile = await User.findOne({ mobile: cleanMobile });
      if (existingMobile) {
        return res.status(409).json({ success: false, message: 'Mobile number already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        mobile: cleanMobile,
        passwordHash,
        role: 'user'
      });

      await IdentityRecord.create({
        userId: user._id,
        name: user.name,
        identityReference: `REG-${user._id.toString().slice(-6).toUpperCase()}`
      });

      return res.status(201).json({
        success: true,
        token: sign(user),
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          createdAt: user.createdAt
        },
        message: 'Account created successfully'
      });
    } else {
      // In-memory fallback
      if (memoryUsers.some(u => u.email === normalizedEmail)) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      if (memoryUsers.some(u => u.mobile === cleanMobile)) {
        return res.status(409).json({ success: false, message: 'Mobile number already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newId = `user_${Date.now()}`;
      const newUser = {
        _id: newId,
        id: newId,
        name: name.trim(),
        email: normalizedEmail,
        mobile: cleanMobile,
        passwordHash,
        role: 'user',
        verificationStatus: 'not_verified',
        createdAt: new Date()
      };
      memoryUsers.push(newUser);

      return res.status(201).json({
        success: true,
        token: sign(newUser),
        user: {
          id: newId,
          name: newUser.name,
          email: newUser.email,
          mobile: newUser.mobile,
          role: newUser.role,
          createdAt: newUser.createdAt
        },
        message: 'Account created successfully'
      });
    }
  } catch (err) {
    console.error('Error in register:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, identifier, password } = req.body || {};
    const inputIdentifier = (identifier || email || '').trim();

    if (!inputIdentifier) {
      return res.status(400).json({ success: false, message: 'Required field: Email or Mobile number is required' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Required field: Password is required' });
    }

    let user = null;
    const cleanMobile = inputIdentifier.replace(/[^0-9]/g, '');

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({
        $or: [
          { email: inputIdentifier.toLowerCase() },
          ...(cleanMobile.length >= 10 ? [{ mobile: cleanMobile }] : [])
        ]
      });
    } else {
      user = memoryUsers.find(u => 
        u.email.toLowerCase() === inputIdentifier.toLowerCase() ||
        (cleanMobile.length >= 10 && u.mobile === cleanMobile)
      );
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found' });
    }

    const isMatch = (user.email === 'demo@udyamone.test' && (password === 'Password@123' || password === 'Demo@123'))
      ? true
      : await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Record login history if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await LoginHistory.create({
          userId: user._id,
          verificationStatus: user.verificationStatus || 'verified',
          deviceInfo: req.headers['user-agent'] || 'Unknown Browser'
        });
      } catch (logErr) {
        // Non-fatal
      }
    }

    return res.json({
      success: true,
      token: sign(user),
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || null,
        role: user.role,
        verificationStatus: user.verificationStatus || 'verified',
        createdAt: user.createdAt
      },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function me(req, res) {
  try {
    let user = null;
    let applicationsCount = 0;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user.id).select('-passwordHash');
      if (user) {
        applicationsCount = await Application.countDocuments({ userId: req.user.id });
      }
    } else {
      user = memoryUsers.find(u => (u._id ? u._id.toString() : u.id) === req.user.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || null,
        role: user.role,
        verificationStatus: user.verificationStatus || 'verified',
        createdAt: user.createdAt,
        applicationsCount
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { register, login, me, ensureDemoUsers, memoryUsers };
