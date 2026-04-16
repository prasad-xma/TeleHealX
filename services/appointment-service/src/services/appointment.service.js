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

const getAppointmentById = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId).lean();

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  return appointment;
};

const getAppointmentByRoomName = async (roomName) => {
  const normalizedRoomName = String(roomName || '').trim();

  if (!normalizedRoomName) {
    throw new AppError('roomName is required', 400);
  }

  const appointment = await Appointment.findOne({ meetingRoomName: normalizedRoomName }).lean();

  if (!appointment) {
    throw new AppError('Appointment not found for this room', 404);
  }

  return appointment;
};

const updateMeetingRoomForAppointment = async ({ appointmentId, meetingRoomName }) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  appointment.meetingRoomName = meetingRoomName;
  appointment.meetingCreatedAt = new Date();
  await appointment.save();

  return appointment.toObject();
};

module.exports = {
  getModuleInfo,
  getMyAppointmentAccessInfo,
  getAppointmentsForDoctor,
  getDoctorsForPatient,
  createAppointmentForPatient,
  getAppointmentsForPatient,
  getAppointmentById,
  getAppointmentByRoomName,
  updateMeetingRoomForAppointment
};