import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { filterNews } from "../api/news";
import type { NewsResponse } from "../types/news";
import "../css/home.css";
import "../css/NewsCountdown.css";

const PAGE_SIZE = 8;

// Badge màu theo số ngày còn lại
const getBadgeClass = (days: number) => {
  if (days <= 7) return "countdown-badge green";
  if (days <= 14) return "countdown-badge blue";
  if (days <= 30) return "countdown-badge purple";
  return "countdown-badge orange";
};

// Helper lấy URL ảnh đầy đủ từ Minio cho news (giống AdminNews)
const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return "https://placehold.co/300x180?text=No+Image";
  if (imageUrl.startsWith("http")) {
    let url = imageUrl.split("?")[0];
    url = url.replace("minio:9000", "localhost:9000");
    return url;
  }
  return `http://localhost:9000/mybucket/${imageUrl}`;
};

const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsResponse[]>([]);
  const [countdownNews, setCountdownNews] = useState<NewsResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  // Fetch all news for countdown and normal list
  useEffect(() => {
    const fetchAllNews = async () => {
      setLoading(true);
      setError("");
      try {
        // Lấy nhiều hơn PAGE_SIZE để đủ countdown và news thường
        const res = await filterNews({
          category: category || undefined,
          search: search || undefined,
          page: 0,
          size: 50,
        });
        const items: NewsResponse[] = res.data.result.items || [];
        // News sắp diễn ra (daysToRelease > 0)
        const countdown = items
          .filter(
            (n) => typeof n.daysToRelease === "number" && n.daysToRelease > 0
          )
          .sort((a, b) => (a.daysToRelease ?? 0) - (b.daysToRelease ?? 0));
        setCountdownNews(countdown);
        // News thường (đã phát hành hoặc không có daysToRelease)
        const normal = items.filter(
          (n) => !n.daysToRelease || n.daysToRelease <= 0
        );
        setNews(normal.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
        setTotalPages(Math.ceil(normal.length / PAGE_SIZE));
      } catch {
        setError("Không thể tải danh sách tin tức.");
        setNews([]);
        setCountdownNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllNews();
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

  // Banner đếm ngược lớn (news gần nhất)
  const bannerNews = countdownNews.length > 0 ? countdownNews[0] : null;
  // Các card đếm ngược nhỏ (bỏ news đã dùng cho banner)
  const countdownCards = countdownNews.slice(1);

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

      {/* Banner đếm ngược lớn */}
      {bannerNews && (
        <div
          className="countdown-banner-glass guest-banner"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/news/${bannerNews.id}`)}
          title="Xem chi tiết"
        >
          <div className="banner-content">
            <div className="banner-title">
              <span className="gradient-text">Chỉ còn</span>
            </div>
            <div className="banner-countdown">
              <span className="pulse-badge guest-badge">
                {bannerNews.daysToRelease} Ngày
              </span>
            </div>
            <div className="banner-main-title">{bannerNews.title}</div>
            {bannerNews.summary && (
              <div className="banner-desc">
                <em>{bannerNews.summary}</em>
              </div>
            )}
            <div className="banner-date">
              <span className="banner-date-badge">
                {bannerNews.releaseDate
                  ? new Date(bannerNews.releaseDate).toLocaleString()
                  : ""}
              </span>
            </div>
            <div className="banner-socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Zalo"
              >
                <i className="fab fa-facebook-messenger"></i>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          <div className="banner-decor-1 floating"></div>
          <div className="banner-decor-2 floating"></div>
        </div>
      )}

      {/* Grid các card đếm ngược nhỏ */}
      {countdownCards.length > 0 && (
        <div className="countdown-news-section">
          <h2 className="section-title gradient-text">Tin sắp phát hành</h2>
          <div className="countdown-news-grid">
            {countdownCards.map((item) => (
              <div
                className="countdown-news-card glass-card floating guest-card"
                key={item.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/news/${item.id}`)}
                title="Xem chi tiết"
              >
                <div className="countdown-card-img-wrap">
                  <div className="countdown-card-icon">
                    <span
                      role="img"
                      aria-label="Đồng hồ cát"
                      style={{ fontSize: 32 }}
                    >
                      ⏳
                    </span>
                  </div>
                  <span className={getBadgeClass(item.daysToRelease!)}>
                    Còn {item.daysToRelease} ngày
                  </span>
                </div>
                <div className="countdown-card-content">
                  <h3 className="countdown-card-title">{item.title}</h3>
                  {item.summary && (
                    <div
                      className="countdown-card-date"
                      style={{
                        color: "#888",
                        fontSize: "0.97rem",
                        marginBottom: 4,
                      }}
                    >
                      {item.summary}
                    </div>
                  )}
                  <div className="countdown-card-date">
                    Ngày phát hành:{" "}
                    {item.releaseDate
                      ? new Date(item.releaseDate).toLocaleDateString()
                      : ""}
                  </div>
                  <a className="countdown-card-link" href={`/news/${item.id}`}>
                    → Xem chi tiết
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách news thường */}
      {loading ? (
        <div className="news-loading">Đang tải...</div>
      ) : error ? (
        <div className="news-error">{error}</div>
      ) : news.length === 0 ? (
        <div className="news-error">Không có tin tức phù hợp.</div>
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
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="news-card-img"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxWidth: "100%",
                      borderRadius: 10,
                      objectFit: "cover",
                      display: "block",
                    }}
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
