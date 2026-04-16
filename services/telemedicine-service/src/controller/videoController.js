const { generateToken } = require('../services/videoService');

const getHealth = (req, res) => {
  return res.status(200).json({
    message: 'Telemedicine service is running',
    status: 'ok',
  });
};

const createToken = (req, res) => {
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
    return res.status(500).json({ message: error.message || 'Token generation failed' });
  }
};

module.exports = {
  getHealth,
  createToken,
};