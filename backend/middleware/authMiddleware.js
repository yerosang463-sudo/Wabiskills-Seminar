const jwt = require('jsonwebtoken');

const parseToken = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = parseToken(token);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const verifySocketToken = async (socket) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('Missing socket auth token');
  }

  const decoded = parseToken(token);
  socket.userId = decoded.id;
  socket.userEmail = decoded.email;
  return decoded;
};

module.exports = { requireAuth, verifySocketToken };
