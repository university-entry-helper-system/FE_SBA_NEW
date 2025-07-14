import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../css/Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isLinkActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo-container">
          <Link
            to="/"
            className="navbar-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="https://static.vecteezy.com/system/resources/previews/050/738/813/non_2x/education-logo-design-with-book-globe-badge-with-leaves-icon-mascot-logo-design-symbol-for-language-school-vector.jpg"
              alt="EduPath"
              className="navbar-logo-img"
            />
            <span className="navbar-logo-text">EduPath</span>
          </Link>
        </div>

        {/* Desktop menu */}
        <nav className="navbar-menu-desktop">
          <ul className="navbar-menu-list">
            <li>
              <Link
                to="/"
                className={`navbar-menu-link ${isLinkActive("/")}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
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
                to="/news"
                className={`navbar-menu-link ${isLinkActive("/news")}`}
              >
                Tin Tức
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
            <li>
              <Link
                to="/about"
                className={`navbar-menu-link ${isLinkActive("/about")}`}
              >
                Tư vấn tuyển sinh
              </Link>
            </li>
            {/* Role-based links */}
            {isAuthenticated && user?.roleName === "ROLE_ADMIN" && (
              <li>
                <Link
                  to="/admin"
                  className={`navbar-menu-link ${isLinkActive("/admin")}`}
                >
                  Quản trị
                </Link>
              </li>
            )}
            {isAuthenticated && user?.roleName === "ROLE_CONSULTANT" && (
              <li>
                <Link
                  to="/consultant"
                  className={`navbar-menu-link ${isLinkActive("/consultant")}`}
                >
                  Tư vấn viên
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="navbar-actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-login-button">
                Đăng nhập
              </Link>
              <Link to="/register" className="navbar-register-button">
                Đăng ký
              </Link>
            </>
          ) : (
            <div className="navbar-user-info">
              <span className="navbar-user-name">
                {user?.email || user?.accountId}
              </span>
              <button className="navbar-logout-button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
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
                onClick={() => {
                  setIsMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
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
            {/* Role-based links */}
            {isAuthenticated && user?.roleName === "ROLE_ADMIN" && (
              <li>
                <Link
                  to="/admin"
                  className={`navbar-mobile-link ${isLinkActive("/admin")}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Quản trị
                </Link>
              </li>
            )}
            {isAuthenticated && user?.roleName === "ROLE_CONSULTANT" && (
              <li>
                <Link
                  to="/consultant"
                  className={`navbar-mobile-link ${isLinkActive(
                    "/consultant"
                  )}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tư vấn viên
                </Link>
              </li>
            )}
          </ul>
          <div className="navbar-mobile-buttons">
            {!isAuthenticated ? (
              <>
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
              </>
            ) : (
              <div className="navbar-user-info">
                <span className="navbar-user-name">
                  {user?.email || user?.accountId}
                </span>
                <button
                  className="navbar-logout-button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
