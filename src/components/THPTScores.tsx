import { useState, useEffect } from "react";
import "../css/ScoreDistribution.css";
import { getScores, getSubjectDisplayName, type Score } from "../api/scores";

const THPTScores = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [modalImage, setModalImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const years = ["2025", "2024", "2023", "2022", "2021", "2020"];

  // Load scores từ API khi component mount hoặc year thay đổi
  useEffect(() => {
    const loadScores = async () => {
      setLoading(true);
      setError(null);
      try {
        const scoresData = await getScores(parseInt(selectedYear), "THPT");
        setScores(scoresData);
      } catch (err) {
        setError("Không thể tải dữ liệu điểm số");
        console.error("Error loading scores:", err);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, [selectedYear]);

  const openModal = (src: string, alt: string) => {
    setModalImage({ src, alt });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="score-distribution-container">
      <div className="score-header">
        <h1 className="score-title">Phổ Điểm Thi THPT Quốc Gia</h1>
        <div className="year-selector">
          <label htmlFor="year-select">Năm thi:</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-dropdown"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="exam-info">
        <h2>Kỳ thi THPT Quốc Gia năm {selectedYear}</h2>
        <p>
          Phổ điểm các môn thi trong kỳ thi Tốt nghiệp Trung học Phổ thông Quốc
          gia
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu điểm số...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-section">
          <p className="error-message">{error}</p>
          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Scores Grid */}
      {!loading && !error && scores.length > 0 && (
        <div className="subjects-grid">
          {scores.map((score) => (
            <div key={score.id} className="subject-card">
              <h3 className="subject-name">
                {getSubjectDisplayName(score.subject)}
              </h3>
              <div className="image-container">
                <img
                  src={score.scoreUrl}
                  alt={`Phổ điểm ${getSubjectDisplayName(score.subject)} ${
                    score.year
                  }`}
                  className="score-image"
                  onClick={() =>
                    openModal(
                      score.scoreUrl,
                      `Phổ điểm ${getSubjectDisplayName(score.subject)} ${
                        score.year
                      }`
                    )
                  }
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/scores/placeholder.jpg";
                  }}
                />
              </div>
              <div className="score-info">
                <p>
                  Phổ điểm môn {getSubjectDisplayName(score.subject)} - Năm{" "}
                  {score.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && scores.length === 0 && (
        <div className="no-data-section">
          <p>Không có dữ liệu điểm số cho năm {selectedYear}</p>
          <p>Vui lòng chọn năm khác hoặc thử lại sau.</p>
        </div>
      )}

      <div className="note-section">
        <h3>Lưu ý:</h3>
        <ul>
          <li>Phổ điểm được cập nhật từ Bộ Giáo dục và Đào tạo</li>
          <li>Thống kê dựa trên kết quả thi chính thức</li>
          <li>Dữ liệu có thể thay đổi theo từng đợt công bố</li>
        </ul>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className={`image-modal ${modalImage ? "open" : ""}`}
          onClick={closeModal}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="image-modal-close" onClick={closeModal}>
              ×
            </button>
            <img
              src={modalImage.src}
              alt={modalImage.alt}
              className="image-modal-image"
            />
            <div className="image-modal-info">{modalImage.alt}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default THPTScores;
