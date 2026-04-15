import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Stethoscope, AlertTriangle, CheckCircle } from 'lucide-react';
import { login as loginService } from '../services/authService';

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

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    return '';
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginService(formData);
      setSuccess(response.data?.message || 'Login successful');
      
      // Store token in localStorage
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userName', response.data.user.name);
      }
      
      setTimeout(() => {
        if (response.data?.user?.role === 'patient') {
          navigate('/dashboard');
          return;
        }

        if (response.data?.user?.role === 'admin') {
          navigate('/admin');
          return;
        }

        if (response.data?.user?.role === 'doctor') {
          // Check if doctor is approved
          if (response.data.user.isApproved) {
            navigate('/dashboard');
          } else {
            navigate('/doctor-login-blocked');
          }
          return;
        }

        navigate('/login');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .login-bg {
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

        .form-space { display: flex; flex-direction: column; gap: 20px; }

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

        .signup-row {
          text-align: center;
          font-size: 13px;
          color: '#64748B';
          font-weight: 500;
        }

        .signup-link {
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
          inset-y-0;
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

        .remember-forgot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remember-me input[type="checkbox"] {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 2px solid #E2E8F0;
          accent-color: #3B82F6;
        }

        .remember-me label {
          font-size: 13px;
          color: '#64748B';
          font-weight: 500;
        }

        .forgot-link {
          font-size: 13px;
          color: #3B82F6;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-link:hover { color: #2563EB; }
      `}</style>

      <div className="login-bg">
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
                  <Stethoscope size={52} className="text-white/40" />
                </div>
              </div>

              <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, margin: '0 0 10px', lineHeight: 1.2 }}>
                Welcome Back to<br />TeleHealX
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.88)', lineHeight: 1.6, margin: 0 }}>
                Sign in to access your healthcare dashboard and manage your medical services.
              </p>
            </div>

                        <div className="dot-pattern">
              {Array.from({ length: 25 }).map((_, i) => <div key={i} className="dot" />)}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon"><Stethoscope size={18} color="white" /></div>
                  <h3 style={{ color: '#000000' }}>Quick Access</h3>
                  <p style={{ color: '#333333' }}>Instant access to your healthcare dashboard.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><Lock size={18} color="white" /></div>
                  <h3 style={{ color: '#000000' }}>Secure Login</h3>
                  <p style={{ color: '#333333' }}>Your medical data is protected with advanced security.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><Mail size={18} color="white" /></div>
                  <h3 style={{ color: '#000000' }}>24/7 Support</h3>
                  <p style={{ color: '#333333' }}>Get help whenever you need it.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><CheckCircle size={18} color="white" /></div>
                  <h3 style={{ color: '#000000' }}>Verified Users</h3>
                  <p style={{ color: '#333333' }}>Trusted healthcare professionals and this para.</p>
                </div>
              </div>
            </div>
          </div>

                    <div className="right-panel">
            <Link to="/" className="back-btn" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={15} />
              Back to Home
            </Link>

            <h2 className="page-title" style={{ color: '#000000' }}>Sign In</h2>
            <p className="page-subtitle" style={{ color: '#333333' }}>Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit} className="form-space">
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
                placeholder="Enter your password"
                rightElement={
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <div className="remember-forgot">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

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

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <><span className="spinner" /> Signing In...</>
                ) : (
                  <>Sign In</>
                )}
              </button>
            </form>

            <div className="divider" style={{ marginTop: 16 }}>
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            <div className="signup-row">
              Don't have an account?{' '}
              <Link to="/register" className="signup-link">
                Create account here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
