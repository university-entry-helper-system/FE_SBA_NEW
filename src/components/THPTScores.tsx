import { useState, useEffect, useMemo } from "react";
import "../css/ScoreDistribution.css";

const THPTScores = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [modalImage, setModalImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  const years = ["2025", "2024", "2023", "2022", "2021", "2020"];

  const subjects = useMemo(
    () => [
      {
        name: "Toán",
        image: "/images/scores/thpt/toan-" + selectedYear + ".jpg",
      },
      {
        name: "Văn",
        image: "/images/scores/thpt/van-" + selectedYear + ".jpg",
      },
      {
        name: "Tiếng Anh",
        image: "/images/scores/thpt/anh-" + selectedYear + ".jpg",
      },
      {
        name: "Vật Lý",
        image: "/images/scores/thpt/ly-" + selectedYear + ".jpg",
      },
      {
        name: "Hóa Học",
        image: "/images/scores/thpt/hoa-" + selectedYear + ".jpg",
      },
      {
        name: "Sinh Học",
        image: "/images/scores/thpt/sinh-" + selectedYear + ".jpg",
      },
      {
        name: "Lịch Sử",
        image: "/images/scores/thpt/su-" + selectedYear + ".jpg",
      },
      {
        name: "Địa Lý",
        image: "/images/scores/thpt/dia-" + selectedYear + ".jpg",
      },
      {
        name: "GDCD",
        image: "/images/scores/thpt/gdcd-" + selectedYear + ".jpg",
      },
      {
        name: "Kinh tế pháp luật",
        image: "/images/scores/thpt/ktpl-" + selectedYear + ".jpg",
      },
      {
        name: "Công nghệ công nghiệp",
        image: "/images/scores/thpt/cncn-" + selectedYear + ".jpg",
      },
      {
        name: "Công nghệ nông nghiệp",
        image: "/images/scores/thpt/cnnn-" + selectedYear + ".jpg",
      },
      {
        name: "Tin Học",
        image: "/images/scores/thpt/tin-" + selectedYear + ".jpg",
      },
    ],
    [selectedYear]
  );

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
  }, [selectedYear, subjects]);

  // Filter subjects to only show those with available images
  const filteredSubjects = subjects.filter((subject) =>
    availableSubjects.includes(subject.name)
  );

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
                Phổ điểm môn {subject.name} - Năm {selectedYear}
              </p>
            </div>
          </div>
        ))}
      </div>

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
