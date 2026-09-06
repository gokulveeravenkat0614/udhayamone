const jwt = require('jsonwebtoken');

function optionalAuthMiddleware(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // The chatbot is public, so an invalid/expired token should not block it.
    req.user = null;
  }

  next();
}

module.exports = optionalAuthMiddleware;
