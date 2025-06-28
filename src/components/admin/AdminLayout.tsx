import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import "../../css/AdminLayout.css";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-layout">
      <AdminNavbar onToggleSidebar={toggleSidebar} />
      <div className="admin-container">
        <AdminSidebar isOpen={isSidebarOpen} />
        <main
          className={`admin-main ${
            isSidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
