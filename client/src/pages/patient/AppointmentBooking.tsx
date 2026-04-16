import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader,
  Video,
  Phone,
  Mail
} from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  email: string;
  rating?: number;
}

interface Appointment {
  _id: string;
  doctorId: Doctor;
  date: string;
  time: string;
  type: 'consultation' | 'checkup' | 'followup' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  isVideoConsultation: boolean;
}

const AppointmentBooking = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'consultation' | 'checkup' | 'followup'>('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'checkup' | 'followup'>('consultation');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = appointments;
    
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(apt => apt.type === filterType);
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, filterType]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from API
      const mockAppointments: Appointment[] = [
        {
          _id: '1',
          doctorId: { _id: '1', name: 'Dr. Sarah Johnson', specialization: 'Cardiology', email: 'sarah.j@telehealx.com' },
          date: '2024-04-20',
          time: '10:00 AM',
          type: 'consultation',
          status: 'confirmed',
          isVideoConsultation: true,
          notes: 'Initial consultation for heart condition'
        },
        {
          _id: '2',
          doctorId: { _id: '2', name: 'Dr. Michael Chen', specialization: 'Internal Medicine', email: 'michael.c@telehealx.com' },
          date: '2024-04-22',
          time: '2:30 PM',
          type: 'followup',
          status: 'scheduled',
          isVideoConsultation: false,
          notes: 'Follow-up on previous consultation results'
        }
      ];
      setAppointments(mockAppointments);
    } catch (error: any) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Mock data - in real implementation, this would fetch from API
      const mockDoctors: Doctor[] = [
        { _id: '1', name: 'Dr. Sarah Johnson', specialization: 'Cardiology', email: 'sarah.j@telehealx.com', rating: 4.8 },
        { _id: '2', name: 'Dr. Michael Chen', specialization: 'Internal Medicine', email: 'michael.c@telehealx.com', rating: 4.6 },
        { _id: '3', name: 'Dr. Emily Davis', specialization: 'Pediatrics', email: 'emily.d@telehealx.com', rating: 4.9 }
      ];
      setDoctors(mockDoctors);
    } catch (error: any) {
      setError('Failed to fetch doctors');
    }
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please select doctor, date, and time for the appointment');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - in real implementation, this would call the booking API
      const newAppointment: Appointment = {
        _id: Date.now().toString(),
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        status: 'scheduled',
        notes: notes,
        isVideoConsultation: appointmentType === 'consultation'
      };

      setAppointments([...appointments, newAppointment]);
      setSuccess('Appointment booked successfully!');
      
      // Reset form
      setShowBookingModal(false);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setAppointmentType('consultation');
      setNotes('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to book appointment');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentType('consultation');
    setNotes('');
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      scheduled: '#F59E0B',
      confirmed: '#10B981',
      completed: '#059669',
      cancelled: '#DC2626'
    };
    return colors[status] || '#6B7280';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      consultation: <Video size={16} />,
      checkup: <Calendar size={16} />,
      followup: <Clock size={16} />,
      emergency: <AlertTriangle size={16} />
    };
    return icons[type] || <Calendar size={16} />;
  };

  const availableTimes = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .booking-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
        }

        .booking-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .back-btn {
          background: #F1F5F9;
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          cursor: pointer;
          color: '#64748B';
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-btn:hover {
          background: #E2E8F0;
          color: '#3B82F6';
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: '#1E293B';
          margin: 0;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }

        .doctors-section, .appointments-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.08);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #F1F5F9;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: '#1E293B';
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .book-btn {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59,130,246,0.25);
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 0.875rem;
          transition: all 0.2s;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }

        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .doctor-card {
          background: #F8FAFC;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .doctor-card:hover {
          border-color: #3B82F6;
          box-shadow: 0 4px 20px rgba(59,130,246,0.1);
        }

        .doctor-card.selected {
          border-color: #3B82F6;
          background: #EFF6FF;
        }

        .doctor-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .doctor-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: '#1E293B';
          margin-bottom: 0.25rem;
        }

        .doctor-specialization {
          color: '#64748B';
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .doctor-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: '#F59E0B';
          font-size: 0.875rem;
        }

        .appointments-list {
          display: grid;
          gap: 1rem;
        }

        .appointment-card {
          background: #F8FAFC;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .appointment-card:hover {
          border-color: #3B82F6;
          box-shadow: 0 4px 20px rgba(59,130,246,0.1);
        }

        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .appointment-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .appointment-title {
          font-size: 1rem;
          font-weight: 600;
          color: '#1E293B';
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .appointment-details {
          color: '#64748B';
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #F1F5F9;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: '#1E293B';
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: '#64748B';
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 1.5rem;
        }

        .close-btn:hover {
          background: #F1F5F9;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: '#374151';
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 0.875rem;
          transition: all 0.2s;
          background: #F9FAFB;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3B82F6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .time-slot {
          padding: 0.5rem;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .time-slot:hover {
          border-color: #3B82F6;
          background: #EFF6FF;
        }

        .time-slot.selected {
          border-color: #3B82F6;
          background: #3B82F6;
          color: white;
        }

        .alert {
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
        }

        .alert-success {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: '#15803D';
        }

        .alert-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: '#DC2626';
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: '#64748B';
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: #F1F5F9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: '#3B82F6';
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: '#64748B';
          font-weight: 600;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            min-width: auto;
          }
        }
      `}</style>

      <div className="booking-bg">
        <div className="booking-container">
          <div className="header">
            <Link to="/dashboard">
              <button className="back-btn">
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </Link>
            <h1 className="page-title">Appointment Booking</h1>
            <button className="book-btn" onClick={() => setShowBookingModal(true)}>
              <Plus size={18} />
              Book Appointment
            </button>
          </div>

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              {success}
            </div>
          )}
          
          {error && (
            <div className="alert alert-error">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <div className="content-grid">
            {/* Doctors Section */}
            <div className="doctors-section">
              <div className="section-header">
                <h2 className="section-title">
                  <User size={24} />
                  Available Doctors
                </h2>
              </div>
              
              <div className="controls">
                <div className="search-box">
                  <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Specializations</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="internal-medicine">Internal Medicine</option>
                  <option value="pediatrics">Pediatrics</option>
                </select>
              </div>

              {loading ? (
                <div className="loading">
                  <Loader size={24} className="spinner" />
                  Loading doctors...
                </div>
              ) : (
                <div className="doctors-grid">
                  {doctors.map((doctor) => (
                    <div 
                      key={doctor._id} 
                      className={`doctor-card ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="doctor-header">
                        <div>
                          <div className="doctor-name">{doctor.name}</div>
                          <div className="doctor-specialization">{doctor.specialization}</div>
                        </div>
                        <div className="doctor-rating">
                          {'⭐'.repeat(doctor.rating || 0)}
                        </div>
                      </div>
                      <div className="appointment-details">
                        <div><Mail size={16} /> {doctor.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Appointments Section */}
            <div className="appointments-section">
              <div className="section-header">
                <h2 className="section-title">
                  <Calendar size={24} />
                  Your Appointments
                </h2>
              </div>

              {loading ? (
                <div className="loading">
                  <Loader size={24} className="spinner" />
                  Loading appointments...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Calendar size={40} />
                  </div>
                  <h3>No appointments found</h3>
                  <p>Book your first appointment to get started</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment._id} className="appointment-card">
                      <div className="appointment-header">
                        <div className="appointment-status" style={{ background: getStatusColor(appointment.status) }}>
                          {getTypeIcon(appointment.type)}
                          <span style={{ marginLeft: '0.5rem' }}>
                            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                          </span>
                        </div>
                        <div className="appointment-title">
                          {appointment.doctorId?.name}
                          {appointment.isVideoConsultation && (
                            <Video size={16} style={{ marginLeft: '0.5rem' }} />
                          )}
                        </div>
                      </div>
                      
                      <div className="appointment-details">
                        <div><strong>Date:</strong> {formatDate(appointment.date)}</div>
                        <div><strong>Time:</strong> {appointment.time}</div>
                        <div><strong>Status:</strong> {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</div>
                        {appointment.notes && (
                          <div><strong>Notes:</strong> {appointment.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Modal */}
          {showBookingModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Book Appointment</h3>
                  <button 
                    className="close-btn"
                    onClick={handleCancel}
                  >
                    ×
                  </button>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Select Doctor</label>
                    <select
                      value={selectedDoctor?._id || ''}
                      onChange={(e) => setSelectedDoctor(doctors.find(d => d._id === e.target.value) || null)}
                      className="form-select"
                      required
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Appointment Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Appointment Type</label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value as any)}
                      className="form-select"
                      required
                    >
                      <option value="consultation">Consultation</option>
                      <option value="checkup">Check-up</option>
                      <option value="followup">Follow-up</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Time</label>
                    <div className="time-slots">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="form-textarea"
                      placeholder="Any special requirements or notes for the appointment..."
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="book-btn"
                    onClick={handleBookAppointment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="spinner" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Book Appointment
                      </>
                    )}
                  </button>
                  <button 
                    className="book-btn" 
                    style={{ background: '#6B7280' }}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentBooking;
