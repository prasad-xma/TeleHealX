import Navbar from '../components/Navbar';

const UserDashboardPage = () => {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const name = user?.name || 'Patient';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'linear-gradient(140deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%)',
        padding: '1.5rem 2rem 2rem',
        fontFamily: "'Nunito', sans-serif"
      }}
    >
      <Navbar />
      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 12px 28px rgba(30, 64, 175, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.12)'
        }}
      >
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1e3a8a', marginTop: 0, marginBottom: '0.6rem' }}>
          {name}'s Dashboard
        </h1>
        <p style={{ color: '#334155', marginTop: 0, marginBottom: '1.5rem' }}>
          This is your dashboard page.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.4rem', color: '#1e3a8a' }}>Appointments</h3>
            <p style={{ margin: 0, color: '#475569' }}>No appointments yet.</p>
          </div>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.4rem', color: '#1e3a8a' }}>Reports</h3>
            <p style={{ margin: 0, color: '#475569' }}>No reports uploaded.</p>
          </div>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.4rem', color: '#1e3a8a' }}>Messages</h3>
            <p style={{ margin: 0, color: '#475569' }}>No new messages.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
