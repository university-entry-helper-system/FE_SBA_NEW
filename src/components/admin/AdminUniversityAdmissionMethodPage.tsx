import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAllUniversityAdmissionMethods,
  createUniversityAdmissionMethod,
  updateUniversityAdmissionMethod,
  deleteUniversityAdmissionMethod,
  getUniversityAdmissionMethod,
} from "../../api/universityAdmissionMethod";
import { getAdmissionMethods } from "../../api/admissionMethod";
import type { UniversityAdmissionMethod } from "../../types/universityAdmissionMethod";
import type { AdmissionMethod } from "../../types/admissionMethod";
import "../../css/AdminUniversities.css";

const defaultForm: UniversityAdmissionMethod = {
  universityId: 0,
  admissionMethodId: 0,
  year: new Date().getFullYear(),
  notes: "",
  conditions: "",
  regulations: "",
  admissionTime: "",
};

interface UniversityAdmissionMethodItem {
  id: number;
  universityId: number;
  universityName: string;
  admissionMethodId: number;
  admissionMethodName: string;
  year: number;
  notes: string;
  conditions: string;
  regulations: string;
  admissionTime: string;
}

const AdminUniversityAdmissionMethodPage: React.FC = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const [methods, setMethods] = useState<UniversityAdmissionMethodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UniversityAdmissionMethod>(defaultForm);
  const [selectedMethod, setSelectedMethod] = useState<UniversityAdmissionMethod | null>(null);
  const [allAdmissionMethods, setAllAdmissionMethods] = useState<AdmissionMethod[]>([]);
  const [success, setSuccess] = useState("");

  const fetchMethods = async () => {
    if (!universityId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAllUniversityAdmissionMethods({
        universityId: Number(universityId),
        page,
        size,
      });
      const result = res.data.result;
      setMethods(result.items || []);
      setTotalPages(result.totalPages || 1);
      setTotalElements(result.totalElements || 0);
    } catch {
      setError("Không thể tải danh sách phương thức tuyển sinh");
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all admission methods when form modal opens
  useEffect(() => {
    if (showFormModal) {
      getAdmissionMethods({ page: 0, size: 100 }).then(res => {
        setAllAdmissionMethods(res.data.result?.items || res.data.items || res.data || []);
      });
    }
  }, [showFormModal]);

  useEffect(() => {
    fetchMethods();
    // eslint-disable-next-line
  }, [universityId, page]);

  const handleAdd = () => {
    setForm({ ...defaultForm, universityId: Number(universityId) });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await getUniversityAdmissionMethod(id);
      const data = res.data.result || res.data;
      setForm({
        universityId: data.universityId,
        admissionMethodId: data.admissionMethodId,
        year: data.year,
        notes: data.notes,
        conditions: data.conditions,
        regulations: data.regulations,
        admissionTime: data.admissionTime,
      });
      setIsEditing(true);
      setShowFormModal(true);
    } catch {
      setError("Không thể lấy thông tin phương thức");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id: number) => {
    setLoading(true);
    try {
      const res = await getUniversityAdmissionMethod(id);
      setSelectedMethod(res.data.result || res.data);
      setShowDetailModal(true);
    } catch {
      setError("Không thể lấy thông tin phương thức");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa phương thức này?")) return;
    setLoading(true);
    try {
      await deleteUniversityAdmissionMethod(id);
      setSuccess("Xóa phương thức thành công");
      fetchMethods();
    } catch {
      setError("Xóa phương thức thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateUniversityAdmissionMethod(form.admissionMethodId, form);
        setSuccess("Cập nhật phương thức thành công");
      } else {
        await createUniversityAdmissionMethod(form);
        setSuccess("Thêm phương thức mới thành công");
      }
      setShowFormModal(false);
      fetchMethods();
    } catch {
      setError(isEditing ? "Cập nhật phương thức thất bại" : "Thêm phương thức thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý phương thức tuyển sinh của trường #{universityId}
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý các phương thức tuyển sinh của trường đại học này
          </p>
        </div>
        <button className="admin-btn admin-btn-primary add-btn" onClick={handleAdd}>
          + Thêm phương thức mới
        </button>
      </div>
      <div className="pagination-info" style={{ marginBottom: 16 }}>
        <span className="admin-text-sm admin-text-gray-600">
          Hiển thị {methods.length} trên tổng số {totalElements} phương thức
        </span>
      </div>
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
                <th>Tên phương thức</th>
                <th>Năm</th>
                <th>Ghi chú</th>
                <th>Điều kiện</th>
                <th>Quy chế</th>
                <th>Thời gian tuyển sinh</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method, idx) => (
                <tr key={method.id} className="table-row">
                  <td>{page * size + idx + 1}</td>
                  <td>{method.admissionMethodName}</td>
                  <td>{method.year}</td>
                  <td>{method.notes}</td>
                  <td>{method.conditions}</td>
                  <td>{method.regulations}</td>
                  <td>{method.admissionTime}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" onClick={() => handleView(method.id)} title="Xem chi tiết">
                        👁️
                      </button>
                      <button className="action-btn edit-btn" onClick={() => handleEdit(method.id)} title="Chỉnh sửa">
                        ✏️
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(method.id)} title="Xóa">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {methods.length === 0 && !loading && (
            <div className="empty-state">
              <h3>Không tìm thấy phương thức tuyển sinh</h3>
              <p>Thử tìm kiếm với từ khóa khác hoặc thêm phương thức mới</p>
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
            <h2>{isEditing ? "Chỉnh sửa phương thức" : "Thêm phương thức mới"}</h2>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Phương thức</label>
                <select
                  name="admissionMethodId"
                  value={form.admissionMethodId}
                  onChange={handleFormChange}
                  required
                  disabled={isEditing}
                >
                  <option value="">-- Chọn phương thức --</option>
                  {allAdmissionMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
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
                <label>Điều kiện</label>
                <textarea name="conditions" value={form.conditions} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Quy chế</label>
                <textarea name="regulations" value={form.regulations} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Thời gian tuyển sinh</label>
                <input name="admissionTime" value={form.admissionTime} onChange={handleFormChange} />
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
      {showDetailModal && selectedMethod && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Chi tiết phương thức</h2>
            <div><b>Phương thức:</b> {allAdmissionMethods.find(m => m.id === selectedMethod.admissionMethodId)?.name || selectedMethod.admissionMethodId}</div>
            <div><b>Năm:</b> {selectedMethod.year}</div>
            <div><b>Ghi chú:</b> {selectedMethod.notes}</div>
            <div><b>Điều kiện:</b> {selectedMethod.conditions}</div>
            <div><b>Quy chế:</b> {selectedMethod.regulations}</div>
            <div><b>Thời gian tuyển sinh:</b> {selectedMethod.admissionTime}</div>
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

export default AdminUniversityAdmissionMethodPage; 