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
  console.log('🔄 [APPOINTMENT SERVICE] Starting appointment creation:', { patientId, doctorId, date, time });

  if (!doctorId) {
    console.error('❌ [APPOINTMENT SERVICE] Doctor ID is required');
    throw new Error('Doctor is required');
  }

  // Generate unique appointment number
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const appointmentNumber = `APT-${timestamp}-${randomSuffix}`;

  console.log('📝 [APPOINTMENT SERVICE] Creating appointment in database with number:', appointmentNumber);
  const created = await Appointment.create({
    appointmentNumber,
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

  console.log('✅ [APPOINTMENT SERVICE] Appointment created successfully:', created._id);

  // Send appointment booking notifications asynchronously
  try {
    console.log('📤 [APPOINTMENT SERVICE] Starting notification process...');

    console.log('🔍 [APPOINTMENT SERVICE] Fetching patient data from auth service...');
    const patientResponse = await axios.get(`${env.authServiceUrl}/api/auth/users/${patientId}`, {
      timeout: 5000,
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_KEY || 'internal-key'
      }
    });
    const patientData = patientResponse.data;
    console.log('✅ [APPOINTMENT SERVICE] Patient data fetched:', { name: patientData.name, email: patientData.email });

    console.log('🔍 [APPOINTMENT SERVICE] Fetching doctor data from auth service...');
    const doctorResponse = await axios.get(`${env.authServiceUrl}/api/auth/doctors/${doctorId}`, {
      timeout: 5000,
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_KEY || 'internal-key'
      }
    });
    const doctorData = doctorResponse.data;
    console.log('✅ [APPOINTMENT SERVICE] Doctor data fetched:', { name: doctorData.name, email: doctorData.email });

    console.log('📧 [APPOINTMENT SERVICE] Sending notifications to notification service...');
    await axios.post(`${env.notificationServiceUrl}/api/notifications/appointment-booked`, {
      appointmentData: {
        _id: created._id,
        date: created.date,
        time: created.time,
        type: created.type,
        notes: created.notes,
        consultationLink: created.consultationLink
      },
      patientData: {
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone
      },
      doctorData: {
        name: doctorData.name,
        email: doctorData.email,
        phone: doctorData.phone,
        specialization: doctorData.specialization
      }
    }, {
      timeout: 10000,
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_KEY || 'internal-key'
      }
    });

    console.log('✅ [APPOINTMENT SERVICE] Notifications sent successfully');

  } catch (notificationError) {
    console.error('❌ [APPOINTMENT SERVICE] Failed to send appointment booking notifications:', notificationError.message);
    console.error('❌ [APPOINTMENT SERVICE] Notification error details:', notificationError.response?.data || notificationError);
    // Log notification error but don't fail the appointment creation
  }

  console.log('🎉 [APPOINTMENT SERVICE] Appointment creation completed successfully');
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

const completeConsultation = async ({ appointmentId, doctorUserId, prescriptionIssued = false }) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    $or: [{ doctorUserId }, { doctorId: doctorUserId }]
  });

  if (!appointment) {
    throw new Error('Appointment not found for this doctor');
  }

  // Update appointment status
  appointment.status = 'completed';
  appointment.completedAt = new Date();
  appointment.prescriptionIssued = prescriptionIssued;
  await appointment.save();

  // Send consultation completion notifications asynchronously
  try {
    // Fetch patient data
    const patientResponse = await axios.get(`${env.authServiceUrl}/api/auth/users/${appointment.patientId}`, {
      timeout: 5000,
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_KEY || 'internal-key'
      }
    });
    const patientData = patientResponse.data;

    // Fetch doctor data
    const doctorResponse = await axios.get(`${env.authServiceUrl}/api/auth/doctors/${appointment.doctorId}`, {
      timeout: 5000,
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_KEY || 'internal-key'
      }
    });
    const doctorData = doctorResponse.data;

    // Send notifications
    await axios.post(`${env.notificationServiceUrl}/api/notifications/consultation-completed`, {
      appointmentData: {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration || '30 minutes',
        consultationLink: appointment.consultationLink,
        recordsLink: appointment.recordsLink
      },
      patientData: {
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone
      },
      doctorData: {
        name: doctorData.name,
        email: doctorData.email,
        phone: doctorData.phone,
        specialization: doctorData.specialization
      },
      prescriptionIssued
    }, {
      timeout: 10000,
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_KEY || 'internal-key'
      }
    });

  } catch (notificationError) {
    // Log notification error but don't fail the consultation completion
    console.error('Failed to send consultation completion notifications:', notificationError.message);
  }

  return appointment;
};

module.exports = {
  getModuleInfo,
  getMyAppointmentAccessInfo,
  getAppointmentsForDoctor,
  getDoctorsForPatient,
  createAppointmentForPatient,
  getAppointmentsForPatient,
  createMeetingForAppointment,
  getMeetingAccessForUser,
  completeConsultation
};