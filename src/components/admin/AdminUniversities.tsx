import React, { useEffect, useState } from "react";
import "../../css/AdminUniversities.css";
import * as universityApi from "../../api/university";
import type {
  UniversityListItem,
  University,
  UniversityCreateRequest,
} from "../../types/university";

const defaultForm: UniversityCreateRequest = {
  categoryId: 0,
  name: "",
  shortName: "",
  logoUrl: "",
  foundingYear: new Date().getFullYear(),
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
  // State management
  const [universities, setUniversities] = useState<UniversityListItem[]>([]);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [form, setForm] = useState<UniversityCreateRequest>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [viewDetail, setViewDetail] = useState<University | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<"province" | "name" | "shortName">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch universities
  const fetchUniversities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await universityApi.getUniversities({
        page,
        search,
        size: 10,
      });
      setUniversities(res.data.result.items);
      setTotalPages(res.data.result.totalPages);
      setTotalElements(res.data.result.totalElements);
    } catch (err) {
      setError("Không thể tải danh sách trường đại học");
      setUniversities([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [page, search]);

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

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Tên trường là bắt buộc";
    }

    if (!form.shortName.trim()) {
      errors.shortName = "Tên viết tắt là bắt buộc";
    }

    if (form.categoryId <= 0) {
      errors.categoryId = "Vui lòng chọn danh mục";
    }

    if (form.provinceId <= 0) {
      errors.provinceId = "Vui lòng chọn tỉnh/thành";
    }

    if (
      form.foundingYear < 1900 ||
      form.foundingYear > new Date().getFullYear()
    ) {
      errors.foundingYear = `Năm thành lập phải từ 1900 đến ${new Date().getFullYear()}`;
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (form.website && !form.website.startsWith("http")) {
      errors.website = "Website phải bắt đầu bằng http:// hoặc https://";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Search functionality
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // CRUD operations
  const handleAdd = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await universityApi.getUniversityDetail(id);
      const university = res.data.result;
      setSelectedUniversity(university);
      setForm({
        categoryId: university.category.id,
        name: university.name,
        shortName: university.shortName,
        logoUrl: university.logoUrl,
        foundingYear: university.foundingYear,
        provinceId: university.province.id,
        type: university.category?.name || "",
        address: university.address,
        email: university.email,
        phone: university.phone,
        website: university.website,
        description: university.description,
        admissionMethodIds: [],
      });
      setIsEditing(true);
      setFormErrors({});
      setShowFormModal(true);
    } catch (err) {
      setError("Không thể lấy chi tiết trường");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa trường "${name}"?`)) return;

    setLoading(true);
    try {
      await universityApi.deleteUniversity(id);
      setSuccess("Xóa trường thành công");
      fetchUniversities();
    } catch (err) {
      setError("Xóa trường thất bại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing && selectedUniversity) {
        await universityApi.updateUniversity(selectedUniversity.id, form);
        setSuccess("Cập nhật trường thành công");
      } else {
        await universityApi.createUniversity(form);
        setSuccess("Thêm trường mới thành công");
      }

      setForm(defaultForm);
      setIsEditing(false);
      setSelectedUniversity(null);
      setShowFormModal(false);
      setFormErrors({});
      fetchUniversities();
    } catch (err) {
      setError(isEditing ? "Cập nhật trường thất bại" : "Thêm trường thất bại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await universityApi.getUniversityDetail(id);
      setViewDetail(res.data.result);
    } catch (err) {
      setError("Không thể lấy chi tiết trường");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowFormModal(false);
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedUniversity(null);
    setFormErrors({});
  };

  const filteredUniversities = universities
    .filter((u) => {
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        return (
          u.name.toLowerCase().includes(s) ||
          u.shortName.toLowerCase().includes(s) ||
          (u.province?.name?.toLowerCase().includes(s) ?? false)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let vA = "",
        vB = "";
      if (sortField === "province") {
        vA = a.province?.name || "";
        vB = b.province?.name || "";
      } else if (sortField === "name") {
        vA = a.name;
        vB = b.name;
      } else if (sortField === "shortName") {
        vA = a.shortName;
        vB = b.shortName;
      }
      if (sortOrder === "asc")
        return vA.localeCompare(vB, "vi", { sensitivity: "base" });
      return vB.localeCompare(vA, "vi", { sensitivity: "base" });
    });

  return (
    <div className="admin-universities">
      {/* Header */}
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý trường đại học
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các trường đại học trong hệ thống
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
          Thêm trường mới
        </button>
      </div>

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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tổng số trường</h3>
            <p className="stat-number">{totalElements}</p>
          </div>
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
              placeholder="Tìm kiếm theo tên trường..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="pagination-info">
          <span className="admin-text-sm admin-text-gray-600">
            Hiển thị {universities.length} trên tổng số {totalElements} trường
          </span>
        </div>
      </div>

      {/* Data Table */}
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
                  <th>ID</th>
                  <th>Logo</th>
                  <th>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Tên trường
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
                        title="Sắp xếp theo tên trường"
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
                        title="Sắp xếp theo viết tắt"
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
                  <th>Năm thành lập</th>
                  <th>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Tỉnh/Thành
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
                          if (sortField === "province") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("province");
                            setSortOrder("asc");
                          }
                        }}
                        title="Sắp xếp theo tỉnh/thành"
                      >
                        {sortField === "province" ? (
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
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUniversities.map((university) => (
                  <tr key={university.id} className="table-row">
                    <td className="admin-font-medium">{university.id}</td>
                    <td>
                      <div className="logo-cell">
                        {university.logoUrl ? (
                          <img
                            src={university.logoUrl}
                            alt={`Logo ${university.shortName}`}
                            className="university-logo"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-logo.png";
                            }}
                          />
                        ) : (
                          <div className="logo-placeholder">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21,15 16,10 5,21" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="university-name">
                        <span className="name">{university.name}</span>
                      </div>
                    </td>
                    <td className="admin-font-medium">
                      {university.shortName}
                    </td>
                    <td>{university.foundingYear}</td>
                    <td>
                      <span className="admin-badge admin-badge-info">
                        {university.province?.name || "N/A"}
                      </span>
                    </td>
                    <td className="admin-text-sm">
                      {university.email || "N/A"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${university.status?.toLowerCase()}`}
                      >
                        {university.status || "Hoạt động"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetail(university.id)}
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
                          onClick={() => handleEdit(university.id)}
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
                          onClick={() =>
                            handleDelete(university.id, university.name)
                          }
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

            {filteredUniversities.length === 0 && !loading && (
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
                <h3>Không tìm thấy trường đại học</h3>
                <p>Thử tìm kiếm với từ khóa khác hoặc thêm trường mới</p>
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
                {isEditing ? "Chỉnh sửa trường" : "Thêm trường mới"}
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
                <div className="form-group">
                  <label className="admin-label">
                    Tên trường <span className="required">*</span>
                  </label>
                  <input
                    className={`admin-input ${formErrors.name ? "error" : ""}`}
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Đại học Bách khoa Hà Nội"
                  />
                  {formErrors.name && (
                    <span className="error-text">{formErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Tên viết tắt <span className="required">*</span>
                  </label>
                  <input
                    className={`admin-input ${
                      formErrors.shortName ? "error" : ""
                    }`}
                    name="shortName"
                    value={form.shortName}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: HUST"
                  />
                  {formErrors.shortName && (
                    <span className="error-text">{formErrors.shortName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    ID Danh mục <span className="required">*</span>
                  </label>
                  <input
                    className={`admin-input ${
                      formErrors.categoryId ? "error" : ""
                    }`}
                    name="categoryId"
                    type="number"
                    value={form.categoryId}
                    onChange={handleInputChange}
                    placeholder="ID danh mục trường"
                  />
                  {formErrors.categoryId && (
                    <span className="error-text">{formErrors.categoryId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    ID Tỉnh/Thành <span className="required">*</span>
                  </label>
                  <input
                    className={`admin-input ${
                      formErrors.provinceId ? "error" : ""
                    }`}
                    name="provinceId"
                    type="number"
                    value={form.provinceId}
                    onChange={handleInputChange}
                    placeholder="ID tỉnh/thành phố"
                  />
                  {formErrors.provinceId && (
                    <span className="error-text">{formErrors.provinceId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Năm thành lập <span className="required">*</span>
                  </label>
                  <input
                    className={`admin-input ${
                      formErrors.foundingYear ? "error" : ""
                    }`}
                    name="foundingYear"
                    type="number"
                    value={form.foundingYear}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 1956"
                  />
                  {formErrors.foundingYear && (
                    <span className="error-text">
                      {formErrors.foundingYear}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">URL Logo</label>
                  <input
                    className="admin-input"
                    name="logoUrl"
                    value={form.logoUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="admin-label">Địa chỉ</label>
                  <input
                    className="admin-input"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Địa chỉ đầy đủ của trường"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Email</label>
                  <input
                    className={`admin-input ${formErrors.email ? "error" : ""}`}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="contact@university.edu.vn"
                  />
                  {formErrors.email && (
                    <span className="error-text">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Số điện thoại</label>
                  <input
                    className="admin-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="024.3869.2008"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Website</label>
                  <input
                    className={`admin-input ${
                      formErrors.website ? "error" : ""
                    }`}
                    name="website"
                    value={form.website}
                    onChange={handleInputChange}
                    placeholder="https://university.edu.vn"
                  />
                  {formErrors.website && (
                    <span className="error-text">{formErrors.website}</span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label className="admin-label">Mô tả</label>
                  <textarea
                    className="admin-input"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả về trường đại học..."
                    rows={3}
                  />
                </div>
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
                Chi tiết trường đại học
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
                {viewDetail.logoUrl && (
                  <img
                    src={viewDetail.logoUrl}
                    alt={`Logo ${viewDetail.shortName}`}
                    className="detail-logo"
                  />
                )}
                <div className="detail-title">
                  <h3 className="admin-text-lg admin-font-semibold">
                    {viewDetail.name}
                  </h3>
                  <p className="admin-text-sm admin-text-gray-600">
                    {viewDetail.shortName}
                  </p>
                  <span className="admin-badge admin-badge-info">
                    {viewDetail.category?.name}
                  </span>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{viewDetail.id}</span>
                </div>
                <div className="detail-item">
                  <label>Năm thành lập:</label>
                  <span>{viewDetail.foundingYear}</span>
                </div>
                <div className="detail-item">
                  <label>Tỉnh/Thành:</label>
                  <span>{viewDetail.province?.name}</span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  <span
                    className={`status-badge ${viewDetail.status?.toLowerCase()}`}
                  >
                    {viewDetail.status || "Hoạt động"}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <label>Địa chỉ:</label>
                  <span>{viewDetail.address || "Chưa cập nhật"}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{viewDetail.email || "Chưa cập nhật"}</span>
                </div>
                <div className="detail-item">
                  <label>Điện thoại:</label>
                  <span>{viewDetail.phone || "Chưa cập nhật"}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Website:</label>
                  {viewDetail.website ? (
                    <a
                      href={viewDetail.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      {viewDetail.website}
                    </a>
                  ) : (
                    <span>Chưa cập nhật</span>
                  )}
                </div>
                <div className="detail-item full-width">
                  <label>Mô tả:</label>
                  <span>{viewDetail.description || "Chưa có mô tả"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUniversities;
