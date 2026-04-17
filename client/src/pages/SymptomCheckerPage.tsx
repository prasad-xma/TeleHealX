import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { analyzeSymptoms, getLatestSymptomResult } from '../services/aiService';

const SymptomCheckerPage = () => {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const name = user?.name || 'Patient';

  const [symptoms, setSymptoms] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestLoading, setLatestLoading] = useState(false);
  const [error, setError] = useState('');

  const patientId = user?._id || user?.id || '';

  const loadLatestResult = async () => {
    if (!patientId) {
      return;
    }

    setLatestLoading(true);
    try {
      const response = await getLatestSymptomResult(patientId);
      setAnswer(response.data?.aiResponse || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch latest symptom result.');
    } finally {
      setLatestLoading(false);
    }
  };

  useEffect(() => {
    loadLatestResult();
  }, [patientId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setAnswer('');

    if (!symptoms.trim()) {
      setError('Please write your symptoms first.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeSymptoms({
        symptoms,
        patientId: patientId || null,
      });

      setAnswer(response.data?.aiResponse || 'No response was returned by the AI service.');
      await loadLatestResult();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze symptoms.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(140deg, #eff6ff 0%, #dbeafe 45%, #bfdbfe 100%)',
        padding: '1.5rem 2rem 2rem',
        fontFamily: "'Nunito', sans-serif"
      }}
    >
      <Navbar />
      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 20px 45px rgba(37, 99, 235, 0.18)',
          border: '1px solid rgba(59, 130, 246, 0.12)'
        }}
      >
        <button
          onClick={() => navigate('/user-dashboard')}
          style={{
            background: 'transparent',
            color: '#2563eb',
            border: '1px solid #93c5fd',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Back to Dashboard
        </button>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a8a', marginTop: 0, marginBottom: '0.5rem' }}>
          Symptom Checker
        </h1>
        <p style={{ color: '#334155', marginTop: 0, marginBottom: '1.5rem' }}>
          Hello {name}, write your symptoms below and get a simple AI response.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#1e3a8a' }}>
            Your Symptoms
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Example: fever, cough, headache, and body pain"
            rows={7}
            style={{
              width: '100%',
              borderRadius: '14px',
              border: '1px solid #cbd5e1',
              padding: '1rem',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {error ? (
            <p style={{ color: '#b91c1c', marginTop: '0.75rem', marginBottom: 0 }}>{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.9rem 1.25rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Symptoms'}
          </button>
        </form>

        {latestLoading ? (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '14px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e3a8a' }}>Latest Saved Answer</h2>
            <p style={{ margin: 0, color: '#334155' }}>Loading latest result...</p>
          </div>
        ) : answer ? (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '14px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e3a8a' }}>Latest Saved Answer</h2>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#0f172a' }}>{answer}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SymptomCheckerPage;