import React, { useEffect, useState } from "react";
import * as accountApi from "../../api/account";
import type { Account, AccountSearchParams } from "../../types/account";
import "../../css/AdminUniversities.css";

interface Filters {
  search: string;
  role: string;
  status: string;
  gender: string;
  isDeleted: boolean;
  createdDateFrom: string;
  createdDateTo: string;
  lastLoginFrom: string;
  lastLoginTo: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}

const AdminAccount: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [viewDetail, setViewDetail] = useState<Account | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState<Filters>({
    search: "",
    role: "",
    status: "",
    gender: "",
    isDeleted: false,
    createdDateFrom: "",
    createdDateTo: "",
    lastLoginFrom: "",
    lastLoginTo: "",
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    banned: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await accountApi.getAccountStats();
      setStats({
        total: res.data.result?.totalAccounts || 0,
        active: res.data.result?.activeAccounts || 0,
        inactive: res.data.result?.inactiveAccounts || 0,
        banned: res.data.result?.bannedAccounts || 0,
      });
    } catch {
      // Fallback to 0 if stats API fails
      setStats({ total: 0, active: 0, inactive: 0, banned: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const params: AccountSearchParams = {
        page,
        size,
        sortBy: filters.sortBy as
          | "id"
          | "username"
          | "email"
          | "fullName"
          | "phone"
          | "status"
          | "gender"
          | "createdAt"
          | "updatedAt"
          | "lastLoginAt"
          | "loginCount",
        sortOrder: filters.sortOrder,
      };

      // Search
      if (filters.search) {
        params.search = filters.search;
      }

      // Filters
      if (filters.role)
        params.role = filters.role as "USER" | "CONSULTANT" | "ADMIN";
      if (filters.status)
        params.status = filters.status as "ACTIVE" | "INACTIVE" | "BANNED";
      if (filters.gender)
        params.gender = filters.gender as "MALE" | "FEMALE" | "OTHER";

      // Advanced filters
      params.isDeleted = filters.isDeleted;
      if (filters.createdDateFrom)
        params.createdDateFrom = filters.createdDateFrom;
      if (filters.createdDateTo) params.createdDateTo = filters.createdDateTo;
      if (filters.lastLoginFrom) params.lastLoginFrom = filters.lastLoginFrom;
      if (filters.lastLoginTo) params.lastLoginTo = filters.lastLoginTo;

      const res = await accountApi.getAccounts(params);
      const items = Array.isArray(res.data.result?.items)
        ? res.data.result.items
        : [];

      setAccounts(items);
      setTotalPages(res.data.result?.totalPages || 1);
      setTotalElements(res.data.result?.totalElements || 0);
    } catch {
      setError("Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchStats();
    // eslint-disable-next-line
  }, [page, size, filters]);

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

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      role: "",
      status: "",
      gender: "",
      isDeleted: false,
      createdDateFrom: "",
      createdDateTo: "",
      lastLoginFrom: "",
      lastLoginTo: "",
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
    setPage(0);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn ${
          currentStatus === "ACTIVE" ? "tạm khóa" : "kích hoạt"
        } tài khoản này?`
      )
    )
      return;

    setLoading(true);
    try {
      await accountApi.toggleStatus(id);
      setSuccess("Cập nhật trạng thái thành công");
      fetchAccounts();
      fetchStats();
    } catch {
      setError("Cập nhật trạng thái thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUnban = async (id: string, currentStatus: string) => {
    const isBanning = currentStatus !== "BANNED";
    if (
      !window.confirm(
        `Bạn có chắc muốn ${isBanning ? "cấm" : "bỏ cấm"} tài khoản này?`
      )
    )
      return;

    setLoading(true);
    try {
      await accountApi.banAccount(id, isBanning);
      setSuccess(`${isBanning ? "Cấm" : "Bỏ cấm"} tài khoản thành công`);
      fetchAccounts();
      fetchStats();
    } catch {
      setError(`${isBanning ? "Cấm" : "Bỏ cấm"} tài khoản thất bại.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${username}"?`))
      return;

    setLoading(true);
    try {
      await accountApi.deleteAccount(id);
      setSuccess("Xóa tài khoản thành công");
      fetchAccounts();
      fetchStats();
    } catch {
      setError("Xóa tài khoản thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (action: "PROMOTE" | "DEMOTE") => {
    if (!selectedAccount) return;
    setAssigning(true);
    try {
      await accountApi.setRole(selectedAccount.id, action);
      setSelectedAccount(null);
      setSuccess(`Thay đổi vai trò thành công`);
      fetchAccounts();
      fetchStats();
    } catch {
      setError("Thay đổi vai trò thất bại.");
    } finally {
      setAssigning(false);
    }
  };

  const canPromote = (account: Account) => {
    return account.role?.name === "USER";
  };

  const canDemote = (account: Account) => {
    return account.role?.name === "CONSULTANT";
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      setError("Vui lòng chọn ít nhất một tài khoản");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc muốn ${action} ${selectedIds.length} tài khoản đã chọn?`
      )
    )
      return;

    setLoading(true);
    try {
      await accountApi.bulkAction(action, selectedIds);
      setSuccess(`${action} thành công ${selectedIds.length} tài khoản`);
      setSelectedIds([]);
      fetchAccounts();
      fetchStats();
    } catch {
      setError(`${action} thất bại`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(accounts.map((acc) => acc.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectAccount = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleViewDetail = async (id: string) => {
    setDetailLoading(true);
    setError("");
    try {
      const res = await accountApi.getAccountById(id);
      setViewDetail(res.data.result);
    } catch {
      setError("Không thể tải thông tin chi tiết tài khoản.");
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateString: string, onlyDate: boolean = false) => {
    if (!dateString) return "Chưa có";
    const options: Intl.DateTimeFormatOptions = onlyDate
      ? { year: "numeric", month: "2-digit", day: "2-digit" }
      : {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: "active",
      INACTIVE: "inactive",
      BANNED: "banned",
    };
    return statusColors[status as keyof typeof statusColors] || "inactive";
  };

  const getRoleDisplay = (account: Account) => {
    if (Array.isArray(account.roles) && account.roles.length > 0) {
      return account.roles.map((r) => r.name).join(", ");
    }
    if (account.role?.name) {
      return account.role.name;
    }
    return "Chưa có vai trò";
  };

  const getGenderDisplay = (gender: string) => {
    if (!gender || gender.trim() === "") return "Chưa cập nhật";

    const genderMap = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác",
    };
    return genderMap[gender as keyof typeof genderMap] || "Chưa cập nhật";
  };

  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý tài khoản
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các tài khoản trong hệ thống
          </p>
        </div>
      </div>

      {/* Search & Filters */}
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
              placeholder="Tìm kiếm theo tên, email, username, số điện thoại..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            {filters.search && (
              <button
                className="clear-search-btn"
                onClick={() => handleFilterChange("search", "")}
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
            )}
          </div>

          <div className="filters-group">
            <button
              className={`filter-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
              </svg>
              Bộ lọc
              {(filters.role ||
                filters.status ||
                filters.gender ||
                filters.isDeleted ||
                filters.createdDateFrom ||
                filters.createdDateTo ||
                filters.lastLoginFrom ||
                filters.lastLoginTo) && (
                <span className="filter-indicator">●</span>
              )}
            </button>

            <select
              className="sort-select"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters((prev) => ({
                  ...prev,
                  sortBy,
                  sortOrder: sortOrder as "ASC" | "DESC",
                }));
              }}
            >
              <option value="createdAt-DESC">Mới nhất</option>
              <option value="createdAt-ASC">Cũ nhất</option>
              <option value="fullName-ASC">Tên A-Z</option>
              <option value="fullName-DESC">Tên Z-A</option>
              <option value="username-ASC">Username A-Z</option>
              <option value="username-DESC">Username Z-A</option>
              <option value="email-ASC">Email A-Z</option>
              <option value="email-DESC">Email Z-A</option>
              <option value="lastLoginAt-DESC">Đăng nhập gần nhất</option>
              <option value="lastLoginAt-ASC">Đăng nhập xa nhất</option>
              <option value="loginCount-DESC">Đăng nhập nhiều nhất</option>
              <option value="loginCount-ASC">Đăng nhập ít nhất</option>
              <option value="updatedAt-DESC">Cập nhật gần nhất</option>
              <option value="updatedAt-ASC">Cập nhật xa nhất</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="filter-controls">
            <div className="filter-row">
              <select
                className="filter-select"
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="USER">User</option>
                <option value="CONSULTANT">Consultant</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Tạm khóa</option>
                <option value="BANNED">Bị cấm</option>
              </select>

              <select
                className="filter-select"
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
              >
                <option value="">Tất cả giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>

              <select
                className="filter-select"
                value={filters.isDeleted ? "true" : "false"}
                onChange={(e) =>
                  handleFilterChange("isDeleted", e.target.value === "true")
                }
              >
                <option value="false">Tất cả</option>
                <option value="true">Đã xóa</option>
              </select>
            </div>

            <div className="filter-row">
              <div className="date-filter-group">
                <label className="filter-label">Ngày tạo:</label>
                <input
                  type="date"
                  className="filter-input date-input"
                  value={filters.createdDateFrom}
                  onChange={(e) =>
                    handleFilterChange("createdDateFrom", e.target.value)
                  }
                  placeholder="Từ ngày"
                />
                <span className="date-separator">đến</span>
                <input
                  type="date"
                  className="filter-input date-input"
                  value={filters.createdDateTo}
                  onChange={(e) =>
                    handleFilterChange("createdDateTo", e.target.value)
                  }
                  placeholder="Đến ngày"
                />
              </div>
            </div>

            <div className="filter-row">
              <div className="date-filter-group">
                <label className="filter-label">Đăng nhập gần nhất:</label>
                <input
                  type="date"
                  className="filter-input date-input"
                  value={filters.lastLoginFrom}
                  onChange={(e) =>
                    handleFilterChange("lastLoginFrom", e.target.value)
                  }
                  placeholder="Từ ngày"
                />
                <span className="date-separator">đến</span>
                <input
                  type="date"
                  className="filter-input date-input"
                  value={filters.lastLoginTo}
                  onChange={(e) =>
                    handleFilterChange("lastLoginTo", e.target.value)
                  }
                  placeholder="Đến ngày"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button className="reset-btn" onClick={resetFilters}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                Đặt lại
              </button>
            </div>
          </div>
        )}

        <div className="pagination-info">
          <span className="admin-text-sm admin-text-gray-600">
            Hiển thị {accounts.length} trên tổng số {totalElements} tài khoản
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
                d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5"
              />
              <circle cx="12" cy="10" r="4" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tổng số tài khoản</h3>
            <p className="stat-number">
              {statsLoading ? (
                <div className="loading-spinner small"></div>
              ) : (
                stats.total
              )}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Đang hoạt động</h3>
            <p className="stat-number">
              {statsLoading ? (
                <div className="loading-spinner small"></div>
              ) : (
                stats.active
              )}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tạm khóa</h3>
            <p className="stat-number">
              {statsLoading ? (
                <div className="loading-spinner small"></div>
              ) : (
                stats.inactive
              )}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Bị cấm</h3>
            <p className="stat-number">
              {statsLoading ? (
                <div className="loading-spinner small"></div>
              ) : (
                stats.banned
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="active-filters">
          <div className="filter-tags">
            <span className="admin-text-sm admin-font-medium">
              Đã chọn {selectedIds.length} tài khoản:
            </span>
            <button
              className="bulk-action-btn active"
              onClick={() => handleBulkAction("ACTIVATE")}
            >
              Kích hoạt
            </button>
            <button
              className="bulk-action-btn inactive"
              onClick={() => handleBulkAction("DEACTIVATE")}
            >
              Tạm khóa
            </button>
            <button
              className="bulk-action-btn banned"
              onClick={() => handleBulkAction("BAN")}
            >
              Cấm
            </button>
            <button
              className="bulk-action-btn export"
              onClick={() => handleBulkAction("EXPORT")}
            >
              Xuất Excel
            </button>
          </div>
          <button className="reset-btn" onClick={() => setSelectedIds([])}>
            Bỏ chọn tất cả
          </button>
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
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === accounts.length &&
                        accounts.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>STT</th>
                  <th>Tên đăng nhập</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, idx) => (
                  <tr key={acc.id} className="table-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(acc.id)}
                        onChange={(e) =>
                          handleSelectAccount(acc.id, e.target.checked)
                        }
                      />
                    </td>
                    <td>{page * size + idx + 1}</td>
                    <td>
                      <div className="username-cell">
                        <span className="username">{acc.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className="full-name">
                        {acc.fullName || "Chưa cập nhật"}
                      </span>
                    </td>
                    <td>{acc.email}</td>
                    <td>{acc.phone || "Chưa cập nhật"}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadge(acc.status)}`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetail(acc.id)}
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
                          onClick={() => setSelectedAccount(acc)}
                          title="Thay đổi vai trò"
                          disabled={acc.role?.name === "ADMIN"}
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
                          className={`action-btn ${
                            acc.status === "ACTIVE"
                              ? "inactive-btn"
                              : "active-btn"
                          }`}
                          onClick={() => handleToggleStatus(acc.id, acc.status)}
                          title={
                            acc.status === "ACTIVE" ? "Tạm khóa" : "Kích hoạt"
                          }
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            {acc.status === "ACTIVE" ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            )}
                          </svg>
                        </button>
                        <button
                          className={`action-btn ${
                            acc.status === "BANNED" ? "unban-btn" : "ban-btn"
                          }`}
                          onClick={() => handleBanUnban(acc.id, acc.status)}
                          title={
                            acc.status === "BANNED" ? "Bỏ cấm" : "Cấm tài khoản"
                          }
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(acc.id, acc.username)}
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
            {accounts.length === 0 && !loading && (
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
                <h3>Không tìm thấy tài khoản</h3>
                <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
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

      {/* Assign Role Modal */}
      {selectedAccount && (
        <div className="modal-overlay" onClick={() => setSelectedAccount(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="admin-text-xl admin-font-semibold">
                Thay đổi vai trò: {selectedAccount.username}
              </h2>
              <button
                className="modal-close"
                onClick={() => setSelectedAccount(null)}
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
            <div className="modal-body">
              <div className="form-group">
                <label className="admin-label">Vai trò hiện tại:</label>
                <p className="role-display">
                  {selectedAccount.role?.name === "USER" && "USER"}
                  {selectedAccount.role?.name === "CONSULTANT" && "CONSULTANT"}
                  {selectedAccount.role?.name === "ADMIN" && "ADMIN"}
                </p>
              </div>

              <div className="form-group">
                <label className="admin-label">Thao tác:</label>
                <div className="role-actions">
                  {canPromote(selectedAccount) && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-success"
                      onClick={() => handleAssignRole("PROMOTE")}
                      disabled={assigning}
                    >
                      {assigning ? (
                        <>
                          <div className="loading-spinner small"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 10l7-70"
                            />
                          </svg>
                          Nâng lên Tư vấn viên
                        </>
                      )}
                    </button>
                  )}

                  {canDemote(selectedAccount) && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-warning"
                      onClick={() => handleAssignRole("DEMOTE")}
                      disabled={assigning}
                    >
                      {assigning ? (
                        <>
                          <div className="loading-spinner small"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 14l-770"
                            />
                          </svg>
                          Hạ xuống Người dùng
                        </>
                      )}
                    </button>
                  )}

                  {selectedAccount.role?.name === "ADMIN" && (
                    <p className="admin-text-sm admin-text-gray-500">
                      Không thể thay đổi vai trò của Quản trị viên
                    </p>
                  )}

                  {selectedAccount.role?.name === "USER" &&
                    !canPromote(selectedAccount) && (
                      <p className="admin-text-sm admin-text-gray-500">
                        Người dùng đã ở vai trò thấp nhất
                      </p>
                    )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedAccount(null)}
              >
                Đóng
              </button>
            </div>
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
                Chi tiết tài khoản
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
            {detailLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải chi tiết...</p>
              </div>
            ) : viewDetail ? (
              <div className="detail-content">
                <div className="detail-header">
                  <div className="detail-title">
                    <h3 className="admin-text-lg admin-font-semibold">
                      {viewDetail.fullName || viewDetail.username}
                    </h3>
                    <p className="admin-text-sm admin-text-gray-600">
                      @{viewDetail.username}
                    </p>
                    <div className="detail-badges">
                      <span
                        className={`status-badge ${getStatusBadge(
                          viewDetail.status
                        )}`}
                      >
                        {viewDetail.status}
                      </span>
                      <span className="admin-badge admin-badge-info">
                        {getRoleDisplay(viewDetail)}
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
                    <label>Email:</label>
                    <span>{viewDetail.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Số điện thoại:</label>
                    <span>{viewDetail.phone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Giới tính:</label>
                    <span>{getGenderDisplay(viewDetail.gender || "")}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày sinh:</label>
                    <span>
                      {viewDetail.dob
                        ? formatDate(viewDetail.dob, true)
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Số lần đăng nhập:</label>
                    <span>{viewDetail.loginCount || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Lần đăng nhập cuối:</label>
                    <span>
                      {viewDetail.lastLoginAt
                        ? formatDate(viewDetail.lastLoginAt)
                        : "Chưa đăng nhập"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày tạo:</label>
                    <span>{formatDate(viewDetail.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày cập nhật:</label>
                    <span>
                      {viewDetail.updatedAt
                        ? formatDate(viewDetail.updatedAt)
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Người tạo:</label>
                    <span>{viewDetail.createdBy || "Hệ thống"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Người cập nhật:</label>
                    <span>{viewDetail.updatedBy || "Chưa cập nhật"}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccount;
