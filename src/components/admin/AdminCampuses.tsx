import React, { useEffect, useState } from "react";
import "../../css/AdminUniversities.css";
import * as campusApi from "../../api/campus";
import * as campusTypeApi from "../../api/campusType";
import * as provinceApi from "../../api/province";
import * as universityApi from "../../api/university";
import type { Campus, CampusCreateRequest } from "../../types/campus";
import type { CampusType } from "../../types/campusType";
import type { Province } from "../../types/province";
import type { UniversityListItem } from "../../types/university";

const defaultForm: CampusCreateRequest = {
  universityId: 0,
  provinceId: 0,
  campusName: "",
  campusCode: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  isMainCampus: false,
  campusTypeId: 0,
  description: "",
  establishedYear: undefined,
  areaHectares: undefined,
};

const AdminCampuses: React.FC = () => {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [form, setForm] = useState<CampusCreateRequest>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<Campus | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  // Đã loại bỏ sortField, setSortField, sortOrder, setSortOrder
  const [universityId, setUniversityId] = useState<number | "">("");
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [campusTypeId, setCampusTypeId] = useState<number | "">("");
  const [isMainCampus, setIsMainCampus] = useState<"" | boolean>("");
  const [campusTypes, setCampusTypes] = useState<CampusType[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [universities, setUniversities] = useState<UniversityListItem[]>([]);

  useEffect(() => {
    campusTypeApi
      .searchCampusTypes({ page: 0, size: 100 })
      .then((res) => setCampusTypes(res.data.result.items || []));
    provinceApi
      .getProvinces({ page: 0, size: 100 })
      .then((res) => setProvinces(res.data.result.items || []));
    universityApi
      .searchUniversities({ page: 0, size: 100 })
      .then((res) => setUniversities(res.data.result.items || []));
  }, []);

  const fetchCampuses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await campusApi.getCampuses({
        search,
        page,
        size,
        // sort: `${sortField},${sortOrder}`, // Xóa dòng này
        universityId: universityId || undefined,
        provinceId: provinceId || undefined,
        campusType: campusTypeId
          ? campusTypes.find((ct) => ct.id === campusTypeId)?.name
          : undefined,
        isMainCampus: isMainCampus === "" ? undefined : isMainCampus,
      });
      setCampuses(res.data.result.items);
      setTotalPages(res.data.result.totalPages);
      setTotalElements(res.data.result.totalElements);
    } catch {
      setError("Không thể tải danh sách cơ sở");
      setCampuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
    // eslint-disable-next-line
  }, [
    page,
    search,
    // sortField, // Xóa dòng này
    // sortOrder, // Xóa dòng này
    universityId,
    provinceId,
    campusTypeId,
    isMainCampus,
  ]);

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAdd = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setShowFormModal(true);
    setSelectedCampus(null);
  };

  const handleEdit = (campus: Campus) => {
    setSelectedCampus(campus);
    setForm({
      universityId: campus.university.id,
      provinceId: campus.province.id,
      campusName: campus.campusName,
      campusCode: campus.campusCode,
      address: campus.address,
      phone: campus.phone || "",
      email: campus.email || "",
      website: campus.website || "",
      isMainCampus: campus.isMainCampus,
      campusTypeId: campus.campusType.id,
      description: campus.description || "",
      establishedYear: campus.establishedYear,
      areaHectares: campus.areaHectares,
    });
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleViewDetail = (campus: Campus) => {
    setViewDetail(campus);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa cơ sở "${name}"?`)) return;
    setLoading(true);
    try {
      await campusApi.deleteCampus(id);
      setSuccess("Xóa cơ sở thành công");
      fetchCampuses();
    } catch {
      setError("Xóa cơ sở thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && selectedCampus) {
        await campusApi.updateCampus(selectedCampus.id, form);
        setSuccess("Cập nhật cơ sở thành công");
      } else {
        await campusApi.createCampus(form);
        setSuccess("Thêm cơ sở mới thành công");
      }
      setForm(defaultForm);
      setIsEditing(false);
      setSelectedCampus(null);
      setShowFormModal(false);
      fetchCampuses();
    } catch {
      setError(isEditing ? "Cập nhật cơ sở thất bại" : "Thêm cơ sở thất bại");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowFormModal(false);
    setForm(defaultForm);
    setIsEditing(false);
    setSelectedCampus(null);
  };

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
            Quản lý cơ sở
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các cơ sở trường đại học trong hệ thống
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
          Thêm cơ sở
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
              placeholder="Tìm kiếm theo tên cơ sở..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
          <div className="filter-row">
            <select
              value={universityId}
              onChange={(e) =>
                setUniversityId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">-- Trường đại học --</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <select
              value={provinceId}
              onChange={(e) =>
                setProvinceId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">-- Tỉnh/Thành --</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={campusTypeId}
              onChange={(e) =>
                setCampusTypeId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">-- Loại cơ sở --</option>
              {campusTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name}
                </option>
              ))}
            </select>
            <select
              value={isMainCampus === "" ? "" : isMainCampus ? "true" : "false"}
              onChange={(e) =>
                setIsMainCampus(
                  e.target.value === "" ? "" : e.target.value === "true"
                )
              }
            >
              <option value="">-- Tất cả --</option>
              <option value="true">Cơ sở chính</option>
              <option value="false">Phân hiệu</option>
            </select>
          </div>
        </div>
        <div className="pagination-info">
          <span className="admin-text-sm admin-text-gray-600">
            Hiển thị {campuses.length} trên tổng số {totalElements} cơ sở
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
                  <th>STT</th>
                  <th>Tên cơ sở</th>
                  <th>Mã</th>
                  <th>Trường</th>
                  <th>Tỉnh/Thành</th>
                  <th>Loại</th>
                  <th>Chính/Phân hiệu</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {campuses.map((c, idx) => (
                  <tr key={c.id} className="table-row">
                    <td>{page * size + idx + 1}</td>
                    <td>{c.campusName}</td>
                    <td>{c.campusCode}</td>
                    <td>{c.university?.name}</td>
                    <td>{c.province?.name}</td>
                    <td>{c.campusType?.name}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          c.isMainCampus ? "main" : "branch"
                        }`}
                      >
                        {c.isMainCampus ? "Cơ sở chính" : "Phân hiệu"}
                      </span>
                    </td>
                    <td>{c.address}</td>
                    <td>
                      <span className={`status-badge ${c.status}`}>
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
                          onClick={() => handleDelete(c.id, c.campusName)}
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
            {campuses.length === 0 && !loading && (
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
                <h3>Không tìm thấy cơ sở</h3>
                <p>Thử thêm cơ sở mới</p>
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
                {isEditing ? "Chỉnh sửa cơ sở" : "Thêm cơ sở mới"}
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
                    Tên cơ sở <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="campusName"
                    value={form.campusName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Mã cơ sở <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="campusCode"
                    value={form.campusCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Trường đại học <span className="required">*</span>
                  </label>
                  <select
                    className="admin-input"
                    name="universityId"
                    value={form.universityId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn trường --</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Tỉnh/Thành <span className="required">*</span>
                  </label>
                  <select
                    className="admin-input"
                    name="provinceId"
                    value={form.provinceId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Loại cơ sở <span className="required">*</span>
                  </label>
                  <select
                    className="admin-input"
                    name="campusTypeId"
                    value={form.campusTypeId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn loại --</option>
                    {campusTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="admin-label">Cơ sở chính?</label>
                  <input
                    type="checkbox"
                    name="isMainCampus"
                    checked={!!form.isMainCampus}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Số điện thoại</label>
                  <input
                    className="admin-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Email</label>
                  <input
                    className="admin-input"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Website</label>
                  <input
                    className="admin-input"
                    name="website"
                    value={form.website}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Năm thành lập</label>
                  <input
                    className="admin-input"
                    name="establishedYear"
                    type="number"
                    value={form.establishedYear || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Diện tích (ha)</label>
                  <input
                    className="admin-input"
                    name="areaHectares"
                    type="number"
                    value={form.areaHectares || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="admin-label">Mô tả</label>
                  <textarea
                    className="admin-input"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
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
                      {" "}
                      <div className="loading-spinner small"></div> Đang xử
                      lý...{" "}
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
                Chi tiết cơ sở
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
                    {viewDetail.campusName}
                  </h3>
                  <div className="detail-badges">
                    <span className="admin-badge admin-badge-info">
                      {viewDetail.campusCode}
                    </span>
                    <span className="admin-badge admin-badge-info">
                      {viewDetail.campusType?.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{viewDetail.id}</span>
                </div>
                <div className="detail-item">
                  <label>Trường:</label>
                  <span>{viewDetail.university?.name}</span>
                </div>
                <div className="detail-item">
                  <label>Tỉnh/Thành:</label>
                  <span>{viewDetail.province?.name}</span>
                </div>
                <div className="detail-item">
                  <label>Địa chỉ:</label>
                  <span>{viewDetail.address}</span>
                </div>
                <div className="detail-item">
                  <label>Điện thoại:</label>
                  <span>{viewDetail.phone || "Chưa có"}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{viewDetail.email || "Chưa có"}</span>
                </div>
                <div className="detail-item">
                  <label>Website:</label>
                  <span>{viewDetail.website || "Chưa có"}</span>
                </div>
                <div className="detail-item">
                  <label>Năm thành lập:</label>
                  <span>{viewDetail.establishedYear || "Chưa có"}</span>
                </div>
                <div className="detail-item">
                  <label>Diện tích (ha):</label>
                  <span>{viewDetail.areaHectares || "Chưa có"}</span>
                </div>
                <div className="detail-item">
                  <label>Chính/Phân hiệu:</label>
                  <span>
                    {viewDetail.isMainCampus ? "Cơ sở chính" : "Phân hiệu"}
                  </span>
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
                  <label>Người tạo:</label>
                  <span>{viewDetail.createdBy}</span>
                </div>
                <div className="detail-item">
                  <label>Thời gian tạo:</label>
                  <span>
                    {new Date(viewDetail.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Người cập nhật:</label>
                  <span>{viewDetail.updatedBy}</span>
                </div>
                <div className="detail-item">
                  <label>Thời gian cập nhật:</label>
                  <span>
                    {new Date(viewDetail.updatedAt).toLocaleString("vi-VN")}
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

export default AdminCampuses;
