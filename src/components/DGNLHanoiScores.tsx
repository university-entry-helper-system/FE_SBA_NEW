import { useState } from "react";
import "../css/ScoreDistribution.css";

const DGNLHanoiScores = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [modalImage, setModalImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const years = ["2025", "2024", "2023", "2022", "2021", "2020"];

  const subjects = [
    {
      name: "Toán",
      image: "/images/scores/dgnl-hanoi/toan-" + selectedYear + ".jpg",
    },
    {
      name: "Văn",
      image: "/images/scores/dgnl-hanoi/van-" + selectedYear + ".jpg",
    },
    {
      name: "Tiếng Anh",
      image: "/images/scores/dgnl-hanoi/anh-" + selectedYear + ".jpg",
    },
    {
      name: "Khoa học Tự nhiên",
      image: "/images/scores/dgnl-hanoi/khtn-" + selectedYear + ".jpg",
    },
    {
      name: "Khoa học Xã hội",
      image: "/images/scores/dgnl-hanoi/khxh-" + selectedYear + ".jpg",
    },
    {
      name: "Tổng điểm",
      image: "/images/scores/dgnl-hanoi/tong-" + selectedYear + ".jpg",
    },
  ];

  const openModal = (src: string, alt: string) => {
    setModalImage({ src, alt });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="score-distribution-container">
      <div className="score-header">
        <h1 className="score-title">
          Phổ Điểm Đánh Giá Năng Lực ĐH Quốc Gia Hà Nội
        </h1>
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
        <h2>Kỳ thi Đánh giá Năng lực ĐH Quốc gia Hà Nội năm {selectedYear}</h2>
        <p>
          Phổ điểm các phần thi trong kỳ thi Đánh giá Năng lực của Đại học Quốc
          gia Hà Nội
        </p>
      </div>

      <div className="subjects-grid">
        {subjects.map((subject, index) => (
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
                Phổ điểm {subject.name} - Năm {selectedYear}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="note-section">
        <h3>Lưu ý:</h3>
        <ul>
          <li>Phổ điểm được cập nhật từ ĐH Quốc gia Hà Nội</li>
          <li>Kỳ thi gồm 3 phần: Toán, Văn, Tiếng Anh và 2 phần Khoa học</li>
          <li>Thời gian thi: 150 phút</li>
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

export default DGNLHanoiScores;
