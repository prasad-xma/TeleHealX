const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const isValidRoomName = (roomName) => {
  return typeof roomName === 'string' && /^[a-zA-Z0-9_-]{3,64}$/.test(roomName.trim());
};

const buildIdentity = (user) => {
  return `${user.role}-${user.id}`;
};

const requestAppointmentService = async ({ path, method = 'GET', authorizationHeader, body }) => {
  const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5007';
  const response = await fetch(`${appointmentServiceUrl}${path}`, {
    method,
    headers: {
      Authorization: authorizationHeader,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Appointment service request failed');
  }

  return payload.data;
};

const createMeetingForAppointment = async ({ appointmentId, authorizationHeader, doctorUserId }) => {
  if (!appointmentId) {
    throw new Error('appointmentId is required');
  }

  if (!authorizationHeader) {
    throw new Error('Authorization header is required');
  }

  if (!doctorUserId) {
    throw new Error('doctorUserId is required');
  }

  return requestAppointmentService({
    path: `/api/appointments/doctor/${encodeURIComponent(String(appointmentId))}/meeting`,
    method: 'PATCH',
    authorizationHeader,
  });
};

const ensureMeetingAccess = async ({ roomName, authorizationHeader, user }) => {
  const trimmedRoomName = String(roomName || '').trim();

  if (!trimmedRoomName) {
    throw new Error('roomName is required');
  }

  if (!authorizationHeader) {
    throw new Error('Authorization header is required');
  }

  const appointment = await requestAppointmentService({
    path: `/api/appointments/meeting/access?roomName=${encodeURIComponent(trimmedRoomName)}`,
    authorizationHeader,
  });

  if (!appointment) {
    throw new Error('Meeting access denied');
  }

  const userId = String(user?.id || '');
  const role = String(user?.role || '');

  if (role === 'doctor') {
    const doctorMatches = String(appointment.doctorUserId || appointment.doctorId || '') === userId;

    if (!doctorMatches) {
      throw new Error('You are not assigned as doctor for this appointment');
    }
  } else if (role === 'patient') {
    const patientMatches = String(appointment.patientId || '') === userId;

    if (!patientMatches) {
      throw new Error('You are not assigned as patient for this appointment');
    }
  } else {
    throw new Error('Role is not allowed for this meeting');
  }

  return appointment;
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
  createMeetingForAppointment,
};