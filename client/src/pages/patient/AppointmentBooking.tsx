import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Search,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader,
  Video,
  CreditCard,
  Wallet,
  Stethoscope,
  Mail,
  Phone
} from 'lucide-react';
import {
  createAppointmentForPatient,
  createPaymentCheckout,
  getDoctorDetailsForPatient,
  getDoctorSlotsForPatient,
  getDoctorsForPatient,
  getMeetingAccess,
  getMyPatientAppointments,
  type DoctorListItem
} from '../../services/appointmentService';

type AppointmentItem = {
  _id: string;
  appointmentNumber?: string;
  doctorId: string;
  doctorUserId?: string;
  doctorName?: string;
  date: string;
  time: string;
  type: 'consultation' | 'checkup' | 'followup' | 'emergency';
  status: string;
  paymentMode?: 'MANUAL' | 'ONLINE';
  paymentStatus?: string;
  consultationFee?: number | null;
  notes?: string;
  isVideoConsultation: boolean;
  meetingRoomName?: string;
  statusHistory?: Array<{
    status: string;
    note: string;
    changedAt: string;
  }>;
};

type DoctorDetail = {
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
};

type SlotItem = {
  time: string;
  status: 'AVAILABLE' | 'BOOKED';
  isAvailable: boolean;
};

