import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminMajor.css";
interface Major {
  id: number;
  name: string;
  code: string;
  majorParentId: number;
  degree: string;
  description: string;
  subjectCombinationIds: number[];
}

const AdminMajors: React.FC = () => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [form, setForm] = useState<Omit<Major, "id">>({
    name: "",
    code: "",
    majorParentId: 0,
    degree: "",
    description: "",
    subjectCombinationIds: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy token đúng key accessToken
  const token = localStorage.getItem("accessToken");

  // Hàm tạo config header có Authorization
  const getAuthConfig = () => ({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  const fetchMajors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/majors",
        getAuthConfig()
      );
      // Đảm bảo majors luôn là mảng lấy từ res.data.result
      setMajors(Array.isArray(res.data.result) ? res.data.result : []);
    } catch {
      setError("Không thể tải danh sách ngành.");
      setMajors([]); // Đảm bảo không bị lỗi map
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (major: Major) => {
    setSelectedMajor(major);
    setForm({
      name: major.name,
      code: major.code,
      majorParentId: major.majorParentId,
      degree: major.degree,
      description: major.description,
      subjectCombinationIds: major.subjectCombinationIds,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa ngành này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/majors/${id}`,
        getAuthConfig()
      );
      fetchMajors();
    } catch {
      setError("Xóa ngành thất bại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedMajor) {
        await axios.put(
          `http://localhost:8080/api/v1/majors/${selectedMajor.id}`,
          form,
          getAuthConfig()
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/v1/majors",
          form,
          getAuthConfig()
        );
      }
      setForm({
        name: "",
        code: "",
        majorParentId: 0,
        degree: "",
        description: "",
        subjectCombinationIds: [],
      });
      setIsEditing(false);
      setSelectedMajor(null);
      fetchMajors();
    } catch {
      setError("Lưu ngành thất bại.");
    }
  };

  return (
    <div className="admin-majors-page majors-container">
      <h2 className="majors-title">Quản lý ngành</h2>
      {error && <div className="error majors-error">{error}</div>}
      <form className="major-form majors-form" onSubmit={handleSubmit}>
        <div className="majors-form-row">
          <input
            className="majors-input"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Tên ngành"
            required
          />
          <input
            className="majors-input"
            name="code"
            value={form.code}
            onChange={handleInputChange}
            placeholder="Mã ngành"
            required
          />
          <input
            className="majors-input"
            name="majorParentId"
            value={form.majorParentId}
            onChange={handleInputChange}
            placeholder="ID ngành cha"
            type="number"
          />
          <input
            className="majors-input"
            name="degree"
            value={form.degree}
            onChange={handleInputChange}
            placeholder="Bằng cấp"
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
            name="subjectCombinationIds"
            value={form.subjectCombinationIds.join(",")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                subjectCombinationIds: e.target.value
                  .split(",")
                  .map(Number)
                  .filter(Boolean),
              }))
            }
            placeholder="ID tổ hợp môn (cách nhau bằng dấu phẩy)"
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
                setSelectedMajor(null);
                setForm({
                  name: "",
                  code: "",
                  majorParentId: 0,
                  degree: "",
                  description: "",
                  subjectCombinationIds: [],
                });
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
                <th>Tên ngành</th>
                <th>Mã ngành</th>
                <th>ID ngành cha</th>
                <th>Bằng cấp</th>
                <th>Mô tả</th>
                <th>Tổ hợp môn</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {majors.map((major) => (
                <tr key={major.id} className="majors-row">
                  <td>{major.id}</td>
                  <td>{major.name}</td>
                  <td>{major.code}</td>
                  <td>{major.majorParentId}</td>
                  <td>{major.degree}</td>
                  <td>{major.description}</td>
                  <td>
                    {Array.isArray(major.subjectCombinationIds)
                      ? major.subjectCombinationIds.join(", ")
                      : ""}
                  </td>
                  <td>
                    <button
                      className="majors-btn majors-btn-edit"
                      onClick={() => handleEdit(major)}
                    >
                      Sửa
                    </button>
                    <button
                      className="majors-btn majors-btn-delete"
                      onClick={() => handleDelete(major.id)}
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

export default AdminMajors;
