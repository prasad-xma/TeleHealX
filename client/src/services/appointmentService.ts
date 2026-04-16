import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const APPOINTMENT_API_BASE_URL = `${GATEWAY_URL}/api/appointments`;
const PAYMENT_API_BASE_URL = `${GATEWAY_URL}/api/payments`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`
  };
};

export interface DoctorListItem {
  id: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  specialty?: string | null;
  experience?: number | string | null;
  qualification?: string | null;
  fee?: number | null;
  about?: string | null;
  profileImage?: string | null;
  hospital?: string | null;
  address?: string | null;
}

export interface DoctorSlotsResponse {
  doctor: {
    id: string;
    name: string;
    specialty?: string | null;
    fee?: number | null;
    profileImage?: string | null;
  };
  date: string;
  slotSource: string;
  note: string;
  slots: Array<{
    time: string;
    status: 'AVAILABLE' | 'BOOKED';
    isAvailable: boolean;
  }>;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
}

export interface CreateAppointmentPayload {
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'consultation' | 'checkup' | 'followup' | 'emergency';
  notes?: string;
  isVideoConsultation?: boolean;
  patientName?: string;
  paymentMode: 'MANUAL' | 'ONLINE';
  consultationFee?: number | null;
}

export const getDoctorsForPatient = async (
  name = '',
  specialty = '',
  limit = 20
) => {
  const response = await axios.get(`${APPOINTMENT_API_BASE_URL}/patient/doctors`, {
    params: { name, specialty, limit },
    headers: getAuthHeaders()
  });

  return response.data?.data;
};

export const getDoctorDetailsForPatient = async (doctorId: string) => {
  const response = await axios.get(
    `${APPOINTMENT_API_BASE_URL}/patient/doctors/${doctorId}`,
    {
      headers: getAuthHeaders()
    }
  );

  return response.data?.data;
};

export const getDoctorSlotsForPatient = async (doctorId: string, date: string) => {
  const response = await axios.get(
    `${APPOINTMENT_API_BASE_URL}/patient/doctors/${doctorId}/slots`,
    {
      params: { date },
      headers: getAuthHeaders()
    }
  );

  return response.data?.data as DoctorSlotsResponse;
};

export const getMyPatientAppointments = async () => {
  const response = await axios.get(`${APPOINTMENT_API_BASE_URL}/patient/me`, {
    headers: getAuthHeaders()
  });

  return response.data?.data;
};

export const getPatientAppointmentById = async (appointmentId: string) => {
  const response = await axios.get(
    `${APPOINTMENT_API_BASE_URL}/patient/me/${appointmentId}`,
    {
      headers: getAuthHeaders()
    }
  );

  return response.data?.data;
};

export const createAppointmentForPatient = async (
  payload: CreateAppointmentPayload
) => {
  const response = await axios.post(
    `${APPOINTMENT_API_BASE_URL}/patient/book`,
    payload,
    {
      headers: getAuthHeaders()
    }
  );

  return response.data?.data;
};

export const cancelPatientAppointment = async (
  appointmentId: string,
  reason: string
) => {
  const response = await axios.patch(
    `${APPOINTMENT_API_BASE_URL}/patient/${appointmentId}/cancel`,
    { reason },
    {
      headers: getAuthHeaders()
    }
  );

  return response.data?.data;
};

export const reschedulePatientAppointment = async (
  appointmentId: string,
  date: string,
  time: string
) => {
  const response = await axios.patch(
    `${APPOINTMENT_API_BASE_URL}/patient/${appointmentId}/reschedule`,
    { date, time },
    {
      headers: getAuthHeaders()
    }
  );

  return response.data?.data;
};

export const createPaymentCheckout = async ({
  appointmentId,
  amount,
  currency = 'usd',
  provider = 'STRIPE'
}: {
  appointmentId: string;
  amount: number;
  currency?: string;
  provider?: 'STRIPE';
}) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${PAYMENT_API_BASE_URL}/checkout`,
    {
      appointmentId,
      amount,
      currency,
      provider
    },
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined
    }
  );

  return response.data?.data;
};