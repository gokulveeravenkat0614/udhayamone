const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'udyamone_secure_jwt_secret_key_2026';

function optionalAuthMiddleware(req, _res, next) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    if (decoded && !decoded.id && decoded._id) {
      req.user.id = decoded._id.toString();
    }
  } catch {
    // The chatbot is public, so an invalid/expired token should not block it.
    req.user = null;
  }

  next();
}

module.exports = optionalAuthMiddleware;

