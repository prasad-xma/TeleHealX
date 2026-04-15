const LandingPage = () => {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const name = user?.name || 'Patient';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(140deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%)',
        padding: '2rem',
        fontFamily: "'Nunito', sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 20px 45px rgba(37, 99, 235, 0.18)',
          border: '1px solid rgba(59, 130, 246, 0.12)'
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.75rem' }}>
          Welcome, {name}
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#334155', margin: 0 }}>
          This is the patient landing page placeholder.
        </p>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.75rem', marginBottom: 0 }}>
          Your group member can now continue building full content here.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
