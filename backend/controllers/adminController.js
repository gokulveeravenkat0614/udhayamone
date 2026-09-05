const User = require('../models/User');
const Verification = require('../models/Verification');
const LoginHistory = require('../models/LoginHistory');

async function users(req, res) {
  const data = await User.find({ role:'user' }).select('-passwordHash').sort({ createdAt:-1 });
  res.json({ success:true, users:data });
}
async function verifications(req, res) {
  const data = await Verification.find().populate('userId','name email verificationStatus').sort({ createdAt:-1 });
  res.json({ success:true, verifications:data });
}
async function statistics(req, res) {
  const [total, verified, failed, pending, logins] = await Promise.all([
    User.countDocuments({ role:'user' }), User.countDocuments({ role:'user', verificationStatus:'verified' }), User.countDocuments({ role:'user', verificationStatus:'failed' }), User.countDocuments({ role:'user', verificationStatus:'pending' }), LoginHistory.countDocuments()
  ]);
  res.json({ success:true, statistics:{ total, verified, failed, pending, logins } });
}
async function userDetail(req, res) {
  const user = await User.findById(req.params.id).select('-passwordHash');
  const verifications = await Verification.find({ userId:req.params.id }).sort({ createdAt:-1 });
  const loginHistory = await LoginHistory.find({ userId:req.params.id }).sort({ loginTime:-1 }).limit(20);
  res.json({ success:true, user, verifications, loginHistory });
}
module.exports = { users, verifications, statistics, userDetail };
