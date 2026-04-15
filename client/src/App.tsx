

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import UploadReport from './pages/UploadReport';
import ProfileManagement from './pages/ProfileManagement';
import MedicalReportsManagement from './pages/MedicalReportsManagement';
import PrescriptionManagement from './pages/PrescriptionManagement';
import AppointmentBooking from './pages/AppointmentBooking';
import AdminDashboard from './pages/AdminDashboard';
import DoctorRegistration from './pages/DoctorRegistration';
import DoctorLoginBlocked from './pages/DoctorLoginBlocked';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/upload-report" element={<UploadReport />} />
        <Route path="/profile" element={<ProfileManagement />} />
        <Route path="/medical-reports" element={<MedicalReportsManagement />} />
        <Route path="/prescriptions" element={<PrescriptionManagement />} />
        <Route path="/appointments" element={<AppointmentBooking />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor-registration" element={<DoctorRegistration />} />
        <Route path="/doctor-login-blocked" element={<DoctorLoginBlocked />} />
      </Routes>
    </Router>
  );
}

export default App;
