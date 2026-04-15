import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  ArrowLeft, 
  Save, 
  Edit2, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone,
  CheckCircle,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { updateProfile } from '../services/patientService';

const ProfileManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    birthDay: user?.birthDay ? new Date(user.birthDay).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    address: user?.address || '',
    email: user?.email || '',
    phone: user?.phone || '',
    emergencyContact: user?.emergencyContact || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        birthDay: user.birthDay ? new Date(user.birthDay).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        address: user.address || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      
      // Update localStorage with new user data
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original data
    if (user) {
      setFormData({
        name: user.name || '',
        birthDay: user.birthDay ? new Date(user.birthDay).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        address: user.address || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || ''
      });
    }
    setError('');
    setSuccess('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .profile-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
        }

        .profile-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
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

        .profile-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.08);
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #F1F5F9;
        }

        .profile-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: '#1E293B';
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .edit-btn, .save-btn, .cancel-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .edit-btn {
          background: #3B82F6;
          color: white;
        }

        .edit-btn:hover {
          background: #2563EB;
        }

        .save-btn {
          background: #10B981;
          color: white;
        }

        .save-btn:hover {
          background: #059669;
        }

        .cancel-btn {
          background: #F1F5F9;
          color: '#64748B';
        }

        .cancel-btn:hover {
          background: #E2E8F0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
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

        .form-input:disabled, .form-select:disabled, .form-textarea:disabled {
          background: #F3F4F6;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
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

        .info-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.08);
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          background: #F1F5F9;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: '#3B82F6';
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }

        .info-label {
          font-weight: 600;
          color: '#6B7280';
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .info-value {
          color: '#1F2937';
          font-size: 1rem;
          line-height: 1.5;
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
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="profile-bg">
        <div className="profile-container">
          <div className="header">
            <Link to="/dashboard">
              <button className="back-btn">
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </Link>
            <h1 className="page-title">Profile Management</h1>
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
            <div className="profile-card">
              <div className="profile-header">
                <h2 className="profile-title">
                  <User size={24} />
                  Personal Information
                </h2>
                <div className="action-buttons">
                  {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      <Edit2 size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button 
                        className="save-btn" 
                        onClick={handleSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader size={16} className="spinner" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        name="birthDay"
                        value={formData.birthDay}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        required
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="Enter your full address"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Emergency Contact</label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Emergency contact name and phone"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="info-item">
                    <div className="info-icon">
                      <User size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Full Name</div>
                      <div className="info-value">{formData.name}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Calendar size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Date of Birth</div>
                      <div className="info-value">
                        {formData.birthDay ? new Date(formData.birthDay).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <User size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Gender</div>
                      <div className="info-value">
                        {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Mail size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Email Address</div>
                      <div className="info-value">{formData.email}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Phone size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Phone Number</div>
                      <div className="info-value">{formData.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Address</div>
                      <div className="info-value">{formData.address}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Emergency Contact</div>
                      <div className="info-value">{formData.emergencyContact || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="info-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '1.5rem' }}>
              Account Information
            </h3>
            
            <div className="info-item">
              <div className="info-icon">
                <User size={20} />
              </div>
              <div className="info-content">
                <div className="info-label">Account Type</div>
                <div className="info-value">
                  <span style={{ 
                    background: '#10B981', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.875rem',
                    fontWeight: 600 
                  }}>
                    Patient Account
                  </span>
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Calendar size={20} />
              </div>
              <div className="info-content">
                <div className="info-label">Member Since</div>
                <div className="info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <CheckCircle size={20} />
              </div>
              <div className="info-content">
                <div className="info-label">Account Status</div>
                <div className="info-value">
                  <span style={{ 
                    background: '#10B981', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.875rem',
                    fontWeight: 600 
                  }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileManagement;
