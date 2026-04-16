import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Search,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader,
  Eye,
  Edit2,
  Trash2,
  Activity,
  CreditCard,
  FileText,
  AlertCircle,
  Settings,
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  isApproved: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface DoctorApplication {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  specialization: string;
  licenseNumber: string;
  hospital: string;
  yearsOfExperience: number;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  appliedDate: string;
  approvedDate?: string;
  rejectionReason?: string;
}

interface Transaction {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  type: 'appointment' | 'consultation' | 'subscription' | 'refund' | 'other';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [doctorApplications, setDoctorApplications] = useState<DoctorApplication[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'blocked'>('all');
  const [filterType, setFilterType] = useState<'all' | 'appointment' | 'consultation' | 'subscription' | 'refund' | 'other'>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      if (userRole !== 'admin') {
        window.location.href = '/login';
        return;
      }

      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';

      const doctorApplicationsResponse = await fetch(`${gatewayUrl}/api/auth/admin/doctor-applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (doctorApplicationsResponse.ok) {
        const doctorApplicationsData = await doctorApplicationsResponse.json();

        const transformedApplications: DoctorApplication[] = doctorApplicationsData.map((app: any) => ({
          _id: app._id,
          userId: {
            _id: app.user?._id || '',
            name: app.user?.name || 'Unknown Doctor',
            email: app.user?.email || 'No Email',
          },
          specialization: app.specialization,
          licenseNumber: app.licenseNumber,
          hospital: app.hospital,
          yearsOfExperience: app.yearsOfExperience,
          status: app.status,
          appliedDate: app.createdAt,
          approvedDate: app.updatedAt,
          rejectionReason:
            app.status === 'rejected'
              ? 'Application does not meet requirements'
              : undefined,
        }));

        setDoctorApplications(transformedApplications);
      } else {
        let errorMessage = 'Failed to fetch doctor applications. Please try again.';

        try {
          await doctorApplicationsResponse.json();
        } catch {
          // ignore json parse error
        }

        if (doctorApplicationsResponse.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (doctorApplicationsResponse.status === 403) {
          errorMessage = 'Access denied. Admin role required.';
        }

        throw new Error(errorMessage);
      }

      const mockUsers: User[] = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'patient',
          isApproved: true,
          createdAt: '2024-01-15',
          lastLogin: '2024-04-14',
        },
        {
          _id: '2',
          name: 'Dr. Sarah Johnson',
          email: 'sarah@telehealx.com',
          role: 'doctor',
          isApproved: true,
          createdAt: '2024-02-01',
          lastLogin: '2024-04-13',
        },
        {
          _id: '3',
          name: 'Admin User',
          email: 'admin@telehealx.com',
          role: 'admin',
          isApproved: true,
          createdAt: '2024-01-01',
          lastLogin: '2024-04-15',
        },
        {
          _id: '4',
          name: 'Dr. Michael Chen',
          email: 'michael@telehealx.com',
          role: 'doctor',
          isApproved: false,
          createdAt: '2024-03-15',
          lastLogin: '2024-03-10',
        },
        {
          _id: '5',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'patient',
          isApproved: true,
          createdAt: '2024-02-10',
          lastLogin: '2024-02-09',
        },
      ];

      const mockTransactions: Transaction[] = [
        {
          _id: '1',
          userId: { _id: '1', name: 'John Doe', email: 'john@example.com' },
          type: 'appointment',
          amount: 150,
          description: 'Consultation fee',
          date: '2024-04-14',
          status: 'completed',
          paymentMethod: 'Credit Card',
        },
        {
          _id: '2',
          userId: { _id: '2', name: 'Dr. Sarah Johnson', email: 'sarah@telehealx.com' },
          type: 'consultation',
          amount: 200,
          description: 'Video consultation',
          date: '2024-04-13',
          status: 'completed',
          paymentMethod: 'PayPal',
        },
        {
          _id: '3',
          userId: { _id: '3', name: 'Admin User', email: 'admin@telehealx.com' },
          type: 'subscription',
          amount: 99,
          description: 'Premium subscription',
          date: '2024-04-01',
          status: 'pending',
          paymentMethod: 'Credit Card',
        },
        {
          _id: '4',
          userId: { _id: '4', name: 'Dr. Michael Chen', email: 'michael@telehealx.com' },
          type: 'refund',
          amount: 75,
          description: 'Refunded consultation',
          date: '2024-04-12',
          status: 'completed',
          paymentMethod: 'Bank Transfer',
        },
      ];

      setUsers(mockUsers);
      setTransactions(mockTransactions);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: '#0f766e',
      doctor: '#1d4ed8',
      patient: '#047857',
    };
    return colors[role] || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#b45309',
      approved: '#0f766e',
      rejected: '#b91c1c',
      blocked: '#6d28d9',
      completed: '#0f766e',
      failed: '#b91c1c',
    };
    return colors[status] || '#6B7280';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      appointment: '#1d4ed8',
      consultation: '#4f46e5',
      subscription: '#047857',
      refund: '#b45309',
      other: '#475569',
    };
    return colors[type] || '#6B7280';
  };

  const handleViewDoctorDetails = (doctor: DoctorApplication) => {
    console.log('Viewing doctor details:', doctor);
  };

  const handleApproveDoctor = async (doctorId: string) => {
    try {
      const token = localStorage.getItem('token');
      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';

      const doctorApp = doctorApplications.find((app) => app._id === doctorId);
      if (!doctorApp) {
        throw new Error('Doctor application not found');
      }

      const response = await fetch(`${gatewayUrl}/api/auth/admin/approve-doctor/${doctorApp.userId._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchDashboardData();
        setSuccess('Doctor approved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to approve doctor');
      }
    } catch (error) {
      setError('Failed to approve doctor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectDoctor = async (doctorId: string) => {
    try {
      setDoctorApplications((prev) =>
        prev.map((app) =>
          app._id === doctorId
            ? {
                ...app,
                status: 'rejected' as const,
                rejectionReason: 'Application does not meet requirements',
              }
            : app
        )
      );
      setSuccess('Doctor rejected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to reject doctor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBlockDoctor = async (doctorId: string) => {
    try {
      setDoctorApplications((prev) =>
        prev.map((app) =>
          app._id === doctorId ? { ...app, status: 'blocked' as const } : app
        )
      );
      setSuccess('Doctor blocked successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to block doctor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUnblockDoctor = async (doctorId: string) => {
    try {
      setDoctorApplications((prev) =>
        prev.map((app) =>
          app._id === doctorId ? { ...app, status: 'approved' as const } : app
        )
      );
      setSuccess('Doctor unblocked successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to unblock doctor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctorApplications = doctorApplications.filter(
    (app) =>
      app.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByRole =
    filterRole === 'all'
      ? filteredUsers
      : filteredUsers.filter((user) => user.role === filterRole);

  const filteredByStatus =
    filterStatus === 'all'
      ? filteredDoctorApplications
      : filteredDoctorApplications.filter((app) => app.status === filterStatus);

  const filteredByType =
    filterType === 'all'
      ? filteredTransactions
      : filteredTransactions.filter((transaction) => transaction.type === filterType);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

        * {
          box-sizing: border-box;
        }

        .admin-bg {
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
          background:
            radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.12), transparent 24%),
            linear-gradient(135deg, #0f172a 0%, #111827 52%, #1f2937 100%);
          color: #0f172a;
        }

        .admin-shell {
          max-width: 1540px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .sidebar {
          width: 300px;
          flex: 0 0 300px;
          border-radius: 30px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(17, 24, 39, 0.9));
          border: 1px solid rgba(148, 163, 184, 0.14);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.34);
          padding: 1.35rem;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          min-height: calc(100vh - 3rem);
          position: sticky;
          top: 1.5rem;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .brand-mark {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8 65%, #0f766e);
          display: grid;
          place-items: center;
          color: white;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.3);
          flex: 0 0 auto;
        }

        .brand-name {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 900;
          color: #f8fafc;
        }

        .brand-subtitle {
          margin: 0;
          font-size: 0.82rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .sidebar-copy {
          padding: 1rem 1rem 1.1rem;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(148, 163, 184, 0.12);
        }

        .sidebar-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.15);
          color: #bfdbfe;
          font-size: 0.78rem;
          font-weight: 800;
          margin-bottom: 0.8rem;
        }

        .sidebar-copy h2 {
          margin: 0;
          font-size: 1.45rem;
          line-height: 1.1;
          color: #ffffff;
        }

        .sidebar-copy p {
          margin: 0.75rem 0 0;
          color: #cbd5e1;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .sidebar-metrics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .mini-metric {
          padding: 0.9rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(148, 163, 184, 0.12);
        }

        .mini-metric span {
          display: block;
          font-size: 0.78rem;
          color: #94a3b8;
          margin-bottom: 0.35rem;
          font-weight: 700;
        }

        .mini-metric strong {
          display: block;
          color: #f8fafc;
          font-size: 1.4rem;
          font-weight: 900;
          line-height: 1;
        }

        .sidebar-nav {
          display: grid;
          gap: 0.55rem;
        }

        .sidebar-tab {
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(255, 255, 255, 0.035);
          color: #cbd5e1;
          padding: 0.95rem 1rem;
          border-radius: 18px;
          cursor: pointer;
          transition: 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          font-size: 0.95rem;
          font-weight: 800;
          text-align: left;
        }

        .sidebar-tab:hover {
          transform: translateY(-1px);
          border-color: rgba(96, 165, 250, 0.42);
          background: rgba(37, 99, 235, 0.16);
          color: #eff6ff;
        }

        .sidebar-tab.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(29, 78, 216, 0.5));
          border-color: rgba(191, 219, 254, 0.45);
          color: #ffffff;
          box-shadow: 0 16px 30px rgba(29, 78, 216, 0.2);
        }

        .tab-label {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-footer {
          margin-top: auto;
          display: grid;
          gap: 0.75rem;
          padding-top: 0.35rem;
        }

        .back-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(148, 163, 184, 0.15);
          padding: 0.9rem 1rem;
          border-radius: 16px;
          color: #e2e8f0;
          transition: all 0.2s ease;
          font-weight: 800;
          cursor: pointer;
        }

        .back-btn:hover {
          background: rgba(37, 99, 235, 0.18);
          border-color: rgba(96, 165, 250, 0.34);
          transform: translateY(-1px);
        }

        .back-btn.primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-color: transparent;
          color: white;
          box-shadow: 0 14px 24px rgba(37, 99, 235, 0.22);
        }

        .main-panel {
          flex: 1;
          min-width: 0;
          border-radius: 30px;
          background: rgba(248, 250, 252, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.18);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
          padding: 1.5rem;
          backdrop-filter: blur(18px);
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.1rem;
          flex-wrap: wrap;
        }

        .main-title {
          margin: 0;
          font-size: clamp(1.6rem, 2.5vw, 2.3rem);
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .main-subtitle {
          margin: 0.45rem 0 0;
          color: #64748b;
          font-size: 0.96rem;
          font-weight: 600;
          max-width: 62ch;
          line-height: 1.6;
        }

        .header-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          justify-content: flex-end;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border-radius: 999px;
          padding: 0.55rem 0.8rem;
          background: #e2e8f0;
          color: #334155;
          font-size: 0.82rem;
          font-weight: 800;
          border: 1px solid #cbd5e1;
        }

        .alert-stack {
          display: grid;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .alert-banner {
          border-radius: 18px;
          padding: 1rem 1.05rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }

        .alert-banner.success {
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .alert-banner.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .section-card,
        .table-card {
          background: rgba(255, 255, 255, 0.86);
          border-radius: 26px;
          padding: 1.25rem;
          border: 1px solid rgba(148, 163, 184, 0.18);
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
        }

        .content-stack {
          display: grid;
          gap: 1rem;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.88));
          border-radius: 24px;
          padding: 1.2rem;
          border: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.07);
        }

        .stat-label {
          font-size: 0.86rem;
          color: #64748b;
          margin-bottom: 0.45rem;
          font-weight: 700;
        }

        .stat-number {
          font-size: 2.35rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 900;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin: 0;
        }

        .card-meta {
          margin: 0.25rem 0 0;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .controls {
          display: flex;
          gap: 0.8rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          font-size: 0.92rem;
          background: #f8fafc;
          color: #0f172a;
        }

        .search-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .filter-select {
          padding: 0.85rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          font-size: 0.92rem;
          background: #f8fafc;
          color: #0f172a;
          cursor: pointer;
          min-width: 170px;
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .data-table {
          width: 100%;
          min-width: 820px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .data-table th {
          background: #f8fafc;
          color: #334155;
          padding: 1rem;
          text-align: left;
          font-weight: 800;
          font-size: 0.84rem;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #eef2f7;
          color: #0f172a;
          font-size: 0.92rem;
          vertical-align: top;
        }

        .data-table tr:hover td {
          background: #f8fbff;
        }

        .status-badge {
          display: inline-block;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 800;
          color: white;
          white-space: nowrap;
        }

        .action-group {
          display: inline-flex;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .action-btn {
          background: #eef2f7;
          border: 1px solid #dbe2ea;
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 12px;
          transition: 0.18s ease;
          color: #334155;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
        }

        .action-btn.approve {
          color: #166534;
          background: #ecfdf5;
          border-color: #bbf7d0;
        }

        .action-btn.reject {
          color: #991b1b;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .action-btn.warn {
          color: #92400e;
          background: #fffbeb;
          border-color: #fde68a;
        }

        .action-btn.info {
          color: #1d4ed8;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .empty-state,
        .loading {
          padding: 2.75rem 1.5rem;
          color: #64748b;
          display: grid;
          place-items: center;
          gap: 0.65rem;
          text-align: center;
          font-weight: 600;
        }

        .empty-state h3 {
          margin: 0;
          color: #0f172a;
          font-size: 1.05rem;
        }

        .empty-state p {
          margin: 0;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1200px) {
          .admin-shell {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            flex-basis: auto;
            min-height: auto;
            position: relative;
            top: 0;
          }

          .overview-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .admin-shell {
            padding: 1rem;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .sidebar-metrics {
            grid-template-columns: 1fr 1fr;
          }

          .main-panel,
          .sidebar,
          .section-card,
          .table-card {
            padding: 1rem;
            border-radius: 22px;
          }

          .search-box,
          .filter-select {
            min-width: 0;
            width: 100%;
          }
        }
      `}</style>

      <div className="admin-bg">
        <div className="admin-shell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brand-mark">
                <Shield size={24} />
              </div>
              <div>
                <p className="brand-name">TeleHealX</p>
                <p className="brand-subtitle">Admin Console</p>
              </div>
            </div>

            <div className="sidebar-copy">
              <div className="sidebar-kicker">
                <Settings size={14} />
                Operations
              </div>
              <h2>Monitor the platform from one calm, focused workspace.</h2>
              <p>Review users, verify doctors, and track transactions with clear controls.</p>
            </div>

            <div className="sidebar-metrics">
              <div className="mini-metric">
                <span>Total Users</span>
                <strong>{users.length}</strong>
              </div>
              <div className="mini-metric">
                <span>Doctors</span>
                <strong>{doctorApplications.length}</strong>
              </div>
              <div className="mini-metric">
                <span>Transactions</span>
                <strong>{transactions.length}</strong>
              </div>
              <div className="mini-metric">
                <span>Active</span>
                <strong>{users.filter((u) => u.isApproved).length}</strong>
              </div>
            </div>

            <nav className="sidebar-nav" aria-label="Dashboard sections">
              <button
                className={`sidebar-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="tab-label">
                  <Activity size={18} />
                  Overview
                </span>
                <TrendingUp size={16} />
              </button>

              <button
                className={`sidebar-tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <span className="tab-label">
                  <Users size={18} />
                  User Management
                </span>
                <FileText size={16} />
              </button>

              <button
                className={`sidebar-tab ${activeTab === 'doctors' ? 'active' : ''}`}
                onClick={() => setActiveTab('doctors')}
              >
                <span className="tab-label">
                  <UserCheck size={18} />
                  Doctor Verification
                </span>
                <AlertCircle size={16} />
              </button>

              <button
                className={`sidebar-tab ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                <span className="tab-label">
                  <DollarSign size={18} />
                  Financial Transactions
                </span>
                <Clock size={16} />
              </button>
            </nav>

            <div className="sidebar-footer">
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <button className="back-btn">
                  <ArrowLeft size={18} />
                  Back to Dashboard
                </button>
              </Link>

              <button
                className="back-btn primary"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('userName');
                  window.location.href = '/login';
                }}
              >
                Logout
              </button>
            </div>
          </aside>

          <main className="main-panel">
            <div className="main-header">
              <div>
                <h1 className="main-title">Admin Dashboard</h1>
                <p className="main-subtitle">
                  Manage the platform, verify doctors, and review transactions from one place.
                </p>
              </div>

              <div className="header-chips">
                <div className="chip">
                  <Calendar size={14} />
                  Today
                </div>
                <div className="chip">
                  <TrendingUp size={14} />
                  Live overview
                </div>
              </div>
            </div>

            <div className="alert-stack">
              {success && (
                <div className="alert-banner success">
                  <CheckCircle size={18} />
                  {success}
                </div>
              )}

              {error && (
                <div className="alert-banner error">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}
            </div>

            <div className="content-stack">
              {activeTab === 'overview' && (
                <section className="section-card">
                  <div className="overview-grid">
                    <div className="stat-card">
                      <div className="stat-label">Total Users</div>
                      <div className="stat-number">{users.length}</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label">Pending Doctor Applications</div>
                      <div className="stat-number">{doctorApplications.length}</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label">Total Transactions</div>
                      <div className="stat-number">{transactions.length}</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label">Active Users</div>
                      <div className="stat-number">{users.filter((u) => u.isApproved).length}</div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'users' && (
                <section className="table-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">
                        <Users size={22} />
                        User Management
                      </h2>
                      <p className="card-meta">Search, filter, and review current platform users.</p>
                    </div>

                    <div className="controls">
                      <div className="search-box">
                        <Search
                          size={18}
                          style={{
                            position: 'absolute',
                            left: '0.85rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                      </div>

                      <select
                        value={filterRole}
                        onChange={(e) =>
                          setFilterRole(e.target.value as 'all' | 'patient' | 'doctor' | 'admin')
                        }
                        className="filter-select"
                      >
                        <option value="all">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="doctor">Doctors</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="loading">
                      <Loader size={24} className="spinner" />
                      Loading users...
                    </div>
                  ) : filteredByRole.length === 0 ? (
                    <div className="empty-state">
                      <Users size={40} />
                      <h3>No users found</h3>
                      <p>Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined Date</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredByRole.map((user) => (
                            <tr key={user._id}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>
                                <span className="status-badge" style={{ background: getRoleColor(user.role) }}>
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                              </td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{ background: user.isApproved ? '#0f766e' : '#b45309' }}
                                >
                                  {user.isApproved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td>{formatDate(user.createdAt)}</td>
                              <td>{user.lastLogin || 'Never'}</td>
                              <td>
                                <div className="action-group">
                                  <button className="action-btn info" aria-label="View user">
                                    <Eye size={16} />
                                  </button>
                                  <button className="action-btn" aria-label="Edit user">
                                    <Edit2 size={16} />
                                  </button>
                                  <button className="action-btn reject" aria-label="Delete user">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {activeTab === 'doctors' && (
                <section className="table-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">
                        <UserCheck size={22} />
                        Doctor Verification
                      </h2>
                      <p className="card-meta">Review applications and handle approval actions.</p>
                    </div>

                    <div className="controls">
                      <div className="search-box">
                        <Search
                          size={18}
                          style={{
                            position: 'absolute',
                            left: '0.85rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Search applications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                      </div>

                      <select
                        value={filterStatus}
                        onChange={(e) =>
                          setFilterStatus(
                            e.target.value as 'all' | 'pending' | 'approved' | 'rejected' | 'blocked'
                          )
                        }
                        className="filter-select"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="loading">
                      <Loader size={24} className="spinner" />
                      Loading applications...
                    </div>
                  ) : filteredByStatus.length === 0 ? (
                    <div className="empty-state">
                      <UserCheck size={40} />
                      <h3>No doctor applications found</h3>
                      <p>Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Doctor Name</th>
                            <th>Email</th>
                            <th>Specialization</th>
                            <th>License Number</th>
                            <th>Hospital</th>
                            <th>Experience</th>
                            <th>Status</th>
                            <th>Applied Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredByStatus.map((app) => (
                            <tr key={app._id}>
                              <td>{app.userId.name}</td>
                              <td>{app.userId.email}</td>
                              <td>{app.specialization}</td>
                              <td>{app.licenseNumber}</td>
                              <td>{app.hospital}</td>
                              <td>{app.yearsOfExperience} years</td>
                              <td>
                                <span className="status-badge" style={{ background: getStatusColor(app.status) }}>
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                              </td>
                              <td>{formatDate(app.appliedDate)}</td>
                              <td>
                                <div className="action-group">
                                  <button
                                    className="action-btn info"
                                    onClick={() => handleViewDoctorDetails(app)}
                                    aria-label="View application"
                                  >
                                    <Eye size={16} />
                                  </button>

                                  {app.status === 'pending' && (
                                    <>
                                      <button
                                        className="action-btn approve"
                                        onClick={() => handleApproveDoctor(app._id)}
                                        aria-label="Approve doctor"
                                      >
                                        <CheckCircle size={16} />
                                      </button>

                                      <button
                                        className="action-btn reject"
                                        onClick={() => handleRejectDoctor(app._id)}
                                        aria-label="Reject doctor"
                                      >
                                        <UserX size={16} />
                                      </button>
                                    </>
                                  )}

                                  {(app.status === 'approved' || app.status === 'rejected') && (
                                    <button
                                      className="action-btn warn"
                                      onClick={() => handleBlockDoctor(app._id)}
                                      aria-label="Block doctor"
                                    >
                                      <AlertTriangle size={16} />
                                    </button>
                                  )}

                                  {app.status === 'blocked' && (
                                    <button
                                      className="action-btn approve"
                                      onClick={() => handleUnblockDoctor(app._id)}
                                      aria-label="Unblock doctor"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {activeTab === 'transactions' && (
                <section className="table-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">
                        <DollarSign size={22} />
                        Financial Transactions
                      </h2>
                      <p className="card-meta">Review payments, refunds, and subscriptions.</p>
                    </div>

                    <div className="controls">
                      <div className="search-box">
                        <Search
                          size={18}
                          style={{
                            position: 'absolute',
                            left: '0.85rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                      </div>

                      <select
                        value={filterType}
                        onChange={(e) =>
                          setFilterType(
                            e.target.value as
                              | 'all'
                              | 'appointment'
                              | 'consultation'
                              | 'subscription'
                              | 'refund'
                              | 'other'
                          )
                        }
                        className="filter-select"
                      >
                        <option value="all">All Types</option>
                        <option value="appointment">Appointments</option>
                        <option value="consultation">Consultations</option>
                        <option value="subscription">Subscriptions</option>
                        <option value="refund">Refunds</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="loading">
                      <Loader size={24} className="spinner" />
                      Loading transactions...
                    </div>
                  ) : filteredByType.length === 0 ? (
                    <div className="empty-state">
                      <CreditCard size={40} />
                      <h3>No transactions found</h3>
                      <p>Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Payment Method</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredByType.map((transaction) => (
                            <tr key={transaction._id}>
                              <td>{transaction.userId.name}</td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{ background: getTypeColor(transaction.type) }}
                                >
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </span>
                              </td>
                              <td>{formatCurrency(transaction.amount)}</td>
                              <td>{transaction.description}</td>
                              <td>{formatDate(transaction.date)}</td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{ background: getStatusColor(transaction.status) }}
                                >
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </span>
                              </td>
                              <td>{transaction.paymentMethod}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;