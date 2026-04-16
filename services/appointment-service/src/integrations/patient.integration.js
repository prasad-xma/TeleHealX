const axios = require("axios");
const env = require("../config/env");
const AppError = require("../utils/appError");

const useMockPatientService = () => {
  return String(env.useMockPatientService).toLowerCase() === "true";
};

const getPatientProfileMock = async (user) => {
  return {
    patientId: user.userId,
    name: user.raw?.name || "Demo Patient",
    email: user.email || "demo.patient@example.com",
    phone: user.raw?.phone || "0770000000"
  };
};

const normalizePatient = (patient, fallbackUser) => {
  return {
    patientId: patient.patientId || patient._id || patient.id || fallbackUser.userId,
    name: patient.name || fallbackUser.raw?.name || "Patient",
    email: patient.email || fallbackUser.email || "",
    phone: patient.phone || ""
  };
};

const getPatientProfile = async (user) => {
  if (useMockPatientService()) {
    return getPatientProfileMock(user);
  }

  try {
    const response = await axios.get(`${env.patientServiceUrl}/api/patients/me`, {
      headers: {
        Authorization: `Bearer ${user.raw?.token || ""}`
      }
    });

    const patient = response?.data?.data || response?.data;

    if (!patient) {
      throw new AppError("Patient profile not found", 404);
    }

    return normalizePatient(patient, user);
  } catch (error) {
    return getPatientProfileMock(user);
  }
};

module.exports = {
  getPatientProfile
};