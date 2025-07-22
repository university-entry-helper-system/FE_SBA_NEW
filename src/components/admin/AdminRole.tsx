import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminUniversities.css";

interface Role {
  id: number;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  name: string;
  description: string;
  accounts: string[];
}

const defaultForm: Omit<
  Role,
  "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "accounts"
> = {
  status: "ACTIVE",
  name: "",
  description: "",
};

const AdminRole: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [form, setForm] =
    useState<
      Omit<
        Role,
        | "id"
        | "createdAt"
        | "createdBy"
        | "updatedAt"
        | "updatedBy"
        | "accounts"
      >
    >(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const getAuthConfig = () => ({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/roles",
        getAuthConfig()
      );
      setRoles(Array.isArray(res.data.result) ? res.data.result : []);
    } catch {
      setError("Không thể tải danh sách vai trò.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setForm({
      status: role.status,
      name: role.name,
      description: role.description,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa vai trò này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/roles/${id}`,
        getAuthConfig()
      );
      fetchRoles();
    } catch {
      setError("Xóa vai trò thất bại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedRole) {
        await axios.put(
          `http://localhost:8080/api/v1/roles/${selectedRole.id}`,
          {
            ...selectedRole,
            ...form,
            updatedAt: new Date().toISOString(),
            updatedBy: "admin",
          },
          getAuthConfig()
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/v1/roles",
          {
            ...form,
            createdAt: new Date().toISOString(),
            createdBy: "admin",
            updatedAt: new Date().toISOString(),
            updatedBy: "admin",
            accounts: [],
          },
          getAuthConfig()
        );
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedRole(null);
      fetchRoles();
    } catch {
      setError("Lưu vai trò thất bại.");
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedRole(null);
    setError("");
  };

  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý vai trò
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các vai trò trong hệ thống
          </p>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {/* Card form create giống AdminAccount */}
      <div
        className="admin-card"
        style={{ maxWidth: 600, margin: "0 auto 24px auto" }}
      >
        <h2
          className="admin-text-xl admin-font-semibold"
          style={{ marginBottom: 12 }}
        >
          Thêm mới vai trò
        </h2>
        <form className="major-form majors-form" onSubmit={handleSubmit}>
          <div className="majors-form-row">
            <input
              className="majors-input"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Tên vai trò"
              required
            />
            <input
              className="majors-input"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Mô tả"
            />
          </div>
          <div className="majors-form-actions">
            <button type="submit" className="majors-btn majors-btn-submit">
              {isEditing ? "Cập nhật" : "Thêm mới"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="majors-btn majors-btn-cancel"
                onClick={handleCancel}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
      <hr className="majors-divider" />
      {loading ? (
        <div className="majors-loading">Đang tải...</div>
      ) : (
        <div className="majors-table-wrapper">
          <table className="majors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên vai trò</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="majors-row">
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.description}</td>
                  <td>{r.status}</td>
                  <td>
                    <button
                      className="majors-btn majors-btn-edit"
                      onClick={() => handleEdit(r)}
                    >
                      Sửa
                    </button>
                    <button
                      className="majors-btn majors-btn-delete"
                      onClick={() => handleDelete(r.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRole;
