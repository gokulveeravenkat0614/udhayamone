const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'udyamone_secure_jwt_secret_key_2026';

function optionalAuthMiddleware(req, res, next) {
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
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'Please sign in again.'
      });
    }
    req.user = null;
    return next();
  }
}

module.exports = optionalAuthMiddleware;

