import "../css/ScoreLookup.css";

const UniversityScoreLookup = () => {
  const handleSearchRedirect = () => {
    window.open("https://mazhocdata.streamlit.app/", "_blank");
  };

  return (
    <div className="score-lookup-container">
      {/* Header Section */}
      <div className="score-lookup-header">
        <h1 className="page-title">Tra Cứu Điểm Thi Đại Học</h1>
        <p className="page-description">
          Tra cứu điểm thi THPT Quốc gia và các kỳ thi đánh giá năng lực theo số
          báo danh
        </p>
      </div>

      {/* Main Content */}
      <div className="score-lookup-content">
        <div className="lookup-card">
          <div className="card-header">
            <div className="card-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h2>Công Cụ Tra Cứu Điểm Thi</h2>
            <p>Hệ thống tra cứu điểm thi chính thức và đáng tin cậy</p>
          </div>

          <div className="card-content">
            <div className="features-list">
              <div className="feature-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>Tra cứu điểm THPT Quốc gia theo số báo danh</span>
              </div>
              <div className="feature-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>Tra cứu điểm thi đánh giá năng lực</span>
              </div>
              <div className="feature-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>Dữ liệu chính thức từ Bộ Giáo dục và Đào tạo</span>
              </div>
              <div className="feature-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>Kết quả nhanh chóng và chính xác</span>
              </div>
            </div>

            <button className="lookup-btn" onClick={handleSearchRedirect}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Bắt Đầu Tra Cứu
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions-section">
          <h3>Hướng Dẫn Tra Cứu</h3>
          <div className="instructions-grid">
            <div className="instruction-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Chuẩn bị thông tin</h4>
                <p>
                  Chuẩn bị số báo danh thi THPT Quốc gia hoặc thi đánh giá năng
                  lực
                </p>
              </div>
            </div>
            <div className="instruction-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Nhập thông tin</h4>
                <p>Nhập chính xác số báo danh vào hệ thống tra cứu</p>
              </div>
            </div>
            <div className="instruction-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Xem kết quả</h4>
                <p>Hệ thống sẽ hiển thị điểm chi tiết các môn thi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note Section */}
        <div className="note-section">
          <h3>Lưu Ý Quan Trọng</h3>
          <ul>
            <li>
              Chỉ tra cứu được điểm của các kỳ thi đã có kết quả chính thức
            </li>
            <li>Cần nhập chính xác số báo danh để có kết quả đúng</li>
            <li>Dữ liệu được cập nhật từ nguồn chính thức của Bộ GD&ĐT</li>
            <li>
              Nếu không tìm thấy kết quả, vui lòng kiểm tra lại số báo danh
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UniversityScoreLookup;
