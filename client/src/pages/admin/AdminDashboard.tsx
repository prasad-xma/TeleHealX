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
  Filter,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Activity,
  CreditCard,
  FileText,
  AlertCircle,
  Settings
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
    try {
      // Check if user is authenticated as admin
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (!token) {
        // Redirect to login if no token
        window.location.href = '/login';
        return;
      }

      if (userRole !== 'admin') {
        // Redirect to login if not admin
        window.location.href = '/login';
        return;
      }

      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
      console.log('Fetching from:', `${gatewayUrl}/api/auth/admin/doctor-applications`);

      // Fetch doctor applications from database
      const doctorApplicationsResponse = await fetch(`${gatewayUrl}/api/auth/admin/doctor-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', doctorApplicationsResponse.status);

      if (doctorApplicationsResponse.ok) {
        const doctorApplicationsData = await doctorApplicationsResponse.json();
        console.log('Doctor applications data:', doctorApplicationsData);
        
        // Transform database data to match frontend interface
        const transformedApplications: DoctorApplication[] = doctorApplicationsData.map((app: any) => ({
          _id: app._id,
          userId: {
            _id: app.user._id,
            name: app.user.name,
            email: app.user.email
          },
          specialization: app.specialization,
          licenseNumber: app.licenseNumber,
          hospital: app.hospital,
          yearsOfExperience: app.yearsOfExperience,
          status: app.status,
          appliedDate: app.createdAt,
          approvedDate: app.updatedAt,
          rejectionReason: app.status === 'rejected' ? 'Application does not meet requirements' : undefined
        }));

        setDoctorApplications(transformedApplications);
      } else {
        const errorData = await doctorApplicationsResponse.json();
        console.error('API Error:', errorData);
        
        if (doctorApplicationsResponse.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (doctorApplicationsResponse.status === 403) {
          throw new Error('Access denied. Admin role required.');
        } else {
          throw new Error('Failed to fetch doctor applications. Please try again.');
        }
      }

      // Mock data for users and transactions (can be implemented similarly)
      const mockUsers: User[] = [
        { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'patient', isApproved: true, createdAt: '2024-01-15', lastLogin: '2024-04-14' },
        { _id: '2', name: 'Dr. Sarah Johnson', email: 'sarah@telehealx.com', role: 'doctor', isApproved: true, createdAt: '2024-02-01', lastLogin: '2024-04-13' },
        { _id: '3', name: 'Admin User', email: 'admin@telehealx.com', role: 'admin', isApproved: true, createdAt: '2024-01-01', lastLogin: '2024-04-15' },
        { _id: '4', name: 'Dr. Michael Chen', email: 'michael@telehealx.com', role: 'doctor', isApproved: false, createdAt: '2024-03-15', lastLogin: '2024-03-10' },
        { _id: '5', name: 'Jane Smith', email: 'jane@example.com', role: 'patient', isApproved: true, createdAt: '2024-02-10', lastLogin: '2024-02-09' }
      ];

      const mockTransactions: Transaction[] = [
        { _id: '1', userId: { _id: '1', name: 'John Doe', email: 'john@example.com' }, type: 'appointment', amount: 150, description: 'Consultation fee', date: '2024-04-14', status: 'completed', paymentMethod: 'Credit Card' },
        { _id: '2', userId: { _id: '2', name: 'Dr. Sarah Johnson', email: 'sarah@telehealx.com' }, type: 'consultation', amount: 200, description: 'Video consultation', date: '2024-04-13', status: 'completed', paymentMethod: 'PayPal' },
        { _id: '3', userId: { _id: '3', name: 'Admin User', email: 'admin@telehealx.com' }, type: 'subscription', amount: 99, description: 'Premium subscription', date: '2024-04-01', status: 'pending', paymentMethod: 'Credit Card' },
        { _id: '4', userId: { _id: '4', name: 'Dr. Michael Chen', email: 'michael@telehealx.com' }, type: 'refund', amount: 75, description: 'Refunded consultation', date: '2024-04-12', status: 'completed', paymentMethod: 'Bank Transfer' }
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
      admin: '#10B981',
      doctor: '#3B82F6',
      patient: '#059669'
    };
    return colors[role] || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#DC2626',
      blocked: '#7C3AED'
    };
    return colors[status] || '#6B7280';
  };

  const handleViewDoctorDetails = (doctor: DoctorApplication) => {
    // Mock function to view doctor details
    console.log('Viewing doctor details:', doctor);
  };

  const handleApproveDoctor = async (doctorId: string) => {
    try {
      const token = localStorage.getItem('token');
      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';

      // Find the doctor application to get the user ID
      const doctorApp = doctorApplications.find(app => app._id === doctorId);
      if (!doctorApp) {
        throw new Error('Doctor application not found');
      }

      // Call the API to approve the doctor
      const response = await fetch(`${gatewayUrl}/api/auth/admin/approve-doctor/${doctorApp.userId._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh the data to get the updated status
        await fetchDashboardData();
        setSuccess('Doctor approved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to approve doctor');
      }
    } catch (error: any) {
      setError('Failed to approve doctor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectDoctor = async (doctorId: string) => {
    try {
      // For now, we'll update the local state since there's no reject endpoint
      // In a real implementation, you would add a reject endpoint to the backend
      setDoctorApplications(prev => 
        prev.map(app => 
          app._id === doctorId 
            ? { ...app, status: 'rejected' as const, rejectionReason: 'Application does not meet requirements' }
            : app
        )
      );
      setSuccess('Doctor rejected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to reject doctor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBlockDoctor = async (doctorId: string) => {
    try {
      // Mock API call - in real implementation, this would call the backend
      setDoctorApplications(prev => 
        prev.map(app => 
          app._id === doctorId 
            ? { ...app, status: 'blocked' as const }
            : app
        )
      );
      setSuccess('Doctor blocked successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to block doctor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUnblockDoctor = async (doctorId: string) => {
    try {
      // Mock API call - in real implementation, this would call the backend
      setDoctorApplications(prev => 
        prev.map(app => 
          app._id === doctorId 
            ? { ...app, status: 'approved' as const }
            : app
        )
      );
      setSuccess('Doctor unblocked successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to unblock doctor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      appointment: '#3B82F6',
      consultation: '#8B5CF6',
      subscription: '#10B981',
      refund: '#F59E0B',
      other: '#6B7280'
    };
    return colors[type] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctorApplications = doctorApplications.filter(app => 
    app.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction => 
    transaction.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByRole = filterRole === 'all' ? filteredUsers : filteredUsers.filter(user => user.role === filterRole);
  const filteredByStatus = filterStatus === 'all' ? filteredDoctorApplications : filteredDoctorApplications.filter(app => app.status === filterStatus);
  const filteredByType = filterType === 'all' ? filteredTransactions : filteredTransactions.filter(transaction => transaction.type === filterType);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        .admin-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #1E293B 0%, #374151 40%, #4B5563 100%);
          font-family: 'Nunito', sans-serif;
        }

        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .back-btn {
          background: #F1F5F9;
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          cursor: pointer;
          color: '#64748B';
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-btn:hover {
          background: #E2E8F0;
          color: '#3B82F6';
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .tabs-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(255,255,255,0.1);
          padding-bottom: 1rem;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          font-weight: 600;
          color: '#94A3B8';
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tab-btn.active {
          background: rgba(255,255,255,0.1);
          color: white;
        }

        .tab-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .stat-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255,255,255,0.2);
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 0.25rem;
        }

        .data-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #F1F5F9;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: '#1E293B';
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          font-size: 0.875rem;
          transition: all 0.2s;
          background: rgba(255,255,255,0.1);
          color: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #3B82F6;
          background: rgba(255,255,255,0.15);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          font-size: 0.875rem;
          background: rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .data-table th {
          background: rgba(255,255,255,0.1);
          color: white;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid rgba(255,255,255,0.2);
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          color: '#E5E7EB';
        }

        .data-table tr:hover {
          background: rgba(255,255,255,0.05);
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .action-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
          font-weight: 600;
        }

        .action-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: rgba(255,255,255,0.8);
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: rgba(255,255,255,0.8);
          font-weight: 600;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            min-width: auto;
          }
        }
      `}</style>

      <div className="admin-bg">
        <div className="admin-container">
          <div className="header">
            <Link to="/dashboard">
              <button className="back-btn">
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </Link>
            <h1 className="page-title">Admin Dashboard</h1>
            <button 
              className="back-btn"
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

          {success && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.2)', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              fontWeight: 600 
            }}>
              <CheckCircle size={20} />
              {success}
            </div>
          )}
          
          {error && (
            <div style={{ 
              background: 'rgba(220, 38, 38, 0.1)', 
              border: '1px solid rgba(220, 38, 38, 0.2)', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              fontWeight: 600 
            }}>
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Activity size={18} />
              Overview
            </button>
            
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              User Management
            </button>
            
            <button 
              className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
              onClick={() => setActiveTab('doctors')}
            >
              <UserCheck size={18} />
              Doctor Verification
            </button>
            
            <button 
              className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <DollarSign size={18} />
              Financial Transactions
            </button>
          </div>

          <div className="content-grid">
            {activeTab === 'overview' && (
              <>
                <div className="stat-card">
                  <div className="stat-number">{users.length}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{doctorApplications.length}</div>
                  <div className="stat-label">Pending Doctor Applications</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{transactions.length}</div>
                  <div className="stat-label">Total Transactions</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{users.filter(u => u.isApproved).length}</div>
                  <div className="stat-label">Active Users</div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="data-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <Users size={24} />
                    User Management
                  </h2>
                  <div className="controls">
                    <div className="search-box">
                      <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
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
                      onChange={(e) => setFilterRole(e.target.value as 'all' | 'patient' | 'doctor' | 'admin')}
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
                            <span 
                              className="status-badge" 
                              style={{ background: getRoleColor(user.role) }}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span 
                              className="status-badge" 
                              style={{ background: user.isApproved ? '#10B981' : '#F59E0B' }}
                            >
                              {user.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>{user.lastLogin || 'Never'}</td>
                          <td>
                            <button className="action-btn">
                              <Eye size={16} />
                            </button>
                            <button className="action-btn">
                              <Edit2 size={16} />
                            </button>
                            <button className="action-btn">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'doctors' && (
              <div className="data-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <UserCheck size={24} />
                    Doctor Verification
                  </h2>
                  <div className="controls">
                    <div className="search-box">
                      <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
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
                      onChange={(e) => setFilterStatus(e.target.value)}
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
                ) : filteredDoctorApplications.length === 0 ? (
                  <div className="empty-state">
                    <UserCheck size={40} />
                    <h3>No doctor applications found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
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
                      {filteredDoctorApplications.map((app) => (
                        <tr key={app._id}>
                          <td>{app.userId.name}</td>
                          <td>{app.userId.email}</td>
                          <td>{app.specialization}</td>
                          <td>{app.licenseNumber}</td>
                          <td>{app.hospital}</td>
                          <td>{app.yearsOfExperience} years</td>
                          <td>
                            <span 
                              className="status-badge" 
                              style={{ background: getStatusColor(app.status) }}
                            >
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </td>
                          <td>{formatDate(app.appliedDate)}</td>
                          <td>
                            <button 
                              className="action-btn"
                              onClick={() => handleViewDoctorDetails(app)}
                            >
                              <Eye size={16} />
                            </button>
                            {app.status === 'pending' && (
                              <>
                                <button 
                                  className="action-btn"
                                  onClick={() => handleApproveDoctor(app._id)}
                                  style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button 
                                  className="action-btn"
                                  onClick={() => handleRejectDoctor(app._id)}
                                  style={{ background: 'rgba(220, 38, 38, 0.2)' }}
                                >
                                  <UserX size={16} />
                                </button>
                              </>
                            )}
                            {(app.status === 'approved' || app.status === 'rejected') && (
                              <button 
                                className="action-btn"
                                onClick={() => handleBlockDoctor(app._id)}
                                style={{ background: 'rgba(245, 158, 11, 0.2)' }}
                              >
                                <AlertTriangle size={16} />
                              </button>
                            )}
                            {app.status === 'blocked' && (
                              <button 
                                className="action-btn"
                                onClick={() => handleUnblockDoctor(app._id)}
                                style={{ background: 'rgba(59, 130, 246, 0.2)' }}
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="data-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <DollarSign size={24} />
                    Financial Transactions
                  </h2>
                  <div className="controls">
                    <div className="search-box">
                      <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
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
                      onChange={(e) => setFilterType(e.target.value as 'all' | 'appointment' | 'consultation' | 'subscription' | 'refund' | 'other')}
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
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
