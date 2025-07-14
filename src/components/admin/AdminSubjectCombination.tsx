import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminMajor.css";

interface SubjectCombination {
  id: number;
  name: string;
  description: string;
  examSubjectIds: number[];
}

const defaultForm: Omit<SubjectCombination, "id"> = {
  name: "",
  description: "",
  examSubjectIds: [],
};

const AdminSubjectCombination: React.FC = () => {
  const [combinations, setCombinations] = useState<SubjectCombination[]>([]);
  const [selectedCombination, setSelectedCombination] =
    useState<SubjectCombination | null>(null);
  const [form, setForm] = useState<Omit<SubjectCombination, "id">>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const getAuthConfig = () => ({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  const fetchCombinations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/subject-combinations",
        getAuthConfig()
      );
      setCombinations(Array.isArray(res.data.result) ? res.data.result : []);
    } catch {
      setError("Không thể tải danh sách tổ hợp môn.");
      setCombinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombinations();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "examSubjectIds"
          ? value
              .split(",")
              .map((v) => Number(v.trim()))
              .filter((v) => !isNaN(v) && v !== 0)
          : value,
    }));
  };

  const handleEdit = (comb: SubjectCombination) => {
    setSelectedCombination(comb);
    setForm({
      name: comb.name,
      description: comb.description,
      examSubjectIds: comb.examSubjectIds,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa tổ hợp môn này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/subject-combinations/${id}`,
        getAuthConfig()
      );
      fetchCombinations();
    } catch {
      setError("Xóa tổ hợp môn thất bại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedCombination) {
        await axios.put(
          `http://localhost:8080/api/v1/subject-combinations/${selectedCombination.id}`,
          form,
          getAuthConfig()
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/v1/subject-combinations",
          form,
          getAuthConfig()
        );
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedCombination(null);
      fetchCombinations();
    } catch {
      setError("Lưu tổ hợp môn thất bại.");
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedCombination(null);
    setError("");
  };

  return (
    <div className="admin-majors-page majors-container">
      <h2 className="majors-title">Quản lý tổ hợp môn</h2>
      {error && <div className="error majors-error">{error}</div>}
      <form className="major-form majors-form" onSubmit={handleSubmit}>
        <div className="majors-form-row">
          <input
            className="majors-input"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Tên tổ hợp môn"
            required
          />
          <input
            className="majors-input"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Mô tả"
          />
          <input
            className="majors-input"
            name="examSubjectIds"
            value={form.examSubjectIds.join(",")}
            onChange={handleInputChange}
            placeholder="ID môn thi (cách nhau bằng dấu phẩy)"
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
                <th>Tên tổ hợp môn</th>
                <th>Mô tả</th>
                <th>ID môn thi</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {combinations.map((c) => (
                <tr key={c.id} className="majors-row">
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td>
                    {Array.isArray(c.examSubjectIds)
                      ? c.examSubjectIds.join(", ")
                      : ""}
                  </td>
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

export default AdminSubjectCombination;
