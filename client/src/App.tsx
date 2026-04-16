

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import UploadReport from './pages/patient/UploadReport';
import ProfileManagement from './pages/patient/ProfileManagement';
import MedicalHistoryManagement from './pages/patient/MedicalHistoryManagement';
import MedicalReportsManagement from './pages/patient/MedicalReportsManagement';
import PrescriptionManagement from './pages/patient/PrescriptionManagement';
import AppointmentBooking from './pages/patient/AppointmentBooking';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorRegistration from './pages/admin/DoctorRegistration';
import DoctorLoginBlocked from './pages/auth/DoctorLoginBlocked';

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
        <Route path="/medical-history" element={<MedicalHistoryManagement />} />
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
