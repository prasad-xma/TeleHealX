const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const isValidRoomName = (roomName) => {
  return typeof roomName === 'string' && /^[a-zA-Z0-9_-]{3,64}$/.test(roomName.trim());
};

const buildIdentity = (user) => {
  return `${user.role}-${user.id}`;
};

const ensureMeetingAccess = async ({ roomName, authorizationHeader }) => {
  const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5007';
  const trimmedRoomName = String(roomName || '').trim();

  if (!trimmedRoomName) {
    throw new Error('roomName is required');
  }

  if (!authorizationHeader) {
    throw new Error('Authorization header is required');
  }

  const query = new URLSearchParams({ roomName: trimmedRoomName }).toString();
  const response = await fetch(`${appointmentServiceUrl}/api/appointments/meeting/access?${query}`, {
    method: 'GET',
    headers: {
      Authorization: authorizationHeader,
      Accept: 'application/json'
    }
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Meeting access denied');
  }

  return payload.data;
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
  ensureMeetingAccess,
};