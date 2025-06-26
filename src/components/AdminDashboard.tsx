import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    users: 128,
    universities: 245,
    majors: 612,
    visits: 9872,
  });

  // Ví dụ hàm cập nhật số liệu thống kê (để sử dụng setStats)
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
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">
          <span>Logged in as: {user?.email}</span>
          <button onClick={logout} className="admin-logout-button">
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <h3>Người dùng</h3>
          <p className="admin-stat-number">{stats.users}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Trường đại học</h3>
          <p className="admin-stat-number">{stats.universities}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Ngành đào tạo</h3>
          <p className="admin-stat-number">{stats.majors}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Lượt truy cập</h3>
          <p className="admin-stat-number">{stats.visits}</p>
        </div>
        <button onClick={refreshStats} className="admin-refresh-button">
          Cập nhật số liệu
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <h2>Quản lý nội dung</h2>
          <div className="admin-actions">
            <button className="admin-action-button">Quản lý trường</button>
            <button className="admin-action-button">Quản lý ngành học</button>
            <button className="admin-action-button">Quản lý điểm chuẩn</button>
            <button className="admin-action-button">
              Quản lý đề án tuyển sinh
            </button>
          </div>
        </div>

        <div className="admin-section">
          <h2>Quản lý người dùng</h2>
          <div className="admin-actions">
            <button className="admin-action-button">
              Danh sách người dùng
            </button>
            <button className="admin-action-button">Phân quyền</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
