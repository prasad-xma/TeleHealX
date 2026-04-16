const Appointment = require("../models/appointment.model");
const env = require("../config/env");
const AppError = require("../utils/appError");
const {
  APPOINTMENT_STATUS,
  PAYMENT_MODE,
  PAYMENT_STATUS,
  SLOT_STATE,
  ACTIVE_BLOCKING_APPOINTMENT_STATUSES,
  ALLOWED_APPOINTMENT_STATUS_TRANSITIONS,
  ALLOWED_PAYMENT_STATUS_TRANSITIONS,
  USER_ROLES
} = require("../utils/constants");
const {
  validateDateKey,
  validateTime24,
  combineDateAndTime,
  addMinutes,
  formatTime24,
  getDayNameFromDateKey,
  isPastDateTime
} = require("../utils/dateTime");
const doctorIntegration = require("../integrations/doctor.integration");
const patientIntegration = require("../integrations/patient.integration");

const buildAppointmentNumber = () => {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `APPT-${Date.now()}-${randomPart}`;
};

const validatePaymentMode = (paymentMode) => {
  if (!Object.values(PAYMENT_MODE).includes(paymentMode)) {
    throw new AppError("Invalid payment mode", 400);
  }
};

const pushStatusHistory = (appointment, status, note, user) => {
  appointment.statusHistory.push({
    status,
    note: note || "",
    changedBy: {
      userId: user?.userId || null,
      role: user?.role || null
    },
    changedAt: new Date()
  });
};

const ensureTransitionAllowed = (currentStatus, nextStatus) => {
  const allowed = ALLOWED_APPOINTMENT_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Invalid appointment status transition from ${currentStatus} to ${nextStatus}`,
      400
    );
  }
};

const ensurePaymentTransitionAllowed = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowed = ALLOWED_PAYMENT_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Invalid payment status transition from ${currentStatus} to ${nextStatus}`,
      400
    );
  }
};

const mapAppointmentForResponse = (appointment) => {
  return {
    id: appointment._id,
    appointmentNumber: appointment.appointmentNumber,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    doctorSnapshot: appointment.doctorSnapshot,
    patientSnapshot: appointment.patientSnapshot,
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    appointmentStart: appointment.appointmentStart,
    appointmentEnd: appointment.appointmentEnd,
    timezone: appointment.timezone,
    slotDurationMinutes: appointment.slotDurationMinutes,
    bookingReason: appointment.bookingReason,
    paymentMode: appointment.paymentMode,
    paymentStatus: appointment.paymentStatus,
    appointmentStatus: appointment.appointmentStatus,
    paymentReferenceId: appointment.paymentReferenceId,
    rescheduleCount: appointment.rescheduleCount,
    cancellationReason: appointment.cancellationReason,
    rejectionReason: appointment.rejectionReason,
    statusHistory: appointment.statusHistory,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt
  };
};

const getModuleInfo = async () => {
  return {
    module: "appointment-service",
    version: "v1",
    status: "active",
    keyFeatures: [
      "doctor search for booking",
      "doctor details for booking",
      "slot generation from doctor availability",
      "appointment creation",
      "appointment cancellation",
      "appointment rescheduling",
      "patient appointment listing",
      "doctor appointment listing",
      "appointment status updates",
      "payment status updates"
    ]
  };
};

const getMyAppointmentAccessInfo = async (user) => {
  return {
    authenticated: true,
    user
  };
};

const getDoctorsForBooking = async (query) => {
  const specialty = query.specialty || "";
  const search = query.search || "";

  const doctors = await doctorIntegration.getDoctors({ specialty, search });

  return doctors.map((doctor) => ({
    doctorId: doctor.doctorId,
    name: doctor.name,
    specialty: doctor.specialty,
    experienceYears: doctor.experienceYears,
    consultationFee: doctor.consultationFee,
    profileImage: doctor.profileImage,
    profileSummary: doctor.profileSummary
  }));
};

const getDoctorDetailsForBooking = async (doctorId) => {
  const doctor = await doctorIntegration.getDoctorById(doctorId);

  return {
    doctorId: doctor.doctorId,
    name: doctor.name,
    specialty: doctor.specialty,
    experienceYears: doctor.experienceYears,
    consultationFee: doctor.consultationFee,
    profileImage: doctor.profileImage,
    profileSummary: doctor.profileSummary,
    availability: doctor.availability || []
  };
};

