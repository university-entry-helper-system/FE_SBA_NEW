import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminMajor.css";

interface University {
  id: number;
  categoryId: number;
  name: string;
  shortName: string;
  logoUrl: string;
  foundingYear: number;
  provinceId: number;
  type: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  admissionMethodIds: number[];
}

const defaultForm: Omit<University, "id"> = {
  categoryId: 0,
  name: "",
  shortName: "",
  logoUrl: "",
  foundingYear: 0,
  provinceId: 0,
  type: "",
  address: "",
  email: "",
  phone: "",
  website: "",
  description: "",
  admissionMethodIds: [],
};

const AdminUniversities: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [form, setForm] = useState<Omit<University, "id">>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const getAuthConfig = () => ({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/universities",
        getAuthConfig()
      );
      setUniversities(Array.isArray(res.data.result) ? res.data.result : []);
    } catch {
      setError("Không thể tải danh sách trường.");
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (university: University) => {
    setSelectedUniversity(university);
    setForm({ ...university });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa trường này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/universities/${id}`,
        getAuthConfig()
      );
      fetchUniversities();
    } catch {
      setError("Xóa trường thất bại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedUniversity) {
        await axios.put(
          `http://localhost:8080/api/v1/universities/${selectedUniversity.id}`,
          form,
          getAuthConfig()
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/v1/universities",
          form,
          getAuthConfig()
        );
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedUniversity(null);
      fetchUniversities();
    } catch {
      setError("Lưu trường thất bại.");
    }
  };

  return (
    <div className="admin-majors-page majors-container">
      <h2 className="majors-title">Quản lý trường đại học</h2>
      {error && <div className="error majors-error">{error}</div>}
      <form className="major-form majors-form" onSubmit={handleSubmit}>
        <div className="majors-form-row">
          <input
            className="majors-input"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Tên trường"
            required
          />
          <input
            className="majors-input"
            name="shortName"
            value={form.shortName}
            onChange={handleInputChange}
            placeholder="Tên viết tắt"
          />
          <input
            className="majors-input"
            name="categoryId"
            value={form.categoryId}
            onChange={handleInputChange}
            placeholder="ID danh mục"
            type="number"
          />
          <input
            className="majors-input"
            name="provinceId"
            value={form.provinceId}
            onChange={handleInputChange}
            placeholder="ID tỉnh/thành"
            type="number"
          />
        </div>
        <div className="majors-form-row">
          <input
            className="majors-input"
            name="logoUrl"
            value={form.logoUrl}
            onChange={handleInputChange}
            placeholder="Logo URL"
          />
          <input
            className="majors-input"
            name="foundingYear"
            value={form.foundingYear}
            onChange={handleInputChange}
            placeholder="Năm thành lập"
            type="number"
          />
          <input
            className="majors-input"
            name="type"
            value={form.type}
            onChange={handleInputChange}
            placeholder="Loại trường"
          />
        </div>
        <div className="majors-form-row">
          <input
            className="majors-input"
            name="address"
            value={form.address}
            onChange={handleInputChange}
            placeholder="Địa chỉ"
          />
          <input
            className="majors-input"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
          />
          <input
            className="majors-input"
            name="phone"
            value={form.phone}
            onChange={handleInputChange}
            placeholder="Số điện thoại"
          />
          <input
            className="majors-input"
            name="website"
            value={form.website}
            onChange={handleInputChange}
            placeholder="Website"
          />
        </div>
        <div className="majors-form-row">
          <textarea
            className="majors-textarea"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Mô tả"
          />
          <input
            className="majors-input"
            name="admissionMethodIds"
            value={form.admissionMethodIds.join(",")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                admissionMethodIds: e.target.value
                  .split(",")
                  .map(Number)
                  .filter(Boolean),
              }))
            }
            placeholder="ID phương thức tuyển sinh (cách nhau bằng dấu phẩy)"
          />
        </div>
        <div className="majors-form-actions">
          <button className="majors-btn majors-btn-submit" type="submit">
            {isEditing ? "Cập nhật" : "Thêm mới"}
          </button>
          {isEditing && (
            <button
              className="majors-btn majors-btn-cancel"
              type="button"
              onClick={() => {
                setIsEditing(false);
                setSelectedUniversity(null);
                setForm(defaultForm);
              }}
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
                <th>Tên trường</th>
                <th>Tên viết tắt</th>
                <th>Logo</th>
                <th>Năm thành lập</th>
                <th>Loại</th>
                <th>Địa chỉ</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Website</th>
                <th>Mô tả</th>
                <th>Phương thức tuyển sinh</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((u) => (
                <tr key={u.id} className="majors-row">
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.shortName}</td>
                  <td>
                    {u.logoUrl ? (
                      <img
                        src={u.logoUrl}
                        alt="logo"
                        style={{ width: 40, height: 40, objectFit: "contain" }}
                      />
                    ) : (
                      ""
                    )}
                  </td>
                  <td>{u.foundingYear}</td>
                  <td>{u.type}</td>
                  <td>{u.address}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.website}</td>
                  <td>{u.description}</td>
                  <td>
                    {Array.isArray(u.admissionMethodIds)
                      ? u.admissionMethodIds.join(", ")
                      : ""}
                  </td>
                  <td>
                    <button
                      className="majors-btn majors-btn-edit"
                      onClick={() => handleEdit(u)}
                    >
                      Sửa
                    </button>
                    <button
                      className="majors-btn majors-btn-delete"
                      onClick={() => handleDelete(u.id)}
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

export default AdminUniversities;
