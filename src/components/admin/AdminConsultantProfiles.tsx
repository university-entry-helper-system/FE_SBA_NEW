import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

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
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
      case 'OFFLINE':
        return { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
      case 'BUSY':
        return { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' };
      default:
        return { backgroundColor: '#e2e3e5', color: '#383d41', border: '1px solid #d6d8db' };
    }
  };

  return (
    <span style={{
      ...getStatusStyle(status),
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.85em',
      fontWeight: '500',
      display: 'inline-block'
    }}>
      {status}
    </span>
  );
};

  return (
    <div className="admin-consultant-profiles-page">
      <h2>Quản lý Quản trị viên</h2>
      
      {/* Search Bar */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, bio, chuyên ngành..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              flex: '1',
              minWidth: '250px',
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchProfiles(searchKeyword);
              }
            }}
          />
          <button
            onClick={() => searchProfiles(searchKeyword)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
          {isSearching && (
            <button
              onClick={resetSearch}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Đặt lại
            </button>
          )}
        </div>
        {isSearching && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '14px', 
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            Đang hiển thị kết quả tìm kiếm cho: "{searchKeyword}"
          </div>
        )}
      </div>
      {editingProfile && (
        <div className="edit-profile-modal">
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
            <label>Bio:</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={4}
              style={{ width: "100%" }}
            />
            <label style={{ marginTop: 12, display: "block" }}>Chuyên ngành:</label>
            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8, borderRadius: 4 }}>
              {majors.map((major) => (
                <div key={major.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editSpecialtyIds.includes(major.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditSpecialtyIds([...editSpecialtyIds, major.id]);
                        } else {
                          setEditSpecialtyIds(editSpecialtyIds.filter(id => id !== major.id));
                        }
                      }}
                    />
                    {major.name}
                  </label>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <button type="submit" disabled={loading}>Lưu</button>
              <button type="button" onClick={() => setEditingProfile(null)} style={{ marginLeft: 8 }}>Hủy</button>
            </div>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      )}
      
      {/* Popup xem chi tiết consultant profile */}
      {viewingProfile && (
        <div className="view-profile-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3>Chi tiết Quản trị viên: {viewingProfile.fullName}</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Account ID:</strong>
              <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em' }}>
                {viewingProfile.accountId}
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Trạng thái:</strong>
              <div style={{ marginTop: '8px' }}>
                {renderStatus(viewingProfile.status)}
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Bio:</strong>
              <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginTop: '5px' }}>
                {viewingProfile.bio || 'Chưa có thông tin bio'}
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Chuyên ngành ({viewingProfile.specialties.length}):</strong>
              <div style={{ marginTop: '8px' }}>
                {viewingProfile.specialties.length > 0 ? (
                  viewingProfile.specialties.map((specialty) => (
                    <div key={specialty.id} style={{
                      display: 'inline-block',
                      margin: '4px',
                      padding: '6px 12px',
                      backgroundColor: specialty.status === 'active' ? '#e8f5e8' : '#f5f5f5',
                      border: `1px solid ${specialty.status === 'active' ? '#4caf50' : '#ccc'}`,
                      borderRadius: '20px',
                      fontSize: '0.9em'
                    }}>
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
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <table className="admin-table">
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
                <tr key={profile.accountId}>
                  <td>{index + 1}</td>
                  <td>{profile.fullName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderStatus(profile.status)}
                      <select
                        value={profile.status}
                        onChange={(e) => changeConsultantStatus(index, e.target.value as 'ONLINE' | 'OFFLINE' | 'BUSY')}
                        disabled={loading}
                        style={{
                          padding: '2px 4px',
                          fontSize: '0.8em',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          backgroundColor: 'white'
                        }}
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
                      <span key={s.id} style={{ display: "inline-block", marginRight: 8 }}>
                        {s.name} <span style={{ color: "#888", fontSize: "0.9em" }}>({s.status})</span>
                      </span>
                    ))}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingProfile(profile);
                        setEditBio(profile.bio);
                      }}
                      style={{ marginRight: '8px' }}
                    >Sửa Bio</button>
                    <button
                      onClick={() => viewProfileDetail(index)}
                      disabled={viewLoading}
                      style={{ 
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {viewLoading ? 'Đang tải...' : 'Xem chi tiết'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={`page-${idx + 1}`}
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
