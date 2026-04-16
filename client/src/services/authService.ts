import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const API_BASE_URL = `${GATEWAY_URL}/api/auth`;

export const register = async (userData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const login = async (credentials: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const logout = async (token?: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/logout`,
      {},
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        : undefined
    );
    return response;
  } catch (error: any) {
    throw error;
  }
};
