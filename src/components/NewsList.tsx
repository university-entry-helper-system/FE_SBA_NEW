import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { filterNews } from "../api/news";
import type { NewsResponse } from "../types/news";
import "../css/home.css";

const PAGE_SIZE = 8;

const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const fetchNews = async (
    pageNum = 0,
    searchQuery = "",
    categoryValue = ""
  ) => {
    setLoading(true);
    setError("");
    try {
      const res = await filterNews({
        category: categoryValue || undefined,
        search: searchQuery || undefined,
        page: pageNum,
        size: PAGE_SIZE,
      });
      setNews(res.data.result.items);
      setTotalPages(res.data.result.totalPages);
    } catch {
      setError("Không thể tải danh sách tin tức.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page, search, category);
    // eslint-disable-next-line
  }, [page, search, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="news-list-page">
      <h2 className="news-title">Tin tức tuyển sinh</h2>
      <form className="news-search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm tin tức..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="category-select"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">Tất cả danh mục</option>
          <option value="ADMISSION_INFO">Thông tin tuyển sinh</option>
          <option value="EXAM_SCHEDULE">Lịch thi</option>
          <option value="SCHOLARSHIP">Học bổng</option>
          <option value="GUIDANCE">Hướng dẫn thủ tục</option>
          <option value="REGULATION_CHANGE">Thay đổi quy định</option>
          <option value="EVENT">Sự kiện</option>
          <option value="RESULT_ANNOUNCEMENT">Công bố kết quả</option>
          <option value="SYSTEM_NOTIFICATION">Thông báo hệ thống</option>
          <option value="OTHER">Khác</option>
        </select>
        <button className="search-btn" type="submit">
          Tìm kiếm
        </button>
      </form>
      {loading ? (
        <div className="news-loading">Đang tải...</div>
      ) : error ? (
        <div className="news-error">{error}</div>
      ) : (
        <>
          <div className="news-list-grid">
            {news.map((item) => (
              <div
                className="news-card"
                key={item.id}
                onClick={() => navigate(`/news/${item.id}`)}
              >
                <div className="news-card-img-wrap">
                  <img
                    src={
                      item.imageUrl ||
                      "https://placehold.co/300x180?text=No+Image"
                    }
                    alt={item.title}
                    className="news-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/300x180?text=No+Image";
                    }}
                  />
                </div>
                <div className="news-card-content">
                  <h3 className="news-card-title">{item.title}</h3>
                  <div className="news-card-summary">{item.summary}</div>
                  <div className="news-card-meta">
                    <span className="news-card-university">
                      {item.university?.shortName ||
                        item.university?.name ||
                        ""}
                    </span>
                    <span className="news-card-date">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : ""}
                    </span>
                    {/* Hiển thị số ngày đến phát hành nếu có */}
                    {typeof item.daysToRelease === "number" && (
                      <span className="news-card-daysToRelease">
                        {item.daysToRelease > 0
                          ? `Còn ${item.daysToRelease} ngày đến phát hành`
                          : item.daysToRelease === 0
                          ? "Phát hành hôm nay"
                          : `Đã phát hành ${-item.daysToRelease} ngày trước`}
                      </span>
                    )}
                  </div>
                  <div className="news-card-views">👁 {item.viewCount}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="news-pagination">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className={`news-page-btn${idx === page ? " active" : ""}`}
                  onClick={() => handlePageChange(idx)}
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

export default NewsList;
