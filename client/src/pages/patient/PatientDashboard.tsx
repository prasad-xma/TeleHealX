import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Pill, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Activity,
  Heart,
  Stethoscope,
  LogOut,
  Settings,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { 
  getMedicalHistory, 
  getMedicalReports, 
  getPrescriptions,
  deleteMedicalReport 
} from '../../services/patientService';
import { analyzeSymptoms } from '../../services/aiService';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [medicalReports, setMedicalReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const name = user?.name || 'Patient';

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMedicalHistory();
    } else if (activeTab === 'reports') {
      fetchMedicalReports();
    } else if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [activeTab]);

  const fetchMedicalHistory = async () => {
    setLoading(true);
    try {
      const data = await getMedicalHistory();
      setMedicalHistory(data);
    } catch (error: any) {
      setError('Failed to fetch medical history');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalReports = async () => {
    setLoading(true);
    try {
      const data = await getMedicalReports();
      setMedicalReports(data);
    } catch (error: any) {
      setError('Failed to fetch medical reports');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteMedicalReport(reportId);
        setSuccess('Report deleted successfully');
        fetchMedicalReports();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        setError('Failed to delete report');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSymptomSubmit = async () => {
    setError('');
    setSuccess('');

    if (!symptoms.trim()) {
      setError('Please write your symptoms before submitting.');
      return;
    }

    setAiLoading(true);
    try {
      const response = await analyzeSymptoms({
        symptoms: symptoms.trim(),
        patientId: user?._id || user?.id || null,
      });

      setAiResponse(response.data?.aiResponse || 'No response was returned by AI.');
      setSuccess('Symptoms analyzed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to analyze symptoms');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .dashboard-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%);
          color: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 4px 20px rgba(59,130,246,0.15);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .header-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s;
        }

        .header-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .tabs-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 1rem;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          font-weight: 600;
          color: '#64748B';
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
          color: white;
        }

        .tab-btn:hover:not(.active) {
          background: #F1F5F9;
          color: '#1E293B';
        }

        .content-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.08);
          margin-bottom: 2rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #F1F5F9;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: '#1E293B';
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .action-btn {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59,130,246,0.25);
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .overview-card {
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border: 2px solid #E2E8F0;
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .overview-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(59,130,246,0.15);
          border-color: #3B82F6;
        }

        .overview-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: white;
        }

        .overview-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: '#1E293B';
          margin-bottom: 0.5rem;
        }

        .overview-value {
          font-size: 2rem;
          font-weight: 800;
          color: '#3B82F6';
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #F8FAFC;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: '#475569';
          border-bottom: 2px solid #E2E8F0;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #F1F5F9;
          color: '#334155';
        }

        .data-table tr:hover {
          background: #F8FAFC;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-active {
          background: #DCFCE7;
          color: '#15803D';
        }

        .status-inactive {
          background: #FEF2F2;
          color: '#DC2626';
        }

        .action-icons {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          color: '#64748B';
        }

        .icon-btn:hover {
          background: '#F1F5F9';
          color: '#3B82F6';
        }

        .icon-btn.delete:hover {
          background: '#FEF2F2';
          color: '#DC2626';
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

        .loading {
          text-align: center;
          padding: 2rem;
          color: '#64748B';
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: '#64748B';
        }

        .empty-state-icon {
          width: 80px;
          height: 80px;
          background: #F1F5F9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: '#94A3B8';
        }

        .symptom-textarea {
          width: 100%;
          min-height: 140px;
          border: 1px solid #CBD5E1;
          border-radius: 12px;
          padding: 1rem;
          font-size: 1rem;
          font-family: 'Nunito', sans-serif;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
        }

        .symptom-textarea:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }

        .ai-response-box {
          margin-top: 1rem;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 12px;
          padding: 1rem;
          white-space: pre-wrap;
          color: #0F172A;
        }

      `}</style>

      <div className="dashboard-bg">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <div className="user-avatar">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                  Welcome, {name}
                </h1>
                <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
                  Patient Dashboard
                </p>
              </div>
            </div>
            
            <div className="header-actions">
              <Link to="/profile">
                <button className="header-btn">
                  <Settings size={18} />
                  Profile Management
                </button>
              </Link>
              <button className="header-btn" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-container">
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

          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Activity size={18} />
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FileText size={18} />
              Medical History
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <Upload size={18} />
              Medical Reports
            </button>
            <button 
              className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              <Pill size={18} />
              Prescriptions
            </button>
            <button 
              className={`tab-btn ${activeTab === 'symptom-checker' ? 'active' : ''}`}
              onClick={() => setActiveTab('symptom-checker')}
            >
              <Stethoscope size={18} />
              AI Symptom Checker
            </button>
          </div>

          {activeTab === 'overview' && (
            <div>
              <Link to="/appointments" className="action-btn" style={{ marginBottom: '1rem', width: 'fit-content' }}>
                <Calendar size={18} />
                Create Appointment
              </Link>

              <div className="overview-grid">
                <div className="overview-card">
                  <div className="overview-icon">
                    <FileText size={30} />
                  </div>
                  <div className="overview-title">Medical Records</div>
                  <div className="overview-value">{medicalHistory.length}</div>
                </div>
                
                <div className="overview-card">
                  <div className="overview-icon">
                    <Upload size={30} />
                  </div>
                  <div className="overview-title">Medical Reports</div>
                  <div className="overview-value">{medicalReports.length}</div>
                </div>
                
                <div className="overview-card">
                  <div className="overview-icon">
                    <Pill size={30} />
                  </div>
                  <div className="overview-title">Active Prescriptions</div>
                  <div className="overview-value">
                    {prescriptions.filter(p => p.isActive).length}
                  </div>
                </div>
                
                <div className="overview-card">
                  <div className="overview-icon">
                    <Heart size={30} />
                  </div>
                  <div className="overview-title">Health Status</div>
                  <div className="overview-value">Good</div>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <Stethoscope size={24} />
                    Recent Activity
                  </h2>
                </div>
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Activity size={40} />
                  </div>
                  <h3>No recent activity</h3>
                  <p>Your medical activities will appear here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  <FileText size={24} />
                  Medical History
                </h2>
              </div>
              
              {loading ? (
                <div className="loading">Loading medical history...</div>
              ) : medicalHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FileText size={40} />
                  </div>
                  <h3>No medical records found</h3>
                  <p>Your medical history will appear here</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Diagnosis</th>
                      <th>Treatment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalHistory.map((record: any) => (
                      <tr key={record._id}>
                        <td>{formatDate(record.visitDate)}</td>
                        <td>{record.doctorId?.name || 'N/A'}</td>
                        <td>{record.diagnosis}</td>
                        <td>{record.treatment}</td>
                        <td>
                          <span className="status-badge status-active">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  <Upload size={24} />
                  Medical Reports
                </h2>
                <Link to="/prescriptions" className="action-btn">
                  <Pill size={18} />
                  Manage Prescriptions
                </Link>
                <Link to="/appointments" className="action-btn">
                  <Calendar size={18} />
                  Create Appointment
                </Link>
                <Link to="/medical-reports" className="action-btn">
                  <FileText size={18} />
                  Manage Reports
                </Link>
              </div>
              
              {loading ? (
                <div className="loading">Loading medical reports...</div>
              ) : medicalReports.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Upload size={40} />
                  </div>
                  <h3>No medical reports found</h3>
                  <p>Upload your medical reports to get started</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>File Size</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalReports.map((report: any) => (
                      <tr key={report._id}>
                        <td>{formatDate(report.uploadDate)}</td>
                        <td>{report.title}</td>
                        <td>{report.reportType}</td>
                        <td>{(report.fileSize / 1024).toFixed(1)} KB</td>
                        <td>
                          <div className="action-icons">
                            <button className="icon-btn">
                              <Eye size={16} />
                            </button>
                            <button className="icon-btn">
                              <Download size={16} />
                            </button>
                            <button 
                              className="icon-btn delete"
                              onClick={() => handleDeleteReport(report._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  <Pill size={24} />
                  Prescriptions
                </h2>
              </div>
              
              {loading ? (
                <div className="loading">Loading prescriptions...</div>
              ) : prescriptions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Pill size={40} />
                  </div>
                  <h3>No prescriptions found</h3>
                  <p>Your prescriptions will appear here</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Diagnosis</th>
                      <th>Medications</th>
                      <th>Status</th>
                      <th>Valid Until</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((prescription: any) => (
                      <tr key={prescription._id}>
                        <td>{formatDate(prescription.prescribedDate)}</td>
                        <td>{prescription.doctorId?.name || 'N/A'}</td>
                        <td>{prescription.diagnosis}</td>
                        <td>
                          {prescription.medications.map((med: any, index: number) => (
                            <div key={index}>
                              {med.name} - {med.dosage}
                            </div>
                          ))}
                        </td>
                        <td>
                          <span className={`status-badge ${prescription.isActive ? 'status-active' : 'status-inactive'}`}>
                            {prescription.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{formatDate(prescription.validUntil)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'symptom-checker' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  <Stethoscope size={24} />
                  AI Symptom Checker
                </h2>
              </div>

              <p style={{ marginTop: 0, color: '#475569' }}>
                Describe your symptoms and submit to get an AI-generated triage response.
              </p>

              <textarea
                className="symptom-textarea"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I have fever, sore throat, cough, and body pain for 2 days."
              />

              <button
                className="action-btn"
                onClick={handleSymptomSubmit}
                disabled={aiLoading}
                style={{ marginTop: '1rem', opacity: aiLoading ? 0.7 : 1, cursor: aiLoading ? 'not-allowed' : 'pointer' }}
              >
                <Stethoscope size={18} />
                {aiLoading ? 'Analyzing...' : 'Submit Symptoms'}
              </button>

              {aiResponse && (
                <div className="ai-response-box">
                  {aiResponse}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