const generateSlotsFromAvailability = ({ doctor, date }) => {
  const dayName = getDayNameFromDateKey(date);
  const availabilityRules = (doctor.availability || []).filter((rule) => rule.day === dayName);

  if (!availabilityRules.length) {
    return [];
  }

  const slots = [];

  for (const rule of availabilityRules) {
    validateTime24(rule.startTime, "availability startTime");
    validateTime24(rule.endTime, "availability endTime");

    const slotDurationMinutes = Number(rule.slotDurationMinutes || 30);

    const windowStart = combineDateAndTime(date, rule.startTime);
    const windowEnd = combineDateAndTime(date, rule.endTime);

    let current = new Date(windowStart);

    while (current < windowEnd) {
      const slotStart = new Date(current);
      const slotEnd = addMinutes(slotStart, slotDurationMinutes);

      if (slotEnd <= windowEnd) {
        slots.push({
          startTime: formatTime24(slotStart),
          endTime: formatTime24(slotEnd),
          startDateTime: slotStart,
          endDateTime: slotEnd,
          slotDurationMinutes
        });
      }

      current = addMinutes(current, slotDurationMinutes);
    }
  }

  return slots;
};

const getBookedAppointmentsForDoctorDate = async ({ doctorId, date }) => {
  return Appointment.find({
    doctorId,
    appointmentDate: date,
    appointmentStatus: { $in: ACTIVE_BLOCKING_APPOINTMENT_STATUSES }
  }).lean();
};

const getDoctorSlots = async ({ doctorId, date }) => {
  validateDateKey(date);

  const doctor = await doctorIntegration.getDoctorById(doctorId);
  const generatedSlots = generateSlotsFromAvailability({ doctor, date });
  const bookedAppointments = await getBookedAppointmentsForDoctorDate({ doctorId, date });

  const slots = generatedSlots.map((slot) => {
    const isPast = isPastDateTime(slot.startDateTime);
    const matchingAppointment = bookedAppointments.find(
      (appointment) =>
        new Date(appointment.appointmentStart).getTime() === slot.startDateTime.getTime()
    );

    let state = SLOT_STATE.AVAILABLE;

    if (isPast) {
      state = SLOT_STATE.UNAVAILABLE;
    } else if (matchingAppointment) {
      state = SLOT_STATE.BOOKED;
    }

    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDurationMinutes: slot.slotDurationMinutes,
      state
    };
  });

  return {
    doctorId: doctor.doctorId,
    date,
    slots
  };
};

const ensureSlotAvailable = async ({ doctorId, appointmentDate, startTime }) => {
  const slotData = await getDoctorSlots({
    doctorId,
    date: appointmentDate
  });

  const slot = slotData.slots.find((item) => item.startTime === startTime);

  if (!slot) {
    throw new AppError("Selected slot does not exist for this doctor/date", 400);
  }

  if (slot.state !== SLOT_STATE.AVAILABLE) {
    throw new AppError("Selected slot is not available", 409);
  }

  return slot;
};

const createAppointment = async ({ user, payload }) => {
  if (user.role !== USER_ROLES.PATIENT && user.role !== USER_ROLES.ADMIN) {
    throw new AppError("Only patients can create appointments", 403);
  }

  const {
    doctorId,
    appointmentDate,
    startTime,
    paymentMode,
    bookingReason = ""
  } = payload;

  if (!doctorId || !appointmentDate || !startTime || !paymentMode) {
    throw new AppError("doctorId, appointmentDate, startTime, and paymentMode are required", 400);
  }

  validateDateKey(appointmentDate);
  validateTime24(startTime, "startTime");
  validatePaymentMode(paymentMode);

  const doctor = await doctorIntegration.getDoctorById(doctorId);
  const patient = await patientIntegration.getPatientProfile(user);

  const slot = await ensureSlotAvailable({
    doctorId,
    appointmentDate,
    startTime
  });

  const appointmentStart = combineDateAndTime(appointmentDate, slot.startTime);
  const appointmentEnd = combineDateAndTime(appointmentDate, slot.endTime);

  const conflictingAppointment = await Appointment.findOne({
    doctorId,
    appointmentStart,
    appointmentStatus: { $in: ACTIVE_BLOCKING_APPOINTMENT_STATUSES }
  });

  if (conflictingAppointment) {
    throw new AppError("This slot has already been booked by another patient", 409);
  }

  const appointmentStatus =
    paymentMode === PAYMENT_MODE.ONLINE
      ? APPOINTMENT_STATUS.PENDING_PAYMENT
      : APPOINTMENT_STATUS.CONFIRMED;

  const paymentStatus = PAYMENT_STATUS.PENDING;

  const appointment = new Appointment({
    appointmentNumber: buildAppointmentNumber(),
    patientId: patient.patientId,
    doctorId: doctor.doctorId,
    doctorSnapshot: {
      doctorId: doctor.doctorId,
      name: doctor.name,
      specialty: doctor.specialty,
      experienceYears: doctor.experienceYears,
      consultationFee: doctor.consultationFee,
      profileImage: doctor.profileImage,
      profileSummary: doctor.profileSummary
    },
    patientSnapshot: {
      patientId: patient.patientId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone
    },
    appointmentDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
    appointmentStart,
    appointmentEnd,
    timezone: env.defaultTimezone,
    slotDurationMinutes: slot.slotDurationMinutes,
    bookingReason,
    paymentMode,
    paymentStatus,
    appointmentStatus,
    statusHistory: []
  });

  pushStatusHistory(
    appointment,
    appointmentStatus,
    paymentMode === PAYMENT_MODE.ONLINE
      ? "Appointment created and waiting for online payment"
      : "Appointment confirmed with manual payment mode",
    user
  );

  await appointment.save();

  return mapAppointmentForResponse(appointment);
};

