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

const isValidDateKey = (date) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date || "").trim());
};

const getDayNameFromDate = (date) => {
  const dayIndex = new Date(`${date}T00:00:00`).getDay();
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return dayNames[dayIndex];
};

const convertTimeStringToMinutes = (time) => {
  const value = String(time || "").trim().toUpperCase();

  const match12Hour = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
  if (match12Hour) {
    let hours = Number(match12Hour[1]);
    const minutes = Number(match12Hour[2]);
    const meridiem = match12Hour[3];

    if (meridiem === "AM" && hours === 12) hours = 0;
    if (meridiem === "PM" && hours !== 12) hours += 12;

    return hours * 60 + minutes;
  }

  const match24Hour = value.match(/^(\d{1,2}):(\d{2})$/);
  if (match24Hour) {
    const hours = Number(match24Hour[1]);
    const minutes = Number(match24Hour[2]);
    return hours * 60 + minutes;
  }

  return null;
};

const formatMinutesTo12Hour = (totalMinutes) => {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${meridiem}`;
};

const buildSlotsFromRange = ({ start, end, stepMinutes = 30 }) => {
  const startMinutes = convertTimeStringToMinutes(start);
  const endMinutes = convertTimeStringToMinutes(end);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return [];
  }

  const slots = [];
  for (let current = startMinutes; current < endMinutes; current += stepMinutes) {
    slots.push(formatMinutesTo12Hour(current));
  }

  return slots;
};

const getFallbackSlots = () => {
  return buildSlotsFromRange({
    start: "05:00 PM",
    end: "09:00 PM",
    stepMinutes: 30
  });
};

const extractSlotsFromDoctorAvailability = (availability, date) => {
  const fallbackSlots = getFallbackSlots();

  if (!availability) {
    return {
      slots: fallbackSlots,
      source: "TEMP_FALLBACK"
    };
  }

  if (Array.isArray(availability) && availability.length === 0) {
    return {
      slots: fallbackSlots,
      source: "TEMP_FALLBACK"
    };
  }

  if (
    Array.isArray(availability) &&
    availability.every((item) => typeof item === "string")
  ) {
    return {
      slots: availability,
      source: "DOCTOR_DATA"
    };
  }

  const dayKey = getDayNameFromDate(date);

  if (Array.isArray(availability)) {
    const matchingEntry = availability.find((item) => {
      const entryDay =
        String(item?.day || item?.dayName || item?.weekDay || "")
          .trim()
          .toLowerCase()
          .slice(0, 3);

      return entryDay === dayKey;
    });

    if (matchingEntry) {
      if (Array.isArray(matchingEntry.slots) && matchingEntry.slots.length > 0) {
        return {
          slots: matchingEntry.slots,
          source: "DOCTOR_DATA"
        };
      }

      if (matchingEntry.start && matchingEntry.end) {
        return {
          slots: buildSlotsFromRange({
            start: matchingEntry.start,
            end: matchingEntry.end,
            stepMinutes: Number(matchingEntry.stepMinutes || 30)
          }),
          source: "DOCTOR_DATA"
        };
      }
    }
  }

  if (typeof availability === "object" && !Array.isArray(availability)) {
    const dayValue = availability[dayKey];

    if (Array.isArray(dayValue) && dayValue.length > 0) {
      return {
        slots: dayValue,
        source: "DOCTOR_DATA"
      };
    }

    if (dayValue && dayValue.start && dayValue.end) {
      return {
        slots: buildSlotsFromRange({
          start: dayValue.start,
          end: dayValue.end,
          stepMinutes: Number(dayValue.stepMinutes || 30)
        }),
        source: "DOCTOR_DATA"
      };
    }
  }

  return {
    slots: fallbackSlots,
    source: "TEMP_FALLBACK"
  };
};

const buildInitialStatusData = ({ paymentMode }) => {
  if (paymentMode === "ONLINE") {
    return {
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      historyNote: "Appointment created and waiting for online payment"
    };
  }

  return {
    status: "CONFIRMED",
    paymentStatus: "UNPAID",
    historyNote: "Appointment created with manual payment"
  };
};

const appendStatusHistory = (appointment, status, note) => {
  appointment.statusHistory.push({
    status,
    note,
    changedAt: new Date()
  });
};

const findPatientAppointmentOrThrow = async ({ appointmentId, patientId }) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patientId
  });

  if (!appointment) {
    throw new AppError("Appointment not found for this patient", 404);
  }

  return appointment;
};

const generateAppointmentNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900);

  return `APT-${year}-${timestampPart}${randomPart}`;
};

const createUniqueAppointmentNumber = async () => {
  let appointmentNumber = generateAppointmentNumber();
  let exists = await Appointment.exists({ appointmentNumber });

  while (exists) {
    appointmentNumber = generateAppointmentNumber();
    exists = await Appointment.exists({ appointmentNumber });
  }

  return appointmentNumber;
};

const getModuleInfo = async () => {
  return {
    module: "appointment-service",
    version: "v1",
    status: "payment-sync-ready",
    featuresAvailable: [
      "health check",
      "auth-protected routes",
      "doctor fetch for patient",
      "doctor detail fetch for booking page",
      "doctor slot fetch for booking page",
      "appointment booking with manual payment",
      "appointment booking with online payment pending state",
      "patient appointment list",
      "patient appointment detail",
      "patient cancel appointment",
      "patient reschedule appointment",
      "doctor appointments fetch",
      "doctor cancel appointment",
      "doctor complete appointment",
      "internal payment status update endpoint",
      "doctor meeting room creation",
      "meeting access validation"
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

const getDoctorSlotsForPatient = async ({ doctorId, date }) => {
  if (!doctorId) {
    throw new AppError("doctorId is required", 400);
  }

  if (!date) {
    throw new AppError("date is required", 400);
  }

  if (!isValidDateKey(date)) {
    throw new AppError("date must be in YYYY-MM-DD format", 400);
  }

  const doctor = await fetchDoctorByIdFromAuthService(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const { slots, source } = extractSlotsFromDoctorAvailability(doctor.availability, date);

  const bookedAppointments = await Appointment.find({
    $or: [{ doctorUserId: doctorId }, { doctorId }],
    date,
    status: { $ne: "CANCELLED" }
  })
    .select("time status")
    .lean();

  const bookedTimeSet = new Set(
    bookedAppointments.map((item) => String(item.time || "").trim())
  );

  const slotItems = slots.map((time) => {
    const normalizedTime = String(time || "").trim();
    const isBooked = bookedTimeSet.has(normalizedTime);

    return {
      time: normalizedTime,
      status: isBooked ? "BOOKED" : "AVAILABLE",
      isAvailable: !isBooked
    };
  });

  return {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      fee: doctor.fee,
      profileImage: doctor.profileImage
    },
    date,
    slotSource: source,
    note:
      source === "TEMP_FALLBACK"
        ? "Temporary fallback slots are used because structured doctor availability is not fully available from upstream service yet."
        : "Slots generated from doctor availability data.",
    slots: slotItems,
    totalSlots: slotItems.length,
    bookedSlots: slotItems.filter((slot) => slot.status === "BOOKED").length,
    availableSlots: slotItems.filter((slot) => slot.status === "AVAILABLE").length
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
  isVideoConsultation,
  paymentMode,
  consultationFee
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

  if (!isValidDateKey(date)) {
    throw new AppError("date must be in YYYY-MM-DD format", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(String(doctorId))) {
    throw new AppError("Invalid doctorId", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(String(patientId))) {
    throw new AppError("Invalid patientId", 400);
  }

  const normalizedPaymentMode =
    String(paymentMode || "MANUAL").trim().toUpperCase();

  if (!["MANUAL", "ONLINE"].includes(normalizedPaymentMode)) {
    throw new AppError("paymentMode must be MANUAL or ONLINE", 400);
  }

  const existingAppointment = await Appointment.findOne({
    $or: [
      { doctorUserId: doctorId, date, time, status: { $ne: "CANCELLED" } },
      { doctorId, date, time, status: { $ne: "CANCELLED" } }
    ]
  }).lean();

  if (existingAppointment) {
    throw new AppError("Selected doctor slot is already booked", 409);
  }

  const initialStatusData = buildInitialStatusData({
    paymentMode: normalizedPaymentMode
  });

  const appointmentNumber = await createUniqueAppointmentNumber();

  const created = await Appointment.create({
    appointmentNumber,
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
    paymentMode: normalizedPaymentMode,
    paymentStatus: initialStatusData.paymentStatus,
    status: initialStatusData.status,
    consultationFee:
      consultationFee !== undefined && consultationFee !== null
        ? Number(consultationFee)
        : null,
    statusHistory: [
      {
        status: initialStatusData.status,
        note: initialStatusData.historyNote,
        changedAt: new Date()
      }
    ]
  });

  return created;
};

const getAppointmentsForPatient = async (patientId) => {
  const appointments = await Appointment.find({ patientId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    appointments,
    totalAppointments: appointments.length
  };
};

const getPatientAppointmentById = async ({ appointmentId, patientId }) => {
  const appointment = await findPatientAppointmentOrThrow({
    appointmentId,
    patientId
  });

  return {
    appointment
  };
};

const cancelPatientAppointment = async ({ appointmentId, patientId, reason }) => {
  const appointment = await findPatientAppointmentOrThrow({
    appointmentId,
    patientId
  });

  if (appointment.status === "CANCELLED") {
    throw new AppError("Appointment is already cancelled", 400);
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError("Completed appointment cannot be cancelled", 400);
  }

  appointment.status = "CANCELLED";
  appointment.cancellationReason = reason || "Cancelled by patient";
  appointment.cancelledBy = "PATIENT";

  appendStatusHistory(
    appointment,
    "CANCELLED",
    reason || "Appointment cancelled by patient"
  );

  await appointment.save();

  return {
    appointment
  };
};

const reschedulePatientAppointment = async ({
  appointmentId,
  patientId,
  date,
  time
}) => {
  if (!date || !time) {
    throw new AppError("date and time are required", 400);
  }

  if (!isValidDateKey(date)) {
    throw new AppError("date must be in YYYY-MM-DD format", 400);
  }

  const appointment = await findPatientAppointmentOrThrow({
    appointmentId,
    patientId
  });

  if (appointment.status === "CANCELLED") {
    throw new AppError("Cancelled appointment cannot be rescheduled", 400);
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError("Completed appointment cannot be rescheduled", 400);
  }

  if (appointment.rescheduleCount >= env.maxRescheduleCount) {
    throw new AppError(
      `Maximum reschedule count reached (${env.maxRescheduleCount})`,
      400
    );
  }

  const conflictingAppointment = await Appointment.findOne({
    _id: { $ne: appointment._id },
    $or: [
      { doctorUserId: appointment.doctorUserId, date, time, status: { $ne: "CANCELLED" } },
      { doctorId: appointment.doctorId, date, time, status: { $ne: "CANCELLED" } }
    ]
  }).lean();

  if (conflictingAppointment) {
    throw new AppError("Selected doctor slot is already booked", 409);
  }

  appointment.date = String(date).trim();
  appointment.time = String(time).trim();
  appointment.rescheduleCount += 1;

  if (appointment.paymentMode === "ONLINE" && appointment.paymentStatus !== "PAID") {
    appointment.status = "PENDING_PAYMENT";
    appendStatusHistory(
      appointment,
      "PENDING_PAYMENT",
      "Appointment rescheduled and still waiting for online payment"
    );
  } else {
    appointment.status = "CONFIRMED";
    appendStatusHistory(
      appointment,
      "CONFIRMED",
      "Appointment rescheduled successfully"
    );
  }

  await appointment.save();

  return {
    appointment
  };
};

const cancelDoctorAppointment = async ({ appointmentId, doctorId, reason }) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    $or: [{ doctorUserId: doctorId }, { doctorId }]
  });

  if (!appointment) {
    throw new AppError("Appointment not found for this doctor", 404);
  }

  if (appointment.status === "CANCELLED") {
    throw new AppError("Appointment already cancelled", 400);
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError("Completed appointment cannot be cancelled", 400);
  }

  appointment.status = "CANCELLED";
  appointment.cancelledBy = "DOCTOR";
  appointment.cancellationReason = reason || "Cancelled by doctor";

  appendStatusHistory(
    appointment,
    "CANCELLED",
    reason || "Appointment cancelled by doctor"
  );

  await appointment.save();

  return {
    appointment
  };
};

const completeDoctorAppointment = async ({ appointmentId, doctorId }) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    $or: [{ doctorUserId: doctorId }, { doctorId }]
  });

  if (!appointment) {
    throw new AppError("Appointment not found for this doctor", 404);
  }

  if (appointment.status === "CANCELLED") {
    throw new AppError("Cancelled appointment cannot be completed", 400);
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError("Appointment already completed", 400);
  }

  if (
    appointment.paymentMode === "ONLINE" &&
    appointment.paymentStatus !== "PAID"
  ) {
    throw new AppError(
      "Cannot complete appointment before payment is completed",
      400
    );
  }

  appointment.status = "COMPLETED";

  appendStatusHistory(
    appointment,
    "COMPLETED",
    "Appointment marked as completed by doctor"
  );

  await appointment.save();

  return {
    appointment
  };
};

const updateAppointmentPaymentStatusInternal = async ({
  appointmentId,
  paymentStatus,
  appointmentStatus,
  note,
  paymentReference
}) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (paymentStatus) {
    appointment.paymentStatus = String(paymentStatus).trim().toUpperCase();
  }

  if (appointmentStatus) {
    appointment.status = String(appointmentStatus).trim().toUpperCase();
  } else {
    if (appointment.paymentMode === "ONLINE" && appointment.paymentStatus === "PAID") {
      appointment.status = "CONFIRMED";
    }

    if (appointment.paymentMode === "ONLINE" && appointment.paymentStatus === "FAILED") {
      appointment.status = "PENDING_PAYMENT";
    }
  }

  const historyNote =
    note ||
    `Payment status updated to ${appointment.paymentStatus}${paymentReference ? ` (${paymentReference})` : ""}`;

  appendStatusHistory(
    appointment,
    appointment.status,
    historyNote
  );

  await appointment.save();

  return {
    appointment
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
  getDoctorSlotsForPatient,
  createAppointmentForPatient,
  getAppointmentsForPatient,
  getPatientAppointmentById,
  cancelPatientAppointment,
  reschedulePatientAppointment,
  cancelDoctorAppointment,
  completeDoctorAppointment,
  updateAppointmentPaymentStatusInternal,
  createMeetingForAppointment,
  getMeetingAccessForUser
};