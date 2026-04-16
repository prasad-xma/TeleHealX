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
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const UploadReport = lazy(() => import('./pages/patient/UploadReport'));
const ProfileManagement = lazy(() => import('./pages/patient/ProfileManagement'));
const MedicalHistoryManagement = lazy(() => import('./pages/patient/MedicalHistoryManagement'));
const MedicalReportsManagement = lazy(() => import('./pages/patient/MedicalReportsManagement'));
const PrescriptionManagement = lazy(() => import('./pages/patient/PrescriptionManagement'));
const AppointmentBooking = lazy(() => import('./pages/patient/AppointmentBooking'));
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