const getMyAppointments = async (user) => {
  const appointments = await Appointment.find({ patientId: user.userId }).sort({
    appointmentStart: 1
  });

  return appointments.map(mapAppointmentForResponse);
};

const getDoctorAppointments = async (user) => {
  const appointments = await Appointment.find({ doctorId: user.userId }).sort({
    appointmentStart: 1
  });

  return appointments.map(mapAppointmentForResponse);
};

const ensureAppointmentAccess = (appointment, user) => {
  const isAdmin = user.role === USER_ROLES.ADMIN;
  const isPatientOwner = appointment.patientId === user.userId;
  const isDoctorOwner = appointment.doctorId === user.userId;

  if (!isAdmin && !isPatientOwner && !isDoctorOwner) {
    throw new AppError("You do not have access to this appointment", 403);
  }
};

const getAppointmentById = async ({ appointmentId, user }) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureAppointmentAccess(appointment, user);

  return mapAppointmentForResponse(appointment);
};

const cancelAppointment = async ({ appointmentId, user, payload }) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureAppointmentAccess(appointment, user);

  if (
    ![
      APPOINTMENT_STATUS.CONFIRMED,
      APPOINTMENT_STATUS.PENDING_PAYMENT,
      APPOINTMENT_STATUS.RESCHEDULED
    ].includes(appointment.appointmentStatus)
  ) {
    throw new AppError("This appointment cannot be cancelled", 400);
  }

  appointment.appointmentStatus = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancellationReason = payload?.reason || "";
  pushStatusHistory(
    appointment,
    APPOINTMENT_STATUS.CANCELLED,
    appointment.cancellationReason || "Appointment cancelled",
    user
  );

  await appointment.save();

  return mapAppointmentForResponse(appointment);
};

const rescheduleAppointment = async ({ appointmentId, user, payload }) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureAppointmentAccess(appointment, user);

  if (appointment.patientId !== user.userId && user.role !== USER_ROLES.ADMIN) {
    throw new AppError("Only the patient can reschedule this appointment", 403);
  }

  if (
    ![
      APPOINTMENT_STATUS.CONFIRMED,
      APPOINTMENT_STATUS.PENDING_PAYMENT,
      APPOINTMENT_STATUS.RESCHEDULED
    ].includes(appointment.appointmentStatus)
  ) {
    throw new AppError("This appointment cannot be rescheduled", 400);
  }

  if (appointment.rescheduleCount >= env.maxRescheduleCount) {
    throw new AppError(`Maximum reschedule limit reached (${env.maxRescheduleCount})`, 400);
  }

  const { appointmentDate, startTime } = payload || {};

  if (!appointmentDate || !startTime) {
    throw new AppError("appointmentDate and startTime are required for rescheduling", 400);
  }

  validateDateKey(appointmentDate);
  validateTime24(startTime, "startTime");

  const doctor = await doctorIntegration.getDoctorById(appointment.doctorId);

  const slot = await ensureSlotAvailable({
    doctorId: appointment.doctorId,
    appointmentDate,
    startTime
  });

  const appointmentStart = combineDateAndTime(appointmentDate, slot.startTime);

  const conflictingAppointment = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctorId: appointment.doctorId,
    appointmentStart,
    appointmentStatus: { $in: ACTIVE_BLOCKING_APPOINTMENT_STATUSES }
  });

  if (conflictingAppointment) {
    throw new AppError("This new slot is already booked", 409);
  }

  appointment.appointmentDate = appointmentDate;
  appointment.startTime = slot.startTime;
  appointment.endTime = slot.endTime;
  appointment.appointmentStart = combineDateAndTime(appointmentDate, slot.startTime);
  appointment.appointmentEnd = combineDateAndTime(appointmentDate, slot.endTime);
  appointment.slotDurationMinutes = slot.slotDurationMinutes;
  appointment.rescheduleCount += 1;
  appointment.appointmentStatus =
    appointment.paymentMode === PAYMENT_MODE.ONLINE &&
    appointment.paymentStatus !== PAYMENT_STATUS.PAID
      ? APPOINTMENT_STATUS.PENDING_PAYMENT
      : APPOINTMENT_STATUS.CONFIRMED;

  appointment.doctorSnapshot = {
    doctorId: doctor.doctorId,
    name: doctor.name,
    specialty: doctor.specialty,
    experienceYears: doctor.experienceYears,
    consultationFee: doctor.consultationFee,
    profileImage: doctor.profileImage,
    profileSummary: doctor.profileSummary
  };

  pushStatusHistory(
    appointment,
    APPOINTMENT_STATUS.RESCHEDULED,
    `Appointment moved to ${appointmentDate} ${slot.startTime}`,
    user
  );

  await appointment.save();

  return mapAppointmentForResponse(appointment);
};

