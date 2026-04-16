const { ensureMeetingAccess, generateToken } = require('../services/videoService');

const getHealth = (req, res) => {
  return res.status(200).json({
    message: 'Telemedicine service is running',
    status: 'ok',
  });
};

const createToken = async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({ message: 'roomName is required' });
    }

    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const allowedRoles = ['patient', 'doctor'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Only patients and doctors can join consultations' });
    }

    await ensureMeetingAccess({
      roomName,
      authorizationHeader: req.headers.authorization,
    });

    const session = generateToken({
      user: {
        id: req.user.id,
        role: req.user.role,
      },
      roomName,
    });

    return res.status(200).json({
      message: 'Video token generated successfully',
      token: session.token,
      identity: session.identity,
      roomName: roomName.trim(),
      expiresIn: 3600,
    });
  } catch (error) {
    const message = error?.message || 'Token generation failed';
    const lower = String(message).toLowerCase();
    const statusCode = lower.includes('denied') || lower.includes('not assigned') || lower.includes('not found') ? 403 : 500;

    return res.status(statusCode).json({ message });
  }
};

module.exports = {
  getHealth,
  createToken,
};