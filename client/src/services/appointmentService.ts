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