const updateAppointmentStatus = async ({ appointmentId, user, payload }) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureAppointmentAccess(appointment, user);

  if (appointment.doctorId !== user.userId && user.role !== USER_ROLES.ADMIN) {
    throw new AppError("Only the assigned doctor can update appointment status", 403);
  }

  const { status, note = "" } = payload || {};

  if (!status) {
    throw new AppError("status is required", 400);
  }

  ensureTransitionAllowed(appointment.appointmentStatus, status);

  if (
    appointment.paymentMode === PAYMENT_MODE.ONLINE &&
    appointment.paymentStatus !== PAYMENT_STATUS.PAID &&
    status === APPOINTMENT_STATUS.CONFIRMED
  ) {
    throw new AppError("Online payment appointment cannot be confirmed before payment success", 400);
  }

  appointment.appointmentStatus = status;

  if (status === APPOINTMENT_STATUS.REJECTED) {
    appointment.rejectionReason = note;
  }

  if (status === APPOINTMENT_STATUS.CANCELLED) {
    appointment.cancellationReason = note;
  }

  pushStatusHistory(appointment, status, note || `Appointment status changed to ${status}`, user);

  await appointment.save();

  return mapAppointmentForResponse(appointment);
};

const updateAppointmentPaymentStatus = async ({ appointmentId, user, payload }) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureAppointmentAccess(appointment, user);

  const { paymentStatus, paymentReferenceId = null, note = "" } = payload || {};

  if (!paymentStatus) {
    throw new AppError("paymentStatus is required", 400);
  }

  ensurePaymentTransitionAllowed(appointment.paymentStatus, paymentStatus);

  appointment.paymentStatus = paymentStatus;

  if (paymentReferenceId) {
    appointment.paymentReferenceId = paymentReferenceId;
  }

  if (
    appointment.paymentMode === PAYMENT_MODE.ONLINE &&
    paymentStatus === PAYMENT_STATUS.PAID &&
    appointment.appointmentStatus === APPOINTMENT_STATUS.PENDING_PAYMENT
  ) {
    appointment.appointmentStatus = APPOINTMENT_STATUS.CONFIRMED;
    pushStatusHistory(
      appointment,
      APPOINTMENT_STATUS.CONFIRMED,
      "Appointment confirmed after successful online payment",
      user
    );
  }

  if (
    appointment.paymentMode === PAYMENT_MODE.ONLINE &&
    paymentStatus === PAYMENT_STATUS.FAILED &&
    appointment.appointmentStatus === APPOINTMENT_STATUS.CONFIRMED
  ) {
    throw new AppError("Cannot set payment to FAILED after appointment already confirmed", 400);
  }

  pushStatusHistory(
    appointment,
    appointment.appointmentStatus,
    note || `Payment status changed to ${paymentStatus}`,
    user
  );

  await appointment.save();

  return mapAppointmentForResponse(appointment);
};

module.exports = {
  getModuleInfo,
  getMyAppointmentAccessInfo,
  getDoctorsForBooking,
  getDoctorDetailsForBooking,
  getDoctorSlots,
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  updateAppointmentPaymentStatus
};