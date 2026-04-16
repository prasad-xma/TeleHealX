const axios = require("axios");
const env = require("../config/env");
const AppError = require("../utils/appError");

const mockDoctors = [
  {
    doctorId: "DOC1001",
    name: "Dr. Sarah Perera",
    specialty: "Cardiology",
    experienceYears: 12,
    consultationFee: 5500,
    profileImage: "https://via.placeholder.com/300x200?text=Dr+Sarah+Perera",
    profileSummary: "Experienced cardiologist focused on preventive heart care and long-term patient wellbeing.",
    availability: [
      { day: "MONDAY", startTime: "09:00", endTime: "12:00", slotDurationMinutes: 30 },
      { day: "WEDNESDAY", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 30 },
      { day: "FRIDAY", startTime: "10:00", endTime: "13:00", slotDurationMinutes: 30 }
    ]
  },
  {
    doctorId: "DOC1002",
    name: "Dr. Nimal Fernando",
    specialty: "Dermatology",
    experienceYears: 8,
    consultationFee: 4200,
    profileImage: "https://via.placeholder.com/300x200?text=Dr+Nimal+Fernando",
    profileSummary: "Dermatologist providing diagnosis and treatment for skin, hair, and nail conditions.",
    availability: [
      { day: "TUESDAY", startTime: "09:00", endTime: "15:00", slotDurationMinutes: 30 },
      { day: "THURSDAY", startTime: "13:00", endTime: "18:00", slotDurationMinutes: 30 }
    ]
  },
  {
    doctorId: "DOC1003",
    name: "Dr. Fathima Rizna",
    specialty: "Pediatrics",
    experienceYears: 10,
    consultationFee: 4800,
    profileImage: "https://via.placeholder.com/300x200?text=Dr+Fathima+Rizna",
    profileSummary: "Pediatric specialist dedicated to child health, growth monitoring, and family-centered care.",
    availability: [
      { day: "MONDAY", startTime: "13:00", endTime: "17:00", slotDurationMinutes: 30 },
      { day: "SATURDAY", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30 }
    ]
  }
];

const useMockDoctorService = () => {
  return String(env.useMockDoctorService).toLowerCase() === "true";
};

const normalizeDoctor = (doctor) => {
  return {
    doctorId: doctor.doctorId || doctor._id || doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    experienceYears: Number(doctor.experienceYears || 0),
    consultationFee: Number(doctor.consultationFee || 0),
    profileImage: doctor.profileImage || "",
    profileSummary: doctor.profileSummary || doctor.bio || "",
    availability: Array.isArray(doctor.availability) ? doctor.availability : []
  };
};

const getDoctorsMock = async ({ specialty = "", search = "" }) => {
  let doctors = [...mockDoctors];

  if (specialty) {
    doctors = doctors.filter(
      (doctor) => doctor.specialty.toLowerCase() === specialty.toLowerCase()
    );
  }

  if (search) {
    const query = search.toLowerCase();
    doctors = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query)
    );
  }

  return doctors;
};

const getDoctorByIdMock = async (doctorId) => {
  const doctor = mockDoctors.find((item) => item.doctorId === doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  return doctor;
};

const getDoctors = async ({ specialty = "", search = "" }) => {
  if (useMockDoctorService()) {
    return getDoctorsMock({ specialty, search });
  }

  try {
    const response = await axios.get(`${env.doctorServiceUrl}/api/doctors`, {
      params: { specialty, search }
    });

    const doctors = response?.data?.data || response?.data || [];
    return doctors.map(normalizeDoctor);
  } catch (error) {
    throw new AppError("Failed to fetch doctors from Doctor Service", 502);
  }
};

const getDoctorById = async (doctorId) => {
  if (useMockDoctorService()) {
    return getDoctorByIdMock(doctorId);
  }

  try {
    const response = await axios.get(`${env.doctorServiceUrl}/api/doctors/${doctorId}`);
    const doctor = response?.data?.data || response?.data;

    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    return normalizeDoctor(doctor);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw new AppError("Failed to fetch doctor details from Doctor Service", 502);
  }
};

module.exports = {
  getDoctors,
  getDoctorById
};