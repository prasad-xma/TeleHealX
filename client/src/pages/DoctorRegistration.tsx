import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Loader,
  ArrowLeft,
  Upload,
  Eye,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Award
} from 'lucide-react';

interface DoctorApplication {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  specialization: string;
  licenseNumber: string;
  hospital: string;
  yearsOfExperience: number;
  education: string;
  certifications: string[];
  documents: {
    license: File | null;
    degree: File | null;
    certifications: File[];
  };
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  rejectionReason?: string;
  approvedDate?: string;
}

const DoctorRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    licenseNumber: '',
    hospital: '',
    yearsOfExperience: '',
    education: '',
    certifications: '',
    documents: {
      license: null,
      degree: null,
      certifications: []
    }
  });

  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const totalSteps = 5;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Mock data - in real implementation, this would fetch from API
      const mockApplications: DoctorApplication[] = [
        {
          _id: '1',
          userId: { _id: '1', name: 'Dr. Sarah Johnson', email: 'sarah@telehealx.com' },
          specialization: 'Cardiology',
          licenseNumber: 'MD123456',
          hospital: 'City Hospital',
          yearsOfExperience: 10,
          education: 'MD from Johns Hopkins',
          certifications: ['Board Certified Cardiologist'],
          status: 'approved',
          appliedDate: '2024-04-05',
          approvedDate: '2024-04-08'
        },
        {
          _id: '2',
          userId: { _id: '2', name: 'Dr. Michael Chen', email: 'michael@telehealx.com' },
          specialization: 'Internal Medicine',
          licenseNumber: 'IM456789',
          hospital: 'General Hospital',
          yearsOfExperience: 8,
          education: 'MD from Harvard Medical',
          certifications: ['Board Certified Internist'],
          status: 'pending',
          appliedDate: '2024-04-10'
        },
        {
          _id: '3',
          userId: { _id: '3', name: 'Dr. Emily Davis', email: 'emily@telehealx.com' },
          specialization: 'Pediatrics',
          licenseNumber: 'PD789012',
          hospital: 'Children\'s Hospital',
          yearsOfExperience: 12,
          education: 'MD from Stanford Medical',
          certifications: ['Board Certified Pediatrician'],
          status: 'rejected',
          appliedDate: '2024-04-01',
          rejectionReason: 'Insufficient documentation provided'
        }
      ];
      setApplications(mockApplications);
    } catch (error: any) {
      setError('Failed to fetch applications');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: 'license' | 'degree' | 'certifications') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = {
        license: ['application/pdf', 'image/jpeg', 'image/png'],
        degree: ['application/pdf', 'image/jpeg', 'image/png'],
        certifications: ['application/pdf', 'image/jpeg', 'image/png']
      };

      if (!allowedTypes[docType].includes(file.type)) {
        setError('Invalid file type. Please upload PDF or image files.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: file
        }
      }));
      setError('');
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email && formData.password && formData.confirmPassword;
      case 2:
        return formData.specialization && formData.licenseNumber && formData.hospital && formData.yearsOfExperience;
      case 3:
        return formData.education && formData.certifications;
      case 4:
        return formData.documents.license || formData.documents.degree || formData.documents.certifications.length > 0;
      case 5:
        return true; // Review step - always valid
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      setError('Please complete all required fields in current step');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Mock API call - in real implementation, this would submit to backend
      const newApplication: DoctorApplication = {
        _id: Date.now().toString(),
        userId: {
          _id: '1', // This would come from authenticated user
          name: formData.name,
          email: formData.email
        },
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        hospital: formData.hospital,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        education: formData.education,
        certifications: formData.certifications.split(',').map(cert => cert.trim()),
        documents: formData.documents,
        status: 'pending',
        appliedDate: new Date().toISOString()
      };

      setApplications(prev => [...prev, newApplication]);
      setSuccess('Doctor registration application submitted successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        specialization: '',
        licenseNumber: '',
        hospital: '',
        yearsOfExperience: '',
        education: '',
        certifications: '',
        documents: {
          license: null,
          degree: null,
          certifications: []
        }
      });
      
      setCurrentStep(1);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#DC2626'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: 'Pending Verification',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return texts[status] || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .registration-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
        }

        .registration-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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
          color: white;
          margin: 0;
        }

        .progress-bar {
          background: rgba(255,255,255,0.2);
          border-radius: 20px;
          height: 8px;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .progress-fill {
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          height: 100%;
          border-radius: 20px;
          transition: width 0.3s ease;
        }

        .step-indicator {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
        }

        .step.active {
          color: white;
        }

        .content-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.08);
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: '#1E293B';
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
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

        .file-upload {
          border: 2px dashed #D1D5DB;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          background: #F8FAFC;
          transition: all 0.2s;
        }

        .file-upload:hover {
          border-color: #3B82F6;
          background: #EFF6FF;
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
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
          margin-bottom: 0.5rem;
        }

        .file-text {
          color: '#64748B';
          font-size: 0.875rem;
          text-align: center;
        }

        .file-name {
          color: '#059669';
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
        }

        .btn-secondary {
          background: #F1F5F9;
          color: '#64748B';
        }

        .btn-secondary:hover {
          background: #E2E8F0;
          color: '#3B82F6';
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .applications-section {
          margin-top: 3rem;
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

        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .application-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 30px rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.08);
          transition: all 0.3s;
        }

        .application-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(59,130,246,0.15);
        }

        .application-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .doctor-info {
          margin-bottom: 1rem;
        }

        .doctor-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: '#1E293B';
          margin-bottom: 0.25rem;
        }

        .doctor-details {
          color: '#64748B';
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .application-details {
          color: '#475569';
          font-size: 0.875rem;
          line-height: 1.5;
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
          width: 64px;
          height: 64px;
          background: #F1F5F9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: '#3B82F6';
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .applications-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="registration-bg">
        <div className="registration-container">
          <div className="header">
            <Link to="/admin">
              <button className="back-btn">
                <ArrowLeft size={20} />
                Back to Admin Panel
              </button>
            </Link>
            <h1 className="page-title">Doctor Registration</h1>
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

          <div className="content-card">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="step-indicator">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                  {step}
                </div>
              ))}
            </div>

            <h2 className="step-title">
              {currentStep === 1 && <User size={24} />}
              {currentStep === 2 && <FileText size={24} />}
              {currentStep === 3 && <Award size={24} />}
              {currentStep === 4 && <Upload size={24} />}
              {currentStep === 5 && <CheckCircle size={24} />}
              Step {currentStep} of {totalSteps}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Dr. John Smith"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="doctor@hospital.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Create a strong password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Professional Information */}
              {currentStep === 2 && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="internal-medicine">Internal Medicine</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="neurology">Neurology</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="psychiatry">Psychiatry</option>
                      <option value="general-surgery">General Surgery</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">License Number *</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="MD123456"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hospital/Clinic *</label>
                    <input
                      type="text"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="City General Hospital"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Years of Experience *</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="5"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Education & Certifications */}
              {currentStep === 3 && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Medical Education *</label>
                    <textarea
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="MD from Harvard Medical School, Residency at Massachusetts General Hospital..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Certifications (comma-separated) *</label>
                    <textarea
                      name="certifications"
                      value={formData.certifications}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Board Certified Cardiologist, ACLS Certified, etc..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Document Upload */}
              {currentStep === 4 && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Medical License Document</label>
                    <div className="file-upload">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'license')}
                        className="file-input"
                      />
                      <label htmlFor="license-upload" className="file-label">
                        <div className="file-icon">
                          <Upload size={24} />
                        </div>
                        <div className="file-text">
                          {formData.documents.license ? (
                            <>
                              <div className="file-name">{formData.documents.license.name}</div>
                              <div>License uploaded successfully</div>
                            </>
                          ) : (
                            <>
                              <div>Click to upload medical license</div>
                              <div className="file-name">No file selected</div>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Medical Degree Document</label>
                    <div className="file-upload">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'degree')}
                        className="file-input"
                      />
                      <label htmlFor="degree-upload" className="file-label">
                        <div className="file-icon">
                          <Upload size={24} />
                        </div>
                        <div className="file-text">
                          {formData.documents.degree ? (
                            <>
                              <div className="file-name">{formData.documents.degree.name}</div>
                              <div>Degree uploaded successfully</div>
                            </>
                          ) : (
                            <>
                              <div>Click to upload medical degree</div>
                              <div className="file-name">No file selected</div>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Certification Documents</label>
                    <div className="file-upload">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setFormData(prev => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              certifications: files
                            }
                          }));
                        }}
                        className="file-input"
                      />
                      <div className="file-text">
                        {formData.documents.certifications.length > 0 ? (
                          <div className="file-name">
                            {formData.documents.certifications.length} certification(s) uploaded
                          </div>
                        ) : (
                          <div>Click to upload certification documents</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div>
                  <h3 style={{ marginBottom: '1.5rem', color: '#1E293B' }}>Review Your Application</h3>
                  
                  <div className="application-details">
                    <div className="doctor-info">
                      <div className="doctor-name">{formData.name}</div>
                      <div className="doctor-details">
                        <div><strong>Email:</strong> {formData.email}</div>
                        <div><strong>Specialization:</strong> {formData.specialization}</div>
                        <div><strong>License:</strong> {formData.licenseNumber}</div>
                        <div><strong>Hospital:</strong> {formData.hospital}</div>
                        <div><strong>Experience:</strong> {formData.yearsOfExperience} years</div>
                      </div>
                    </div>
                    
                    <div className="application-details">
                      <div><strong>Education:</strong> {formData.education}</div>
                      <div><strong>Certifications:</strong> {formData.certifications}</div>
                      <div><strong>Documents:</strong> 
                        {formData.documents.license ? '✅ License' : '❌ License'}
                        {formData.documents.degree ? '✅ Degree' : '❌ Degree'}
                        {formData.documents.certifications.length > 0 ? `✅ ${formData.documents.certifications.length} Certifications` : '❌ Certifications'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                {currentStep > 1 && (
                  <button type="button" className="btn btn-secondary" onClick={handlePrevious}>
                    Previous
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    {currentStep === totalSteps ? 'Submit Application' : 'Next'}
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing Applications */}
          <div className="applications-section">
            <div className="section-header">
              <h2 className="section-title">
                <FileText size={24} />
                Your Applications
              </h2>
              <Link to="/admin" className="btn btn-primary">
                View All Applications
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FileText size={32} />
                </div>
                <h3>No applications found</h3>
                <p>Complete your first application to get started</p>
              </div>
            ) : (
              <div className="applications-grid">
                {applications.map((application) => (
                  <div key={application._id} className="application-card">
                    <div className="application-header">
                      <span 
                        className="status-badge"
                        style={{ background: getStatusColor(application.status) }}
                      >
                        {getStatusText(application.status)}
                      </span>
                    </div>
                    
                    <div className="doctor-info">
                      <div className="doctor-name">{application.userId.name}</div>
                      <div className="doctor-details">
                        <div><strong>Email:</strong> {application.userId.email}</div>
                        <div><strong>Specialization:</strong> {application.specialization}</div>
                        <div><strong>License:</strong> {application.licenseNumber}</div>
                      </div>
                    </div>
                    
                    <div className="application-details">
                      <div><strong>Hospital:</strong> {application.hospital}</div>
                      <div><strong>Experience:</strong> {application.yearsOfExperience} years</div>
                      <div><strong>Education:</strong> {application.education}</div>
                      <div><strong>Certifications:</strong> {application.certifications.join(', ')}</div>
                      <div><strong>Applied:</strong> {formatDate(application.appliedDate)}</div>
                      {application.approvedDate && (
                        <div><strong>Approved:</strong> {formatDate(application.approvedDate)}</div>
                      )}
                      {application.rejectionReason && (
                        <div><strong>Rejection Reason:</strong> {application.rejectionReason}</div>
                      )}
                    </div>
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

export default DoctorRegistration;
