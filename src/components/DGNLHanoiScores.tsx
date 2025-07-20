import { useState, useEffect, useMemo } from "react";
import "../css/ScoreDistribution.css";

const DGNLHanoiScores = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isStatisticsMode, setIsStatisticsMode] = useState(false);
  const [modalImage, setModalImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  const years = ["2025", "2024", "2023"];

  const subjects = useMemo(() => {
    if (isStatisticsMode) {
      // Hiển thị thống kê tổng hợp
      return [
        {
          name: "Thống kê tổng hợp DGNL Hà Nội (2023-2025)",
          image: "/images/scores/dgnl-hanoi/thongke-tong.jpg",
        },
      ];
    }

    return [
      {
        name: "Phổ điểm ĐGNL Hà Nội",
        image: "/images/scores/dgnl-hanoi/dgnl-hanoi-" + selectedYear + ".jpg",
      },
    ];
  }, [selectedYear, isStatisticsMode]);

  const openModal = (src: string, alt: string) => {
    setModalImage({ src, alt });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  // Function to check if image exists
  const checkImageExists = (imagePath: string, subjectName: string) => {
    const img = new Image();
    img.onload = () => {
      setAvailableSubjects((prev) => [
        ...prev.filter((s) => s !== subjectName),
        subjectName,
      ]);
    };
    img.onerror = () => {
      setAvailableSubjects((prev) => prev.filter((s) => s !== subjectName));
    };
    img.src = imagePath;
  };

  // Check images when component mounts or year changes
  useEffect(() => {
    const checkAllImages = () => {
      setAvailableSubjects([]);
      subjects.forEach((subject) => {
        checkImageExists(subject.image, subject.name);
      });
    };

    checkAllImages();
  }, [selectedYear, isStatisticsMode, subjects]);

  // Filter subjects to only show those with available images
  const filteredSubjects = subjects.filter((subject) =>
    availableSubjects.includes(subject.name)
  );

  return (
    <div className="score-distribution-container">
      <div className="score-header">
        <h1 className="score-title">
          Phổ Điểm Đánh Giá Năng Lực ĐH Quốc Gia Hà Nội
        </h1>
        <div className="header-controls">
          <div className="year-selector">
            <label htmlFor="year-select">Năm thi:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="year-dropdown"
              disabled={isStatisticsMode}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            className={`statistics-btn ${isStatisticsMode ? "active" : ""}`}
            onClick={() => setIsStatisticsMode(!isStatisticsMode)}
          >
            {isStatisticsMode ? "Xem theo năm" : "Xem thống kê"}
          </button>
        </div>
      </div>

      <div className="exam-info">
        <h2>
          {isStatisticsMode
            ? "Thống kê phổ điểm ĐGNL ĐH Quốc gia Hà Nội (2023-2025)"
            : `Kỳ thi Đánh giá Năng lực ĐH Quốc gia Hà Nội năm ${selectedYear}`}
        </h2>
        <p>
          {isStatisticsMode
            ? "Tổng hợp và so sánh phổ điểm trong 3 năm gần đây của kỳ thi Đánh giá Năng lực"
            : "Phổ điểm kỳ thi Đánh giá Năng lực của Đại học Quốc gia Hà Nội"}
        </p>
      </div>

      <div className="subjects-grid">
        {filteredSubjects.map((subject, index) => (
          <div key={index} className="subject-card">
            <h3 className="subject-name">{subject.name}</h3>
            <div className="image-container">
              <img
                src={subject.image}
                alt={`Phổ điểm ${subject.name} ${selectedYear}`}
                className="score-image"
                onClick={() =>
                  openModal(
                    subject.image,
                    `Phổ điểm ${subject.name} ${selectedYear}`
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
                {isStatisticsMode
                  ? `${subject.name}`
                  : `Phổ điểm ${subject.name} - Năm ${selectedYear}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="note-section">
        <h3>Lưu ý:</h3>
        <ul>
          <li>Phổ điểm được cập nhật từ ĐH Quốc gia Hà Nội</li>
          <li>Kỳ thi được tổ chức 1 lần trong năm</li>
          <li>Thời gian thi: 150 phút</li>
          {isStatisticsMode && (
            <>
              <li>Thống kê tổng hợp từ năm 2023 đến 2025</li>
              <li>Dữ liệu so sánh xu hướng qua các năm</li>
            </>
          )}
          <li>Dữ liệu có thể thay đổi theo từng lần công bố</li>
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

export default DGNLHanoiScores;
