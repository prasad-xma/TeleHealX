import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Eye,
  EyeOff
} from 'lucide-react';

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDay: '',
    gender: '',
    
    // Professional Information
    specialization: '',
    licenseNumber: '',
    hospital: '',
    yearsOfExperience: '',
    
    // Account Security
    password: '',
    confirmPassword: '',
    
    // Documents
    medicalLicense: null as File | null,
    medicalDegree: null as File | null,
    idProof: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const existingApplications = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah@telehealx.com',
      specialization: 'Cardiology',
      status: 'approved',
      appliedDate: '2024-04-05'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      email: 'michael@telehealx.com',
      specialization: 'Pediatrics',
      status: 'pending',
      appliedDate: '2024-04-10'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({ ...prev, [fieldName]: file }));
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Personal Information
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.birthDay) newErrors.birthDay = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;
        
      case 2: // Professional Information
        if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.hospital.trim()) newErrors.hospital = 'Hospital is required';
        if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
        break;
        
      case 3: // Account Security
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
        
      case 4: // Documents
        if (!formData.medicalLicense) newErrors.medicalLicense = 'Medical license is required';
        if (!formData.medicalDegree) newErrors.medicalDegree = 'Medical degree is required';
        if (!formData.idProof) newErrors.idProof = 'ID proof is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'medicalLicense' && key !== 'medicalDegree' && key !== 'idProof') {
          submitData.append(key, formData[key as keyof typeof formData]);
        }
      });
      
      // Add files
      if (formData.medicalLicense) {
        submitData.append('medicalLicense', formData.medicalLicense);
      }
      if (formData.medicalDegree) {
        submitData.append('medicalDegree', formData.medicalDegree);
      }
      if (formData.idProof) {
        submitData.append('idProof', formData.idProof);
      }
      
      // Add role
      submitData.append('role', 'doctor');
      
      // Mock API call
      console.log('Submitting doctor registration:', submitData);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        alert('Doctor registration submitted successfully! You will be notified once approved.');
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      alert('Registration failed. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Dr. John Smith"
                    className={errors.name ? 'error' : ''}
                  />
                </div>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="doctor@telehealx.com"
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className={errors.phone ? 'error' : ''}
                  />
                </div>
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label>Address</label>
                <div className="input-wrapper">
                  <MapPin size={18} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Medical Center, City, State"
                    className={errors.address ? 'error' : ''}
                  />
                </div>
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="date"
                      name="birthDay"
                      value={formData.birthDay}
                      onChange={handleInputChange}
                      className={errors.birthDay ? 'error' : ''}
                    />
                  </div>
                  {errors.birthDay && <span className="error-message">{errors.birthDay}</span>}
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={errors.gender ? 'error' : ''}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="step-title">Professional Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Specialization</label>
                <div className="input-wrapper">
                  <Briefcase size={18} />
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={errors.specialization ? 'error' : ''}
                  >
                    <option value="">Select Specialization</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="endocrinology">Endocrinology</option>
                    <option value="gastroenterology">Gastroenterology</option>
                    <option value="neurology">Neurology</option>
                    <option value="oncology">Oncology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="radiology">Radiology</option>
                    <option value="surgery">Surgery</option>
                    <option value="urology">Urology</option>
                  </select>
                </div>
                {errors.specialization && <span className="error-message">{errors.specialization}</span>}
              </div>

              <div className="form-group">
                <label>Medical License Number</label>
                <div className="input-wrapper">
                  <FileText size={18} />
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="MD123456"
                    className={errors.licenseNumber ? 'error' : ''}
                  />
                </div>
                {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
              </div>

              <div className="form-group">
                <label>Hospital/Clinic</label>
                <div className="input-wrapper">
                  <Briefcase size={18} />
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    placeholder="City General Hospital"
                    className={errors.hospital ? 'error' : ''}
                  />
                </div>
                {errors.hospital && <span className="error-message">{errors.hospital}</span>}
              </div>

              <div className="form-group">
                <label>Years of Experience</label>
                <div className="input-wrapper">
                  <Briefcase size={18} />
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    placeholder="5"
                    min="0"
                    max="50"
                    className={errors.yearsOfExperience ? 'error' : ''}
                  />
                </div>
                {errors.yearsOfExperience && <span className="error-message">{errors.yearsOfExperience}</span>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="step-title">Account Security</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2 className="step-title">Document Upload</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Medical License</label>
                <div className="file-upload">
                  <Upload size={24} />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange('medicalLicense')}
                    className={errors.medicalLicense ? 'error' : ''}
                  />
                  <div className="file-info">
                    {formData.medicalLicense ? (
                      <div className="file-selected">
                        <FileText size={16} />
                        <span>{formData.medicalLicense.name}</span>
                      </div>
                    ) : (
                      <span>Upload medical license (PDF, JPG, PNG)</span>
                    )}
                  </div>
                </div>
                {errors.medicalLicense && <span className="error-message">{errors.medicalLicense}</span>}
              </div>

              <div className="form-group">
                <label>Medical Degree</label>
                <div className="file-upload">
                  <Upload size={24} />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange('medicalDegree')}
                    className={errors.medicalDegree ? 'error' : ''}
                  />
                  <div className="file-info">
                    {formData.medicalDegree ? (
                      <div className="file-selected">
                        <GraduationCap size={16} />
                        <span>{formData.medicalDegree.name}</span>
                      </div>
                    ) : (
                      <span>Upload medical degree (PDF, JPG, PNG)</span>
                    )}
                  </div>
                </div>
                {errors.medicalDegree && <span className="error-message">{errors.medicalDegree}</span>}
              </div>

              <div className="form-group">
                <label>ID Proof</label>
                <div className="file-upload">
                  <Upload size={24} />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange('idProof')}
                    className={errors.idProof ? 'error' : ''}
                  />
                  <div className="file-info">
                    {formData.idProof ? (
                      <div className="file-selected">
                        <FileText size={16} />
                        <span>{formData.idProof.name}</span>
                      </div>
                    ) : (
                      <span>Upload ID proof (PDF, JPG, PNG)</span>
                    )}
                  </div>
                </div>
                {errors.idProof && <span className="error-message">{errors.idProof}</span>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .registration-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Nunito', sans-serif;
        }

        .registration-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .registration-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo {
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          margin-bottom: 0.5rem;
          font-family: 'Fredoka One', cursive;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .registration-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .progress-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
        }

        .progress-bar::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: #e5e7eb;
          z-index: 1;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 2;
        }

        .progress-step.active {
          color: #667eea;
        }

        .progress-step.completed {
          color: #10b981;
        }

        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .progress-step.active .step-number {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .progress-step.completed .step-number {
          border-color: #10b981;
          background: #10b981;
          color: white;
        }

        .step-content {
          margin-bottom: 2rem;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-grid {
          display: grid;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper input,
        .input-wrapper select {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .input-wrapper input:focus,
        .input-wrapper select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-wrapper .error {
          border-color: #ef4444;
        }

        .input-wrapper svg {
          position: absolute;
          left: 0.75rem;
          color: #6b7280;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
        }

        .file-upload {
          position: relative;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s;
        }

        .file-upload:hover {
          border-color: #667eea;
          background: #f8fafc;
        }

        .file-upload input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .file-info {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .file-selected {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-weight: 600;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }

        .nav-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-btn.prev {
          background: #f3f4f6;
          color: #6b7280;
        }

        .nav-btn.prev:hover {
          background: #e5e7eb;
        }

        .nav-btn.next {
          background: #667eea;
          color: white;
        }

        .nav-btn.next:hover {
          background: #5a67d8;
        }

        .nav-btn.submit {
          background: #10b981;
          color: white;
        }

        .nav-btn.submit:hover {
          background: #059669;
        }

        .existing-applications {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #e5e7eb;
        }

        .existing-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .application-list {
          display: grid;
          gap: 1rem;
        }

        .application-item {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .application-info h4 {
          margin: 0 0 0.25rem 0;
          font-weight: 600;
          color: #1f2937;
        }

        .application-info p {
          margin: 0 0 0.5rem 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.approved {
          background: #10b981;
          color: white;
        }

        .status-badge.pending {
          background: #f59e0b;
          color: white;
        }

        @media (max-width: 768px) {
          .registration-container {
            padding: 1rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="registration-bg">
        <div className="registration-container">
          <div className="registration-header">
            <div className="logo">TeleHealX</div>
            <p className="subtitle">Doctor Registration Portal</p>
          </div>

          <div className="registration-card">
            <div className="progress-bar">
              <div className="progress-step">
                <div className="step-number">1</div>
                <span>Personal</span>
              </div>
              <div className="progress-step">
                <div className="step-number">2</div>
                <span>Professional</span>
              </div>
              <div className="progress-step">
                <div className="step-number">3</div>
                <span>Security</span>
              </div>
              <div className="progress-step">
                <div className="step-number">4</div>
                <span>Documents</span>
              </div>
            </div>

            {renderStep()}

            <div className="navigation">
              <button
                className="nav-btn prev"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft size={18} />
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  className="nav-btn next"
                  onClick={nextStep}
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  className="nav-btn submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit Registration'}
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="existing-applications">
            <h3 className="existing-title">Existing Applications</h3>
            <div className="application-list">
              {existingApplications.map((app) => (
                <div key={app.id} className="application-item">
                  <div className="application-info">
                    <h4>{app.name}</h4>
                    <p>{app.email} · {app.specialization}</p>
                    <p>Applied: {app.appliedDate}</p>
                  </div>
                  <span className={`status-badge ${app.status}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorRegistration;
