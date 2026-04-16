import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  UserCheck, 
  Clock, 
  Mail, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const DoctorLoginBlocked = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .blocked-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 40%, #FECACA 100%);
          font-family: 'Nunito', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .blocked-container {
          max-width: 500px;
          width: 90%;
          background: white;
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(220, 38, 38, 0.1);
          border: 2px solid rgba(220, 38, 38, 0.2);
          text-align: center;
        }

        .blocked-icon {
          width: 120px;
          height: 120px;
          background: rgba(220, 38, 38, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: #DC2626;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .blocked-title {
          font-size: 2rem;
          font-weight: 800;
          color: '#1F2937';
          margin-bottom: 1rem;
        }

        .blocked-subtitle {
          font-size: 1.125rem;
          color: '#6B7280';
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .status-card {
          background: rgba(220, 38, 38, 0.05);
          border: 2px solid rgba(220, 38, 38, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: '#DC2626';
          font-weight: 600;
        }

        .status-details {
          color: '#4B5563';
          line-height: 1.6;
        }

        .status-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .status-icon {
          width: 24px;
          height: 24px;
          background: rgba(220, 38, 38, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: '#DC2626';
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .status-text {
          flex: 1;
          text-align: left;
        }

        .status-label {
          font-weight: 600;
          color: '#374151';
          margin-bottom: 0.25rem;
        }

        .status-value {
          color: '#6B7280';
          font-size: 0.875rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          flex: 1;
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.25);
        }

        .btn-secondary {
          background: #F1F5F9;
          color: '#64748B';
          border: 2px solid #E5E7EB;
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

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .help-text {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #F3F4F6;
          color: '#6B7280';
          font-size: 0.875rem;
        }

        .help-text a {
          color: '#3B82F6';
          text-decoration: none;
          font-weight: 600;
        }

        .help-text a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="blocked-bg">
        <div className="blocked-container">
          <div className="blocked-icon">
            <AlertTriangle size={60} />
          </div>
          
          <h1 className="blocked-title">Account Verification Required</h1>
          <p className="blocked-subtitle">
            Your doctor account is currently under review. You'll be able to login once approved by our admin team.
          </p>

          <div className="status-card">
            <div className="status-header">
              <Clock size={20} />
              Current Status
            </div>
            
            <div className="status-details">
              <div className="status-item">
                <div className="status-icon">
                  <UserCheck size={12} />
                </div>
                <div className="status-text">
                  <div className="status-label">Verification Status</div>
                  <div className="status-value">Pending Admin Approval</div>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon">
                  <Mail size={12} />
                </div>
                <div className="status-text">
                  <div className="status-label">Notification</div>
                  <div className="status-value">You'll receive an email when your account is approved</div>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon">
                  <AlertTriangle size={12} />
                </div>
                <div className="status-text">
                  <div className="status-label">Estimated Time</div>
                  <div className="status-value">24-48 hours for review</div>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw size={20} className="spinner" />
                  Checking Status...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Check Status
                </>
              )}
            </button>
            
            <Link to="/login">
              <button className="btn btn-secondary">
                <ArrowLeft size={20} />
                Back to Login
              </button>
            </Link>
          </div>

          <div className="help-text">
            <p>
              If you haven't received approval within 48 hours, please contact our support team at 
              <a href="mailto:support@telehealx.com">support@telehealx.com</a>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Make sure your registration documents are complete and valid for faster approval.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorLoginBlocked;
