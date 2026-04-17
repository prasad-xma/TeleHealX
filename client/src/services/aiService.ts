import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const API_BASE_URL = `${GATEWAY_URL}/api/ai`;

export const analyzeSymptoms = async (payload: { symptoms: string; patientId?: string | null }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getLatestSymptomResult = async (patientId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/latest`, {
      params: { patientId }
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};