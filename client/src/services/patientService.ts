import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const API_BASE_URL = `${GATEWAY_URL}/api/patients`;

export const getMedicalHistory = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/medical-history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const uploadMedicalReport = async (formData: FormData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/reports`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getMedicalReports = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteMedicalReport = async (reportId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const downloadMedicalReport = async (reportId: string) => {
  try {
    console.log('downloadMedicalReport called with reportId:', reportId);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Full URL:', `${API_BASE_URL}/reports/${reportId}`);
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    const response = await axios.get(`${API_BASE_URL}/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in downloadMedicalReport:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const getPrescriptions = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/prescriptions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getPrescriptionById = async (prescriptionId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateProfile = async (profileData: any) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
