import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Pill, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Search,
  Filter,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Activity
} from 'lucide-react';
import { 
  getPrescriptions, 
  getPrescriptionById 
} from '../services/patientService';

interface Prescription {
  _id: string;
  patientId: string;
  doctorId: {
    _id: string;
    name: string;
    email: string;
    specialization?: string;
  };
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  instructions: string;
  prescribedDate: string;
  validUntil: string;
  isActive: boolean;
  refills: number;
}

const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    let filtered = prescriptions;
    
    if (searchTerm) {
      filtered = filtered.filter(prescription => 
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        prescription.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(prescription => 
        filterStatus === 'active' ? prescription.isActive : !prescription.isActive
      );
    }
    
    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm, filterStatus]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (error: any) {
      setError('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (prescriptionId: string) => {
    try {
      const prescription = await getPrescriptionById(prescriptionId);
      setSelectedPrescription(prescription);
      setShowDetailsModal(true);
    } catch (error: any) {
      setError('Failed to fetch prescription details');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10B981' : '#6B7280';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Completed';
  };

  const getDaysRemaining = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .prescriptions-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
        }

        .prescriptions-container {
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

        .controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
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

        .prescriptions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .prescription-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 30px rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.08);
          transition: all 0.3s;
          cursor: pointer;
        }

        .prescription-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(59,130,246,0.15);
          border-color: #3B82F6;
        }

        .prescription-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #F1F5F9;
        }

        .prescription-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .prescription-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: '#1E293B';
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .prescription-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: '#64748B';
        }

        .info-section {
          flex: 1;
        }

        .info-label {
          font-weight: 600;
          color: '#374151';
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .info-value {
          color: '#1F2937';
          line-height: 1.5;
        }

        .medications-list {
          margin-top: 0.5rem;
        }

        .medication-item {
          background: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 0.75rem;
        }

        .medication-name {
          font-weight: 600;
          color: '#1E293B';
          margin-bottom: 0.25rem;
        }

        .medication-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: '#64748B';
        }

        .prescription-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #F1F5F9;
          font-size: 0.875rem;
          color: '#64748B';
        }

        .days-remaining {
          font-weight: 600;
          color: '#059669';
        }

        .days-remaining.warning {
          color: '#DC2626';
        }

        .days-remaining.expired {
          color: '#7C3AED';
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
          max-width: 600px;
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
        }

        .close-btn:hover {
          background: #F1F5F9;
        }

        .modal-body {
          color: '#475569';
          line-height: 1.6;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: '#1E293B';
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-content {
          color: '#64748B';
          line-height: 1.6;
        }

        .medications-grid {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
        }

        .medication-card {
          background: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 1.25rem;
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
          .prescriptions-grid {
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

      <div className="prescriptions-bg">
        <div className="prescriptions-container">
          <div className="header">
            <Link to="/dashboard">
              <button className="back-btn">
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </Link>
            <h1 className="page-title">Prescription Management</h1>
          </div>

          {success && (
            <div style={{ 
              background: '#F0FDF4', 
              border: '1px solid #BBF7D0', 
              color: '#15803D', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              fontWeight: 600 
            }}>
              <CheckCircle size={20} />
              {success}
            </div>
          )}
          
          {error && (
            <div style={{ 
              background: '#FEF2F2', 
              border: '1px solid #FECACA', 
              color: '#DC2626', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              fontWeight: 600 
            }}>
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <div className="controls">
            <div className="search-box">
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Prescriptions</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">
              <Activity size={24} className="spinner" />
              Loading prescriptions...
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Pill size={40} />
              </div>
              <h3>No prescriptions found</h3>
              <p>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Your prescriptions will appear here once prescribed by your doctor'}
              </p>
            </div>
          ) : (
            <div className="prescriptions-grid">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription._id} className="prescription-card">
                  <div className="prescription-header">
                    <div className="prescription-status" style={{ background: getStatusColor(prescription.isActive) }}>
                      {getStatusText(prescription.isActive)}
                    </div>
                    <div className="prescription-info">
                      <div className="info-section">
                        <div className="info-label">Prescribed Date</div>
                        <div className="info-value">{formatDate(prescription.prescribedDate)}</div>
                      </div>
                      <div className="info-section">
                        <div className="info-label">Doctor</div>
                        <div className="info-value">{prescription.doctorId?.name || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="prescription-title">{prescription.diagnosis}</h3>
                  
                  <div className="medications-list">
                    {prescription.medications.map((medication, index) => (
                      <div key={index} className="medication-item">
                        <div className="medication-name">{medication.name}</div>
                        <div className="medication-details">
                          <div><strong>Dosage:</strong> {medication.dosage}</div>
                          <div><strong>Frequency:</strong> {medication.frequency}</div>
                          <div><strong>Duration:</strong> {medication.duration}</div>
                          {medication.instructions && (
                            <div><strong>Instructions:</strong> {medication.instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="prescription-footer">
                    <div>
                      <div className="info-label">Valid Until</div>
                      <div className="info-value">{formatDate(prescription.validUntil)}</div>
                    </div>
                    <div>
                      <span className={`days-remaining ${
                        getDaysRemaining(prescription.validUntil) <= 7 ? 'warning' : 
                        getDaysRemaining(prescription.validUntil) <= 0 ? 'expired' : ''
                      }`}>
                        {getDaysRemaining(prescription.validUntil)} days remaining
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prescription Details Modal */}
          {showDetailsModal && selectedPrescription && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Prescription Details</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="detail-section">
                    <div className="detail-title">
                      <Calendar size={20} />
                      Prescription Information
                    </div>
                    <div className="detail-content">
                      <p><strong>Prescribed Date:</strong> {formatDate(selectedPrescription.prescribedDate)}</p>
                      <p><strong>Valid Until:</strong> {formatDate(selectedPrescription.validUntil)}</p>
                      <p><strong>Status:</strong> 
                        <span style={{ 
                          color: getStatusColor(selectedPrescription.isActive),
                          background: getStatusColor(selectedPrescription.isActive),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {getStatusText(selectedPrescription.isActive)}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <div className="detail-title">
                      <User size={20} />
                      Doctor Information
                    </div>
                    <div className="detail-content">
                      <p><strong>Name:</strong> {selectedPrescription.doctorId?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedPrescription.doctorId?.email || 'N/A'}</p>
                      {selectedPrescription.doctorId?.specialization && (
                        <p><strong>Specialization:</strong> {selectedPrescription.doctorId.specialization}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <div className="detail-title">
                      <Pill size={20} />
                      Diagnosis & Instructions
                    </div>
                    <div className="detail-content">
                      <p><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
                      <p><strong>Instructions:</strong> {selectedPrescription.instructions}</p>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <div className="detail-title">
                      <Pill size={20} />
                      Medications
                    </div>
                    <div className="medications-grid">
                      {selectedPrescription.medications.map((medication, index) => (
                        <div key={index} className="medication-card">
                          <h4>{medication.name}</h4>
                          <div className="medication-details">
                            <div><strong>Dosage:</strong> {medication.dosage}</div>
                            <div><strong>Frequency:</strong> {medication.frequency}</div>
                            <div><strong>Duration:</strong> {medication.duration}</div>
                            {medication.instructions && (
                              <div><strong>Special Instructions:</strong> {medication.instructions}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PrescriptionManagement;
