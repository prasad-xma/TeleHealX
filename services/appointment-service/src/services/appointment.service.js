const Appointment = require('../models/Appointment');
const axios = require('axios');
const AppError = require('../utils/appError');
const env = require('../config/env');

const getModuleInfo = async () => {
  return {
    module: "appointment-service",
    version: "v1",
    featuresComingNext: [
      "doctor search integration",
      "doctor details integration",
      "slot generation",
      "appointment creation",
      "appointment cancellation",
      "appointment rescheduling",
      "patient appointment listing",
      "doctor appointment listing"
    ]
  };
};

const getMyAppointmentAccessInfo = async (user) => {
  return {
    authenticated: true,
    user
  };
};

const getAppointmentsForDoctor = async (doctorId) => {
  const appointments = await Appointment.find({
    $or: [{ doctorUserId: doctorId }, { doctorId }]
  })
    .sort({ date: 1, time: 1 })
    .lean();

  return {
    appointments,
    totalAppointments: appointments.length
  };
};

const getDoctorsForPatient = async ({ name = '', limit = 5 }) => {
  const response = await axios.get(`${env.authServiceUrl}/api/auth/doctors`, {
    params: name ? { name } : undefined,
    timeout: 8000
  });

  const doctors = Array.isArray(response.data) ? response.data.slice(0, Math.max(1, Math.min(Number(limit) || 5, 5))) : [];

  return {
    doctors,
    totalDoctors: doctors.length
  };
};

const createAppointmentForPatient = async ({ patientId, patientName, doctorId, doctorName, date, time, type, notes, isVideoConsultation }) => {
  if (!doctorId) {
    throw new Error('Doctor is required');
  }

  const created = await Appointment.create({
    doctorId,
    doctorUserId: doctorId,
    patientId,
    patientName,
    doctorName: doctorName || 'Doctor',
    date,
    time,
    type: type || 'consultation',
    notes: notes || '',
    isVideoConsultation: Boolean(isVideoConsultation)
  });

  return created;
};

const getAppointmentsForPatient = async (patientId) => {
  const appointments = await Appointment.find({ patientId })
    .sort({ date: 1, time: 1 })
    .lean();

  return {
    appointments,
    totalAppointments: appointments.length
  };
};

const createMeetingForAppointment = async ({ appointmentId, doctorUserId }) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    $or: [{ doctorUserId }, { doctorId: doctorUserId }]
  });

  if (!appointment) {
    throw new Error('Appointment not found for this doctor');
  }

  const hasReadableRoomName =
    Boolean(appointment.meetingRoomName) &&
    appointment.meetingRoomName.includes('-with-');

  if (!hasReadableRoomName) {
    const slugify = (value = '') =>
      String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 24);

    const doctorSlug = slugify(appointment.doctorName) || 'doctor';
    const patientSlug = slugify(appointment.patientName) || 'patient';
    const suffix = String(appointment._id).slice(-6);

    appointment.meetingRoomName = `${doctorSlug}-with-${patientSlug}-${suffix}`;
    appointment.meetingCreatedAt = new Date();
    await appointment.save();
  }

  return appointment.toObject();
};

const getMeetingAccessForUser = async ({ roomName, userId, role }) => {
  const normalizedRoomName = String(roomName || '').trim();

  if (!normalizedRoomName) {
    throw new AppError('roomName is required', 400);
  }

  const appointment = await Appointment.findOne({ meetingRoomName: normalizedRoomName }).lean();

  if (!appointment) {
    throw new AppError('Meeting room not found', 404);
  }

  if (role === 'doctor') {
    const doctorMatches = String(appointment.doctorUserId || appointment.doctorId || '') === String(userId || '');

    if (!doctorMatches) {
      throw new AppError('You are not assigned as doctor for this appointment', 403);
    }
  } else if (role === 'patient') {
    const patientMatches = String(appointment.patientId || '') === String(userId || '');

    if (!patientMatches) {
      throw new AppError('You are not assigned as patient for this appointment', 403);
    }
  } else {
    throw new AppError('Role is not allowed for this meeting', 403);
  }

  return {
    roomName: normalizedRoomName,
    appointmentId: String(appointment._id),
    doctorId: String(appointment.doctorUserId || appointment.doctorId || ''),
    patientId: String(appointment.patientId || ''),
    doctorName: appointment.doctorName || 'Doctor',
    patientName: appointment.patientName || 'Patient'
  };
};

module.exports = {
  getModuleInfo,
  getMyAppointmentAccessInfo,
  getAppointmentsForDoctor,
  getDoctorsForPatient,
  createAppointmentForPatient,
  getAppointmentsForPatient,
  createMeetingForAppointment,
  getMeetingAccessForUser
};