const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const IdentityRecord = require('../models/IdentityRecord');

function sign(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

async function ensureDemoUsers() {
  const demos = [
    { name: 'ABC Manufacturing Pvt. Ltd.', email: 'demo@udyamone.test', password: 'Demo@123', role: 'user' },
    { name: 'UdyamOne Admin', email: 'admin@udyamone.test', password: 'Admin@123', role: 'admin' }
  ];
  for (const d of demos) {
    const existing = await User.findOne({ email: d.email });
    if (!existing) { const u = await User.create({ name: d.name, email: d.email, passwordHash: await bcrypt.hash(d.password, 10), role: d.role }); if (d.role === 'user') await IdentityRecord.create({ userId:u._id, name:d.name, dateOfBirth:'2000-01-01', identityReference:'DEMO-ABC-001' }); }
  }
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ success:false, message:'Name, email and password (6+ chars) are required' });
    if (await User.findOne({ email })) return res.status(409).json({ success:false, message:'Email already registered' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
    await IdentityRecord.create({ userId:user._id, name, identityReference:`DEMO-${user._id.toString().slice(-6).toUpperCase()}` });
    res.status(201).json({ success:true, token:sign(user), user:{ id:user._id, name:user.name, email:user.email, role:user.role, verificationStatus:user.verificationStatus } });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ success:false, message:'Invalid email or password' });
    await LoginHistory.create({ userId:user._id, verificationStatus:user.verificationStatus, deviceInfo:req.headers['user-agent'] || 'Unknown' });
    res.json({ success:true, token:sign(user), user:{ id:user._id, name:user.name, email:user.email, role:user.role, verificationStatus:user.verificationStatus } });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
}

async function me(req, res) {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ success:false, message:'User not found' });
  res.json({ success:true, user });
}

module.exports = { register, login, me, ensureDemoUsers };
