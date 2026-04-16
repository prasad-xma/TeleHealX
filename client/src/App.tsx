import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    }>
      {children}
    </Suspense>
  );
};

// Lazy loaded components for better performance
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage'));
const SymptomCheckerPage = lazy(() => import('./pages/SymptomCheckerPage'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const UploadReport = lazy(() => import('./pages/patient/UploadReport'));
const ProfileManagement = lazy(() => import('./pages/patient/ProfileManagement'));
const MedicalHistoryManagement = lazy(() => import('./pages/patient/MedicalHistoryManagement'));
const MedicalReportsManagement = lazy(() => import('./pages/patient/MedicalReportsManagement'));
const PrescriptionManagement = lazy(() => import('./pages/patient/PrescriptionManagement'));
const AppointmentBooking = lazy(() => import('./pages/patient/AppointmentBooking'));
const VideoCallPage = lazy(() => import('./pages/VideoCallPage'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorOverviewPage = lazy(() => import('./pages/doctor/DoctorOverviewPage'));
const DoctorProfilePage = lazy(() => import('./pages/doctor/DoctorProfilePage'));
const AvailabilityPage = lazy(() => import('./pages/doctor/AvailabilityPage'));
const DoctorAppointmentsPage = lazy(() => import('./pages/doctor/DoctorAppointmentsPage'));
const DoctorPrescriptionsPage = lazy(() => import('./pages/doctor/PrescriptionsPage'));
const PatientReportsPage = lazy(() => import('./pages/doctor/PatientReportsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DoctorRegistration = lazy(() => import('./pages/admin/DoctorRegistration'));
const DoctorLoginBlocked = lazy(() => import('./pages/auth/DoctorLoginBlocked'));

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Doctor Route Component
const DoctorRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const role = userRole || user?.role;

  if (!token || role !== 'doctor') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/doctor-login-blocked" element={<DoctorLoginBlocked />} />
          
          {/* Protected General Routes */}
          <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/symptom-checker" element={<ProtectedRoute><SymptomCheckerPage /></ProtectedRoute>} />

          {/* Protected Patient Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/upload-report" element={
            <ProtectedRoute>
              <UploadReport />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileManagement />
            </ProtectedRoute>
          } />
          <Route path="/medical-history" element={
            <ProtectedRoute>
              <MedicalHistoryManagement />
            </ProtectedRoute>
          } />
          <Route path="/medical-reports" element={
            <ProtectedRoute>
              <MedicalReportsManagement />
            </ProtectedRoute>
          } />
          <Route path="/prescriptions" element={
            <ProtectedRoute>
              <PrescriptionManagement />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <AppointmentBooking />
            </ProtectedRoute>
          } />
          <Route path="/video-call/:roomName" element={
            <ProtectedRoute>
              <VideoCallPage />
            </ProtectedRoute>
          } />

          {/* Protected Doctor Routes */}
          <Route path="/doctor" element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorOverviewPage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
            <Route path="patient-reports" element={<PatientReportsPage />} />
          </Route>
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/doctor-registration" element={
            <AdminRoute>
              <DoctorRegistration />
            </AdminRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
