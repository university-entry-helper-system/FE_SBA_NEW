import { useState } from "react";
import "../../css/AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 128,
    universities: 245,
    majors: 612,
    visits: 9872,
  });

  const refreshStats = () => {
    setStats({
      users: Math.floor(Math.random() * 200) + 100,
      universities: Math.floor(Math.random() * 100) + 200,
      majors: Math.floor(Math.random() * 200) + 500,
      visits: Math.floor(Math.random() * 1000) + 9000,
    });
  };

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Dashboard Overview
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Tổng quan hệ thống quản lý tuyển sinh
          </p>
        </div>
        <button
          onClick={refreshStats}
          className="admin-btn admin-btn-primary refresh-button"
        >
          <svg
            className="refresh-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card users-card">
          <div className="stat-icon">
            <svg
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
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Người dùng</h3>
            <p className="stat-number">{stats.users}</p>
            <span className="stat-change positive">+12%</span>
          </div>
        </div>

        <div className="stat-card universities-card">
          <div className="stat-icon">
            <svg
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
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Trường đại học</h3>
            <p className="stat-number">{stats.universities}</p>
            <span className="stat-change positive">+8%</span>
          </div>
        </div>

        <div className="stat-card majors-card">
          <div className="stat-icon">
            <svg
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
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Ngành đào tạo</h3>
            <p className="stat-number">{stats.majors}</p>
            <span className="stat-change positive">+15%</span>
          </div>
        </div>

        <div className="stat-card visits-card">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Lượt truy cập</h3>
            <p className="stat-number">{stats.visits.toLocaleString()}</p>
            <span className="stat-change positive">+24%</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        <div className="content-section">
          <div className="section-header">
            <h2 className="admin-text-xl admin-font-semibold admin-text-gray-900">
              Quản lý nội dung
            </h2>
            <span className="admin-badge admin-badge-info">4 modules</span>
          </div>
          <div className="action-grid">
            <button className="action-card">
              <div className="action-icon">
                <svg
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
              </div>
              <div className="action-content">
                <h3>Quản lý trường</h3>
                <p>Thêm, sửa, xóa thông tin trường đại học</p>
              </div>
            </button>

            <button className="action-card">
              <div className="action-icon">
                <svg
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
              </div>
              <div className="action-content">
                <h3>Quản lý ngành học</h3>
                <p>Quản lý các ngành đào tạo và chuyên môn</p>
              </div>
            </button>

            <button className="action-card">
              <div className="action-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="action-content">
                <h3>Quản lý điểm chuẩn</h3>
                <p>Cập nhật điểm chuẩn các năm</p>
              </div>
            </button>

            <button className="action-card">
              <div className="action-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="action-content">
                <h3>Đề án tuyển sinh</h3>
                <p>Quản lý thông tin tuyển sinh</p>
              </div>
            </button>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2 className="admin-text-xl admin-font-semibold admin-text-gray-900">
              Quản lý hệ thống
            </h2>
            <span className="admin-badge admin-badge-warning">2 modules</span>
          </div>
          <div className="action-grid">
            <button className="action-card">
              <div className="action-icon">
                <svg
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
              </div>
              <div className="action-content">
                <h3>Danh sách người dùng</h3>
                <p>Quản lý tài khoản người dùng</p>
              </div>
            </button>

            <button className="action-card">
              <div className="action-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="action-content">
                <h3>Phân quyền</h3>
                <p>Quản lý vai trò và quyền hạn</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="quick-actions">
        <h3 className="admin-text-lg admin-font-semibold admin-text-gray-900 admin-m-4">
          Thao tác nhanh
        </h3>
        <div className="quick-actions-grid">
          <button className="admin-btn admin-btn-primary">
            Thêm trường mới
          </button>
          <button className="admin-btn admin-btn-secondary">
            Export dữ liệu
          </button>
          <button className="admin-btn admin-btn-secondary">
            Backup hệ thống
          </button>
          <button className="admin-btn admin-btn-secondary">Xem báo cáo</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
