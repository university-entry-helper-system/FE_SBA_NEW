import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isLinkActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo-container">
          <Link to="/" className="navbar-logo">
            <img src="/logo.png" alt="EduPath" className="navbar-logo-img" />
            <span className="navbar-logo-text">EduPath</span>
          </Link>
        </div>

        {/* Desktop menu */}
        <nav className="navbar-menu-desktop">
          <ul className="navbar-menu-list">
            <li>
              <Link to="/" className={`navbar-menu-link ${isLinkActive("/")}`}>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/universities"
                className={`navbar-menu-link ${isLinkActive("/universities")}`}
              >
                Các trường
              </Link>
            </li>
            <li>
              <Link
                to="/majors"
                className={`navbar-menu-link ${isLinkActive("/majors")}`}
              >
                Ngành học
              </Link>
            </li>
            <li>
              <Link
                to="/exam-info"
                className={`navbar-menu-link ${isLinkActive("/exam-info")}`}
              >
                Thông tin thi
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`navbar-menu-link ${isLinkActive("/contact")}`}
              >
                Liên hệ
              </Link>
            </li>
          </ul>
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="navbar-login-button">
            Đăng nhập
          </Link>
          <Link to="/register" className="navbar-register-button">
            Đăng ký
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="navbar-mobile-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <span
            className={`navbar-mobile-icon ${isMenuOpen ? "open" : ""}`}
          ></span>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      <div className={`navbar-mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <nav className="navbar-mobile-nav">
          <ul className="navbar-mobile-list">
            <li>
              <Link
                to="/"
                className={`navbar-mobile-link ${isLinkActive("/")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/universities"
                className={`navbar-mobile-link ${isLinkActive(
                  "/universities"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Các trường
              </Link>
            </li>
            <li>
              <Link
                to="/majors"
                className={`navbar-mobile-link ${isLinkActive("/majors")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Ngành học
              </Link>
            </li>
            <li>
              <Link
                to="/exam-info"
                className={`navbar-mobile-link ${isLinkActive("/exam-info")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Thông tin thi
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`navbar-mobile-link ${isLinkActive("/contact")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Liên hệ
              </Link>
            </li>
          </ul>
          <div className="navbar-mobile-buttons">
            <Link
              to="/login"
              className="navbar-mobile-login"
              onClick={() => setIsMenuOpen(false)}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="navbar-mobile-register"
              onClick={() => setIsMenuOpen(false)}
            >
              Đăng ký
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
