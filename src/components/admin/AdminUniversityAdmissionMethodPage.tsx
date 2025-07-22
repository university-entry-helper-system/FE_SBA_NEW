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

interface FormData extends Omit<UniversityAdmissionMethod, 'admissionTime'> {
  admissionTime: string;
  fromDate: string;
  toDate: string;
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
  const [form, setForm] = useState<FormData>({
    ...defaultForm,
    fromDate: "",
    toDate: ""
  });
  const [selectedMethod, setSelectedMethod] = useState<UniversityAdmissionMethod | null>(null);
  const [allAdmissionMethods, setAllAdmissionMethods] = useState<AdmissionMethod[]>([]);
  const [success, setSuccess] = useState("");

  // Helper function to parse admissionTime string to fromDate and toDate
  const parseAdmissionTime = (admissionTime: string): { fromDate: string; toDate: string } => {
    if (!admissionTime) return { fromDate: "", toDate: "" };
    
    // Try to parse different formats like "DD/MM/YYYY - DD/MM/YYYY" or "DD/MM/YYYY đến DD/MM/YYYY"
    const patterns = [
      /^(.+?)\s*-\s*(.+?)$/,
      /^(.+?)\s*đến\s*(.+?)$/,
      /^(.+?)\s*to\s*(.+?)$/,
    ];
    
    for (const pattern of patterns) {
      const match = admissionTime.match(pattern);
      if (match) {
        const [, from, to] = match;
        // Try to convert to ISO format if possible
        const fromDate = convertToISODate(from.trim());
        const toDate = convertToISODate(to.trim());
        return { fromDate, toDate };
      }
    }
    
    return { fromDate: "", toDate: "" };
  };

  // Helper function to convert date string to ISO format for datetime-local input
  const convertToISODate = (dateStr: string): string => {
    if (!dateStr) return "";
    
    try {
      // Try parsing DD/MM/YYYY format
      const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00`;
      }
      
      // Try parsing other formats or return as is if already in ISO format
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 16);
      }
    } catch (e) {
      console.warn("Could not parse date:", dateStr);
    }
    
    return "";
  };

  // Helper function to format datetime-local input to display string
  const formatDateTimeToString = (fromDate: string, toDate: string): string => {
    if (!fromDate && !toDate) return "";
    
    const formatDate = (isoDate: string): string => {
      if (!isoDate) return "";
      try {
        const date = new Date(isoDate);
        return date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit", 
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch (e) {
        return isoDate;
      }
    };

    const formattedFrom = formatDate(fromDate);
    const formattedTo = formatDate(toDate);
    
    if (formattedFrom && formattedTo) {
      return `${formattedFrom} đến ${formattedTo}`;
    } else if (formattedFrom) {
      return `Từ ${formattedFrom}`;
    } else if (formattedTo) {
      return `Đến ${formattedTo}`;
    }
    
    return "";
  };

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
    setForm({ 
      ...defaultForm, 
      universityId: Number(universityId),
      fromDate: "",
      toDate: ""
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await getUniversityAdmissionMethod(id);
      const data = res.data.result || res.data;
      const { fromDate, toDate } = parseAdmissionTime(data.admissionTime);
      
      setForm({
        universityId: data.universityId,
        admissionMethodId: data.admissionMethodId,
        year: data.year,
        notes: data.notes,
        conditions: data.conditions,
        regulations: data.regulations,
        admissionTime: data.admissionTime,
        fromDate,
        toDate,
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
    setError(""); // Clear previous errors
    
    // Validate date range
    if (form.fromDate && form.toDate) {
      const fromDateTime = new Date(form.fromDate);
      const toDateTime = new Date(form.toDate);
      
      if (toDateTime <= fromDateTime) {
        setError("Ngày kết thúc phải lớn hơn ngày bắt đầu");
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Convert fromDate and toDate to admissionTime string
      const admissionTimeString = formatDateTimeToString(form.fromDate, form.toDate);
      
      const submitData: UniversityAdmissionMethod = {
        universityId: form.universityId,
        admissionMethodId: form.admissionMethodId,
        year: form.year,
        notes: form.notes,
        conditions: form.conditions,
        regulations: form.regulations,
        admissionTime: admissionTimeString,
      };

      if (isEditing) {
        await updateUniversityAdmissionMethod(form.admissionMethodId, submitData);
        setSuccess("Cập nhật phương thức thành công");
      } else {
        await createUniversityAdmissionMethod(submitData);
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
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div className="success-message" style={{ color: 'green', marginBottom: 16 }}>
          {success}
        </div>
      )}
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
              {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: 16, padding: '8px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
                  {error}
                </div>
              )}
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
                <label>Từ ngày</label>
                <input 
                  name="fromDate" 
                  type="datetime-local" 
                  value={form.fromDate} 
                  onChange={handleFormChange} 
                />
              </div>
              <div className="form-group">
                <label>Đến ngày</label>
                <input 
                  name="toDate" 
                  type="datetime-local" 
                  value={form.toDate} 
                  onChange={handleFormChange}
                  min={form.fromDate || undefined}
                />
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