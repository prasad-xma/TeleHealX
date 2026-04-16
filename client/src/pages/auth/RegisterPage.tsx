import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
  UserRound,
  Users
} from 'lucide-react';
import { register as registerService } from '../../services/authService';

type Role = 'patient' | 'doctor';

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  birthDay: string;
  gender: string;
  address: string;
  role: Role;
  doctorInfo: {
    specialization: string;
    licenseNumber: string;
    hospital: string;
    yearsOfExperience: string;
  };
};

const initialForm: RegisterForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  birthDay: '',
  gender: '',
  address: '',
  role: 'patient',
  doctorInfo: {
    specialization: '',
    licenseNumber: '',
    hospital: '',
    yearsOfExperience: ''
  }
};

type FieldProps = {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
};

const Field = ({ label, icon: Icon, name, value, onChange, type = 'text', placeholder = '' }: FieldProps) => (
  <div>
    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0f172a', fontFamily: "'Nunito', sans-serif" }}>
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Icon size={18} className="text-slate-400 group-focus-within:text-blue-500" />
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
          paddingRight: '1rem',
          borderColor: '#E2E8F0',
          color: '#1E293B',
          fontFamily: "'Nunito', sans-serif"
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#3B82F6';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E2E8F0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepLabels = useMemo(
    () => (form.role === 'doctor' ? ['Account', 'Personal', 'Professional', 'Summary'] : ['Account', 'Personal', 'Summary']),
    [form.role]
  );

  const isLastStep = stepIndex === stepLabels.length - 1;

  const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('doctorInfo.')) {
      const key = name.replace('doctorInfo.', '') as keyof RegisterForm['doctorInfo'];
      setForm((prev) => ({
        ...prev,
        doctorInfo: {
          ...prev.doctorInfo,
          [key]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value } as RegisterForm));
    }

    setError('');
    setSuccess('');
  };

  const getCurrentLogicalStep = () => {
    if (form.role === 'doctor') {
      return stepIndex;
    }

    if (stepIndex === 2) {
      return 3;
    }

    return stepIndex;
  };

  const validateStep = (logicalStep: number) => {
    if (logicalStep === 0) {
      if (!form.name.trim()) return 'Full name is required';
      if (!form.email.trim()) return 'Email is required';
      if (!form.phone.trim()) return 'Phone number is required';
      if (!/^\+?[0-9]{7,15}$/.test(form.phone.trim())) return 'Enter a valid phone number';
      if (!form.password) return 'Password is required';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
      if (form.role !== 'patient' && form.role !== 'doctor') return 'Please select patient or doctor';
      return '';
    }

    if (logicalStep === 1) {
      if (!form.birthDay) return 'Date of birth is required';
      if (!form.gender) return 'Gender is required';
      if (!form.address.trim()) return 'Address is required';
      return '';
    }

    if (logicalStep === 2 && form.role === 'doctor') {
      if (!form.doctorInfo.specialization.trim()) return 'Specialization is required';
      if (!form.doctorInfo.licenseNumber.trim()) return 'License number is required';
      if (!form.doctorInfo.hospital.trim()) return 'Hospital/clinic is required';
      const years = Number(form.doctorInfo.yearsOfExperience);
      if (!form.doctorInfo.yearsOfExperience || Number.isNaN(years) || years < 0) {
        return 'Valid years of experience is required';
      }
      return '';
    }

    return '';
  };

  const handleNext = () => {
    const validationError = validateStep(getCurrentLogicalStep());
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setStepIndex((prev) => Math.min(prev + 1, stepLabels.length - 1));
  };

  const handlePrev = () => {
    setError('');
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLastStep) {
      handleNext();
      return;
    }

    const stepsToValidate = form.role === 'doctor' ? [0, 1, 2] : [0, 1];
    for (const logicalStep of stepsToValidate) {
      const validationError = validateStep(logicalStep);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        address: form.address.trim(),
        birthDay: form.birthDay,
        gender: form.gender,
        role: form.role
      };

      if (form.role === 'doctor') {
        payload.doctorInfo = {
          specialization: form.doctorInfo.specialization.trim(),
          licenseNumber: form.doctorInfo.licenseNumber.trim(),
          hospital: form.doctorInfo.hospital.trim(),
          yearsOfExperience: Number(form.doctorInfo.yearsOfExperience)
        };
      }

      const response = await registerService(payload);
      const message = response?.data?.message || 'Registration successful';
      setSuccess(message);

      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAccountStep = () => (
    <div className="form-grid">
      <Field label="Full Name" icon={User} name="name" value={form.name} onChange={updateField} placeholder="John Doe" />
      <Field label="Email Address" icon={Mail} name="email" type="email" value={form.email} onChange={updateField} placeholder="john@email.com" />
      <Field label="Phone Number" icon={Phone} name="phone" value={form.phone} onChange={updateField} placeholder="+94771234567" />
      <Field label="Password" icon={Lock} name="password" type="password" value={form.password} onChange={updateField} placeholder="Minimum 6 characters" />
      <Field
        label="Confirm Password"
        icon={ShieldCheck}
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={updateField}
        placeholder="Retype password"
      />

      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0f172a' }}>
          Register As
        </label>
        <div className="role-switch">
          <button
            type="button"
            className={`role-btn ${form.role === 'patient' ? 'active' : ''}`}
            onClick={() => setForm((prev) => ({ ...prev, role: 'patient' }))}
          >
            <Users size={16} /> Patient
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'doctor' ? 'active' : ''}`}
            onClick={() => setForm((prev) => ({ ...prev, role: 'doctor' }))}
          >
            <Stethoscope size={16} /> Doctor
          </button>
        </div>
      </div>
    </div>
  );

  const renderPersonalStep = () => (
    <div className="form-grid">
      <Field label="Date of Birth" icon={Calendar} name="birthDay" type="date" value={form.birthDay} onChange={updateField} />

      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0f172a' }}>
          Gender
        </label>
        <select name="gender" value={form.gender} onChange={updateField} className="styled-select">
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="full-width">
        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0f172a' }}>
          Address
        </label>
        <div className="relative group">
          <div className="absolute top-3 left-3.5 pointer-events-none">
            <MapPin size={18} className="text-slate-400" />
          </div>
          <textarea
            name="address"
            rows={3}
            value={form.address}
            onChange={updateField}
            placeholder="Enter your full address"
            className="styled-textarea"
          />
        </div>
      </div>
    </div>
  );

  const renderDoctorStep = () => (
    <div className="form-grid">
      <Field
        label="Specialization"
        icon={ClipboardCheck}
        name="doctorInfo.specialization"
        value={form.doctorInfo.specialization}
        onChange={updateField}
        placeholder="Cardiology, Dermatology..."
      />
      <Field
        label="License Number"
        icon={IdCard}
        name="doctorInfo.licenseNumber"
        value={form.doctorInfo.licenseNumber}
        onChange={updateField}
        placeholder="Medical council registration ID"
      />
      <Field
        label="Hospital / Clinic"
        icon={Building2}
        name="doctorInfo.hospital"
        value={form.doctorInfo.hospital}
        onChange={updateField}
        placeholder="Current workplace"
      />
      <Field
        label="Years Of Experience"
        icon={UserRound}
        name="doctorInfo.yearsOfExperience"
        value={form.doctorInfo.yearsOfExperience}
        onChange={updateField}
        type="number"
        placeholder="0"
      />
    </div>
  );

  const renderSummaryStep = () => (
    <div className="summary-box">
      <h3 className="summary-title">Review Before Submit</h3>
      <div className="summary-grid">
        <div><span>Name</span><strong>{form.name || '-'}</strong></div>
        <div><span>Email</span><strong>{form.email || '-'}</strong></div>
        <div><span>Phone</span><strong>{form.phone || '-'}</strong></div>
        <div><span>Role</span><strong>{form.role}</strong></div>
        <div><span>Date of Birth</span><strong>{form.birthDay || '-'}</strong></div>
        <div><span>Gender</span><strong>{form.gender || '-'}</strong></div>
        <div><span>Address</span><strong>{form.address || '-'}</strong></div>

        {form.role === 'doctor' ? (
          <>
            <div><span>Specialization</span><strong>{form.doctorInfo.specialization || '-'}</strong></div>
            <div><span>License Number</span><strong>{form.doctorInfo.licenseNumber || '-'}</strong></div>
            <div><span>Hospital</span><strong>{form.doctorInfo.hospital || '-'}</strong></div>
            <div><span>Experience</span><strong>{form.doctorInfo.yearsOfExperience || '0'} years</strong></div>
          </>
        ) : null}
      </div>

      {form.role === 'doctor' ? (
        <div className="pending-note">
          <AlertTriangle size={16} />
          Doctor accounts stay in pending state until admin approval.
        </div>
      ) : (
        <div className="pending-note success">
          <CheckCircle size={16} />
          Patient account will be active immediately after registration.
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .page-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Nunito', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .blob-1, .blob-2 {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .blob-1 {
          width: 320px;
          height: 320px;
          top: -90px;
          left: -70px;
          background: radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%);
        }

        .blob-2 {
          width: 380px;
          height: 380px;
          right: -80px;
          bottom: -120px;
          background: radial-gradient(circle, rgba(37,99,235,0.2), transparent 70%);
        }

        .card-shell {
          width: 100%;
          max-width: 980px;
          border-radius: 32px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          box-shadow: 0 26px 60px rgba(59,130,246,0.2), 0 8px 24px rgba(59,130,246,0.12);
          background: white;
          border: 1px solid rgba(59,130,246,0.1);
          z-index: 2;
        }

        @media (max-width: 1024px) {
          .card-shell { grid-template-columns: 1fr; }
          .left-panel { display: none; }
        }

        .left-panel {
          padding: 2.5rem;
          background: linear-gradient(160deg, #3B82F6 0%, #60A5FA 45%, #93C5FD 100%);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .brand-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.2);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          width: fit-content;
        }

        .hero-title {
          font-family: 'Fredoka One', cursive;
          margin: 1rem 0 0.65rem;
          font-size: 30px;
          line-height: 1.2;
        }

        .hero-copy {
          margin: 0;
          color: rgba(15,23,42,0.92);
          font-size: 13.5px;
          line-height: 1.6;
          font-weight: 600;
        }

        .feature-list {
          display: grid;
          gap: 10px;
          margin-top: 1.5rem;
        }

        .feature-list div {
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.26);
          border-radius: 14px;
          padding: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .right-panel {
          padding: 2rem 2.2rem;
          max-height: 92vh;
          overflow-y: auto;
          background: white;
        }

        .right-panel::-webkit-scrollbar { width: 5px; }
        .right-panel::-webkit-scrollbar-thumb { background: #DBEAFE; border-radius: 10px; }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 800;
          color: #2563EB;
          background: #EFF6FF;
          border-radius: 999px;
          padding: 8px 14px;
          text-decoration: none;
          margin-bottom: 1rem;
        }

        .title {
          font-family: 'Fredoka One', cursive;
          margin: 0;
          font-size: 30px;
          color: #0f172a;
        }

        .subtitle {
          margin: 0.45rem 0 1rem;
          font-size: 13.5px;
          color: #334155;
          font-weight: 600;
        }

        .stepper {
          display: flex;
          gap: 8px;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
        }

        .step-chip {
          font-size: 12px;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #BFDBFE;
          color: #475569;
          background: #F8FAFC;
        }

        .step-chip.active {
          color: white;
          border-color: #2563EB;
          background: linear-gradient(90deg, #3B82F6, #2563EB);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 0.2rem;
        }

        .full-width { grid-column: 1 / -1; }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .role-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .role-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 2px solid #CBD5E1;
          background: #F8FAFC;
          color: #334155;
          font-weight: 800;
          border-radius: 14px;
          padding: 11px 10px;
          cursor: pointer;
        }

        .role-btn.active {
          border-color: #2563EB;
          background: #EFF6FF;
          color: #1E3A8A;
        }

        .styled-select, .styled-textarea {
          width: 100%;
          border: 2px solid #E2E8F0;
          border-radius: 14px;
          background: #F8FAFC;
          color: #1E293B;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
        }

        .styled-select {
          padding: 12px 14px;
          height: 50px;
        }

        .styled-textarea {
          padding: 12px 14px 12px 42px;
          resize: vertical;
          min-height: 94px;
        }

        .summary-box {
          border: 1.5px solid #BFDBFE;
          background: #F8FBFF;
          border-radius: 16px;
          padding: 1rem;
        }

        .summary-title {
          margin: 0 0 0.8rem;
          color: #1E3A8A;
          font-size: 1rem;
          font-weight: 900;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .summary-grid { grid-template-columns: 1fr; }
        }

        .summary-grid div {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px;
          display: grid;
          gap: 3px;
        }

        .summary-grid span {
          font-size: 11px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          font-weight: 700;
        }

        .summary-grid strong {
          font-size: 13.5px;
          color: #0f172a;
          word-break: break-word;
        }

        .pending-note {
          margin-top: 0.9rem;
          border-radius: 12px;
          border: 1px solid #FCD34D;
          background: #FFFBEB;
          color: #92400E;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 10px 12px;
        }

        .pending-note.success {
          border-color: #86EFAC;
          background: #F0FDF4;
          color: #166534;
        }

        .alert-error, .alert-success {
          margin-top: 0.9rem;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-error {
          border: 1px solid #FECACA;
          background: #FEF2F2;
          color: #B91C1C;
        }

        .alert-success {
          border: 1px solid #BBF7D0;
          background: #F0FDF4;
          color: #15803D;
        }

        .actions {
          margin-top: 1.1rem;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          border-radius: 14px;
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-secondary {
          background: #F1F5F9;
          color: #1E293B;
          border: 1px solid #CBD5E1;
        }

        .btn-primary {
          color: white;
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%);
          min-width: 140px;
          justify-content: center;
        }

        .btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .footer-link {
          margin-top: 0.9rem;
          text-align: center;
          color: #64748B;
          font-size: 13px;
          font-weight: 600;
        }

        .footer-link a {
          color: #2563EB;
          text-decoration: underline;
          font-weight: 800;
          text-underline-offset: 2px;
        }
      `}</style>

      <div className="page-bg">
        <div className="blob-1" />
        <div className="blob-2" />

        <div className="card-shell">
          <div className="left-panel">
            <div>
              <div className="brand-chip">
                <Stethoscope size={14} />
                TeleHealX
              </div>

              <h1 className="hero-title">Create Your TeleHealX Account</h1>
              <p className="hero-copy" />
            </div>

            <div className="feature-list" />
          </div>

          <div className="right-panel">
            <Link to="/login" className="back-link">
              <ArrowLeft size={14} /> Back to Login
            </Link>

            <h2 className="title">Register</h2>
            <p className="subtitle" />

            <div className="stepper">
              {stepLabels.map((label, idx) => (
                <div key={label} className={`step-chip ${idx === stepIndex ? 'active' : ''}`}>
                  {idx + 1}. {label}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {stepLabels[stepIndex] === 'Account' ? renderAccountStep() : null}
              {stepLabels[stepIndex] === 'Personal' ? renderPersonalStep() : null}
              {stepLabels[stepIndex] === 'Professional' ? renderDoctorStep() : null}
              {stepLabels[stepIndex] === 'Summary' ? renderSummaryStep() : null}

              {error ? (
                <div className="alert-error">
                  <AlertTriangle size={16} /> {error}
                </div>
              ) : null}

              {success ? (
                <div className="alert-success">
                  <CheckCircle size={16} /> {success}
                </div>
              ) : null}

              <div className="actions">
                <button type="button" className="btn btn-secondary" onClick={handlePrev} disabled={stepIndex === 0 || isSubmitting}>
                  <ChevronLeft size={16} /> Previous
                </button>

                {!isLastStep ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext} disabled={isSubmitting}>
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                  </button>
                )}
              </div>
            </form>

            <div className="footer-link">
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
