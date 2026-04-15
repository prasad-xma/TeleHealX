import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  ArrowLeft,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Loader,
  X
} from 'lucide-react';
import { 
  getMedicalReports, 
  deleteMedicalReport 
} from '../services/patientService';

interface MedicalReport {
  _id: string;
  title: string;
  description: string;
  reportType: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  isShared: boolean;
}

const MedicalReportsManagement = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.reportType === filterType);
    }
    
    setFilteredReports(filtered);
  }, [reports, searchTerm, filterType]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getMedicalReports();
      setReports(data);
    } catch (error: any) {
      setError('Failed to fetch medical reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    
    setLoading(true);
    try {
      await deleteMedicalReport(selectedReport._id);
      setSuccess('Medical report deleted successfully!');
      setReports(reports.filter(r => r._id !== selectedReport._id));
      setShowDeleteModal(false);
      setSelectedReport(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to delete medical report');
      setTimeout(() => setError(''), 3000);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const r = Math.round(bytes / Math.pow(k, i) * 100) / 100;
    return r + ' ' + sizes[i];
  };

  const getReportTypeIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      lab: <FileText size={16} />,
      imaging: <FileText size={16} />,
      prescription: <FileText size={16} />,
      discharge: <FileText size={16} />,
      other: <FileText size={16} />
    };
    return icons[type] || icons.other;
  };

  const getReportTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      lab: '#10B981',
      imaging: '#3B82F6',
      prescription: '#059669',
      discharge: '#7C3AED',
      other: '#6B7280'
    };
    return colors[type] || colors.other;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .reports-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
        }

        .reports-container {
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

        .upload-btn {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .report-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 30px rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.08);
          transition: all 0.3s;
          cursor: pointer;
        }

        .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(59,130,246,0.15);
          border-color: #3B82F6;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .report-type {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .report-actions {
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .report-card:hover .report-actions {
          opacity: 1;
        }

        .action-btn {
          background: #F1F5F9;
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: '#64748B';
        }

        .action-btn:hover {
          background: #E2E8F0;
          color: '#3B82F6';
        }

        .action-btn.delete:hover {
          background: #FEF2F2;
          color: '#DC2626';
        }

        .report-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: '#1E293B';
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .report-description {
          color: '#64748B';
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .report-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: '#94A3B8';
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
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
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
          margin-bottom: 1.5rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .cancel-btn {
          background: #F1F5F9;
          color: '#64748B';
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
        }

        .cancel-btn:hover {
          background: #E2E8F0;
        }

        .delete-btn {
          background: #DC2626;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
        }

        .delete-btn:hover {
          background: #B91C1C;
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
          .reports-grid {
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

      <div className="reports-bg">
        <div className="reports-container">
          <div className="header">
            <Link to="/dashboard">
              <button className="back-btn">
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </Link>
            <h1 className="page-title">Medical Reports Management</h1>
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
                placeholder="Search reports..."
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
              <option value="all">All Types</option>
              <option value="lab">Lab Reports</option>
              <option value="imaging">Imaging</option>
              <option value="prescription">Prescriptions</option>
              <option value="discharge">Discharge Summary</option>
              <option value="other">Other</option>
            </select>
            
            <Link to="/upload-report">
              <button className="upload-btn">
                <Upload size={18} />
                Upload New Report
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="loading">
              <Loader size={24} className="spinner" />
              Loading medical reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FileText size={40} />
              </div>
              <h3>No medical reports found</h3>
              <p>
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Upload your first medical report to get started'}
              </p>
            </div>
          ) : (
            <div className="reports-grid">
              {filteredReports.map((report) => (
                <div key={report._id} className="report-card">
                  <div className="report-header">
                    <div 
                      className="report-type"
                      style={{ background: getReportTypeColor(report.reportType) }}
                    >
                      {getReportTypeIcon(report.reportType)}
                      <span style={{ marginLeft: '0.5rem' }}>
                        {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                      </span>
                    </div>
                    <div className="report-actions">
                      <button className="action-btn">
                        <Eye size={16} />
                      </button>
                      <button className="action-btn">
                        <Download size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="report-title">{report.title}</h3>
                  <p className="report-description">{report.description}</p>
                  
                  <div className="report-meta">
                    <span>📄 {report.fileName}</span>
                    <span>💾 {formatFileSize(report.fileSize)}</span>
                  </div>
                  
                  <div className="report-meta">
                    <span>📅 {formatDate(report.uploadDate)}</span>
                    <span style={{ 
                      background: report.isShared ? '#10B981' : '#E5E7EB',
                      color: report.isShared ? 'white' : '#64748B',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {report.isShared ? 'Shared' : 'Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedReport && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Delete Report</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="modal-body">
                  <p>Are you sure you want to delete "<strong>{selectedReport.title}</strong>"?</p>
                  <p>This action cannot be undone.</p>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="spinner" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete Report
                      </>
                    )}
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

export default MedicalReportsManagement;
