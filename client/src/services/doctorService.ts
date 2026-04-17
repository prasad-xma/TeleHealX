import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const API_BASE_URL = `${GATEWAY_URL}/api`;

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const getDoctors = async (params?: { specialization?: string; name?: string }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctors`, { params });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getDoctorById = async (doctorId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getMyDoctorProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctors/me/profile`, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const createOrUpdateMyProfile = async (data: object) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/doctors/me/profile`, data, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getMyAvailability = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctors/me/availability`, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const setAvailability = async (schedule: object) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/doctors/me/availability`, schedule, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const blockDate = async (date: string) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/doctors/me/availability/block`, { date }, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const unblockDate = async (date: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/doctors/me/availability/block`, { 
      data: { date },
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getDoctorAvailability = async (doctorId: string, date: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctors/${doctorId}/availability`, {
      params: { date }
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const issuePrescription = async (data: object) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/prescriptions`, data, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getMyPrescriptions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/prescriptions/doctor/me`, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getPrescriptionById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/prescriptions/${id}`, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getPatientPrescriptions = async (patientId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/prescriptions/patient/${patientId}`, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const deletePrescription = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/prescriptions/${id}`, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updatePrescription = async (id: string, data: object) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/prescriptions/${id}`, data, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getPatientReports = async (patientId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctors/me/patients/${patientId}/reports`, {
      headers: authHeader()
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};
