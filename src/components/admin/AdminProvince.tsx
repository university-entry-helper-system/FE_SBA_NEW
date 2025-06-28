import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminProvince.css";

interface Province {
  id: number;
  name: string;
  region: string;
}

const defaultForm: Omit<Province, "id"> = {
  name: "",
  region: "",
};

const AdminProvince: React.FC = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [form, setForm] = useState<Omit<Province, "id">>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const getAuthConfig = () => ({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/provinces",
        getAuthConfig()
      );
      setProvinces(Array.isArray(res.data.result) ? res.data.result : []);
    } catch {
      setError("Không thể tải danh sách tỉnh/thành.");
      setProvinces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (province: Province) => {
    setSelectedProvince(province);
    setForm({ name: province.name, region: province.region });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa tỉnh/thành này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/provinces/${id}`,
        getAuthConfig()
      );
      fetchProvinces();
    } catch {
      setError("Xóa tỉnh/thành thất bại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedProvince) {
        await axios.put(
          `http://localhost:8080/api/v1/provinces/${selectedProvince.id}`,
          { id: selectedProvince.id, ...form },
          getAuthConfig()
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/v1/provinces",
          { id: 0, ...form },
          getAuthConfig()
        );
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedProvince(null);
      fetchProvinces();
    } catch {
      setError("Lưu tỉnh/thành thất bại.");
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedProvince(null);
    setError("");
  };

  return (
    <div className="admin-majors-page majors-container">
      <h2 className="majors-title">Quản lý tỉnh/thành phố</h2>
      {error && <div className="error majors-error">{error}</div>}
      <form className="major-form majors-form" onSubmit={handleSubmit}>
        <div className="majors-form-row">
          <input
            className="majors-input"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Tên tỉnh/thành"
            required
          />
          <input
            className="majors-input"
            name="region"
            value={form.region}
            onChange={handleInputChange}
            placeholder="Vùng miền"
            required
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
      <hr className="majors-divider" />
      {loading ? (
        <div className="majors-loading">Đang tải...</div>
      ) : (
        <div className="majors-table-wrapper">
          <table className="majors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên tỉnh/thành</th>
                <th>Vùng miền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {provinces.map((p) => (
                <tr key={p.id} className="majors-row">
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.region}</td>
                  <td>
                    <button
                      className="majors-btn majors-btn-edit"
                      onClick={() => handleEdit(p)}
                    >
                      Sửa
                    </button>
                    <button
                      className="majors-btn majors-btn-delete"
                      onClick={() => handleDelete(p.id)}
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

export default AdminProvince;
