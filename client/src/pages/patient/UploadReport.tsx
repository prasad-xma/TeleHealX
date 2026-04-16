import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Loader
} from 'lucide-react';
import { uploadMedicalReport } from '../../services/patientService';

const UploadReport = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportType: 'other'
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only images, PDFs, and Word documents are allowed');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for the report');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description for the report');
      return;
    }

    setIsLoading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('medicalReport', file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('reportType', formData.reportType);

      await uploadMedicalReport(uploadFormData);
      setSuccess('Medical report uploaded successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .upload-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Nunito', sans-serif;
        }

        .upload-container {
          width: 100%;
          max-width: 800px;
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.18);
          border: 1px solid rgba(59, 130, 246, 0.12);
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

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .file-upload {
          position: relative;
          border: 2px dashed #D1D5DB;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          background: #F9FAFB;
          transition: all 0.2s;
          cursor: pointer;
        }

        .file-upload:hover {
          border-color: #3B82F6;
          background: #EFF6FF;
        }

        .file-upload.has-file {
          border-color: #10B981;
          background: #ECFDF5;
        }

        .file-input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .file-icon {
          width: 48px;
          height: 48px;
          background: #E5E7EB;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: '#6B7280';
        }

        .file-upload.has-file .file-icon {
          background: #10B981;
          color: white;
        }

        .file-text {
          color: '#6B7280';
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .file-upload.has-file .file-text {
          color: '#059669';
          font-weight: 600;
        }

        .file-name {
          font-size: 0.75rem;
          color: '#9CA3AF';
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="upload-bg">
        <div className="upload-container">
          <div className="header">
            <Link to="/dashboard">
              <button className="back-btn">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <h1 className="page-title">Upload Medical Report</h1>
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Report Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter report title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="lab">Lab Report</option>
                <option value="imaging">Imaging (X-ray, MRI, CT)</option>
                <option value="prescription">Prescription</option>
                <option value="discharge">Discharge Summary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Provide a brief description of the report"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medical Report File</label>
              <div className={`file-upload ${file ? 'has-file' : ''}`}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="file-input"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                />
                <div className="file-icon">
                  <Upload size={24} />
                </div>
                <div className="file-text">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </div>
                <div className="file-name">
                  Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX (Max 10MB)
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader size={20} className="spinner" />
                  Uploading Report...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Report
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadReport;
