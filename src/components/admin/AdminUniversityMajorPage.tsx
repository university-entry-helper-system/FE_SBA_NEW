import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAllUniversityMajors,
  createUniversityMajor,
  updateUniversityMajor,
  deleteUniversityMajor,
  getUniversityMajor,
} from "../../api/universityMajor";
import { getMajors } from "../../api/major";
import { getAdmissionMethods } from "../../api/admissionMethod";
import { getSubjectCombinations } from "../../api/subjectCombination";
import type { UniversityMajor, UniversityMajorRequest } from "../../types/universityMajor";
import type { Major } from "../../types/major";
import type { AdmissionMethod } from "../../types/admissionMethod";
import type { SubjectCombination } from "../../types/subjectCombination";
import "../../css/AdminUniversities.css";

const defaultForm: UniversityMajorRequest = {
  universityId: 0,
  majorId: 0,
  universityMajorName: "",
  quota: 0,
  notes: "",
  year: new Date().getFullYear(),
  admissionMethodIds: [],
  subjectCombinationIds: [],
  scores: 0,
};

const AdminUniversityMajorPage: React.FC = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const [majors, setMajors] = useState<UniversityMajor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UniversityMajorRequest>(defaultForm);
  const [selectedMajor, setSelectedMajor] = useState<UniversityMajor | null>(null);
  const [allMajors, setAllMajors] = useState<Major[]>([]);
  const [allAdmissionMethods, setAllAdmissionMethods] = useState<AdmissionMethod[]>([]);
  const [allSubjectCombinations, setAllSubjectCombinations] = useState<SubjectCombination[]>([]);

  const fetchMajors = async () => {
    if (!universityId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAllUniversityMajors(Number(universityId), {
        name: search,
        page,
        size,
      });
      const result = res.data.result;
      setMajors(result.items || []);
      setTotalPages(result.totalPages || 1);
      setTotalElements(result.totalElements || 0);
    } catch {
      setError("Không thể tải danh sách ngành");
      setMajors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
    // eslint-disable-next-line
  }, [universityId, page, search]);

  // Fetch all majors, admission methods, and subject combinations when form modal opens
  useEffect(() => {
    if (showFormModal) {
      getMajors({ page: 0, size: 100 }).then(res => {
        setAllMajors(res.data.result?.items || res.data.items || res.data || []);
      });
      getAdmissionMethods({ page: 0, size: 100 }).then(res => {
        console.log('admission methods', res.data);
        setAllAdmissionMethods(res.data.result?.items || res.data.items || res.data || []);
      });
      getSubjectCombinations({ page: 0, size: 100 }).then(res => {
        console.log('subject combinations', res.data);
        setAllSubjectCombinations(res.data.result?.items || res.data.items || res.data || []);
      });
    }
  }, [showFormModal]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleAdd = () => {
    setForm({ ...defaultForm, universityId: Number(universityId) });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await getUniversityMajor(id);
      const data = res.data.result;
      setForm({
        universityId: data.universityId,
        majorId: data.majorId,
        universityMajorName: data.universityMajorName || data.uniMajorName || "",
        quota: data.quota,
        notes: data.notes,
        year: data.year,
        admissionMethodIds: Array.isArray((data as any).admissionMethods)
          ? (data as any).admissionMethods.map((m: any) => m.id)
          : data.admissionMethodIds || [],
        subjectCombinationIds: Array.isArray((data as any).subjectCombinations)
          ? (data as any).subjectCombinations.map((sc: any) => sc.id)
          : data.subjectCombinationIds || [],
        scores: data.scores || data.score || 0,
      });
      setIsEditing(true);
      setShowFormModal(true);
    } catch {
      setError("Không thể lấy thông tin ngành");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id: number) => {
    setLoading(true);
    try {
      const res = await getUniversityMajor(id);
      setSelectedMajor(res.data.result);
      setShowDetailModal(true);
    } catch {
      setError("Không thể lấy thông tin ngành");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa ngành này?")) return;
    setLoading(true);
    try {
      await deleteUniversityMajor(id);
      setSuccess("Xóa ngành thành công");
      fetchMajors();
    } catch {
      setError("Xóa ngành thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === "" ? "" : Number(value)) : value,
    }));
  };
  // Add a handler for select change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "majorId") {
      const selected = allMajors.find((m) => m.id === Number(value));
      setForm((prev) => ({
        ...prev,
        majorId: Number(value),
        majorName: selected ? selected.name : "",
      }));
    } else {    
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add a handler for multi-select change
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const values = Array.from(options).filter(o => o.selected).map(o => Number(o.value));
    setForm((prev) => ({ ...prev, [name]: values }));
  };

  // Remove an item from a multi-select field
  const handleRemoveFromMulti = (field: 'admissionMethodIds' | 'subjectCombinationIds', id: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((itemId: number) => itemId !== id),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateUniversityMajor(form.majorId, form);
        setSuccess("Cập nhật ngành thành công");
      } else {
        await createUniversityMajor(form);
        setSuccess("Thêm ngành mới thành công");
      }
      setShowFormModal(false);
      fetchMajors();
    } catch {
      setError(isEditing ? "Cập nhật ngành thất bại" : "Thêm ngành thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý ngành của trường #{universityId}
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý các ngành đào tạo của trường đại học này
          </p>
        </div>
        <button className="admin-btn admin-btn-primary add-btn" onClick={handleAdd}>
          + Thêm ngành mới
        </button>
      </div>
      <div className="search-section">
        <div className="search-controls">
          <div className="search-input-group">
            <input
              className="search-input"
              placeholder="Tìm kiếm theo tên ngành..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
        </div>
        <div className="pagination-info">
          <span className="admin-text-sm admin-text-gray-600">
            Hiển thị {majors.length} trên tổng số {totalElements} ngành
          </span>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngành</th>
                <th>Tên Ngành</th>
                <th>Điểm chuẩn</th>
                <th>Chỉ tiêu</th>
                <th>Năm</th>
                <th>Ghi chú</th>
                <th>Tổ hợp môn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {majors.map((major, idx) => (
                <tr key={major.id} className="table-row">
                  <td>{page * size + idx + 1}</td>
                  <td>{major.majorName}</td>
                  <td>{major.uniMajorName}</td>
                  <td>{major.score}</td>
                  <td>{major.quota}</td>
                  <td>{major.year}</td>
                  <td>{major.notes}</td>
                  <td>
                    {major.subjectCombinations && major.subjectCombinations.length > 0
                      ? major.subjectCombinations.map((sc) => sc.name).join(", ")
                      : "-"}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" onClick={() => handleView(major.id)} title="Xem chi tiết">
                        👁️
                      </button>
                      <button className="action-btn edit-btn" onClick={() => handleEdit(major.id)} title="Chỉnh sửa">
                        ✏️
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(major.id)} title="Xóa">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {majors.length === 0 && !loading && (
            <div className="empty-state">
              <h3>Không tìm thấy ngành</h3>
              <p>Thử tìm kiếm với từ khóa khác hoặc thêm ngành mới</p>
            </div>
          )}
        </div>
      )}
      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Trước
        </button>
        <div className="pagination-info">
          <span>
            Trang {page + 1} / {totalPages}
          </span>
        </div>
        <button
          className="pagination-btn"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Sau
        </button>
      </div>
      {/* Modal for Add/Edit */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{isEditing ? "Chỉnh sửa ngành" : "Thêm ngành mới"}</h2>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Mã ngành</label>
                <select
                  name="majorId"
                  value={form.majorId}
                  onChange={handleSelectChange}
                  required
                  disabled={isEditing}
                >
                  <option value="">-- Chọn mã ngành --</option>
                  {allMajors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
        
              <div className="form-group">
                <label>Tên ngành (trường)</label>
                <input name="universityMajorName" value={form.universityMajorName} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Điểm chuẩn</label>
                <input name="scores" type="number" value={form.scores} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Chỉ tiêu</label>
                <input name="quota" type="number" value={form.quota} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Năm</label>
                <input name="year" type="number" value={form.year} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea name="notes" value={form.notes} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Phương thức tuyển sinh</label>
                <select
                  name="admissionMethodIds"
                  value={form.admissionMethodIds.map(String)}
                  onChange={handleMultiSelectChange}
                  multiple
                  required
                >
                  {allAdmissionMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <div className="chip-list">
                  {form.admissionMethodIds.map((id) => {
                    const method = allAdmissionMethods.find((m) => m.id === id);
                    return method ? (
                      <span className="chip" key={id}>
                        {method.name}
                        <button type="button" className="chip-remove" onClick={() => handleRemoveFromMulti('admissionMethodIds', id)}>
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="form-group">
                <label>Tổ hợp môn</label>
                <select
                  name="subjectCombinationIds"
                  value={form.subjectCombinationIds.map(String)}
                  onChange={handleMultiSelectChange}
                  multiple
                  required
                >
                  {allSubjectCombinations.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
                <div className="chip-list">
                  {form.subjectCombinationIds.map((id) => {
                    const sc = allSubjectCombinations.find((s) => s.id === id);
                    return sc ? (
                      <span className="chip" key={id}>
                        {sc.name}
                        <button type="button" className="chip-remove" onClick={() => handleRemoveFromMulti('subjectCombinationIds', id)}>
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowFormModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                  {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for View */}
      {showDetailModal && selectedMajor && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Chi tiết ngành</h2>
            <div><b>Mã ngành:</b> {selectedMajor?.majorId}</div>
            <div><b>Tên ngành (trường):</b> {selectedMajor?.uniMajorName}</div>
            <div><b>Điểm chuẩn:</b> {selectedMajor?.score}</div>
            <div><b>Chỉ tiêu:</b> {selectedMajor?.quota}</div>
            <div><b>Năm:</b> {selectedMajor?.year}</div>
            <div><b>Ghi chú:</b> {selectedMajor?.notes}</div>
            <div><b>Tổ hợp môn:</b> {selectedMajor?.subjectCombinations && selectedMajor?.subjectCombinations.length > 0 ? selectedMajor?.subjectCombinations.map(sc => sc.name).join(", ") : "-"}</div>
            <div className="modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUniversityMajorPage; 