import { useState, useEffect, useCallback } from "react";
import { getAllMajors, type Major } from "../api/major";
import "../css/Majors.css";

const Majors = () => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMajors, setFilteredMajors] = useState<Major[]>([]);

  const pageSize = 12; // 12 items per page for better grid layout

  const fetchMajors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllMajors(currentPage, pageSize);

      if (response.code === 1000) {
        setMajors(response.result.items);
        setTotalPages(response.result.totalPages);
      } else {
        setError("Không thể tải danh sách ngành học");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
      console.error("Error fetching majors:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchMajors();
  }, [fetchMajors]);

  useEffect(() => {
    // Filter majors based on search term
    const filtered = majors.filter((major) =>
      major.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMajors(filtered);
  }, [majors, searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="majors-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách ngành học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="majors-container">
        <div className="error-message">
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button onClick={fetchMajors} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="majors-container">
      {/* Header Section */}
      <div className="majors-header">
        <div className="header-content">
          <h1 className="page-title">Danh Sách Ngành Học</h1>
          <p className="page-description">
            Khám phá các ngành học phổ biến và tìm hiểu thông tin chi tiết về
            từng ngành
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm ngành học..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="clear-search-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Majors Grid */}
      <div className="majors-content">
        {filteredMajors.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h3>Không tìm thấy ngành học nào</h3>
            <p>Hãy thử từ khóa khác hoặc xóa bộ lọc tìm kiếm</p>
            {searchTerm && (
              <button onClick={clearSearch} className="clear-filter-btn">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="majors-grid">
            {filteredMajors.map((major) => (
              <div key={major.id} className="major-card">
                <div className="major-card-header">
                  <div className="major-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <span
                    className={`status-badge ${
                      major.status === "active" ? "active" : "inactive"
                    }`}
                  >
                    {major.status === "active" ? "Đang mở" : "Tạm dừng"}
                  </span>
                </div>
                <div className="major-card-content">
                  <h3 className="major-name">{major.name}</h3>
                  <p className="major-id">Mã ngành: {major.id}</p>
                </div>
                <div className="major-card-footer">
                  <button className="view-detail-btn">
                    Xem chi tiết
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <polyline points="9,18 15,12 9,6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!searchTerm && totalPages > 1 && (
        <div className="pagination-section">
          <div className="pagination-container">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="pagination-btn prev-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Trang trước
            </button>

            <div className="pagination-info">
              <span className="page-info">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage <= 2) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`page-number-btn ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="pagination-btn next-btn"
            >
              Trang sau
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Majors;
