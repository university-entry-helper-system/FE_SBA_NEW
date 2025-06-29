import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminMajor.css";

interface AdmissionMethod {
  id: number;
  name: string;
  description: string;
}

const defaultForm: Omit<AdmissionMethod, "id"> = {
  name: "",
  description: "",
};

const AdminAdmissionMethod: React.FC = () => {
  const [methods, setMethods] = useState<AdmissionMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<AdmissionMethod | null>(
    null
  );
  const [form, setForm] = useState<Omit<AdmissionMethod, "id">>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const getAuthConfig = () => ({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/admission-methods",
        getAuthConfig()
      );
      setMethods(
        Array.isArray(res.data.result?.items)
          ? res.data.result.items
          : Array.isArray(res.data.result)
          ? res.data.result
          : []
      );
    } catch {
      setError("Không thể tải danh sách phương thức tuyển sinh.");
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (method: AdmissionMethod) => {
    setSelectedMethod(method);
    setForm({ name: method.name, description: method.description });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa phương thức này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/admission-methods/${id}`,
        getAuthConfig()
      );
      fetchMethods();
    } catch {
      setError("Xóa phương thức tuyển sinh thất bại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedMethod) {
        await axios.put(
          `http://localhost:8080/api/v1/admission-methods/${selectedMethod.id}`,
          form,
          getAuthConfig()
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/v1/admission-methods",
          form,
          getAuthConfig()
        );
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedMethod(null);
      fetchMethods();
    } catch {
      setError("Lưu phương thức tuyển sinh thất bại.");
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedMethod(null);
    setError("");
  };

  return (
    <div className="admin-majors-page majors-container">
      <h2 className="majors-title">Quản lý phương thức tuyển sinh</h2>
      {error && <div className="majors-error">{error}</div>}
      <form className="majors-form" onSubmit={handleSubmit}>
        <div className="majors-form-row">
          <input
            className="majors-input"
            name="name"
            placeholder="Tên phương thức"
            value={form.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            className="majors-textarea"
            name="description"
            placeholder="Mô tả"
            value={form.description}
            onChange={handleInputChange}
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
                <th>Tên phương thức</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="majors-row">
                  <td>{m.id}</td>
                  <td>{m.name}</td>
                  <td>{m.description}</td>
                  <td>
                    <button
                      className="majors-btn majors-btn-edit"
                      onClick={() => handleEdit(m)}
                    >
                      Sửa
                    </button>
                    <button
                      className="majors-btn majors-btn-delete"
                      onClick={() => handleDelete(m.id)}
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

export default AdminAdmissionMethod;