const AppointmentBooking = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<DoctorDetail | null>(null);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] =
    useState<'consultation' | 'checkup' | 'followup' | 'emergency'>('consultation');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'MANUAL' | 'ONLINE'>('ONLINE');

  const [doctorLoading, setDoctorLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const patientName = user?.name || 'Patient';

  const specialtyOptions = useMemo(() => {
    const allSpecialties = doctors
      .map((doctor) => doctor.specialty || '')
      .filter(Boolean);

    return Array.from(new Set(allSpecialties));
  }, [doctors]);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!selectedDoctorId) {
      setSelectedDoctorDetail(null);
      setSlots([]);
      setSelectedTime('');
      return;
    }

    fetchDoctorDetail(selectedDoctorId);
  }, [selectedDoctorId]);

  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setSlots([]);
      setSelectedTime('');
      return;
    }

    fetchDoctorSlots(selectedDoctorId, selectedDate);
  }, [selectedDoctorId, selectedDate]);

  const fetchDoctors = async (name = '', specialty = '') => {
    setDoctorLoading(true);
    setError('');

    try {
      const data = await getDoctorsForPatient(name, specialty, 20);
      setDoctors(data?.doctors || []);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to load doctors');
    } finally {
      setDoctorLoading(false);
    }
  };

  const fetchDoctorDetail = async (doctorId: string) => {
    setDetailLoading(true);
    setError('');

    try {
      const data = await getDoctorDetailsForPatient(doctorId);
      setSelectedDoctorDetail(data?.doctor || null);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to load doctor details');
      setSelectedDoctorDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchDoctorSlots = async (doctorId: string, date: string) => {
    setSlotLoading(true);
    setError('');

    try {
      const data = await getDoctorSlotsForPatient(doctorId, date);
      setSlots(data?.slots || []);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to load slots');
      setSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setAppointmentLoading(true);
    setError('');

    try {
      const data = await getMyPatientAppointments();
      setAppointments(data?.appointments || []);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to load your appointments');
    } finally {
      setAppointmentLoading(false);
    }
  };

  const handleDoctorSearch = async () => {
    await fetchDoctors(searchTerm.trim(), specialtyFilter.trim());
  };

  const handleSelectDoctor = (doctor: DoctorListItem) => {
    setSelectedDoctorId(doctor.id);
    setSelectedTime('');
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctorDetail) {
      setError('Please select a doctor');
      return;
    }

    if (!selectedDate) {
      setError('Please select an appointment date');
      return;
    }

    if (!selectedTime) {
      setError('Please select a slot');
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const consultationFee =
        selectedDoctorDetail.fee !== null &&
        selectedDoctorDetail.fee !== undefined
          ? Number(selectedDoctorDetail.fee)
          : 50;

      const appointmentData = await createAppointmentForPatient({
        doctorId: selectedDoctorDetail.id,
        doctorName: selectedDoctorDetail.name,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes,
        isVideoConsultation: appointmentType === 'consultation',
        patientName,
        paymentMode,
        consultationFee
      });

      if (paymentMode === 'ONLINE') {
        const checkoutData = await createPaymentCheckout({
          appointmentId: appointmentData?._id,
          amount: consultationFee,
          currency: 'usd',
          provider: 'STRIPE'
        });

        if (checkoutData?.checkoutUrl) {
          window.location.href = checkoutData.checkoutUrl;
          return;
        }

        throw new Error('Checkout URL not received from payment service');
      }

      setSuccess('Appointment booked successfully. Redirecting to dashboard...');
      setNotes('');
      setSelectedTime('');
      await fetchAppointments();
      await fetchDoctorSlots(selectedDoctorDetail.id, selectedDate);

      setTimeout(() => {
        navigate('/dashboard', {
          replace: true,
          state: {
            successMessage: 'Appointment booked successfully.'
          }
        });
      }, 1800);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to book appointment'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const normalized = String(status || '').toUpperCase();

    const colors: Record<string, string> = {
      PENDING: '#F59E0B',
      PENDING_PAYMENT: '#F59E0B',
      CONFIRMED: '#10B981',
      COMPLETED: '#059669',
      CANCELLED: '#DC2626'
    };

    return colors[normalized] || '#6B7280';
  };

  const getPaymentBadgeColor = (paymentStatus: string) => {
    const normalized = String(paymentStatus || '').toUpperCase();

    const colors: Record<string, string> = {
      PAID: '#10B981',
      PENDING: '#F59E0B',
      UNPAID: '#EF4444',
      FAILED: '#DC2626',
      REFUNDED: '#8B5CF6'
    };

    return colors[normalized] || '#6B7280';
  };

  const availableSlots = slots.filter((slot) => slot.isAvailable);
  const bookedSlots = slots.filter((slot) => !slot.isAvailable);

  const handleJoinCall = async (meetingRoomName: string) => {
    const roomName = String(meetingRoomName || '').trim();

    if (!roomName) {
      setError('Meeting room is not available yet');
      return;
    }

    setError('');

    try {
      await getMeetingAccess(roomName);
      navigate(`/video-call/${encodeURIComponent(roomName)}`);
    } catch (error: any) {
      setError(error?.response?.data?.message || error?.message || 'Unable to join call');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

        .booking-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 45%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
        }

        .booking-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .page-title {
          margin: 0;
          font-size: 1.9rem;
          font-weight: 800;
          color: #0F172A;
        }

        .page-subtitle {
          margin: 0.35rem 0 0;
          color: #475569;
          font-size: 0.95rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: white;
          color: #1E293B;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 0.8rem 1rem;
          text-decoration: none;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(59,130,246,0.08);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.05fr 1.35fr;
          gap: 1.5rem;
          align-items: start;
        }

        .panel {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 10px 32px rgba(59,130,246,0.10);
          border: 1px solid rgba(59,130,246,0.08);
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 1rem;
        }

        .controls {
          display: grid;
          grid-template-columns: 1.4fr 1fr auto;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .input,
        .select,
        .textarea {
          width: 100%;
          border: 1px solid #CBD5E1;
          border-radius: 14px;
          padding: 0.9rem 1rem;
          font-size: 0.95rem;
          background: #F8FAFC;
          box-sizing: border-box;
        }

        .input:focus,
        .select:focus,
        .textarea:focus {
          outline: none;
          border-color: #3B82F6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
        }

        .search-btn,
        .action-btn,
        .payment-mode-btn {
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .search-btn,
        .action-btn {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
          color: white;
          padding: 0.9rem 1rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
        }

        .search-btn:hover,
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(59,130,246,0.20);
        }

        .doctor-list {
          display: grid;
          gap: 0.85rem;
        }

        .doctor-card {
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #F8FAFC;
        }

        .doctor-card:hover {
          border-color: #60A5FA;
          transform: translateY(-1px);
        }

        .doctor-card.active {
          border-color: #3B82F6;
          background: #EFF6FF;
          box-shadow: 0 10px 24px rgba(59,130,246,0.12);
        }

        .doctor-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 0.2rem;
        }

        .doctor-sub {
          color: #475569;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .doctor-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          font-size: 0.85rem;
          color: #64748B;
        }

        .doctor-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .detail-top {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-card {
          background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
          border: 1px solid #DBEAFE;
          border-radius: 18px;
          padding: 1.2rem;
        }

        .detail-name {
          font-size: 1.5rem;
          font-weight: 900;
          color: #0F172A;
          margin: 0 0 0.25rem;
        }

        .detail-specialty {
          font-size: 1rem;
          color: #475569;
          margin-bottom: 0.8rem;
          font-weight: 700;
        }

        .detail-about {
          color: #334155;
          line-height: 1.65;
          margin-bottom: 1rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.8rem;
        }

        .detail-chip {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 0.8rem;
          font-size: 0.92rem;
          color: #334155;
        }

        .detail-chip strong {
          display: block;
          color: #0F172A;
          margin-bottom: 0.15rem;
        }

        .booking-box {
          margin-top: 1rem;
          display: grid;
          gap: 1rem;
        }

        .booking-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.9rem;
        }

        .slot-group-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 0.7rem;
        }

        .slot-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .slot-btn {
          border: 1px solid #CBD5E1;
          background: white;
          color: #0F172A;
          padding: 0.7rem 0.95rem;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 700;
        }

        .slot-btn:hover {
          border-color: #3B82F6;
          background: #EFF6FF;
        }

        .slot-btn.active {
          background: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }

        .slot-btn.booked {
          background: #F1F5F9;
          color: #94A3B8;
          border-color: #E2E8F0;
          cursor: not-allowed;
          text-decoration: line-through;
        }

        .payment-mode-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .payment-mode-btn {
          padding: 0.85rem 1rem;
          background: #F8FAFC;
          color: #0F172A;
          border: 1px solid #CBD5E1;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
        }

        .payment-mode-btn.active {
          background: #EFF6FF;
          border-color: #3B82F6;
          color: #1D4ED8;
        }

        .appointments-list {
          display: grid;
          gap: 0.9rem;
        }

        .appointment-card {
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 1rem;
          background: #F8FAFC;
        }

        .appointment-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .appointment-doctor {
          font-size: 1rem;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 0.2rem;
        }

        .appointment-sub {
          color: #475569;
          font-size: 0.9rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: white;
          border-radius: 999px;
          padding: 0.4rem 0.8rem;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .payment-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: white;
          border-radius: 999px;
          padding: 0.35rem 0.7rem;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .appointment-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          color: #334155;
          font-size: 0.92rem;
          margin-top: 0.35rem;
        }

        .empty-state,
        .loading-box {
          text-align: center;
          padding: 2rem 1rem;
          color: #64748B;
        }

        .alert {
          padding: 0.95rem 1rem;
          border-radius: 14px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-weight: 700;
        }

        .alert-success {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #15803D;
        }

        .alert-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
        }

        .helper-text {
          color: #64748B;
          font-size: 0.88rem;
          margin-top: -0.35rem;
        }

        @media (max-width: 1100px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .booking-container {
            padding: 1rem;
          }

          .controls,
          .booking-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="booking-bg">
        <div className="booking-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Appointments</h1>
              <p className="page-subtitle">
                Browse doctors, choose an available slot, book your appointment, and pay online.
              </p>
            </div>

            <Link to="/dashboard" className="back-btn">
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
          </div>

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div className="dashboard-grid">
            <div className="panel">
              <h2 className="panel-title">
                <User size={22} />
                All Doctors
              </h2>

              <div className="controls">
                <input
                  className="input"
                  type="text"
                  placeholder="Search by doctor name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="select"
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                >
                  <option value="">All specialties</option>
                  {specialtyOptions.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>

                <button className="search-btn" onClick={handleDoctorSearch}>
                  <Search size={16} />
                  Search
                </button>
              </div>

              {doctorLoading ? (
                <div className="loading-box">
                  <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ marginTop: '0.7rem' }}>Loading doctors...</div>
                </div>
              ) : doctors.length === 0 ? (
                <div className="empty-state">No doctors found.</div>
              ) : (
                <div className="doctor-list">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`doctor-card ${selectedDoctorId === doctor.id ? 'active' : ''}`}
                      onClick={() => handleSelectDoctor(doctor)}
                    >
                      <div className="doctor-name">{doctor.name}</div>
                      <div className="doctor-sub">{doctor.specialty || 'Specialty not available'}</div>

                      <div className="doctor-meta">
                        {doctor.email ? (
                          <span className="doctor-meta-item">
                            <Mail size={14} />
                            {doctor.email}
                          </span>
                        ) : null}

                        {doctor.phone ? (
                          <span className="doctor-meta-item">
                            <Phone size={14} />
                            {doctor.phone}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel">
              <h2 className="panel-title">
                <Stethoscope size={22} />
                Doctor Details & Booking
              </h2>

              {!selectedDoctorId ? (
                <div className="empty-state">
                  Select a doctor from the left panel to view full details and slots.
                </div>
              ) : detailLoading ? (
                <div className="loading-box">
                  <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ marginTop: '0.7rem' }}>Loading doctor details...</div>
                </div>
              ) : !selectedDoctorDetail ? (
                <div className="empty-state">Doctor details not available.</div>
              ) : (
                <>
                  <div className="detail-top">
                    <div className="detail-card">
                      <div className="detail-name">{selectedDoctorDetail.name}</div>
                      <div className="detail-specialty">
                        {selectedDoctorDetail.specialty || 'General Physician'}
                      </div>

                      <div className="detail-about">
                        {selectedDoctorDetail.about ||
                          'Doctor details are available for booking. Select a date and a time slot to continue with your appointment.'}
                      </div>

                      <div className="detail-grid">
                        <div className="detail-chip">
                          <strong>Qualification</strong>
                          {selectedDoctorDetail.qualification || 'Not available'}
                        </div>

                        <div className="detail-chip">
                          <strong>Experience</strong>
                          {selectedDoctorDetail.experience || 'Not available'}
                        </div>

                        <div className="detail-chip">
                          <strong>Appointment Fee</strong>
                          {selectedDoctorDetail.fee !== null &&
                          selectedDoctorDetail.fee !== undefined
                            ? `$${selectedDoctorDetail.fee}`
                            : '$50'}
                        </div>

                        <div className="detail-chip">
                          <strong>Hospital / Clinic</strong>
                          {selectedDoctorDetail.hospital || 'Not available'}
                        </div>

                        <div className="detail-chip">
                          <strong>Email</strong>
                          {selectedDoctorDetail.email || 'Not available'}
                        </div>

                        <div className="detail-chip">
                          <strong>Address</strong>
                          {selectedDoctorDetail.address || 'Not available'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="booking-box">
                    <div className="booking-grid">
                      <div>
                        <label className="helper-text">Appointment Date</label>
                        <input
                          className="input"
                          type="date"
                          value={selectedDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime('');
                          }}
                        />
                      </div>

                      <div>
                        <label className="helper-text">Appointment Type</label>
                        <select
                          className="select"
                          value={appointmentType}
                          onChange={(e) =>
                            setAppointmentType(
                              e.target.value as 'consultation' | 'checkup' | 'followup' | 'emergency'
                            )
                          }
                        >
                          <option value="consultation">Consultation</option>
                          <option value="checkup">Check-up</option>
                          <option value="followup">Follow-up</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="slot-group-title">Available Slots</div>

                      {!selectedDate ? (
                        <div className="helper-text">Select a date first to load doctor slots.</div>
                      ) : slotLoading ? (
                        <div className="loading-box">
                          <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
                          <div style={{ marginTop: '0.7rem' }}>Loading slots...</div>
                        </div>
                      ) : (
                        <>
                          {availableSlots.length > 0 ? (
                            <div className="slot-grid" style={{ marginBottom: '1rem' }}>
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  className={`slot-btn ${selectedTime === slot.time ? 'active' : ''}`}
                                  onClick={() => setSelectedTime(slot.time)}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="helper-text" style={{ marginBottom: '1rem' }}>
                              No available slots for the selected date.
                            </div>
                          )}

                          {bookedSlots.length > 0 ? (
                            <>
                              <div className="slot-group-title">Booked Slots</div>
                              <div className="slot-grid">
                                {bookedSlots.map((slot) => (
                                  <button
                                    key={slot.time}
                                    type="button"
                                    className="slot-btn booked"
                                    disabled
                                  >
                                    {slot.time}
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : null}
                        </>
                      )}
                    </div>

                    <div>
                      <div className="slot-group-title">Payment Method</div>
                      <div className="payment-mode-row">
                        <button
                          type="button"
                          className={`payment-mode-btn ${paymentMode === 'ONLINE' ? 'active' : ''}`}
                          onClick={() => setPaymentMode('ONLINE')}
                        >
                          <CreditCard size={16} />
                          Online Payment
                        </button>

                        <button
                          type="button"
                          className={`payment-mode-btn ${paymentMode === 'MANUAL' ? 'active' : ''}`}
                          onClick={() => setPaymentMode('MANUAL')}
                        >
                          <Wallet size={16} />
                          Manual Payment
                        </button>
                      </div>
                      <div className="helper-text" style={{ marginTop: '0.6rem' }}>
                        {paymentMode === 'ONLINE'
                          ? 'After booking, you will be redirected to Stripe checkout.'
                          : 'Appointment will be created first, then you will return to dashboard.'}
                      </div>
                    </div>

                    <div>
                      <label className="helper-text">Notes (Optional)</label>
                      <textarea
                        className="textarea"
                        rows={4}
                        placeholder="Write any special note for the doctor..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <button
                      className="action-btn"
                      onClick={handleBookAppointment}
                      disabled={bookingLoading || !selectedDoctorDetail || !selectedDate || !selectedTime}
                    >
                      {bookingLoading ? (
                        <>
                          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          Processing...
                        </>
                      ) : paymentMode === 'ONLINE' ? (
                        <>
                          <CreditCard size={16} />
                          Book & Pay Online
                        </>
                      ) : (
                        <>
                          <Calendar size={16} />
                          Book Appointment
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="panel" style={{ marginTop: '1.5rem' }}>
            <h2 className="panel-title">
              <Calendar size={22} />
              My Appointments
            </h2>

            {appointmentLoading ? (
              <div className="loading-box">
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: '0.7rem' }}>Loading appointments...</div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="empty-state">No appointments found yet.</div>
            ) : (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-head">
                      <div>
                        <div className="appointment-doctor">
                          {appointment.doctorName || 'Doctor'}
                        </div>
                        <div className="appointment-sub">
                          {appointment.appointmentNumber || 'Appointment'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span
                          className="badge"
                          style={{ background: getStatusColor(appointment.status) }}
                        >
                          {appointment.status}
                        </span>

                        <span
                          className="payment-badge"
                          style={{
                            background: getPaymentBadgeColor(
                              appointment.paymentStatus || 'UNPAID'
                            )
                          }}
                        >
                          {appointment.paymentStatus || 'UNPAID'}
                        </span>
                      </div>
                    </div>

                    <div className="appointment-row">
                      <span>
                        <Calendar size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                        {formatDate(appointment.date)}
                      </span>

                      <span>
                        <Clock size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                        {appointment.time}
                      </span>

                      <span>
                        <Stethoscope size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                        {appointment.type}
                      </span>

                      <span>
                        {appointment.paymentMode === 'ONLINE' ? (
                          <>
                            <CreditCard size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                            ONLINE
                          </>
                        ) : (
                          <>
                            <Wallet size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                            MANUAL
                          </>
                        )}
                      </span>

                      {appointment.consultationFee !== null &&
                      appointment.consultationFee !== undefined ? (
                        <span>
                          Fee: ${appointment.consultationFee}
                        </span>
                      ) : null}
                    </div>

                    {appointment.notes ? (
                      <div className="helper-text" style={{ marginTop: '0.8rem' }}>
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    ) : null}

                    {appointment.meetingRoomName ? (
                      <div
                        className="helper-text"
                        style={{
                          marginTop: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span>Meeting Room: {appointment.meetingRoomName}</span>
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => handleJoinCall(appointment.meetingRoomName || '')}
                          style={{ padding: '0.55rem 0.95rem' }}
                        >
                          <Video size={15} />
                          Join Call
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentBooking;