import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminMajor.css";

interface AdmissionMethod {
  id: number;
  name: string;
  description: string;
}

const AdminAdmissionMethod: React.FC = () => {
  const [methods, setMethods] = useState<AdmissionMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchMethods = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/v1/admission-methods");
      setMethods(res.data.result?.items || res.data.result || []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
      } else {
        setError("Lỗi không xác định khi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editId) {
        await axios.put(`/api/v1/admission-methods/${editId}`, form);
      } else {
        await axios.post("/api/v1/admission-methods", form);
      }
      setShowForm(false);
      setForm({ name: "", description: "" });
      setEditId(null);
      fetchMethods();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Lỗi khi lưu dữ liệu");
      } else {
        setError("Lỗi không xác định khi lưu dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: AdmissionMethod) => {
    setForm({ name: method.name, description: method.description });
    setEditId(method.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa phương thức này?")) return;
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/api/v1/admission-methods/${id}`);
      fetchMethods();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Lỗi khi xóa dữ liệu");
      } else {
        setError("Lỗi không xác định khi xóa dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-major-container">
      <h2>Quản lý phương thức tuyển sinh</h2>
      {error && <div className="admin-error">{error}</div>}
      <button
        className="admin-add-btn"
        onClick={() => {
          setShowForm(true);
          setEditId(null);
          setForm({ name: "", description: "" });
        }}
      >
        Thêm phương thức
      </button>
      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Tên phương thức
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Mô tả
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>
          <div className="admin-form-actions">
            <button type="submit" disabled={loading}>
              {editId ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
                setForm({ name: "", description: "" });
              }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}
      <table className="admin-table">
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
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.name}</td>
              <td>{m.description}</td>
              <td>
                <button onClick={() => handleEdit(m)}>Sửa</button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="admin-delete-btn"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <div>Đang tải...</div>}
    </div>
  );
};

export default AdminAdmissionMethod;
