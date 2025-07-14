import React, { useEffect, useState } from "react";
import "../../css/AdminMajor.css";
import * as blockApi from "../../api/block";
import * as subjectCombinationApi from "../../api/subjectCombination";
import type { Block, BlockStatus, BlockUpdateRequest } from "../../types/block";
import type { SubjectCombination } from "../../types/subjectCombination";

const defaultForm: {
  name: string;
  description: string;
  subjectCombinationIds: number[];
  status?: string;
} = {
  name: "",
  description: "",
  subjectCombinationIds: [],
  status: "ACTIVE",
};

const AdminBlock: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [subjectCombinations, setSubjectCombinations] = useState<
    SubjectCombination[]
  >([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<Block | null>(null);
  // Pagination, search, sort
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<"id" | "name">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // Subject combination dropdown states
  const [subjectCombinationSearch, setSubjectCombinationSearch] = useState("");
  const [showSubjectCombinationDropdown, setShowSubjectCombinationDropdown] =
    useState(false);

  // Fetch blocks
  const fetchBlocks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await blockApi.getBlocks({
        search,
        page,
        size,
        sort: `${sortField},${sortOrder}`,
      });
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      setBlocks(items);
      setTotalPages(res.data.result.totalPages ?? 1);
      setTotalElements(res.data.result.totalElements ?? 0);
    } catch {
      setError("Không thể tải danh sách khối");
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subject combinations for dropdown
  const fetchSubjectCombinations = async () => {
    try {
      const res = await subjectCombinationApi.getSubjectCombinations({
        size: 100,
      });
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      setSubjectCombinations(items);
    } catch {
      console.error("Không thể tải danh sách tổ hợp môn");
    }
  };

  useEffect(() => {
    fetchBlocks();
    fetchSubjectCombinations();
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

  // Helper: get first letter for block filter
  const getBlockPrefix = () => {
    // Remove 'Khối ' prefix if present, trim, and get first letter
    const name = form.name.trim();
    let prefix = name;
    if (name.toLowerCase().startsWith("khối ")) {
      prefix = name.slice(5).trim();
    }
    return prefix.charAt(0).toUpperCase();
  };

  // Filtered subject combinations based on block prefix and search
  const filteredSubjectCombinations = subjectCombinations.filter((combo) => {
    const blockPrefix = getBlockPrefix();
    const matchesPrefix = combo.name.toUpperCase().startsWith(blockPrefix);
    const matchesSearch =
      combo.name
        .toLowerCase()
        .includes(subjectCombinationSearch.toLowerCase()) ||
      combo.description
        .toLowerCase()
        .includes(subjectCombinationSearch.toLowerCase());
    return matchesPrefix && matchesSearch;
  });

  const handleSubjectCombinationToggle = (comboId: number) => {
    setForm((prev) => ({
      ...prev,
      subjectCombinationIds: prev.subjectCombinationIds.includes(comboId)
        ? prev.subjectCombinationIds.filter((id) => id !== comboId)
        : [...prev.subjectCombinationIds, comboId],
    }));
  };

  const handleSubjectCombinationRemove = (comboId: number) => {
    setForm((prev) => ({
      ...prev,
      subjectCombinationIds: prev.subjectCombinationIds.filter(
        (id) => id !== comboId
      ),
    }));
  };

  const getSelectedCombinations = () => {
    return subjectCombinations.filter((combo) =>
      form.subjectCombinationIds.includes(combo.id)
    );
  };

  const handleAdd = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setShowFormModal(true);
    setSelectedBlock(null);
  };

  const handleEdit = (block: Block) => {
    setSelectedBlock(block);
    setForm({
      name: block.name,
      description: block.description,
      subjectCombinationIds: block.subjectCombinations.map((combo) => combo.id),
      status: block.status,
    });
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleViewDetail = (block: Block) => {
    setViewDetail(block);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khối "${name}"?`)) return;
    setLoading(true);
    try {
      await blockApi.deleteBlock(id);
      setSuccess("Xóa khối thành công");
      fetchBlocks();
    } catch {
      setError("Xóa khối thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiData: BlockUpdateRequest = {
        name: form.name,
        description: form.description,
        subjectCombinationIds: form.subjectCombinationIds,
        status: (form.status as BlockStatus) || undefined,
      };
      if (!isEditing) delete apiData.status;
      if (isEditing && selectedBlock) {
        await blockApi.updateBlock(selectedBlock.id, apiData);
        setSuccess("Cập nhật khối thành công");
      } else {
        await blockApi.createBlock(apiData);
        setSuccess("Thêm khối mới thành công");
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedBlock(null);
      setShowFormModal(false);
      fetchBlocks();
    } catch {
      setError(isEditing ? "Cập nhật khối thất bại" : "Thêm khối thất bại");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowFormModal(false);
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedBlock(null);
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
            Quản lý khối
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các khối trong hệ thống
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
          Thêm khối
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
              placeholder="Tìm kiếm theo tên khối..."
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
            Hiển thị {Array.isArray(blocks) ? blocks.length : 0} trên tổng số{" "}
            {totalElements} khối
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
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tổng số khối</h3>
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
                      Tên khối
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
                  <th>Tổ hợp môn</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b) => (
                  <tr key={b.id} className="table-row">
                    <td>{b.id}</td>
                    <td>{b.name}</td>
                    <td>{b.description}</td>
                    <td>
                      <div className="subject-tags">
                        {b.subjectCombinations.map((combo) => (
                          <span key={combo.id} className="subject-tag">
                            {combo.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${b.status?.toLowerCase()}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetail(b)}
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
                          onClick={() => handleEdit(b)}
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
                          onClick={() => handleDelete(b.id, b.name)}
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
            {blocks.length === 0 && !loading && (
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
                <h3>Không tìm thấy khối</h3>
                <p>Thử thêm khối mới</p>
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
                {isEditing ? "Chỉnh sửa khối" : "Thêm khối mới"}
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
                    Tên khối <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Khối A, Khối D"
                    maxLength={50}
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
                    placeholder="Mô tả về khối"
                    rows={3}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="admin-label">Tổ hợp môn</label>
                  {/* Selected subject combinations display */}
                  {getSelectedCombinations().length > 0 && (
                    <div className="selected-subjects">
                      {getSelectedCombinations().map((combo) => (
                        <span key={combo.id} className="selected-subject-tag">
                          {combo.name} - {combo.description}
                          <button
                            type="button"
                            className="remove-subject-btn"
                            onClick={() =>
                              handleSubjectCombinationRemove(combo.id)
                            }
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
                      placeholder="Tìm kiếm tổ hợp môn..."
                      value={subjectCombinationSearch}
                      onChange={(e) =>
                        setSubjectCombinationSearch(e.target.value)
                      }
                      onFocus={() => setShowSubjectCombinationDropdown(true)}
                      onBlur={() =>
                        setTimeout(
                          () => setShowSubjectCombinationDropdown(false),
                          200
                        )
                      }
                    />
                    {showSubjectCombinationDropdown && (
                      <div className="dropdown-options">
                        {filteredSubjectCombinations.length > 0 ? (
                          filteredSubjectCombinations.map((combo) => (
                            <div
                              key={combo.id}
                              className={`dropdown-option ${
                                form.subjectCombinationIds.includes(combo.id)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleSubjectCombinationToggle(combo.id)
                              }
                            >
                              <span className="option-text">
                                {combo.name} - {combo.description}
                              </span>
                              {form.subjectCombinationIds.includes(
                                combo.id
                              ) && <span className="checkmark">✓</span>}
                            </div>
                          ))
                        ) : (
                          <div className="dropdown-option no-results">
                            Không tìm thấy tổ hợp môn
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <small className="form-help">
                    Gõ để tìm kiếm và click để chọn/bỏ chọn tổ hợp môn
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
                      <option value="INACTIVE">INACTIVE</option>
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
                Chi tiết khối
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
                  <label>Tổ hợp môn:</label>
                  <div className="subject-tags">
                    {viewDetail.subjectCombinations.map((combo) => (
                      <span key={combo.id} className="subject-tag">
                        {combo.name} - {combo.description}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlock;
