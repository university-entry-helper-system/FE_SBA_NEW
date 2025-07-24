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

  const pageSize = 12;

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
      <div className="majors">
        <div className="majors__loading">
          <div className="majors__spinner"></div>
          <p>Đang tải danh sách ngành học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="majors">
        <div className="majors__error">
          <h2 className="majors__error-title">Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button onClick={fetchMajors} className="majors__retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="majors">
      {/* Header */}
      <div className="majors__header">
        <div className="majors__header-bg" />
        <div className="majors__header-content">
          <h1 className="majors__title">Danh Sách Ngành Học</h1>
          <p className="majors__desc">
            Khám phá các ngành học phổ biến và tìm hiểu thông tin chi tiết về
            từng ngành
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="majors__search">
        <div className="majors__search-container">
          <div className="majors__search-input-wrapper">
            <svg
              className="majors__search-icon"
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
              className="majors__search-input"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="majors__search-clear-btn"
                aria-label="Xóa tìm kiếm"
              >
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
      <div className="majors__content">
        {filteredMajors.length === 0 ? (
          <div className="majors__no-results">
            <div className="majors__no-results-icon">
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
            <h3 className="majors__no-results-title">
              Không tìm thấy ngành học nào
            </h3>
            <p className="majors__no-results-desc">
              Hãy thử từ khóa khác hoặc xóa bộ lọc tìm kiếm
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="majors__clear-filter-btn"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="majors__grid">
            {filteredMajors.map((major) => (
              <div
                key={major.id}
                className={`majors__card majors__card--${
                  major.status === "active" ? "active" : "inactive"
                }`}
              >
                <div className="majors__card-header">
                  <div className="majors__card-icon">
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
                  <span className="majors__card-status">
                    {major.status === "active" ? "Đang mở" : "Tạm dừng"}
                  </span>
                </div>
                <div className="majors__card-content">
                  <h3 className="majors__card-name">{major.name}</h3>
                  <p className="majors__card-id">Mã ngành: {major.id}</p>
                </div>
                <div className="majors__card-footer"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!searchTerm && totalPages > 1 && (
        <div className="majors__pagination">
          <div className="majors__pagination-container">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="majors__pagination-btn majors__pagination-btn--prev"
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

            <div className="majors__pagination-info">
              <span className="majors__page-info">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <div className="majors__page-numbers">
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
                      className={`majors__page-number-btn${
                        currentPage === pageNum
                          ? " majors__page-number-btn--active"
                          : ""
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
              className="majors__pagination-btn majors__pagination-btn--next"
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
