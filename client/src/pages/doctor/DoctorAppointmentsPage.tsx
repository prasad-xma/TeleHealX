import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Loader2, RefreshCw, Video, User, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { acceptDoctorAppointment, cancelDoctorAppointment, getMeetingAccess, getMyDoctorAppointments } from '../../services/appointmentService';
import { createTelemedicineMeeting } from '../../services/telemedicineService';

type Appointment = {
  _id: string;
  patientName: string;
  date: string;
  time: string;
  type: 'consultation' | 'checkup' | 'followup' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  paymentMode?: 'MANUAL' | 'ONLINE';
  paymentStatus?: string;
  notes?: string;
  isVideoConsultation?: boolean;
  meetingRoomName?: string;
};

const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingMeetingId, setCreatingMeetingId] = useState('');
  const [acceptingAppointmentId, setAcceptingAppointmentId] = useState('');
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState('');
  const [error, setError] = useState('');
  const [doctorName, setDoctorName] = useState('Doctor');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setDoctorName(parsedUser.name || 'Doctor');
    }

    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getMyDoctorAppointments();
      setAppointments((response?.appointments || []).map((appointment) => ({
        ...appointment,
        status: appointment.status as Appointment['status']
      })));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      scheduled: '#F59E0B',
      confirmed: '#2563EB',
      completed: '#10B981',
      cancelled: '#DC2626'
    };

    return colors[status];
  };

  const openMeetingRoom = (roomName: string) => {
    navigate(`/video-call/${encodeURIComponent(roomName)}`);
  };

  const handleCreateMeeting = async (appointment: Appointment) => {
    setError('');
    setCreatingMeetingId(appointment._id);

    try {
      const updated = await createTelemedicineMeeting(appointment._id);
      const roomName = updated?.meetingRoomName;

      if (!roomName) {
        throw new Error('Meeting room was not created');
      }

      openMeetingRoom(roomName);
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create meeting');
    } finally {
      setCreatingMeetingId('');
    }
  };

  const handleAcceptAppointment = async (appointmentId: string) => {
    setError('');
    setAcceptingAppointmentId(appointmentId);

    try {
      await acceptDoctorAppointment(appointmentId);
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to accept appointment');
    } finally {
      setAcceptingAppointmentId('');
    }
  };

  const handleJoinMeeting = async (roomName: string) => {
    try {
      await getMeetingAccess(roomName);
      openMeetingRoom(roomName);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Unable to join meeting');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setError('');
    setCancellingAppointmentId(appointmentId);

    try {
      await cancelDoctorAppointment(appointmentId);
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel appointment');
    } finally {
      setCancellingAppointmentId('');
    }
  };

  const acceptedAppointments = appointments.filter((appointment) => appointment.status === 'confirmed');
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'scheduled');

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

        .appointment-shell {
          display: grid;
          gap: 1.5rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .summary-card {
          background: white;
          border: 1px solid rgba(59,130,246,0.12);
          border-radius: 18px;
          padding: 1.25rem;
          box-shadow: 0 8px 24px rgba(59,130,246,0.08);
        }

        .summary-label {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 0.35rem;
        }

        .summary-value {
          color: #1e3a8a;
          font-size: 1.8rem;
          font-weight: 800;
        }

        .panel {
          background: white;
          border-radius: 18px;
          padding: 1.5rem;
          border: 1px solid rgba(59,130,246,0.12);
          box-shadow: 0 8px 24px rgba(59,130,246,0.08);
        }

        .appointment-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
        }

        .appointment-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .appointment-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.9rem 1.25rem;
          color: #475569;
          font-size: 0.95rem;
          margin-top: 0.8rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 999px;
          padding: 0.35rem 0.8rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
        }

        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          border-radius: 12px;
          padding: 0.8rem 1rem;
          background: #2563eb;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .refresh-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .meeting-btn {
          border: none;
          border-radius: 10px;
          padding: 0.55rem 0.9rem;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          color: white;
          background: #2563eb;
          margin-top: 0.75rem;
          margin-right: 0.5rem;
        }

        .meeting-btn.join {
          background: #16a34a;
        }

        .meeting-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      <div className="appointment-shell">
        <div
          className="rounded-3xl shadow-xl p-6 text-white"
          style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-3xl font-bold mb-2">Doctor Appointments</h2>
              <p className="text-blue-100">Welcome, {doctorName}. Here are the appointments created for you.</p>
            </div>
            <button className="refresh-btn" onClick={fetchAppointments} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="panel border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
            <AlertTriangle size={20} />
            {error}
          </div>
        ) : null}

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Total Appointments</div>
            <div className="summary-value">{appointments.length}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Upcoming</div>
            <div className="summary-value">
              {appointments.filter((appointment) => appointment.status === 'scheduled' || appointment.status === 'confirmed').length}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Completed</div>
            <div className="summary-value">
              {appointments.filter((appointment) => appointment.status === 'completed').length}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={22} className="text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-800 m-0">Accepted Appointments</h3>
          </div>

          {acceptedAppointments.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No accepted appointments yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 mb-8">
              {acceptedAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <div className="appointment-row">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <User size={18} className="text-blue-600" />
                        {appointment.patientName}
                        {appointment.isVideoConsultation ? <Video size={16} className="text-blue-500" /> : null}
                      </h4>
                      <p className="text-slate-500 m-0">Accepted appointment</p>
                    </div>

                    <span className="badge" style={{ background: '#10B981' }}>
                      Accepted
                    </span>
                  </div>

                  <div className="appointment-meta">
                    <span className="flex items-center gap-2"><Calendar size={16} /> {formatDate(appointment.date)}</span>
                    <span className="flex items-center gap-2"><Clock size={16} /> {appointment.time}</span>
                    <span className="flex items-center gap-2">Type: {appointment.type}</span>
                  </div>

                  <div>
                    <button
                      className="meeting-btn"
                      onClick={() => handleCreateMeeting(appointment)}
                      disabled={creatingMeetingId === appointment._id}
                    >
                      {creatingMeetingId === appointment._id ? 'Creating...' : 'Create Video Call'}
                    </button>

                    {appointment.meetingRoomName ? (
                      <button
                        className="meeting-btn join"
                        onClick={() => handleJoinMeeting(appointment.meetingRoomName || '')}
                      >
                        Join Meeting
                      </button>
                    ) : null}

                    <button
                      className="meeting-btn"
                      onClick={() => handleCancelAppointment(appointment._id)}
                      disabled={cancellingAppointmentId === appointment._id}
                      style={{ background: '#DC2626' }}
                    >
                      {cancellingAppointmentId === appointment._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <Calendar size={22} className="text-blue-600" />
            <h3 className="text-xl font-bold text-slate-800 m-0">Appointments Waiting for Accept</h3>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Loading appointments...
            </div>
          ) : pendingAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText size={40} className="mx-auto mb-3 text-slate-300" />
              <h4 className="text-lg font-bold text-slate-700 mb-1">No pending appointments found</h4>
              <p>All appointments have already been accepted or closed.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <div className="appointment-row">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <User size={18} className="text-blue-600" />
                        {appointment.patientName}
                        {appointment.isVideoConsultation ? <Video size={16} className="text-blue-500" /> : null}
                      </h4>
                      <p className="text-slate-500 m-0">{appointment.notes || 'No notes provided'}</p>
                    </div>

                    <span className="badge" style={{ background: getStatusColor(appointment.status) }}>
                      {appointment.paymentStatus === 'PENDING' ? 'Waiting for Payment' : appointment.status === 'scheduled' ? 'Pending' : appointment.status}
                    </span>
                  </div>

                  <div className="appointment-meta">
                    <span className="flex items-center gap-2"><Calendar size={16} /> {formatDate(appointment.date)}</span>
                    <span className="flex items-center gap-2"><Clock size={16} /> {appointment.time}</span>
                    <span className="flex items-center gap-2">Type: {appointment.type}</span>
                  </div>

                  <div>
                    <button
                      className="meeting-btn join"
                      onClick={() => handleAcceptAppointment(appointment._id)}
                      disabled={acceptingAppointmentId === appointment._id || appointment.paymentStatus === 'PENDING'}
                      style={{ background: '#10B981' }}
                    >
                      {appointment.paymentStatus === 'PENDING'
                        ? 'Waiting for Payment'
                        : acceptingAppointmentId === appointment._id
                          ? 'Accepting...'
                          : 'Accept'}
                    </button>

                    <button
                      className="meeting-btn"
                      onClick={() => handleCancelAppointment(appointment._id)}
                      disabled={cancellingAppointmentId === appointment._id}
                      style={{ background: '#DC2626' }}
                    >
                      {cancellingAppointmentId === appointment._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage;