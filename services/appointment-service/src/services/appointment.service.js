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

const textIncludes = (value, search) => {
  return String(value || "")
    .toLowerCase()
    .includes(String(search || "").toLowerCase());
};

const normalizeDoctorObject = (doctor = {}) => {
  const firstName = doctor.firstName || "";
  const lastName = doctor.lastName || "";
  const combinedName = `${firstName} ${lastName}`.trim();

  const name =
    doctor.name ||
    doctor.fullName ||
    doctor.doctorName ||
    combinedName ||
    "Doctor";

  const specialty =
    doctor.specialty ||
    doctor.specialisation ||
    doctor.specialization ||
    doctor.category ||
    doctor.department ||
    "";

  const fee =
    doctor.consultationFee ||
    doctor.fee ||
    doctor.appointmentFee ||
    doctor.sessionFee ||
    null;

  const experience =
    doctor.experience ||
    doctor.experienceYears ||
    doctor.yearsOfExperience ||
    null;

  const qualification =
    doctor.qualification ||
    doctor.qualifications ||
    doctor.degree ||
    null;

  const about =
    doctor.about ||
    doctor.bio ||
    doctor.description ||
    doctor.profileSummary ||
    "";

  const availability =
    doctor.availability ||
    doctor.availableSlots ||
    doctor.schedule ||
    [];

  return {
    id: doctor._id || doctor.id || doctor.userId || null,
    userId: doctor.userId || doctor._id || doctor.id || null,
    name,
    email: doctor.email || null,
    phone: doctor.phone || doctor.mobile || null,
    specialty,
    experience,
    qualification,
    fee,
    about,
    profileImage: doctor.profileImage || doctor.image || doctor.avatar || null,
    availability,
    hospital: doctor.hospital || doctor.clinic || doctor.workplace || null,
    address: doctor.address || null,
    raw: doctor
  };
};

const fetchDoctorsFromAuthService = async (params) => {
  if (!env.authServiceUrl) {
    throw new AppError("AUTH_SERVICE_URL is not configured", 500);
  }

  try {
    const response = await axios.get(`${env.authServiceUrl}/api/auth/doctors`, {
      params,
      timeout: 8000
    });

    return normalizeDoctorListFromAuthResponse(response.data).map(normalizeDoctorObject);
  } catch (error) {
    const upstreamMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch doctors from auth-service";

    throw new AppError(upstreamMessage, error.response?.status || 502);
  }
};

const fetchDoctorByIdFromAuthService = async (doctorId) => {
  if (!env.authServiceUrl) {
    throw new AppError("AUTH_SERVICE_URL is not configured", 500);
  }

  try {
    const response = await axios.get(
      `${env.authServiceUrl}/api/auth/doctors/${doctorId}`,
      {
        timeout: 8000
      }
    );

    const payload = response.data?.data || response.data;
    return normalizeDoctorObject(payload);
  } catch (error) {
    // Fallback: if auth-service does not support /doctors/:id,
    // fetch doctor list and find locally without changing auth-service.
    if (error.response?.status === 404 || error.response?.status === 405) {
      const doctors = await fetchDoctorsFromAuthService();
      return doctors.find((doctor) => String(doctor.id) === String(doctorId)) || null;
    }

    const upstreamMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch doctor details from auth-service";

    throw new AppError(upstreamMessage, error.response?.status || 502);
  }
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
      "doctor detail fetch for booking page",
      "patient booking base route",
      "patient appointments fetch",
      "doctor appointments fetch",
      "doctor meeting room creation",
      "meeting access validation"
    ],
    nextPhase: [
      "slot availability logic",
      "doctor schedule validation",
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

const getDoctorsForPatient = async ({ name = "", specialty = "", limit = 10 }) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 50));

  const doctors = await fetchDoctorsFromAuthService(name ? { name } : undefined);

  const filteredDoctors = doctors
    .filter((doctor) => doctor.id)
    .filter((doctor) => {
      if (!name) return true;
      return textIncludes(doctor.name, name);
    })
    .filter((doctor) => {
      if (!specialty) return true;
      return textIncludes(doctor.specialty, specialty);
    })
    .slice(0, safeLimit);

  return {
    filters: {
      name,
      specialty,
      limit: safeLimit
    },
    doctors: filteredDoctors,
    totalDoctors: filteredDoctors.length
  };
};

const getDoctorDetailsForPatient = async ({ doctorId }) => {
  if (!doctorId) {
    throw new AppError("doctorId is required", 400);
  }

  const doctor = await fetchDoctorByIdFromAuthService(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  return {
    doctor
  };
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
  getDoctorDetailsForPatient,
  createAppointmentForPatient,
  getAppointmentsForPatient,
  createMeetingForAppointment,
  getMeetingAccessForUser
};