import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { updateProfile } from '../../services/patientService';

const ProfileManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [user, setUser] = useState(() => {
    const userRaw = localStorage.getItem('user');
    return userRaw ? JSON.parse(userRaw) : null;
  });

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
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/patients/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const profileData = await response.json();
          console.log('Fetched profile data:', profileData);
          setFormData({
            name: profileData.data.name || '',
            birthDay: profileData.data.birthDay ? new Date(profileData.data.birthDay).toISOString().split('T')[0] : '',
            gender: profileData.data.gender || '',
            address: profileData.data.address || '',
            email: profileData.data.email || '',
            phone: profileData.data.phone || '',
            emergencyContact: profileData.data.emergencyContact || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Fallback to localStorage if API fails
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
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Field changed:', name, 'New value:', value);
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Submitting form data:', formData);
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    console.log('Edit button clicked - switching to edit mode');
    setIsEditing(true);
  };

  const handleCancel = () => {
    console.log('Cancel button clicked - switching to view mode');
    setIsEditing(false);
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

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Nunito, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Please login to view your Profile</h2>
          <Link 
            to="/login" 
            style={{
              background: '#3B82F6',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%)',
      fontFamily: 'Nunito, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Link 
          to="/dashboard" 
          style={{
            background: '#F1F5F9',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '12px',
            cursor: 'pointer',
            color: '#64748B',
            textDecoration: 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#1E293B',
          margin: 0
        }}>Profile Management</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #F1F5F9'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: 0
            }}>
              <User size={24} />
              Personal Information
            </h2>
            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              {!isEditing ? (
                <button 
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#3B82F6',
                    color: 'white'
                  }}
                  onClick={handleEditClick}
                  disabled={isLoading}
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#10B981',
                      color: 'white'
                    }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader size={16} /> : <Save size={16} />}
                    Save Changes
                  </button>
                  <button 
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#EF4444',
                      color: 'white'
                    }}
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#EF4444',
              color: 'white'
            }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#10B981',
              color: 'white'
            }}>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: isLoading ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Date of Birth</label>
                  <input
                    type="date"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: isLoading ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: isLoading ? '#f3f4f6' : 'white'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: isLoading ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: isLoading ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Emergency Contact</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Emergency contact number"
                    disabled={isLoading}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: isLoading ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  required
                  disabled={isLoading}
                  style={{
                      padding: '0.75rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      resize: 'vertical',
                      backgroundColor: isLoading ? '#f3f4f6' : 'white'
                  }}
                />
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: '#3B82F6',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Full Name</div>
                  <div style={{ color: '#1F2937', fontWeight: 500 }}>{user?.name || 'Not provided'}</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: '#3B82F6',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Calendar size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Date of Birth</div>
                  <div style={{ color: '#1F2937', fontWeight: 500 }}>
                    {user?.birthDay ? new Date(user.birthDay).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: '#3B82F6',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Gender</div>
                  <div style={{ color: '#1F2937', fontWeight: 500 }}>{user?.gender || 'Not provided'}</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: '#3B82F6',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email Address</div>
                  <div style={{ color: '#1F2937', fontWeight: 500 }}>{user?.email || 'Not provided'}</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: '#3B82F6',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Phone size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Phone Number</div>
                  <div style={{ color: '#1F2937', fontWeight: 500 }}>{user?.phone || 'Not provided'}</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: '#3B82F6',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Phone size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Emergency Contact</div>
                  <div style={{ color: '#1F2937', fontWeight: 500 }}>{user?.emergencyContact || 'Not provided'}</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: '#3B82F6',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Address</div>
                  <div style={{ color: '#1F2937', fontWeight: 500 }}>{user?.address || 'Not provided'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.08)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '1.5rem' }}>
            Account Information
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: '#F8FAFC',
            borderRadius: '12px',
            borderLeft: '4px solid #3B82F6'
          }}>
            <div style={{
              padding: '0.5rem',
              background: '#3B82F6',
              borderRadius: '8px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Account Type</div>
              <div style={{ color: '#1F2937', fontWeight: 500 }}>
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

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: '#F8FAFC',
            borderRadius: '12px',
            borderLeft: '4px solid #3B82F6'
          }}>
            <div style={{
              padding: '0.5rem',
              background: '#3B82F6',
              borderRadius: '8px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Member Since</div>
              <div style={{ color: '#1F2937', fontWeight: 500 }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: '#F8FAFC',
            borderRadius: '12px',
            borderLeft: '4px solid #3B82F6'
          }}>
            <div style={{
              padding: '0.5rem',
              background: '#3B82F6',
              borderRadius: '8px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Account Status</div>
              <div style={{ color: '#1F2937', fontWeight: 500 }}>
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
  );
};

export default ProfileManagement;
