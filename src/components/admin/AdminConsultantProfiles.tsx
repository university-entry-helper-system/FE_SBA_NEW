import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../css/AdminConsultantProfiles.css";

interface Specialty {
  id: number;
  name: string;
  status: string;
}

interface ConsultantProfile {
  accountId: string;
  fullName: string;
  bio: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
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
  const [editingProfile, setEditingProfile] = useState<ConsultantProfile | null>(null);
  const [editBio, setEditBio] = useState("");
  const [viewingProfile, setViewingProfile] = useState<ConsultantProfile | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // useEffect lấy danh sách majors khi mở form edit
useEffect(() => {
  if (editingProfile) {
    (async () => {
      try {
        const res = await axios.get("/majors?page=0&size=50");
        setMajors(res.data.result.items);
        setEditSpecialtyIds(editingProfile.specialties.map(s => s.id));
      } catch {}
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
    } catch (err) {
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
        `/consultant-profiles/search?keyword=${encodeURIComponent(keyword)}&page=${searchPage}&size=10`
      );
    }
    setProfiles(res.data.result.content);
    setTotalPages(res.data.result.totalPages);
    setPage(searchPage);
  } catch (err) {
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
    } catch (err) {
      setError("Không thể tải danh sách quản trị viên.");
    } finally {
      setLoading(false);
    }
  };
  fetchProfiles();
};

// Function để xem chi tiết consultant profile
const viewProfileDetail = async (profileIndex: number) => {
  setViewLoading(true);
  try {
    const profileId = profileIndex + 1;
    const res = await axios.get(`/consultant-profiles/${profileId}`);
    setViewingProfile(res.data.result);
  } catch (err) {
    setError("Không thể tải thông tin chi tiết quản trị viên.");
  } finally {
    setViewLoading(false);
  }
};

// Function để thay đổi status consultant profile
const changeConsultantStatus = async (profileIndex: number, newStatus: 'ONLINE' | 'OFFLINE' | 'BUSY') => {
  setLoading(true);
  try {
    const profileId = profileIndex + 1;
    await axios.patch(`/consultant-profiles/${profileId}/status?status=${newStatus}`);
    
    // Cập nhật lại bảng sau khi thay đổi status thành công
    setProfiles((prev) =>
      prev.map((p, idx) =>
        idx === profileIndex ? { ...p, status: newStatus } : p
      )
    );
  } catch (err) {
    setError("Không thể cập nhật trạng thái quản trị viên.");
  } finally {
    setLoading(false);
  }
};

// Function để render status với màu sắc
const renderStatus = (status: 'ONLINE' | 'OFFLINE' | 'BUSY') => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'status-badge status-online';
      case 'OFFLINE':
        return 'status-badge status-offline';
      case 'BUSY':
        return 'status-badge status-busy';
      default:
        return 'status-badge';
    }
  };

  return (
    <span className={getStatusClass(status)}>
      {status}
    </span>
  );
};

  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý Quản trị viên
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các quản trị viên tư vấn trong hệ thống
          </p>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="admin-news-filter-row">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, bio, chuyên ngành..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchProfiles(searchKeyword);
              }
            }}
          />
          <button
            onClick={() => searchProfiles(searchKeyword)}
            disabled={loading}
            className="search-button"
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
          {isSearching && (
            <button
              onClick={resetSearch}
              className="reset-button"
            >
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
      {editingProfile && (
        <div className="edit-profile-modal">
          <div className="modal-content">
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
                  // Sử dụng index + 1 làm ID cho endpoint PUT
                  const profileIndex = profiles.findIndex(p => p.accountId === editingProfile.accountId);
                  const profileId = profileIndex + 1;
                  
                  await axios.put(
                    `/consultant-profiles/${profileId}`,
                    {
                      accountId: editingProfile.accountId,
                      bio: editBio,
                      specialtyIds: editSpecialtyIds,
                    }
                  );
                  // Cập nhật lại bảng
                  setProfiles((prev) =>
                    prev.map((p) =>
                      p.accountId === editingProfile.accountId
                        ? {
                            ...p,
                            bio: editBio,
                            specialties: majors
                              .filter(m => editSpecialtyIds.includes(m.id))
                              .map(m => ({ id: m.id, name: m.name, status: "active" }))
                          }
                        : p
                    )
                  );
                  setEditingProfile(null);
                } catch (err) {
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
                            setEditSpecialtyIds([...editSpecialtyIds, major.id]);
                          } else {
                            setEditSpecialtyIds(editSpecialtyIds.filter(id => id !== major.id));
                          }
                        }}
                      />
                      <label className="specialty-label">{major.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" disabled={loading} className="save-button">Lưu</button>
                <button type="button" onClick={() => setEditingProfile(null)} className="cancel-button">Hủy</button>
              </div>
              {error && <div className="error">{error}</div>}
            </form>
          </div>
        </div>
      )}
      
      {/* Popup xem chi tiết consultant profile */}
      {viewingProfile && (
        <div className="view-profile-modal">
          <div className="view-modal-content">
            <h3>Chi tiết Quản trị viên: {viewingProfile.fullName}</h3>
            
            <div className="detail-section">
              <div className="detail-label">Account ID:</div>
              <div className="detail-content account-id">
                {viewingProfile.accountId}
              </div>
            </div>
            
            <div className="detail-section">
              <div className="detail-label">Trạng thái:</div>
              <div style={{ marginTop: '8px' }}>
                {renderStatus(viewingProfile.status)}
              </div>
            </div>
            
            <div className="detail-section">
              <div className="detail-label">Bio:</div>
              <div className="detail-content">
                {viewingProfile.bio || 'Chưa có thông tin bio'}
              </div>
            </div>
            
            <div className="detail-section">
              <div className="detail-label">Chuyên ngành ({viewingProfile.specialties.length}):</div>
              <div style={{ marginTop: '8px' }}>
                {viewingProfile.specialties.length > 0 ? (
                  viewingProfile.specialties.map((specialty) => (
                    <div 
                      key={specialty.id} 
                      className={`specialty-detail-tag ${specialty.status === 'active' ? 'specialty-active' : 'specialty-inactive'}`}
                    >
                      {specialty.name}
                      <span style={{ 
                        marginLeft: '6px', 
                        fontSize: '0.8em',
                        color: specialty.status === 'active' ? '#2e7d32' : '#666'
                      }}>
                        ({specialty.status})
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontStyle: 'italic', color: '#666' }}>Chưa có chuyên ngành nào</div>
                )}
              </div>
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button 
                onClick={() => setViewingProfile(null)}
                className="close-button"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="admin-news-loading-container">
          <div className="admin-news-loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="admin-news-alert alert-error">{error}</div>
      ) : (
        <>
          <div className="admin-news-table-container">
            <div className="table-wrapper">
              <table className="admin-news-table">
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
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {renderStatus(profile.status)}
                          <select
                            value={profile.status}
                            onChange={(e) => changeConsultantStatus(index, e.target.value as 'ONLINE' | 'OFFLINE' | 'BUSY')}
                            disabled={loading}
                            className="status-dropdown"
                          >
                            <option value="ONLINE">ONLINE</option>
                            <option value="OFFLINE">OFFLINE</option>
                            <option value="BUSY">BUSY</option>
                          </select>
                        </div>
                      </td>
                      <td>{profile.bio}</td>
                      <td>
                        {profile.specialties.map((s) => (
                          <span key={s.id} className="specialty-tag">
                            {s.name} <span className="specialty-status">({s.status})</span>
                          </span>
                        ))}
                      </td>
                      <td>
                        <div className="admin-news-action-buttons">
                          <button
                            onClick={() => {
                              setEditingProfile(profile);
                              setEditBio(profile.bio);
                            }}
                            className="action-btn edit-btn"
                            title="Sửa Bio"
                          >
                            Sửa Bio
                          </button>
                          <button
                            onClick={() => viewProfileDetail(index)}
                            disabled={viewLoading}
                            className="action-btn view-btn"
                            title="Xem chi tiết"
                          >
                            {viewLoading ? 'Đang tải...' : 'Xem chi tiết'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="admin-news-pagination">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={`page-${idx + 1}`}
                  className={`pagination-btn ${idx === page ? 'active' : ''}`}
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
        </>
      )}
    </div>
  );
};

export default AdminConsultantProfiles;
