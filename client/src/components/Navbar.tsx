import { Link, useNavigate } from 'react-router-dom';
import { logout as logoutService } from '../services/authService';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate('/user-dashboard');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await logoutService(token || undefined);
    } catch (error) {
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <h2>TeleHealX</h2>
      </div>
      <div className="navbar__center">
        <Link to="/landing">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
      <div className="navbar__right">
        <button type="button" onClick={handleDashboard} className="navbar__dashboard">
          Dashboard
        </button>
        <button type="button" onClick={handleLogout} className="navbar__logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
