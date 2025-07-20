import { useState } from "react";
import "../css/ScoreDistribution.css";

const THPTScores = () => {
  const [selectedYear, setSelectedYear] = useState("2024");

  const years = ["2024", "2023", "2022", "2021", "2020"];

  const subjects = [
    {
      name: "Toán",
      image: "/images/scores/thpt/toan-" + selectedYear + ".jpg",
    },
    { name: "Văn", image: "/images/scores/thpt/van-" + selectedYear + ".jpg" },
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
  ];

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
        {subjects.map((subject, index) => (
          <div key={index} className="subject-card">
            <h3 className="subject-name">{subject.name}</h3>
            <div className="image-container">
              <img
                src={subject.image}
                alt={`Phổ điểm ${subject.name} ${selectedYear}`}
                className="score-image"
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
    </div>
  );
};

export default THPTScores;
