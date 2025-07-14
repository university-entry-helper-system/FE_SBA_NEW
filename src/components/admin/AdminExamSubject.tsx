import React, { useEffect, useState } from "react";
import "../../css/AdminMajor.css";
import * as examSubjectApi from "../../api/examSubject";
import type {
  ExamSubject,
  ExamSubjectStatus,
  ExamSubjectUpdateRequest,
} from "../../types/examSubject";

const defaultForm: {
  name: string;
  shortName: string;
  status?: string;
} = {
  name: "",
  shortName: "",
  status: "ACTIVE",
};

const AdminExamSubject: React.FC = () => {
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<ExamSubject | null>(
    null
  );
  const [form, setForm] = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<ExamSubject | null>(null);
  // Pagination, search, sort
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<"id" | "name" | "shortName">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch subjects
  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await examSubjectApi.getExamSubjects({
        search,
        page,
        size,
        sort: `${sortField},${sortOrder}`,
      });
      // Defensive: ensure items is always an array
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      setSubjects(items);
      setTotalPages(res.data.result.totalPages ?? 1);
      setTotalElements(res.data.result.totalElements ?? 0);
    } catch {
      setError("Không thể tải danh sách môn thi");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line
  }, [page, search, sortField, sortOrder]);

  // Auto clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Form handlers
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setShowFormModal(true);
    setSelectedSubject(null);
  };

  const handleEdit = (subject: ExamSubject) => {
    setSelectedSubject(subject);
    setForm({
      name: subject.name,
      shortName: subject.shortName,
      status: subject.status,
    });
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleViewDetail = (subject: ExamSubject) => {
    setViewDetail(subject);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa môn thi "${name}"?`)) return;
    setLoading(true);
    try {
      await examSubjectApi.deleteExamSubject(id);
      setSuccess("Xóa môn thi thành công");
      fetchSubjects();
    } catch {
      setError("Xóa môn thi thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiData: ExamSubjectUpdateRequest = {
        name: form.name,
        shortName: form.shortName,
        status: (form.status as ExamSubjectStatus) || undefined,
      };
      if (!isEditing) delete apiData.status;
      if (isEditing && selectedSubject) {
        await examSubjectApi.updateExamSubject(selectedSubject.id, apiData);
        setSuccess("Cập nhật môn thi thành công");
      } else {
        await examSubjectApi.createExamSubject(apiData);
        setSuccess("Thêm môn thi mới thành công");
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedSubject(null);
      setShowFormModal(false);
      fetchSubjects();
    } catch {
      setError(
        isEditing ? "Cập nhật môn thi thất bại" : "Thêm môn thi thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowFormModal(false);
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedSubject(null);
  };

  // Search handlers
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý môn thi
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các môn thi trong hệ thống
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary add-btn"
          onClick={handleAdd}
        >
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Thêm môn thi
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-controls">
          <div className="search-input-group">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35"
              />
            </svg>
            <input
              className="search-input"
              placeholder="Tìm kiếm theo tên môn thi..."
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
            Hiển thị {Array.isArray(subjects) ? subjects.length : 0} trên tổng
            số {totalElements} môn thi
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <svg
            className="alert-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <svg
            className="alert-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon universities-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tổng số môn thi</h3>
            <p className="stat-number">{totalElements}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
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
                  <th>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      ID
                      <button
                        className="sort-th-btn"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          marginLeft: 2,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          if (sortField === "id") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("id");
                            setSortOrder("asc");
                          }
                        }}
                        title="Sắp xếp theo ID"
                      >
                        {sortField === "id" ? (
                          sortOrder === "asc" ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 15l6-6 6 6" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 9l-6 6-6-6" />
                            </svg>
                          )
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ opacity: 0.3 }}
                          >
                            <path d="M6 15l6-6 6 6" />
                          </svg>
                        )}
                      </button>
                    </span>
                  </th>
                  <th>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Tên môn thi
                      <button
                        className="sort-th-btn"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          marginLeft: 2,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          if (sortField === "name") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("name");
                            setSortOrder("asc");
                          }
                        }}
                        title="Sắp xếp theo tên"
                      >
                        {sortField === "name" ? (
                          sortOrder === "asc" ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 15l6-6 6 6" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 9l-6 6-6-6" />
                            </svg>
                          )
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ opacity: 0.3 }}
                          >
                            <path d="M6 15l6-6 6 6" />
                          </svg>
                        )}
                      </button>
                    </span>
                  </th>
                  <th>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Tên viết tắt
                      <button
                        className="sort-th-btn"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          marginLeft: 2,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          if (sortField === "shortName") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("shortName");
                            setSortOrder("asc");
                          }
                        }}
                        title="Sắp xếp theo tên viết tắt"
                      >
                        {sortField === "shortName" ? (
                          sortOrder === "asc" ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 15l6-6 6 6" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 9l-6 6-6-6" />
                            </svg>
                          )
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ opacity: 0.3 }}
                          >
                            <path d="M6 15l6-6 6 6" />
                          </svg>
                        )}
                      </button>
                    </span>
                  </th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.shortName}</td>
                    <td>
                      <span
                        className={`status-badge ${s.status?.toLowerCase()}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetail(s)}
                          title="Xem chi tiết"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(s)}
                          title="Chỉnh sửa"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(s.id, s.name)}
                          title="Xóa"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3,6 5,6 21,6" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                            />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subjects.length === 0 && !loading && (
              <div className="empty-state">
                <svg
                  className="empty-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35"
                  />
                </svg>
                <h3>Không tìm thấy môn thi</h3>
                <p>Thử thêm môn thi mới</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6" />
            </svg>
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="admin-text-xl admin-font-semibold">
                {isEditing ? "Chỉnh sửa môn thi" : "Thêm môn thi mới"}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="admin-label">
                    Tên môn thi <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Toán học"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="admin-label">
                    Tên viết tắt <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="shortName"
                    value={form.shortName}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Toán"
                    required
                  />
                </div>
                {isEditing && (
                  <div className="form-group full-width">
                    <label className="admin-label">Trạng thái</label>
                    <select
                      className="admin-input"
                      name="status"
                      value={form.status || "ACTIVE"}
                      onChange={handleInputChange}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DELETED">DELETED</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Đang xử lý...
                    </>
                  ) : isEditing ? (
                    "Cập nhật"
                  ) : (
                    "Thêm mới"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewDetail && (
        <div className="modal-overlay" onClick={() => setViewDetail(null)}>
          <div
            className="modal-content detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="admin-text-xl admin-font-semibold">
                Chi tiết môn thi
              </h2>
              <button
                className="modal-close"
                onClick={() => setViewDetail(null)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-header">
                <div className="detail-title">
                  <h3 className="admin-text-lg admin-font-semibold">
                    {viewDetail.name}
                  </h3>
                  <span className="admin-badge admin-badge-info">
                    {viewDetail.shortName}
                  </span>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{viewDetail.id}</span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  <span
                    className={`status-badge ${viewDetail.status?.toLowerCase()}`}
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {viewDetail.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Tên viết tắt:</label>
                  <span>{viewDetail.shortName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamSubject;
