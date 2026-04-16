import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorOverviewPage from './pages/doctor/DoctorOverviewPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import AvailabilityPage from './pages/doctor/AvailabilityPage';
import PrescriptionsPage from './pages/doctor/PrescriptionsPage';
import PatientReportsPage from './pages/doctor/PatientReportsPage';
import LandingPage from './pages/LandingPage';
import UserDashboardPage from './pages/UserDashboardPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';

const ProtectedRoute = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  if (user.role !== 'doctor') {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/user-dashboard" element={<UserDashboardPage />} />
        
        <Route path="/symptom-checker" element={<SymptomCheckerPage />} />

        
        <Route element={<ProtectedRoute />}>
          <Route path="/doctor" element={<DoctorDashboard />}>
            <Route path="dashboard" element={<DoctorOverviewPage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="patient-reports" element={<PatientReportsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
}

export default App;
