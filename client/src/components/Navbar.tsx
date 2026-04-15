import { Link, useNavigate } from 'react-router-dom';
import { logout as logoutService } from '../services/authService';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const name = user?.name || 'Patient';

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
        <span>{name}</span>
        <button type="button" onClick={handleLogout} className="navbar__logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
