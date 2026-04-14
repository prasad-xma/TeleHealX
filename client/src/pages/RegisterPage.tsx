import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, MapPin, Calendar, ClipboardList, Target, BarChart2, Stethoscope, Users, Shield, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, Heart, Brain, Activity, FileText, Clock, UserCheck } from 'lucide-react';
import { register as registerService } from '../services/authService';

const InputField = ({ label, icon: Icon, type, name, value, onChange, placeholder, rightElement }: any) => (
  <div>
    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#000000', fontFamily: "'Nunito', sans-serif" }}>
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors">
        <Icon className="h-4.5 w-4.5 transition-colors duration-200 group-focus-within:text-blue-500" style={{ color: '#94A3B8', width: 18, height: 18 }} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full py-3 border-2 rounded-2xl text-sm transition-all duration-200 bg-blue-50/40 placeholder-blue-200 focus:outline-none focus:bg-white"
        style={{
          paddingLeft: '2.5rem',
          paddingRight: rightElement ? '3rem' : '1rem',
          borderColor: '#E2E8F0',
          color: '#1A202C',
          fontFamily: "'Nunito', sans-serif",
        }}
        onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
      />
      {rightElement}
    </div>
  </div>
);

const RoleCard = ({ title, description, icon: Icon, isSelected, onClick }: any) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
    }`}
  >
    <div className="flex items-center mb-3">
      <div className={`p-3 rounded-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
        <Icon size={24} />
      </div>
      <h3 className="ml-3 text-lg font-semibold" style={{ color: '#000000' }}>{title}</h3>
    </div>
    <p className="text-sm" style={{ color: '#333333' }}>{description}</p>
  </div>
);

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    name: '',
    birthDay: '',
    gender: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    doctorInfo: {
      specialization: '',
      licenseNumber: '',
      hospital: '',
      yearsOfExperience: ''
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalSteps = formData.role === 'doctor' ? 4 : 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
    setSuccess('');
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.role) return 'Please select a role';
        return '';
      case 2:
        if (!formData.name.trim()) return 'Name is required';
        if (!formData.birthDay) return 'Date of birth is required';
        if (!formData.gender) return 'Gender is required';
        if (!formData.address.trim()) return 'Address is required';
        return '';
      case 3:
        if (!formData.email.trim()) return 'Email is required';
        if (!formData.password) return 'Password is required';
        if (formData.password.length < 6) return 'Password must be at least 6 characters';
        if (!formData.confirmPassword) return 'Confirm password is required';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        return '';
      case 4:
        if (formData.role === 'doctor') {
          if (!formData.doctorInfo.specialization.trim()) return 'Specialization is required';
          if (!formData.doctorInfo.licenseNumber.trim()) return 'License number is required';
          if (!formData.doctorInfo.hospital.trim()) return 'Hospital is required';
          if (!formData.doctorInfo.yearsOfExperience) return 'Years of experience is required';
        }
        return '';
      default:
        return '';
    }
  };

  const handleNext = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const submitData: any = {
        name: formData.name,
        birthDay: formData.birthDay,
        gender: formData.gender,
        address: formData.address,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      if (formData.role === 'doctor') {
        submitData.doctorInfo = {
          ...formData.doctorInfo,
          yearsOfExperience: parseInt(formData.doctorInfo.yearsOfExperience)
        };
      }

      const response = await registerService(submitData);
      setSuccess(response.data?.message || 'Registration successful');
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#000000', marginBottom: 20 }}>Select Your Role</h3>
            <div className="space-y-4">
              <RoleCard
                role="patient"
                title="Patient"
                description="Access healthcare services and manage your appointments"
                icon={Users}
                isSelected={formData.role === 'patient'}
                onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
              />
              <RoleCard
                role="doctor"
                title="Doctor"
                description="Provide medical consultations and manage patient care"
                icon={Stethoscope}
                isSelected={formData.role === 'doctor'}
                onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
              />
              <RoleCard
                role="admin"
                title="Administrator"
                description="Manage the healthcare system and oversee operations"
                icon={Shield}
                isSelected={formData.role === 'admin'}
                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#000000', marginBottom: 20 }}>Personal Information</h3>
            <div className="space-y-4">
              <InputField
                label="Full Name"
                icon={User}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              <InputField
                label="Date of Birth"
                icon={Calendar}
                type="date"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#000000', fontFamily: "'Nunito', sans-serif" }}>
                  Gender
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 group-focus-within:text-blue-500" style={{ color: '#94A3B8', width: 18, height: 18 }} />
                  </div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full py-3 pl-10 pr-4 border-2 rounded-2xl text-sm transition-all bg-blue-50/40 focus:outline-none focus:bg-white"
                    style={{ borderColor: '#E2E8F0', color: '#1A202C', fontFamily: "'Nunito', sans-serif" }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <InputField
                label="Address"
                icon={MapPin}
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#000000', marginBottom: 20 }}>Account Security</h3>
            <div className="space-y-4">
              <InputField
                label="Email Address"
                icon={Mail}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
              <InputField
                label="Password"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                rightElement={
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <InputField
                label="Confirm Password"
                icon={Lock}
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                rightElement={
                  <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(p => !p)}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#000000', marginBottom: 20 }}>Professional Information</h3>
            <div className="space-y-4">
              <InputField
                label="Specialization"
                icon={Stethoscope}
                type="text"
                name="doctorInfo.specialization"
                value={formData.doctorInfo.specialization}
                onChange={handleChange}
                placeholder="e.g., Cardiology, Neurology"
              />
              <InputField
                label="License Number"
                icon={ClipboardList}
                type="text"
                name="doctorInfo.licenseNumber"
                value={formData.doctorInfo.licenseNumber}
                onChange={handleChange}
                placeholder="Medical license number"
              />
              <InputField
                label="Hospital/Clinic"
                icon={Target}
                type="text"
                name="doctorInfo.hospital"
                value={formData.doctorInfo.hospital}
                onChange={handleChange}
                placeholder="Current workplace"
              />
              <InputField
                label="Years of Experience"
                icon={BarChart2}
                type="number"
                name="doctorInfo.yearsOfExperience"
                value={formData.doctorInfo.yearsOfExperience}
                onChange={handleChange}
                placeholder="Number of years"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSummary = () => (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#000000', marginBottom: 20 }}>Registration Summary</h3>
      <div className="bg-blue-50 rounded-2xl p-6 space-y-4">
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 8 }}>Personal Information</h4>
          <div className="space-y-2">
            <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Name:</strong> {formData.name}</p>
            <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Date of Birth:</strong> {formData.birthDay}</p>
            <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Gender:</strong> {formData.gender}</p>
            <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Address:</strong> {formData.address}</p>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 8 }}>Account Information</h4>
          <div className="space-y-2">
            <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Email:</strong> {formData.email}</p>
            <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Role:</strong> {formData.role}</p>
          </div>
        </div>
        {formData.role === 'doctor' && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 8 }}>Professional Information</h4>
            <div className="space-y-2">
              <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Specialization:</strong> {formData.doctorInfo.specialization}</p>
              <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>License Number:</strong> {formData.doctorInfo.licenseNumber}</p>
              <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Hospital:</strong> {formData.doctorInfo.hospital}</p>
              <p style={{ fontSize: 14, color: '#2C3E50' }}><strong>Years of Experience:</strong> {formData.doctorInfo.yearsOfExperience}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .register-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          font-family: 'Nunito', sans-serif;
        }

        .bg-blob-1 {
          position: absolute;
          top: -80px;
          left: -80px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(147,197,253,0.1) 50%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: float 20s ease-in-out infinite;
        }

        .bg-blob-2 {
          position: absolute;
          bottom: -100px;
          right: -60px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(59,130,246,0.1) 50%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: float 25s ease-in-out infinite reverse;
        }

        .bg-blob-3 {
          position: absolute;
          top: 40%;
          left: 30%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(96,165,250,0.15) 0%, rgba(147,197,253,0.05) 50%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: float 15s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.05); }
          50% { transform: translate(-10px, 20px) scale(0.95); }
          75% { transform: translate(30px, 10px) scale(1.02); }
        }

        .card-wrapper {
          position: relative;
          width: 100%;
          max-width: 900px;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(59,130,246,0.25), 0 8px 24px rgba(59,130,246,0.15), 0 0 0 1px rgba(59,130,246,0.05);
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59,130,246,0.1);
        }

        @media (max-width: 1023px) {
          .card-wrapper { grid-template-columns: 1fr; }
          .left-panel { display: none !important; }
        }

        .left-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          background: linear-gradient(160deg, #3B82F6 0%, #60A5FA 40%, #93C5FD 100%);
          position: relative;
          overflow: hidden;
          color: white;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 220px;
          height: 220px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }

        .left-panel::after {
          content: '';
          position: absolute;
          bottom: 60px;
          left: -40px;
          width: 160px;
          height: 160px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.22);
          backdrop-filter: blur(8px);
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.03em;
          width: fit-content;
        }

        .hero-emoji-ring {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 1.5rem 0;
        }

        .emoji-ring {
          width: 120px;
          height: 120px;
          background: rgba(255,255,255,0.18);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 52px;
          backdrop-filter: blur(10px);
          border: 3px solid rgba(255,255,255,0.3);
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 0;
        }

        .feature-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .feature-card h3 {
          font-weight: 700;
          font-size: 14px;
          margin: 0 0 6px;
        }

        .feature-card p {
          font-size: 12px;
          color: rgba(255,255,255,0.85);
          margin: 0;
          line-height: 1.5;
        }

        .feature-icon {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          font-size: 18px;
        }

        .dot-pattern {
          position: absolute;
          bottom: 120px;
          right: 20px;
          opacity: 0.2;
          display: grid;
          grid-template-columns: repeat(5, 8px);
          gap: 6px;
        }

        .dot { width: 4px; height: 4px; background: white; border-radius: 50%; }

        .right-panel {
          padding: 2rem 2.5rem 2rem;
          overflow-y: auto;
          max-height: 90vh;
          background: white;
        }

        .right-panel::-webkit-scrollbar { width: 4px; }
        .right-panel::-webkit-scrollbar-track { background: transparent; }
        .right-panel::-webkit-scrollbar-thumb { background: #DBEAFE; border-radius: 99px; }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #3B82F6;
          font-weight: 700;
          font-size: 13px;
          background: #EFF6FF;
          padding: 8px 14px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-bottom: 1.25rem;
        }

        .back-btn:hover { background: #DBEAFE; transform: translateX(-2px); }

        .page-title {
          font-family: 'Fredoka One', cursive;
          font-size: 30px;
          color: #1E293B;
          margin: 0 0 4px;
          letter-spacing: 0.01em;
        }

        .page-subtitle {
          color: '#64748B';
          font-size: 13.5px;
          margin: 0 0 1.25rem;
          font-weight: 500;
        }

        .step-indicator {
          display: flex;
          gap: 6px;
          margin-bottom: 1.5rem;
        }

        .step-dot {
          height: 4px;
          border-radius: 99px;
          background: '#DBEAFE';
          flex: 1;
          transition: background 0.3s;
        }

        .step-dot.active { background: linear-gradient(90deg, #3B82F6, #60A5FA); }

        .form-space { display: flex; flex-direction: column; gap: 20px; }

        .step-navigation {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .nav-btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: 16px;
          border: none;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'Nunito', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .prev-btn {
          background: #F1F5F9;
          color: '#64748B';
        }

        .prev-btn:hover {
          background: #E2E8F0;
        }

        .next-btn {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(59,130,246,0.35);
        }

        .next-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(59,130,246,0.42);
          background: linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%);
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%);
          color: white;
          font-weight: 800;
          font-size: 15px;
          padding: 14px;
          border-radius: 18px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(59,130,246,0.35), 0 0 0 1px rgba(59,130,246,0.1);
          letter-spacing: 0.02em;
          font-family: 'Nunito', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 35px rgba(59,130,246,0.45), 0 0 0 2px rgba(59,130,246,0.2);
          background: linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%);
        }

        .submit-btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .alert-error {
          background: #FEF2F2;
          border: 1.5px solid #FECACA;
          border-radius: 14px;
          padding: 10px 14px;
          color: #DC2626;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-success {
          background: #F0FDF4;
          border: 1.5px solid #BBF7D0;
          border-radius: 14px;
          padding: 10px 14px;
          color: #15803D;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0;
        }

        .divider-line { flex: 1; height: 1px; background: '#E2E8F0'; }
        .divider-text { font-size: 12px; color: '#94A3B8'; font-weight: 600; }

        .signin-row {
          text-align: center;
          font-size: 13px;
          color: '#64748B';
          font-weight: 500;
        }

        .signin-link {
          color: #3B82F6;
          font-weight: 800;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 13px;
          font-family: 'Nunito', sans-serif;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .eye-btn {
          position: absolute;
          inset-y: 0;
          right: 0;
          padding-right: 12px;
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          color: '#94A3B8';
          transition: color 0.2s;
        }

        .eye-btn:hover { color: #3B82F6; }

        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
      `}</style>

      <div className="register-bg">
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        <div className="bg-blob-3" />

        <div className="card-wrapper">
                    <div className="left-panel">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="brand-badge">
                <Stethoscope size={14} className="text-blue-200" />
                <span>TeleHealX</span>
              </div>

              <div className="hero-emoji-ring" style={{ marginTop: '1.5rem' }}>
                <div className="emoji-ring">
                  <div className="relative">
                    <Stethoscope size={52} className="text-white/40" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, margin: '0 0 10px', lineHeight: 1.2 }}>
                Join the Healthcare<br />Management System
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, margin: 0 }}>
                Create your account and start managing healthcare services, appointments, and patient care in one place.
              </p>
            </div>

                        <div className="dot-pattern">
              {Array.from({ length: 25 }).map((_, i) => <div key={i} className="dot" />)}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <div className="relative">
                      <Users size={18} color="white" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <h3 style={{ color: '#000000' }}>Patient Care</h3>
                  <p style={{ color: '#333333' }}>Comprehensive patient management with smart records.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <div className="relative">
                      <Stethoscope size={18} color="white" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <h3 style={{ color: '#000000' }}>Doctor Services</h3>
                  <p style={{ color: '#333333' }}>Professional healthcare consultation platform.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <div className="relative">
                      <Shield size={18} color="white" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-300 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <h3 style={{ color: '#000000' }}>Secure Platform</h3>
                  <p style={{ color: '#333333' }}>Advanced encryption and data protection.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <div className="relative">
                      <BarChart2 size={18} color="white" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <h3 style={{ color: '#000000' }}>Health Analytics</h3>
                  <p style={{ color: '#333333' }}>AI-powered health insights and trends.</p>
                </div>
              </div>
            </div>
          </div>

                    <div className="right-panel">
            <Link to="/login" className="back-btn" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={15} />
              Back to Login
            </Link>

            <h2 className="page-title">Create Account</h2>
            <p className="page-subtitle">Fill in your details to get started</p>

            <div className="step-indicator">
              {Array.from({ length: totalSteps + (currentStep === totalSteps ? 1 : 0) }, (_, i) => (
                <div 
                  key={i} 
                  className={`step-dot ${i < currentStep ? 'active' : ''} ${i === currentStep - 1 ? 'active' : ''}`}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="form-space">
              {currentStep <= totalSteps ? renderStepContent() : renderSummary()}

              {error && (
                <div className="alert-error">
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert-success">
                  <CheckCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{success}</span>
                </div>
              )}

              {currentStep <= totalSteps ? (
                <div className="step-navigation">
                  {currentStep > 1 && (
                    <button type="button" className="nav-btn prev-btn" onClick={handlePrevious}>
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="nav-btn next-btn" 
                    onClick={currentStep === totalSteps ? handleSubmit : handleNext}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><span className="spinner" /> Processing...</>
                    ) : currentStep === totalSteps ? (
                      <>Submit Registration</>
                    ) : (
                      <>Next <ChevronRight size={16} /></>
                    )}
                  </button>
                </div>
              ) : (
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <><span className="spinner" /> Creating Account...</>
                  ) : (
                    <>Create Account</>
                  )}
                </button>
              )}
            </form>

            <div className="divider" style={{ marginTop: 16 }}>
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            <div className="signin-row">
              Already have an account?{' '}
              <Link to="/login" className="signin-link">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
