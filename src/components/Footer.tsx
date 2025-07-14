import { Link } from "react-router-dom";
import "../css/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* Logo and description */}
          <div className="footer-branding">
            <Link to="/" className="footer-logo">
              <img
                src="https://static.vecteezy.com/system/resources/previews/050/738/813/non_2x/education-logo-design-with-book-globe-badge-with-leaves-icon-mascot-logo-design-symbol-for-language-school-vector.jpg"
                alt="EduPath"
                className="footer-logo-img"
              />
              <span className="footer-logo-text">EduPath</span>
            </Link>
            <p className="footer-description">
              Nền tảng hỗ trợ học sinh, sinh viên tìm kiếm thông tin tuyển sinh,
              lựa chọn ngành học và định hướng nghề nghiệp.
            </p>
            <div className="footer-social">
              <a
                href="https://facebook.com"
                className="footer-social-link"
                aria-label="Facebook"
              >
                <svg
                  className="footer-social-icon"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                className="footer-social-link"
                aria-label="YouTube"
              >
                <svg
                  className="footer-social-icon"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                className="footer-social-link"
                aria-label="Twitter"
              >
                <svg
                  className="footer-social-icon"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.073 4.073 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.093 4.093 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.615 11.615 0 0 0 6.29 1.84" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <svg
                  className="footer-social-icon"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3 className="footer-heading">Liên kết nhanh</h3>
            <ul className="footer-list">
              <li>
                <Link to="/universities" className="footer-link">
                  Danh sách trường
                </Link>
              </li>
              <li>
                <Link to="/majors" className="footer-link">
                  Danh sách ngành
                </Link>
              </li>
              <li>
                <Link to="/exam-info" className="footer-link">
                  Thông tin tuyển sinh
                </Link>
              </li>
              <li>
                <Link to="/scholarship" className="footer-link">
                  Học bổng
                </Link>
              </li>
              <li>
                <Link to="/career-guide" className="footer-link">
                  Định hướng nghề nghiệp
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-links">
            <h3 className="footer-heading">Tài nguyên</h3>
            <ul className="footer-list">
              <li>
                <Link to="/blog" className="footer-link">
                  Tin tức giáo dục
                </Link>
              </li>
              <li>
                <Link to="/practice-tests" className="footer-link">
                  Đề thi thử
                </Link>
              </li>
              <li>
                <Link to="/documents" className="footer-link">
                  Tài liệu học tập
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="footer-contact">
            <h3 className="footer-heading">Liên hệ</h3>
            <address className="footer-address">
              <p className="footer-contact-item">
                <svg
                  className="footer-contact-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                123 Đường Giáo Dục, Quận Kiến Thức, TP Tri Thức
              </p>
              <p className="footer-contact-item">
                <svg
                  className="footer-contact-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a href="tel:+84123456789" className="footer-link">
                  (+84) 123 456 789
                </a>
              </p>
              <p className="footer-contact-item">
                <svg
                  className="footer-contact-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a href="mailto:contact@edupath.com" className="footer-link">
                  contact@edupath.com
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} EduPath. Đã đăng ký bản quyền.
          </p>
          <div className="footer-bottom-links">
            <Link to="/terms" className="footer-policy-link">
              Điều khoản sử dụng
            </Link>
            <Link to="/privacy" className="footer-policy-link">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
