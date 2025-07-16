import React, { useEffect, useState } from "react";
import "../../css/AdminMajor.css";
import * as subjectCombinationApi from "../../api/subjectCombination";
import * as examSubjectApi from "../../api/examSubject";
import type {
  SubjectCombination,
  SubjectCombinationStatus,
  SubjectCombinationUpdateRequest,
  ExamSubject as ExamSubjectType,
} from "../../types/subjectCombination";

const defaultForm: {
  name: string;
  description: string;
  examSubjectIds: number[];
  status?: string;
} = {
  name: "",
  description: "",
  examSubjectIds: [],
  status: "ACTIVE",
};

const AdminSubjectCombination: React.FC = () => {
  const [combinations, setCombinations] = useState<SubjectCombination[]>([]);
  const [examSubjects, setExamSubjects] = useState<ExamSubjectType[]>([]);
  const [selectedCombination, setSelectedCombination] =
    useState<SubjectCombination | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<SubjectCombination | null>(null);
  // Pagination, search, sort
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [block, setBlock] = useState("");
  const [examSubject, setExamSubject] = useState("");
  const [sortField, setSortField] = useState<"id" | "name">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // Exam subject dropdown states
  const [examSubjectSearch, setExamSubjectSearch] = useState("");
  const [showExamSubjectDropdown, setShowExamSubjectDropdown] = useState(false);

  // Fetch combinations
  const fetchCombinations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await subjectCombinationApi.getSubjectCombinations({
        search,
        block,
        examSubject,
        page,
        size,
        sort: `${sortField},${sortOrder}`,
      });
      // Defensive: ensure items is always an array
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      setCombinations(items);
      setTotalPages(res.data.result.totalPages ?? 1);
      setTotalElements(res.data.result.totalElements ?? 0);
    } catch {
      setError("Không thể tải danh sách tổ hợp môn");
      setCombinations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exam subjects for dropdown
  const fetchExamSubjects = async () => {
    try {
      const res = await examSubjectApi.getExamSubjects({
        size: 100, // Get all subjects
      });
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      setExamSubjects(items);
    } catch {
      console.error("Không thể tải danh sách môn thi");
    }
  };

  useEffect(() => {
    fetchCombinations();
    fetchExamSubjects();
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
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filtered exam subjects based on search
  const filteredExamSubjects = examSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(examSubjectSearch.toLowerCase()) ||
      subject.shortName.toLowerCase().includes(examSubjectSearch.toLowerCase())
  );

  const handleExamSubjectToggle = (subjectId: number) => {
    setForm((prev) => ({
      ...prev,
      examSubjectIds: prev.examSubjectIds.includes(subjectId)
        ? prev.examSubjectIds.filter((id) => id !== subjectId)
        : [...prev.examSubjectIds, subjectId],
    }));
  };

  const handleExamSubjectRemove = (subjectId: number) => {
    setForm((prev) => ({
      ...prev,
      examSubjectIds: prev.examSubjectIds.filter((id) => id !== subjectId),
    }));
  };

  const getSelectedSubjects = () => {
    return examSubjects.filter((subject) =>
      form.examSubjectIds.includes(subject.id)
    );
  };

  const handleAdd = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setShowFormModal(true);
    setSelectedCombination(null);
  };

  const handleEdit = (combination: SubjectCombination) => {
    setSelectedCombination(combination);
    setForm({
      name: combination.name,
      description: combination.description,
      examSubjectIds: combination.examSubjects.map((subject) => subject.id),
      status: combination.status,
    });
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleViewDetail = (combination: SubjectCombination) => {
    setViewDetail(combination);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tổ hợp môn "${name}"?`)) return;
    setLoading(true);
    try {
      await subjectCombinationApi.deleteSubjectCombination(id);
      setSuccess("Xóa tổ hợp môn thành công");
      fetchCombinations();
    } catch {
      setError("Xóa tổ hợp môn thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiData: SubjectCombinationUpdateRequest = {
        name: form.name,
        description: form.description,
        examSubjectIds: form.examSubjectIds,
        status: (form.status as SubjectCombinationStatus) || undefined,
      };
      if (!isEditing) delete apiData.status;
      if (isEditing && selectedCombination) {
        await subjectCombinationApi.updateSubjectCombination(
          selectedCombination.id,
          apiData
        );
        setSuccess("Cập nhật tổ hợp môn thành công");
      } else {
        await subjectCombinationApi.createSubjectCombination(apiData);
        setSuccess("Thêm tổ hợp môn mới thành công");
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedCombination(null);
      setShowFormModal(false);
      fetchCombinations();
    } catch {
      setError(
        isEditing ? "Cập nhật tổ hợp môn thất bại" : "Thêm tổ hợp môn thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowFormModal(false);
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedCombination(null);
  };

  // Search handlers
  const handleSearch = () => {
    // Parse searchInput: nếu chỉ 1 từ => search theo tên tổ hợp môn
    // Nếu nhiều từ: từ đầu là block (A, B, C, D...), còn lại là examSubject
    let s = "";
    let b = "";
    let e = "";
    const parts = searchInput.trim().split(/\s+/);
    if (parts.length === 1) {
      s = parts[0];
    } else if (parts.length > 1) {
      // Nếu từ đầu là 1 ký tự hoặc A, B, C, D... thì là block
      if (/^[A-Z]$/.test(parts[0])) {
        b = parts[0];
        e = parts.slice(1).join(" ");
      } else {
        // Nếu không, search toàn bộ chuỗi
        s = searchInput;
      }
    }
    setSearch(s);
    setBlock(b);
    setExamSubject(e);
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
            Quản lý tổ hợp môn
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các tổ hợp môn trong hệ thống
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
          Thêm tổ hợp môn
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-controls">
          <div
            className="search-input-group"
            style={{ gap: 8, display: "flex", flexWrap: "wrap" }}
          >
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
              placeholder="Tìm kiếm tổ hợp môn, khối hoặc môn thi. VD: 'A Toán' hoặc 'A00' hoặc 'Toán'"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ minWidth: 260 }}
            />
            <button className="search-btn" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
        </div>
        <div className="pagination-info">
          <span className="admin-text-sm admin-text-gray-600">
            Hiển thị {Array.isArray(combinations) ? combinations.length : 0}{" "}
            trên tổng số {totalElements} tổ hợp môn
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tổng số tổ hợp môn</h3>
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
                      STT
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
                      Tên tổ hợp môn
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
                  <th>Mô tả</th>
                  <th>Môn thi</th>
                  <th>Khối</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {combinations.map((c, idx) => (
                  <tr key={c.id} className="table-row">
                    <td>{page * size + idx + 1}</td>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td>
                      <div className="subject-tags">
                        {c.examSubjects.map((subject) => (
                          <span key={subject.id} className="subject-tag">
                            {subject.shortName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{c.block ? c.block.name : "Không thuộc khối nào"}</td>
                    <td>
                      <span
                        className={`status-badge ${c.status?.toLowerCase()}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetail(c)}
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
                          onClick={() => handleEdit(c)}
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
                          onClick={() => handleDelete(c.id, c.name)}
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
            {combinations.length === 0 && !loading && (
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
                <h3>Không tìm thấy tổ hợp môn</h3>
                <p>Thử thêm tổ hợp môn mới</p>
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
                {isEditing ? "Chỉnh sửa tổ hợp môn" : "Thêm tổ hợp môn mới"}
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
                    Tên tổ hợp môn <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: A00, A01, B00"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="admin-label">Mô tả</label>
                  <textarea
                    className="admin-input"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả về tổ hợp môn"
                    rows={3}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="admin-label">
                    Môn thi <span className="required">*</span>
                  </label>

                  {/* Selected subjects display */}
                  {getSelectedSubjects().length > 0 && (
                    <div className="selected-subjects">
                      {getSelectedSubjects().map((subject) => (
                        <span key={subject.id} className="selected-subject-tag">
                          {subject.name} ({subject.shortName})
                          <button
                            type="button"
                            className="remove-subject-btn"
                            onClick={() => handleExamSubjectRemove(subject.id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Searchable dropdown */}
                  <div className="searchable-dropdown">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Tìm kiếm môn thi..."
                      value={examSubjectSearch}
                      onChange={(e) => setExamSubjectSearch(e.target.value)}
                      onFocus={() => setShowExamSubjectDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowExamSubjectDropdown(false), 200)
                      }
                    />

                    {showExamSubjectDropdown && (
                      <div className="dropdown-options">
                        {filteredExamSubjects.length > 0 ? (
                          filteredExamSubjects.map((subject) => (
                            <div
                              key={subject.id}
                              className={`dropdown-option ${
                                form.examSubjectIds.includes(subject.id)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleExamSubjectToggle(subject.id)
                              }
                            >
                              <span className="option-text">
                                {subject.name} ({subject.shortName})
                              </span>
                              {form.examSubjectIds.includes(subject.id) && (
                                <span className="checkmark">✓</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="dropdown-option no-results">
                            Không tìm thấy môn thi
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <small className="form-help">
                    Gõ để tìm kiếm và click để chọn/bỏ chọn môn thi
                  </small>
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
                Chi tiết tổ hợp môn
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
                <div className="detail-item full-width">
                  <label>Mô tả:</label>
                  <span>{viewDetail.description || "Chưa có mô tả"}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Môn thi:</label>
                  <div className="subject-tags">
                    {viewDetail.examSubjects.map((subject) => (
                      <span key={subject.id} className="subject-tag">
                        {subject.name} ({subject.shortName})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Khối:</label>
                  <span>
                    {viewDetail.block
                      ? viewDetail.block.name
                      : "Không thuộc khối nào"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectCombination;
