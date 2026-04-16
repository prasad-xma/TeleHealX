import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Star, 
  Heart, 
  Shield, 
  Users,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');
    
    if (token && user) {
      setUserRole(role || '');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const handleGetStarted = () => {
    if (userRole) {
      // User is logged in, redirect to appropriate dashboard
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'patient') {
        navigate('/dashboard');
      } else if (userRole === 'doctor') {
        navigate('/dashboard');
      }
    } else {
      // User not logged in, redirect to register
      navigate('/register');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .landing-bg {
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-text h1 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          font-family: 'Fredoka One', cursive;
          line-height: 1.2;
        }

        .hero-text p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: white;
          color: #667eea;
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 1rem 2rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .hero-image {
          position: relative;
        }

        .hero-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          transform: rotate(3deg);
        }

        .hero-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .hero-card-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-card-info h3 {
          margin: 0;
          color: #1f2937;
          font-weight: 700;
        }

        .hero-card-info p {
          margin: 0;
          color: #6b7280;
        }

        .features-section {
          padding: 4rem 2rem;
          background: #f8fafc;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title h2 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .section-title p {
          font-size: 1.125rem;
          color: #6b7280;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .feature-icon.blue {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .feature-icon.green {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .feature-icon.purple {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.6;
        }

        .stats-section {
          padding: 4rem 2rem;
          background: white;
        }

        .stats-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .stat-item {
          padding: 2rem;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 900;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.125rem;
          color: #6b7280;
          font-weight: 600;
        }

        .cta-section {
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }

        .cta-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-section h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .cta-section p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .header {
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.75rem;
          font-weight: 900;
          color: #667eea;
          font-family: 'Fredoka One', cursive;
        }

        .header-nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .header-nav a {
          color: #6b7280;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }

        .header-nav a:hover {
          color: #667eea;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border-radius: 12px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #667eea;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .btn-logout {
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s;
        }

        .btn-logout:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .hero-text h1 {
            font-size: 2.5rem;
          }
          
          .hero-buttons {
            flex-direction: column;
          }
          
          .header-nav {
            display: none;
          }
        }
      `}</style>

      <div className="landing-bg">
        <header className="header">
          <div className="header-content">
            <div className="logo">TeleHealX</div>
            <nav className="header-nav">
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="header-actions">
              {userRole ? (
                <>
                  <div className="user-info">
                    <div className="user-avatar">
                      {localStorage.getItem('userName')?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span>{localStorage.getItem('userName') || 'User'}</span>
                    <span>({userRole})</span>
                  </div>
                  <button className="btn-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => navigate('/login')}>
                    Login
                  </button>
                  <button className="btn-primary" onClick={() => navigate('/register')}>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Your Health, Our Priority</h1>
              <p>Connect with qualified doctors anytime, anywhere. Experience seamless healthcare with TeleHealX - your trusted telemedicine platform.</p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={handleGetStarted}>
                  {userRole ? 'Go to Dashboard' : 'Get Started'}
                  <ChevronRight size={20} />
                </button>
                <button className="btn-secondary" onClick={() => navigate('/login')}>
                  Login
                </button>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="hero-card-header">
                  <div className="hero-card-avatar">
                    <Stethoscope size={32} color="white" />
                  </div>
                  <div className="hero-card-info">
                    <h3>Dr. Sarah Johnson</h3>
                    <p>Cardiologist</p>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>4.9 (127 reviews)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="#6b7280" />
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>City Medical Center</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#f3f4f6', borderRadius: '20px', fontSize: '0.75rem', color: '#6b7280' }}>Available Now</span>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#dbeafe', borderRadius: '20px', fontSize: '0.75rem', color: '#3b82f6' }}>Video Call</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="features-container">
            <div className="section-title">
              <h2>Why Choose TeleHealX?</h2>
              <p>Experience healthcare reimagined with our innovative features</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon blue">
                  <Users size={32} />
                </div>
                <h3>Expert Doctors</h3>
                <p>Connect with board-certified physicians across various specialties, all verified and experienced in their fields.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon green">
                  <Clock size={32} />
                </div>
                <h3>24/7 Availability</h3>
                <p>Get medical consultation anytime, anywhere. Our doctors are available round the clock for your healthcare needs.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon purple">
                  <Shield size={32} />
                </div>
                <h3>Secure & Private</h3>
                <p>Your health data is protected with enterprise-grade security. All consultations are completely confidential.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-container">
            <div className="section-title">
              <h2>Trusted by Thousands</h2>
              <p>Join our growing community of satisfied patients</p>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Happy Patients</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Expert Doctors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Consultations</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-container">
            <h2>Start Your Health Journey Today</h2>
            <p>Join thousands of patients who trust TeleHealX for their healthcare needs</p>
            <button className="btn-primary" onClick={handleGetStarted}>
              {userRole ? 'Go to Dashboard' : 'Get Started Now'}
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingPage;
