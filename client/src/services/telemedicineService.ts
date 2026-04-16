import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const API_BASE_URL = `${GATEWAY_URL}/api/telemedicine`;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const createTelemedicineToken = async (roomName: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/token`,
      { roomName },
      { headers: authHeader() }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const createTelemedicineMeeting = async (appointmentId: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/meeting`,
      { appointmentId },
      { headers: authHeader() }
    );

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};
