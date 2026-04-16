const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const isValidRoomName = (roomName) => {
  return typeof roomName === 'string' && /^[a-zA-Z0-9_-]{3,64}$/.test(roomName.trim());
};

const buildIdentity = (user) => {
  return `${user.role}-${user.id}`;
};

const generateToken = ({ user, roomName }) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_API_KEY || !process.env.TWILIO_API_SECRET) {
    throw new Error('Twilio configuration is missing');
  }

  if (!isValidRoomName(roomName)) {
    throw new Error('roomName must be 3 to 64 characters and contain only letters, numbers, hyphens, or underscores');
  }

  const identity = buildIdentity(user);

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    {
      identity,
      ttl: 3600,
    }
  );

  token.addGrant(
    new VideoGrant({
      room: roomName.trim(),
    })
  );

  return {
    token: token.toJwt(),
    identity,
  };
};

module.exports = {
  generateToken,
  isValidRoomName,
  buildIdentity,
};