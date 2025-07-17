import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNewsById } from "../api/news";
import type { NewsResponse } from "../types/news";
import "../css/home.css";

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        if (!id) throw new Error("Không tìm thấy ID tin tức");
        const res = await getNewsById(Number(id));
        setNews(res.data.result);
      } catch {
        setError("Không thể tải chi tiết tin tức.");
        setNews(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) return <div className="news-loading">Đang tải...</div>;
  if (error) return <div className="news-error">{error}</div>;
  if (!news) return <div className="news-error">Không tìm thấy tin tức.</div>;

  return (
    <div className="news-detail-page">
      <button className="news-back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>
      <div className="news-detail-card">
        <div className="news-detail-img-wrap">
          <img
            src={news.imageUrl || "https://placehold.co/600x300?text=No+Image"}
            alt={news.title}
            className="news-detail-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x300?text=No+Image";
            }}
          />
        </div>
        <div className="news-detail-content">
          <h1 className="news-detail-title">{news.title}</h1>
          <div className="news-detail-meta">
            <span className="news-detail-university">
              {news.university?.shortName || news.university?.name || ""}
            </span>
            <span className="news-detail-date">
              {news.publishedAt
                ? new Date(news.publishedAt).toLocaleDateString()
                : ""}
            </span>
            <span className="news-detail-views">👁 {news.viewCount}</span>
          </div>
          <div className="news-detail-summary">{news.summary}</div>
          <div
            className="news-detail-body"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
