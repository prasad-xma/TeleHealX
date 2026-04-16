import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  User, 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  Loader,
  CheckCircle
} from 'lucide-react';
import { getMedicalHistory } from '../../services/patientService';

const MedicalHistoryManagement = () => {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        setIsLoading(true);
        const response = await getMedicalHistory();
        console.log('Medical history response:', response);
        setMedicalHistory(response.data || []);
        setError('');
      } catch (err: any) {
        console.error('Error fetching medical history:', err);
        setError(err.response?.data?.message || 'Failed to fetch medical history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

  const filteredHistory = medicalHistory.filter(record => 
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

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
        }}>Medical History Management</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        maxWidth: '1200px',
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
              <FileText size={24} />
              Medical History
            </h2>
            <Link 
              to="/medical-history/add"
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
            >
              <Plus size={16} />
              Add Medical Record
            </Link>
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

          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem'
            }}>
              <Loader size={24} className="animate-spin" />
              <span style={{ marginLeft: '1rem' }}>Loading medical history...</span>
            </div>
          )}

          {!isLoading && medicalHistory.length === 0 && !error && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6B7280'
            }}>
              <FileText size={48} />
              <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                No medical history records found. Click "Add Medical Record" to add your first medical record.
              </p>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search medical history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  width: '300px'
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Filter size={20} />
              <select
                onChange={(e) => {
                  // Add filtering logic here if needed
                  console.log('Filter by:', e.target.value);
                }}
                style={{
                  padding: '0.5rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="">All Records</option>
                <option value="recent">Most Recent</option>
                <option value="emergency">Emergency Only</option>
              </select>
            </div>
          </div>

          <div style={{
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((record, index) => (
                <div key={record._id || index} style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #E5E7EB',
                  transition: 'all 0.2s'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
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
                      <div>
                        <div style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {formatDate(record.visitDate)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.25rem' }}>
                          Visit Date
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Eye size={20} style={{ cursor: 'pointer' }} />
                      <Download size={20} style={{ cursor: 'pointer' }} />
                      <Trash2 size={20} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '1rem',
                    flex: 1
                  }}>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={20} />
                      <span>Diagnosis</span>
                    </div>
                    <div style={{ color: '#374151', fontSize: '1rem', marginBottom: '0.5rem' }}>
                      {record.diagnosis}
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '1rem',
                    flex: 1
                  }}>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={20} />
                      <span>Symptoms</span>
                    </div>
                    <div style={{ color: '#374151', fontSize: '1rem', marginBottom: '0.5rem' }}>
                      {Array.isArray(record.symptoms) ? record.symptoms.join(', ') : 'No symptoms recorded'}
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '1rem',
                    flex: 1
                  }}>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={20} />
                      <span>Treatment</span>
                    </div>
                    <div style={{ color: '#374151', fontSize: '1rem', marginBottom: '0.5rem' }}>
                      {record.treatment}
                    </div>
                  </div>

                  {record.notes && (
                    <div style={{
                      background: 'white',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} />
                        <span>Doctor Notes</span>
                      </div>
                      <div style={{ color: '#374151', fontSize: '1rem' }}>
                        {record.notes}
                      </div>
                    </div>
                  )}

                  {record.isEmergency && (
                    <div style={{
                      background: '#FEF2F2',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      marginTop: '1rem',
                      textAlign: 'center'
                    }}>
                      <span style={{ 
                        color: '#DC2626', 
                        fontWeight: 600, 
                        fontSize: '0.875rem' 
                      }}>
                        ⚠️ EMERGENCY VISIT
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6B7280'
              }}>
                <FileText size={48} />
                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                  No medical history records found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.08)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '1.5rem' }}>
            Medical History Summary
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #E5E7EB',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                {medicalHistory.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                Total Records
              </div>
            </div>
            
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #E5E7EB',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                {medicalHistory.filter(record => record.isEmergency).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                Emergency Visits
              </div>
            </div>
            
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #E5E7EB',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                {medicalHistory.filter(record => !record.isEmergency).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                Regular Visits
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryManagement;
