import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const appointmentId = searchParams.get('appointmentId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', {
        replace: true,
        state: {
          successMessage: 'Payment completed successfully. Your appointment is confirmed.',
          appointmentId,
          sessionId
        }
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigate, appointmentId, sessionId]);

  return (
    <>
      <style>{`
        .payment-success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 45%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
          padding: 1rem;
        }

        .payment-success-card {
          width: 100%;
          max-width: 520px;
          background: white;
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 20px 50px rgba(59,130,246,0.16);
          border: 1px solid rgba(59,130,246,0.08);
        }

        .payment-success-icon {
          width: 84px;
          height: 84px;
          margin: 0 auto 1rem;
          border-radius: 999px;
          background: #DCFCE7;
          color: #16A34A;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payment-success-title {
          font-size: 1.7rem;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 0.6rem;
        }

        .payment-success-text {
          color: #475569;
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 1.2rem;
        }

        .payment-success-loader {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          color: #3B82F6;
          font-weight: 700;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="payment-success-page">
        <div className="payment-success-card">
          <div className="payment-success-icon">
            <CheckCircle size={44} />
          </div>

          <div className="payment-success-title">Payment Successful</div>

          <div className="payment-success-text">
            Your online payment was completed successfully and your appointment is being finalized.
            You will be redirected to your dashboard shortly.
          </div>

          <div className="payment-success-loader">
            <Loader size={18} className="spin" />
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;