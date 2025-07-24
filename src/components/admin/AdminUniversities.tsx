import React, { useEffect, useState } from "react";
import "../../css/AdminUniversities.css";
import * as universityApi from "../../api/university";
import type { UniversityListItem, University } from "../../types/university";
import Select from "react-select";
import type { MultiValue } from "react-select";
import {getTopUniversityToDay} from "../../api/stats.ts";
import { useNavigate } from "react-router-dom";

const defaultForm = {
  universityCode: "",
  name: "",
  nameEn: "",
  shortName: "",
  fanpage: "",
  foundingYear: undefined as number | undefined,
  email: "",
  phone: "",
  website: "",
  description: "",
  categoryId: undefined as number | undefined,
  admissionMethodIds: [] as number[],
};

const AdminUniversities: React.FC = () => {
  const [universities, setUniversities] = useState<UniversityListItem[]>([]);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<University | null>(null);
  const [topUniversity, setTopUniversity] = useState<{
    universityId: number;
    universityName: string;
    totalSearches: number;
  } | null>(null);
  // Pagination, search, sort
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<
    "id" | "name" | "code" | "abbreviation"
  >("name");
  const [sortOrder] = useState<"asc" | "desc">("asc");
  // 1. Thêm state cho file logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  // State cho danh sách phương thức tuyển sinh và loại trường
  const [admissionMethods, setAdmissionMethods] = useState<
    { id: number; name: string }[]
  >([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const navigate = useNavigate();
  // Remove dropdownNode and openDropdown state and related logic

  // Key lưu localStorage
  const FORM_STORAGE_KEY = "adminUniversityForm";

  // Form handlers
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    } else {
      setLogoFile(null);
    }
  };

  // Fetch universities
  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const res = await universityApi.searchUniversities({
        search,
        page,
        size,
        sort: `${sortField},${sortOrder}`,
      });
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      // const today = new Date().toISOString().split("T")[0]; // "2025-07-21"
      const hotsearch = await getTopUniversityToDay();
      setTopUniversity(hotsearch.data.result);
      setUniversities(items);
      setTotalPages(res.data.result.totalPages ?? 1);
      setTotalElements(res.data.result.totalElements ?? 0);
    } catch {
      setError("Không thể tải danh sách trường đại học");
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
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

  // Khi form thay đổi, lưu vào localStorage (trừ file)
  useEffect(() => {
    if (showFormModal) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
    }
  }, [form, showFormModal]);

  // Fetch admission methods & categories khi mở form
  useEffect(() => {
    if (showFormModal) {
      // Lấy phương thức tuyển sinh
      import("../../api/admissionMethod").then((api) => {
        api.getAdmissionMethods({ page: 0, size: 100 }).then((res) => {
          setAdmissionMethods(res.data.result.items || []);
        });
      });
      // Lấy loại trường
      import("../../api/universityCategory").then((api) => {
        api
          .getUniversityCategoriesPaginated({ page: 0, size: 100 })
          .then((res) => {
            setCategories(res.data.result.items || []);
          });
      });
    }
  }, [showFormModal]);

  // Khi mở form (thêm/sửa), nếu có dữ liệu localStorage thì load vào state
  const handleAdd = () => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      setForm({ ...defaultForm, ...JSON.parse(saved) });
    } else {
      setForm(defaultForm);
    }
    setIsEditing(false);
    setShowFormModal(true);
    setSelectedUniversity(null);
    setLogoFile(null);
  };

  const handleEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await universityApi.getUniversityById(id);
      const university = res.data.result;
      setSelectedUniversity(university);
      setForm({
        universityCode: university.universityCode || "",
        name: university.name || "",
        nameEn: university.nameEn || "",
        shortName: university.shortName || "",
        fanpage: university.fanpage || "",
        foundingYear: university.foundingYear || undefined,
        email: university.email || "",
        phone: university.phone || "",
        website: university.website || "",
        description: university.description || "",
        categoryId: university.categoryId || undefined,
        admissionMethodIds: university.admissionMethodIds || [],
      });
      setLogoFile(null); // reset file khi edit
      setIsEditing(true);
      setShowFormModal(true);
      // Không load localStorage khi edit, chỉ khi add
    } catch {
      setError("Không thể lấy chi tiết trường");
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
    } catch {
      setError("Xóa trường thất bại");
    } finally {
      setLoading(false);
    }
  };

  // 6. Cập nhật handleSubmit:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) {
      setError("Vui lòng chọn loại trường đại học!");
      return;
    }
    setLoading(true);
    try {
      if (isEditing && selectedUniversity) {
        // UPDATE: luôn gửi multipart/form-data
        const fd = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) =>
              fd.append(key, v !== undefined && v !== null ? v.toString() : "")
            );
          } else {
            fd.append(
              key,
              value !== undefined && value !== null ? value.toString() : ""
            );
          }
        });
        if (logoFile) {
          fd.append("logoFile", logoFile);
        }
        await universityApi.updateUniversity(selectedUniversity.id, fd, true);
        setSuccess("Cập nhật trường thành công");
      } else {
        // CREATE: nếu có file thì gửi multipart, không thì gửi JSON
        if (logoFile) {
          const fd = new FormData();
          Object.entries(form).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) =>
                fd.append(
                  key,
                  v !== undefined && v !== null ? v.toString() : ""
                )
              );
            } else {
              fd.append(
                key,
                value !== undefined && value !== null ? value.toString() : ""
              );
            }
          });
          fd.append("logoFile", logoFile);
          await universityApi.createUniversity(fd, true);
        } else {
          await universityApi.createUniversity(form, false);
        }
        setSuccess("Thêm trường mới thành công");
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedUniversity(null);
      setShowFormModal(false);
      setLogoFile(null);
      localStorage.removeItem(FORM_STORAGE_KEY);
      fetchUniversities();
    } catch {
      setError(isEditing ? "Cập nhật trường thất bại" : "Thêm trường thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await universityApi.getUniversityById(id);
      setViewDetail(res.data.result);
    } catch {
      setError("Không thể lấy chi tiết trường");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowFormModal(false);
    setIsEditing(false);
    setSelectedUniversity(null);
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  // Search handlers
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // Helper lấy URL logo đầy đủ từ Minio
  const getLogoUrl = (logoUrl?: string) => {
    if (!logoUrl) return "/placeholder-logo.png";
    if (logoUrl.startsWith("http")) {
      let url = logoUrl.split("?")[0];
      url = url.replace("minio:9000", "localhost:9000");
      return url;
    }
    return `http://localhost:9000/mybucket/${logoUrl}`;
  };

  return (
    <div className="admin-universities">
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
      <div className="search-section" style={{ display: "flex", gap: "2rem" }}>
        {/* LEFT: Search */}
        <div style={{ flex: 1 }}>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                  className="search-input"
                  placeholder="Tìm kiếm theo tên, mã trường, viết tắt..."
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
        Hiển thị {universities.length} trên tổng số {totalElements} trường
      </span>
          </div>
        </div>

        {/* RIGHT: Top searched universities */}
        <div style={{ width: "280px" }}>
          <div className="stat-card universities-card"
                onClick={() => navigate("/admin/search-charts")}
               style={{ cursor: "pointer" }}>
            <div className="stat-icon">
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
              <h3 className="stat-title">Trường đại học được tìm kiếm nhiều nhất </h3>
              {topUniversity && (
                  <p className="stat-number">{topUniversity.universityName}</p>
              )}
            </div>
          </div>
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
                  <th>STT</th>
                  <th>Logo</th>
                  <th>
                    <button
                      className="sort-header"
                      onClick={() => setSortField("name")}
                    >
                      Tên trường
                      {sortField === "name" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      className="sort-header"
                      onClick={() => setSortField("code")}
                    >
                      Mã trường
                      {sortField === "code" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      className="sort-header"
                      onClick={() => setSortField("abbreviation")}
                    >
                      Viết tắt
                      {sortField === "abbreviation" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>Website</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((university, idx) => (
                  <tr key={university.id} className="table-row">
                    <td>{page * size + idx + 1}</td>
                    {/*<td>*/}
                    {/*  <div className="logo-cell">*/}
                    {/*    {university.logoUrl ? (*/}
                    {/*      <img*/}
                    {/*        src={getLogoUrl(university.logoUrl)}*/}
                    {/*        alt={`Logo ${university.shortName}`}*/}
                    {/*        className="university-logo"*/}
                    {/*        onError={(e) => {*/}
                    {/*          e.currentTarget.src = "/placeholder-logo.png";*/}
                    {/*        }}*/}
                    {/*      />*/}
                    {/*    ) : (*/}
                    {/*      <div className="logo-placeholder">*/}
                    {/*        <svg*/}
                    {/*          viewBox="0 0 24 24"*/}
                    {/*          fill="none"*/}
                    {/*          stroke="currentColor"*/}
                    {/*          strokeWidth="2"*/}
                    {/*        >*/}
                    {/*          <rect*/}
                    {/*            x="3"*/}
                    {/*            y="3"*/}
                    {/*            width="18"*/}
                    {/*            height="18"*/}
                    {/*            rx="2"*/}
                    {/*            ry="2"*/}
                    {/*          />*/}
                    {/*          <circle cx="8.5" cy="8.5" r="1.5" />*/}
                    {/*          <polyline points="21,15 16,10 5,21" />*/}
                    {/*        </svg>*/}
                    {/*      </div>*/}
                    {/*    )}*/}
                    {/*  </div>*/}
                    {/*</td>*/}
                    <td>{university.name}</td>
                    <td>{university.universityCode}</td>
                    <td>{university.shortName}</td>
                    <td>
                      {university.website ? (
                        <a
                          href={university.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {university.website}
                        </a>
                      ) : (
                        <span>Chưa cập nhật</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${university.status}`}>
                        {university.status}
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
                        <button
                          className="action-btn"
                          onClick={() => navigate(`/admin/universities/${university.id}/majors`)}
                          title="Quản lý ngành"
                        >
                          🏫
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => navigate(`/admin/universities/${university.id}/admission-methods`)}
                          title="Quản lý phương thức tuyển sinh"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {universities.length === 0 && !loading && (
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
                    className="admin-input"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Đại học Bách khoa Hà Nội"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Tên tiếng Anh</label>
                  <input
                    className="admin-input"
                    name="nameEn"
                    value={form.nameEn}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Hanoi University of Science and Technology"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Mã trường <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="universityCode"
                    value={form.universityCode}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: HUST, FPTU, ..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Viết tắt <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="shortName"
                    value={form.shortName}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: HUST, FPT, ..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Logo (tải lên file)</label>
                  <input
                    className="admin-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {logoFile && <span>Đã chọn: {logoFile.name}</span>}
                </div>
                <div className="form-group">
                  <label className="admin-label">Website</label>
                  <input
                    className="admin-input"
                    name="website"
                    value={form.website}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Email</label>
                  <input
                    className="admin-input"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: info@hust.edu.vn"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Số điện thoại</label>
                  <input
                    className="admin-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 024.3868.1000"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Năm thành lập</label>
                  <input
                    className="admin-input"
                    name="foundingYear"
                    type="number"
                    value={form.foundingYear || ""}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 1976"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Trang fanpage</label>
                  <input
                    className="admin-input"
                    name="fanpage"
                    value={form.fanpage}
                    onChange={handleInputChange}
                    placeholder="https://www.facebook.com/hust.edu.vn"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Loại trường đại học <span className="required">*</span>
                  </label>
                  <select
                    className="admin-input"
                    name="categoryId"
                    value={form.categoryId || ""}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn loại trường --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="admin-label">Phương thức tuyển sinh</label>
                  <Select
                    isMulti
                    isSearchable
                    name="admissionMethodIds"
                    classNamePrefix="react-select"
                    options={admissionMethods.map((m) => ({
                      value: m.id,
                      label: m.name,
                    }))}
                    value={admissionMethods
                      .filter((m) => form.admissionMethodIds.includes(m.id))
                      .map((m) => ({ value: m.id, label: m.name }))}
                    onChange={(
                      selected: MultiValue<{ value: number; label: string }>
                    ) => {
                      setForm((prev) => ({
                        ...prev,
                        admissionMethodIds: (
                          selected as MultiValue<{
                            value: number;
                            label: string;
                          }>
                        ).map((opt) => opt.value),
                      }));
                    }}
                    placeholder="Chọn phương thức tuyển sinh..."
                  />
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
                    src={getLogoUrl(viewDetail.logoUrl)}
                    alt={`Logo ${viewDetail.shortName}`}
                    className="detail-logo"
                  />
                )}
                <div className="detail-title">
                  <h3 className="admin-text-lg admin-font-semibold">
                    {viewDetail.name}
                  </h3>
                  <p className="admin-text-sm admin-text-gray-600">
                    {viewDetail.nameEn || "Chưa có tên tiếng Anh"}
                  </p>
                  <div className="detail-badges">
                    <span className="admin-badge admin-badge-info">
                      {viewDetail.universityCode}
                    </span>
                    <span className="admin-badge admin-badge-info">
                      {viewDetail.shortName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin cơ bản</h4>
                  <div className="detail-section-content">
                    <div className="detail-item">
                      <label>ID:</label>
                      <span>{viewDetail.id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng thái:</label>
                      <span className={`status-badge ${viewDetail.status}`}>
                        {viewDetail.status}
                      </span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Mô tả:</label>
                      <span>{viewDetail.description || "Chưa có mô tả"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Website:</label>
                      {viewDetail.website ? (
                        <a
                          href={viewDetail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {viewDetail.website}
                        </a>
                      ) : (
                        <span>Chưa cập nhật</span>
                      )}
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{viewDetail.email || "Chưa có email"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{viewDetail.phone || "Chưa có số điện thoại"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Năm thành lập:</label>
                      <span>
                        {viewDetail.foundingYear || "Chưa có năm thành lập"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Trang fanpage:</label>
                      {viewDetail.fanpage ? (
                        <a
                          href={viewDetail.fanpage}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {viewDetail.fanpage}
                        </a>
                      ) : (
                        <span>Chưa có trang fanpage</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin hệ thống</h4>
                  <div className="detail-section-content">
                    <div className="detail-item">
                      <label>Người tạo:</label>
                      <span>{viewDetail.createdBy || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Thời gian tạo:</label>
                      <span>
                        {viewDetail.createdAt
                          ? new Date(viewDetail.createdAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Người cập nhật:</label>
                      <span>{viewDetail.updatedBy || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Thời gian cập nhật:</label>
                      <span>
                        {viewDetail.updatedAt
                          ? new Date(viewDetail.updatedAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin viết tắt</h4>
                  <div className="detail-section-content">
                    <div className="detail-item">
                      <label>Viết tắt:</label>
                      <span>{viewDetail.shortName || "Chưa cập nhật"}</span>
                    </div>
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

export default AdminUniversities;
