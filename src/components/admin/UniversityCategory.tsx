import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminMajor.css";

interface UniversityCategory {
  id: number;
  name: string;
  description: string;
}

const defaultForm: Omit<UniversityCategory, "id"> = {
  name: "",
  description: "",
};

const UniversityCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<UniversityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<UniversityCategory | null>(null);
  const [form, setForm] = useState<Omit<UniversityCategory, "id">>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const getAuthConfig = () => ({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/university-categories/paginated",
        getAuthConfig()
      );
      setCategories(
        Array.isArray(res.data.result?.items) ? res.data.result.items : []
      );
    } catch {
      setError("Không thể tải danh sách loại trường.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (category: UniversityCategory) => {
    setSelectedCategory(category);
    setForm({ name: category.name, description: category.description });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa loại trường này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/university-categories/${id}`,
        getAuthConfig()
      );
      fetchCategories();
    } catch {
      setError("Xóa loại trường thất bại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedCategory) {
        await axios.put(
          `http://localhost:8080/api/v1/university-categories/${selectedCategory.id}`,
          form,
          getAuthConfig()
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/v1/university-categories",
          form,
          getAuthConfig()
        );
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch {
      setError("Lưu loại trường thất bại.");
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedCategory(null);
    setError("");
  };

  return (
    <div className="admin-majors-page majors-container">
      <h2 className="majors-title">Quản lý loại trường đại học</h2>
      {error && <div className="error majors-error">{error}</div>}
      <form className="major-form majors-form" onSubmit={handleSubmit}>
        <div className="majors-form-row">
          <input
            className="majors-input"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Tên loại trường"
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
      <hr className="majors-divider" />
      {loading ? (
        <div className="majors-loading">Đang tải...</div>
      ) : (
        <div className="majors-table-wrapper">
          <table className="majors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên loại trường</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="majors-row">
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td>
                    <button
                      className="majors-btn majors-btn-edit"
                      onClick={() => handleEdit(c)}
                    >
                      Sửa
                    </button>
                    <button
                      className="majors-btn majors-btn-delete"
                      onClick={() => handleDelete(c.id)}
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

export default UniversityCategoryPage;
