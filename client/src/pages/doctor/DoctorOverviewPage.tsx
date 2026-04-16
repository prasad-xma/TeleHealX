import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Calendar, FileText, Clock, Star, ArrowRight, Info } from 'lucide-react';

const DoctorOverviewPage = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('Doctor');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setDoctorName(user.name || 'Doctor');
    }
  }, []);

  const stats = [
    { label: 'Total Appointments Today', value: '8', icon: Calendar, color: 'blue' },
    { label: 'Prescriptions Issued', value: '24', icon: FileText, color: 'green' },
    { label: 'Pending Approvals', value: '3', icon: Clock, color: 'orange' },
    { label: 'Average Rating', value: '4.8', icon: Star, color: 'yellow' },
  ];

  const quickActions = [
    { label: 'Update Availability', path: '/doctor/availability', icon: Calendar },
    { label: 'Issue Prescription', path: '/doctor/prescriptions', icon: FileText },
    { label: 'View Patient Reports', path: '/doctor/patient-reports', icon: Stethoscope },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50',
      green: 'from-green-500 to-green-600 bg-green-50',
      orange: 'from-orange-500 to-orange-600 bg-orange-50',
      yellow: 'from-yellow-500 to-yellow-600 bg-yellow-50',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');
      `}</style>

      <div className="font-['Nunito',sans-serif] space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Stethoscope size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-['Fredoka_One',cursive]">
                Welcome back, {doctorName}!
              </h1>
              <p className="text-blue-100 mt-1 text-lg">
                Here's your overview for today
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = getColorClasses(stat.color);
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses.split(' ').slice(0, 2).join(' ')} rounded-xl flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-xl font-bold text-gray-800 font-['Fredoka_One',cursive]">Quick Actions</h2>
            <p className="text-gray-500 text-sm mt-1">Common tasks you can perform</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="group flex items-center gap-4 p-5 border-2 border-blue-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors">
                      <Icon size={24} className="text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                        {action.label}
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notice Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Info size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Coming Soon</h3>
              <p className="text-gray-600">
                Telemedicine and Appointment modules are coming soon. Stay tuned for more features!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorOverviewPage;
