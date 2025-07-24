import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../css/AdminUniversities.css";

interface Specialty {
  id: number;
  name: string;
  status: string;
}

interface ConsultantProfile {
  accountId: string;
  fullName: string;
  bio: string;
  status: "ONLINE" | "OFFLINE" | "BUSY";
  specialties: Specialty[];
}

interface ApiResponse {
  code: number;
  message: string;
  result: {
    content: ConsultantProfile[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

const AdminConsultantProfiles: React.FC = () => {
  const [majors, setMajors] = useState<{ id: number; name: string }[]>([]);
  const [editSpecialtyIds, setEditSpecialtyIds] = useState<number[]>([]);
  const [profiles, setProfiles] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProfile, setEditingProfile] =
    useState<ConsultantProfile | null>(null);
  const [editBio, setEditBio] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // useEffect lấy danh sách majors khi mở form edit
  useEffect(() => {
    if (editingProfile) {
      (async () => {
        try {
          const res = await axios.get("/majors?page=0&size=50");
          setMajors(res.data.result.items);
          setEditSpecialtyIds(editingProfile.specialties.map((s) => s.id));
        } catch {
          // ignore error when loading majors for edit
        }
      })();
    }
  }, [editingProfile]);

  // useEffect lấy danh sách profiles khi đổi page
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get<ApiResponse>(
          `http://localhost:8080/api/v1/consultant-profiles?page=${page}&size=10`
        );
        setProfiles(res.data.result.content);
        setTotalPages(res.data.result.totalPages);
      } catch {
        setError("Không thể tải danh sách quản trị viên.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [page]);

  // Function để tìm kiếm consultant profiles
  const searchProfiles = async (keyword: string, searchPage: number = 0) => {
    setLoading(true);
    setError("");
    setIsSearching(keyword.trim() !== "");

    try {
      let res;
      if (keyword.trim() === "") {
        // Nếu keyword rỗng, lấy tất cả profiles
        res = await axios.get<ApiResponse>(
          `http://localhost:8080/api/v1/consultant-profiles?page=${searchPage}&size=10`
        );
      } else {
        // Nếu có keyword, tìm kiếm
        res = await axios.get<ApiResponse>(
          `/consultant-profiles/search?keyword=${encodeURIComponent(
            keyword
          )}&page=${searchPage}&size=10`
        );
      }
      setProfiles(res.data.result.content);
      setTotalPages(res.data.result.totalPages);
      setPage(searchPage);
    } catch {
      setError("Không thể tìm kiếm quản trị viên.");
    } finally {
      setLoading(false);
    }
  };

  // Function để reset tìm kiếm
  const resetSearch = () => {
    setSearchKeyword("");
    setIsSearching(false);
    setPage(0);
    // Tự động reload danh sách ban đầu
    const fetchProfiles = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get<ApiResponse>(
          `http://localhost:8080/api/v1/consultant-profiles?page=0&size=10`
        );
        setProfiles(res.data.result.content);
        setTotalPages(res.data.result.totalPages);
      } catch {
        setError("Không thể tải danh sách quản trị viên.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  };

  // Function để thay đổi status consultant profile
  const changeConsultantStatus = async (
    profileId: number,
    newStatus: "ONLINE" | "OFFLINE" | "BUSY"
  ) => {
    setLoading(true);
    try {
      await axios.patch(
        `/consultant-profiles/${profileId}/status?status=${newStatus}`
      );

      // Cập nhật lại bảng sau khi thay đổi status thành công
      setProfiles((prev) =>
        prev.map((p) =>
          p.accountId === profiles[profileId - 1].accountId
            ? { ...p, status: newStatus }
            : p
        )
      );
    } catch {
      setError("Không thể cập nhật trạng thái quản trị viên.");
    } finally {
      setLoading(false);
    }
  };

  // Function để render status với màu sắc
  const renderStatus = (status: "ONLINE" | "OFFLINE" | "BUSY") => {
    const getStatusClass = (status: string) => {
      switch (status) {
        case "ONLINE":
          return "status-badge status-online";
        case "OFFLINE":
          return "status-badge status-offline";
        case "BUSY":
          return "status-badge status-busy";
        default:
          return "status-badge";
      }
    };

    return <span className={getStatusClass(status)}>{status}</span>;
  };

  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý Quản trị viên tư vấn
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các quản trị viên tư vấn trong hệ thống
          </p>
        </div>
      </div>
      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-controls">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, bio, chuyên ngành..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  searchProfiles(searchKeyword);
                }
              }}
            />
            <button
              onClick={() => searchProfiles(searchKeyword)}
              disabled={loading}
              className="search-btn"
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
            {isSearching && (
              <button onClick={resetSearch} className="reset-btn">
                Đặt lại
              </button>
            )}
          </div>
          {isSearching && (
            <div className="search-info">
              Đang hiển thị kết quả tìm kiếm cho: "{searchKeyword}"
            </div>
          )}
        </div>
      </div>
      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Trạng thái</th>
                <th>Bio</th>
                <th>Chuyên ngành</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile, index) => (
                <tr key={profile.accountId} className="table-row">
                  <td>{index + 1}</td>
                  <td>{profile.fullName}</td>
                  <td>{renderStatus(profile.status)}</td>
                  <td>{profile.bio}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {profile.specialties.length === 0 ? (
                        <span style={{ color: "#888", fontStyle: "italic" }}>
                          Chưa có chuyên ngành
                        </span>
                      ) : (
                        profile.specialties.map((s) => (
                          <span
                            key={s.id}
                            className="chip"
                            style={{
                              marginBottom: 2,
                              background:
                                s.status === "active" ? "#e0f2fe" : "#f3f4f6",
                              color: s.status === "active" ? "#0369a1" : "#888",
                            }}
                          >
                            {s.name}
                            <span
                              className="specialty-status"
                              style={{ marginLeft: 6, fontSize: "0.8em" }}
                            >
                              ({s.status})
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>
                    <div
                      className="action-buttons"
                      style={{
                        justifyContent: "flex-end",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() => {
                          setEditingProfile(profile);
                          setEditBio(profile.bio);
                        }}
                        className="action-btn edit-btn"
                        title="Sửa Bio"
                        style={{ minWidth: 80 }}
                      >
                        Sửa Bio
                      </button>
                      {/* Nút chỉnh trạng thái */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginLeft: 12,
                        }}
                      >
                        {/* Nút trạng thái hiện tại (nổi bật) */}
                        <button
                          className="action-btn"
                          style={{
                            minWidth: 90,
                            fontWeight: 600,
                            background:
                              profile.status === "ONLINE"
                                ? "#10b981"
                                : profile.status === "OFFLINE"
                                ? "#6b7280"
                                : "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            cursor: "default",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          }}
                          disabled
                          title={`Trạng thái hiện tại: ${profile.status}`}
                        >
                          {profile.status === "ONLINE" && "🟢 Online"}
                          {profile.status === "OFFLINE" && "⚪ Offline"}
                          {profile.status === "BUSY" && "🟠 Busy"}
                        </button>
                        {/* Các nút chuyển trạng thái khác */}
                        {["ONLINE", "OFFLINE", "BUSY"]
                          .filter((s) => s !== profile.status)
                          .map((status) => (
                            <button
                              key={status}
                              className="action-btn"
                              style={{
                                minWidth: 36,
                                fontWeight: 500,
                                background:
                                  status === "ONLINE"
                                    ? "#d1fae5"
                                    : status === "OFFLINE"
                                    ? "#e5e7eb"
                                    : "#fef3c7",
                                color:
                                  status === "ONLINE"
                                    ? "#059669"
                                    : status === "OFFLINE"
                                    ? "#374151"
                                    : "#b45309",
                                border: "none",
                                borderRadius: 8,
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1,
                                fontSize: 13,
                                marginLeft: 2,
                                padding: "6px 8px",
                                transition: "background 0.2s",
                              }}
                              disabled={loading}
                              onClick={() =>
                                changeConsultantStatus(
                                  index + 1,
                                  status as "ONLINE" | "OFFLINE" | "BUSY"
                                )
                              }
                              title={`Chuyển sang ${status}`}
                            >
                              {status === "ONLINE" && "🟢"}
                              {status === "OFFLINE" && "⚪"}
                              {status === "BUSY" && "🟠"}
                            </button>
                          ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && !loading && (
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
              <h3>Không tìm thấy quản trị viên tư vấn</h3>
              <p>Thử tìm kiếm với từ khóa khác hoặc thêm mới</p>
            </div>
          )}
        </div>
      </div>
      {/* Edit Modal and View Modal giữ nguyên như cũ, chỉ cần đảm bảo nằm trong admin-universities */}
      {editingProfile && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chỉnh sửa thông tin cho {editingProfile.fullName}</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError("");
                // Kiểm tra editingProfile và accountId
                if (!editingProfile || !editingProfile.accountId) {
                  setError("Không tìm thấy ID quản trị viên để cập nhật.");
                  setLoading(false);
                  return;
                }
                try {
                  const profileId =
                    profiles.findIndex(
                      (p) => p.accountId === editingProfile.accountId
                    ) + 1;

                  await axios.put(`/consultant-profiles/${profileId}`, {
                    accountId: editingProfile.accountId,
                    bio: editBio,
                    specialtyIds: editSpecialtyIds,
                  });
                  // Cập nhật lại bảng
                  setProfiles((prev) =>
                    prev.map((p) =>
                      p.accountId === editingProfile.accountId
                        ? {
                            ...p,
                            bio: editBio,
                            specialties: majors
                              .filter((m) => editSpecialtyIds.includes(m.id))
                              .map((m) => ({
                                id: m.id,
                                name: m.name,
                                status: "active",
                              })),
                          }
                        : p
                    )
                  );
                  setEditingProfile(null);
                } catch {
                  setError("Không thể cập nhật thông tin.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="form-group">
                <label className="form-label">Bio:</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={4}
                  className="form-textarea"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Chuyên ngành:</label>
                <div className="specialty-list">
                  {majors.map((major) => (
                    <div key={major.id} className="specialty-item">
                      <input
                        type="checkbox"
                        className="specialty-checkbox"
                        checked={editSpecialtyIds.includes(major.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditSpecialtyIds([
                              ...editSpecialtyIds,
                              major.id,
                            ]);
                          } else {
                            setEditSpecialtyIds(
                              editSpecialtyIds.filter((id) => id !== major.id)
                            );
                          }
                        }}
                      />
                      <label className="specialty-label">{major.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-buttons">
                <button
                  type="submit"
                  disabled={loading}
                  className="save-button"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="cancel-button"
                >
                  Hủy
                </button>
              </div>
              {error && <div className="error">{error}</div>}
            </form>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-news-pagination">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={`page-${idx + 1}`}
              className={`pagination-btn ${idx === page ? "active" : ""}`}
              onClick={() => {
                if (isSearching) {
                  searchProfiles(searchKeyword, idx);
                } else {
                  setPage(idx);
                }
              }}
              disabled={idx === page}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminConsultantProfiles;
