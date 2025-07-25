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
            <li className="navbar-dropdown">
              <span
                className={`navbar-menu-link dropdown-toggle ${
                  isLinkActive("/universities") || isLinkActive("/majors")
                    ? "active"
                    : ""
                }`}
              >
                Trường & Ngành
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="dropdown-arrow"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </span>
              <div className="dropdown-menu">
                <Link
                  to="/universities"
                  className={`dropdown-item ${isLinkActive("/universities")}`}
                >
                  Các trường
                </Link>
                <Link
                  to="/majors"
                  className={`dropdown-item ${isLinkActive("/majors")}`}
                >
                  Ngành học
                </Link>
              </div>
            </li>
            <li className="navbar-dropdown">
              <span
                className={`navbar-menu-link dropdown-toggle ${
                  isLinkActive("/news") || isLinkActive("/contact")
                    ? "active"
                    : ""
                }`}
              >
                Tin tức & Liên hệ
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="dropdown-arrow"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </span>
              <div className="dropdown-menu">
                <Link
                  to="/news"
                  className={`dropdown-item ${isLinkActive("/news")}`}
                >
                  Tin tức
                </Link>
                <Link
                  to="/contact"
                  className={`dropdown-item ${isLinkActive("/contact")}`}
                >
                  Liên hệ
                </Link>
              </div>
            </li>
            <li className="navbar-dropdown">
              <span
                className={`navbar-menu-link dropdown-toggle ${
                  isLinkActive("/questions") || isLinkActive("/about")
                    ? "active"
                    : ""
                }`}
              >
                Tư vấn
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="dropdown-arrow"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </span>
              <div className="dropdown-menu">
                <Link
                  to="/questions"
                  className={`dropdown-item ${isLinkActive("/questions")}`}
                >
                  Câu hỏi thường gặp
                </Link>
                <Link
                  to="/about"
                  className={`dropdown-item ${isLinkActive("/about")}`}
                >
                  Tư vấn tuyển sinh
                </Link>
              </div>
            </li>
            <li className="navbar-dropdown">
              <span
                className={`navbar-menu-link dropdown-toggle ${
                  isLinkActive("/thpt-scores") ||
                  isLinkActive("/dgnl-hcm-scores") ||
                  isLinkActive("/dgnl-hanoi-scores")
                    ? "active"
                    : ""
                }`}
              >
                Phổ điểm
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="dropdown-arrow"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </span>
              <div className="dropdown-menu">
                <Link
                  to="/thpt-scores"
                  className={`dropdown-item ${isLinkActive("/thpt-scores")}`}
                >
                  Phổ điểm THPT
                </Link>
                <Link
                  to="/dgnl-hcm-scores"
                  className={`dropdown-item ${isLinkActive(
                    "/dgnl-hcm-scores"
                  )}`}
                >
                  Phổ điểm ĐGNL HCM
                </Link>
                <Link
                  to="/dgnl-hanoi-scores"
                  className={`dropdown-item ${isLinkActive(
                    "/dgnl-hanoi-scores"
                  )}`}
                >
                  Phổ điểm đánh giá HN
                </Link>
              </div>
            </li>
            <li className="navbar-dropdown">
              <span
                className={`navbar-menu-link dropdown-toggle ${
                  isLinkActive("/graduation-score") ||
                  isLinkActive("/university-score-lookup") ||
                  isLinkActive("/score-evaluation")
                    ? "active"
                    : ""
                }`}
              >
                Tính điểm tốt nghiệp
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="dropdown-arrow"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </span>
              <div className="dropdown-menu">
                <Link
                  to="/university-score-lookup"
                  className={`dropdown-item ${isLinkActive(
                    "/university-score-lookup"
                  )}`}
                >
                  Tra cứu điểm thi đại học
                </Link>
                <Link
                  to="/score-evaluation"
                  className={`dropdown-item ${isLinkActive(
                    "/score-evaluation"
                  )}`}
                >
                  Đánh giá điểm thi
                </Link>
                <Link
                  to="/graduation-score"
                  className={`dropdown-item ${isLinkActive(
                    "/graduation-score"
                  )}`}
                >
                  Tính điểm tốt nghiệp
                </Link>
              </div>
            </li>
            <li>
              <Link
                  to="/scholarship-review"
                  className={`navbar-menu-link  ${isLinkActive("/scholarship-review")}`}
                   onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Học bổng
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
                to="/questions"
                className={`navbar-mobile-link ${isLinkActive("/questions")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <Link
                to="/university-score-lookup"
                className={`navbar-mobile-link ${isLinkActive(
                  "/university-score-lookup"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Tra cứu điểm thi đại học
              </Link>
            </li>
            <li>
              <Link
                to="/score-evaluation"
                className={`navbar-mobile-link ${isLinkActive(
                  "/score-evaluation"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Đánh giá điểm thi
              </Link>
            </li>
            <li>
              <Link
                to="/graduation-score"
                className={`navbar-mobile-link ${isLinkActive(
                  "/graduation-score"
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Tính điểm tốt nghiệp
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
