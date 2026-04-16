const Appointment = require("../models/Appointment");
const axios = require("axios");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const env = require("../config/env");

const normalizeDoctorListFromAuthResponse = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && payload.data && Array.isArray(payload.data.doctors)) {
    return payload.data.doctors;
  }

  if (payload && Array.isArray(payload.doctors)) {
    return payload.doctors;
  }

  return [];
};

const normalizeDoctorObject = (doctor = {}) => {
  return {
    id: doctor._id || doctor.id || doctor.userId || null,
    userId: doctor.userId || doctor._id || doctor.id || null,
    name:
      doctor.name ||
      doctor.fullName ||
      doctor.doctorName ||
      `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
      "Doctor",
    email: doctor.email || null,
    specialty:
      doctor.specialty ||
      doctor.specialisation ||
      doctor.specialization ||
      doctor.category ||
      null,
    experience: doctor.experience || null,
    profileImage: doctor.profileImage || doctor.image || doctor.avatar || null,
    raw: doctor
  };
};

const getModuleInfo = async () => {
  return {
    module: "appointment-service",
    version: "v1",
    status: "stable-foundation",
    featuresAvailable: [
      "health check",
      "auth-protected routes",
      "doctor fetch for patient",
      "patient booking base route",
      "patient appointments fetch",
      "doctor appointments fetch",
      "doctor meeting room creation",
      "meeting access validation"
    ],
    nextPhase: [
      "doctor specialty filtering",
      "doctor details enrichment",
      "slot availability logic",
      "reschedule and cancellation enhancements",
      "payment integration"
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

const getDoctorsForPatient = async ({ name = "", limit = 10 }) => {
  if (!env.authServiceUrl) {
    throw new AppError("AUTH_SERVICE_URL is not configured", 500);
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 50));

  try {
    const response = await axios.get(`${env.authServiceUrl}/api/auth/doctors`, {
      params: name ? { name } : undefined,
      timeout: 8000
    });

    const doctors = normalizeDoctorListFromAuthResponse(response.data)
      .map(normalizeDoctorObject)
      .filter((doctor) => doctor.id)
      .slice(0, safeLimit);

    return {
      doctors,
      totalDoctors: doctors.length
    };
  } catch (error) {
    const upstreamMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch doctors from auth-service";

    throw new AppError(upstreamMessage, error.response?.status || 502);
  }
};

const createAppointmentForPatient = async ({
  patientId,
  patientName,
  doctorId,
  doctorName,
  date,
  time,
  type,
  notes,
  isVideoConsultation
}) => {
  if (!doctorId) {
    throw new AppError("Doctor is required", 400);
  }

  if (!patientId) {
    throw new AppError("Patient is required", 400);
  }

  if (!date || !time) {
    throw new AppError("Date and time are required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(String(doctorId))) {
    throw new AppError("Invalid doctorId", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(String(patientId))) {
    throw new AppError("Invalid patientId", 400);
  }

  const existingAppointment = await Appointment.findOne({
    $or: [
      { doctorUserId: doctorId, date, time, status: { $ne: "cancelled" } },
      { doctorId, date, time, status: { $ne: "cancelled" } }
    ]
  }).lean();

  if (existingAppointment) {
    throw new AppError("Selected doctor slot is already booked", 409);
  }

  const created = await Appointment.create({
    doctorId,
    doctorUserId: doctorId,
    patientId,
    patientName: String(patientName || "Patient").trim(),
    doctorName: String(doctorName || "Doctor").trim(),
    date: String(date).trim(),
    time: String(time).trim(),
    type: type || "consultation",
    notes: notes || "",
    isVideoConsultation: Boolean(isVideoConsultation),
    status: "scheduled"
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
    throw new AppError("Appointment not found for this doctor", 404);
  }

  const hasReadableRoomName =
    Boolean(appointment.meetingRoomName) &&
    appointment.meetingRoomName.includes("-with-");

  if (!hasReadableRoomName) {
    const slugify = (value = "") =>
      String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24);

    const doctorSlug = slugify(appointment.doctorName) || "doctor";
    const patientSlug = slugify(appointment.patientName) || "patient";
    const suffix = String(appointment._id).slice(-6);

    appointment.meetingRoomName = `${doctorSlug}-with-${patientSlug}-${suffix}`;
    appointment.meetingCreatedAt = new Date();
    await appointment.save();
  }

  return appointment.toObject();
};

const getMeetingAccessForUser = async ({ roomName, userId, role }) => {
  const normalizedRoomName = String(roomName || "").trim();

  if (!normalizedRoomName) {
    throw new AppError("roomName is required", 400);
  }

  const appointment = await Appointment.findOne({
    meetingRoomName: normalizedRoomName
  }).lean();

  if (!appointment) {
    throw new AppError("Meeting room not found", 404);
  }

  if (role === "doctor") {
    const doctorMatches =
      String(appointment.doctorUserId || appointment.doctorId || "") ===
      String(userId || "");

    if (!doctorMatches) {
      throw new AppError("You are not assigned as doctor for this appointment", 403);
    }
  } else if (role === "patient") {
    const patientMatches =
      String(appointment.patientId || "") === String(userId || "");

    if (!patientMatches) {
      throw new AppError("You are not assigned as patient for this appointment", 403);
    }
  } else {
    throw new AppError("Role is not allowed for this meeting", 403);
  }

  return {
    roomName: normalizedRoomName,
    appointmentId: String(appointment._id),
    doctorId: String(appointment.doctorUserId || appointment.doctorId || ""),
    patientId: String(appointment.patientId || ""),
    doctorName: appointment.doctorName || "Doctor",
    patientName: appointment.patientName || "Patient"
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