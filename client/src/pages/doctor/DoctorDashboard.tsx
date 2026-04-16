import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Stethoscope, Bell, Menu, X, LogOut, LayoutDashboard, User, Calendar, FileText, Users, Video } from 'lucide-react';

const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const pageTitle = location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard';

  const navItems = [
    { path: '/doctor/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/doctor/profile', label: 'My Profile', icon: User },
    { path: '/doctor/availability', label: 'Availability', icon: Calendar },
    { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { path: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { path: '/doctor/patient-reports', label: 'Patient Reports', icon: Users },
    { path: '/doctor/telemedicine', label: 'Telemedicine', icon: Video, disabled: true, badge: 'Coming Soon' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');
      `}</style>

      <div
        className="min-h-screen font-['Nunito',sans-serif]"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)' }}
      >
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          {sidebarOpen ? <X size={24} className="text-blue-600" /> : <Menu size={24} className="text-blue-600" />}
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-blue-200 shadow-xl z-40 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            {/* Brand Logo */}
            <div className="p-6 border-b border-blue-100">
              <Link to="/doctor/dashboard" className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                >
                  <Stethoscope size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold font-['Fredoka_One',cursive] text-blue-900">TeleHealX</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      {item.disabled ? (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed bg-gray-50">
                          <Icon size={20} />
                          <span className="flex-1 font-medium">{item.label}</span>
                          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                            {item.badge}
                          </span>
                        </div>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            isActive
                              ? 'text-white shadow-lg'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                          style={isActive ? { background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' } : undefined}
                        >
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Info & Logout */}
            <div
              className="p-4 border-t border-blue-100"
              style={{ background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)' }}
            >
              {user && (
                <div className="mb-3 px-2">
                  <p className="font-semibold text-gray-900 text-sm">{user.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-colors border border-red-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64 min-h-screen">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-blue-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-bold font-['Fredoka_One',cursive] text-blue-900 capitalize">
                  {pageTitle}
                </h1>
              </div>
              <button className="relative p-2 rounded-xl hover:bg-blue-50 transition-colors group">
                <Bell size={22} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default DoctorDashboard;
