import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../css/AdminNavbar.css";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

const AdminNavbar = ({ onToggleSidebar }: AdminNavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-logo">
        <button className="admin-sidebar-toggle" onClick={onToggleSidebar}>
          <svg
            className="toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Link to="/admin" className="admin-logo">
          <span className="admin-logo-text">Admin Portal</span>
        </Link>
      </div>
      <div className="admin-navbar-actions">
        <div className="admin-navbar-user">
          <div className="admin-user-avatar">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="admin-user-details">
            <span className="admin-user-name">
              {user?.email?.split("@")[0]}
            </span>
            <span className="admin-user-role">{user?.roleName}</span>
          </div>
        </div>
        <button onClick={logout} className="admin-logout-btn">
          <svg
            className="logout-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
