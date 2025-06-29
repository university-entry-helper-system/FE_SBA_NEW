import { NavLink } from "react-router-dom";
import "../../css/AdminSidebar.css";

interface SidebarProps {
  isOpen: boolean;
}

const AdminSidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <nav className="admin-nav">
        <ul className="admin-nav-list">
          <li className="admin-nav-item">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3"
                />
              </svg>
              <span className="admin-nav-text">Dashboard</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/universities"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="admin-nav-text">Quản lý trường</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/majors"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="admin-nav-text">Quản lý ngành</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="admin-nav-text">Quản lý người dùng</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/provinces"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5m6-16a4 4 0 110 8 4 4 0 010-8z"
                />
              </svg>
              <span className="admin-nav-text">Quản lý tỉnh/thành</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 6h8M8 12h8M8 18h8M4 6h.01M4 12h.01M4 18h.01"
                />
              </svg>
              <span className="admin-nav-text">Quản lý loại trường</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/exam-subjects"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20h9"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"
                />
              </svg>
              <span className="admin-nav-text">Quản lý môn thi</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/admission-methods"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-2a4 4 0 0 1 8 0v2M12 12v-2a4 4 0 1 1 8 0v2M12 12v2a4 4 0 1 0 8 0v-2"
                />
              </svg>
              <span className="admin-nav-text">
                Quản lý phương thức tuyển sinh
              </span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/subject-combinations"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
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
              <span className="admin-nav-text">Quản lý tổ hợp môn</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink
              to="/admin/roles"
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <svg
                className="admin-nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12l6-6 6 6M6 18l6-6 6 6"
                />
              </svg>
              <span className="admin-nav-text">Quản lý vai trò</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
