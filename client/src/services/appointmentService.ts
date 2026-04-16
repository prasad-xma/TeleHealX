import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const API_BASE_URL = `${GATEWAY_URL}/api/appointments`;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const getMyDoctorAppointments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctor/me`, {
      headers: authHeader()
    });

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

export const getDoctorsForPatient = async (name?: string, limit = 5) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patient/doctors`, {
      headers: authHeader(),
      params: {
        ...(name ? { name } : {}),
        limit
      }
    });

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

export const getMyPatientAppointments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patient/me`, {
      headers: authHeader()
    });

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

export const createAppointmentForPatient = async (payload: {
  doctorId: string;
  date: string;
  time: string;
  type: 'consultation' | 'checkup' | 'followup';
  notes?: string;
  isVideoConsultation?: boolean;
  patientName?: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/patient/book`, payload, {
      headers: authHeader()
    });

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};