import "../css/PriorityScoreInfo.css";

const PriorityScoreInfo = () => {
  return (
    <div className="priority-score-info-container">
      <div className="info-header">
        <h1 className="info-title">Hướng Dẫn Điểm Ưu Tiên & Khuyến Khích</h1>
        <p className="info-description">
          Thông tin chi tiết về cách tính điểm ưu tiên và điểm khuyến khích
          trong thi tốt nghiệp THPT
        </p>
      </div>

      <div className="info-content">
        {/* Điểm Ưu Tiên */}
        <div className="info-section">
          <h2 className="section-title">📍 Điểm Ưu Tiên</h2>

          <div className="subsection">
            <h3 className="subsection-title">🌍 Điểm ưu tiên theo khu vực:</h3>
            <div className="info-card">
              <p>
                Được cộng cho thí sinh ở các khu vực có điều kiện kinh tế - xã
                hội khó khăn
              </p>
              <div className="highlight-box">
                <strong>Mức cộng tối đa: 0.75 điểm</strong>
              </div>
            </div>
          </div>

          <div className="subsection">
            <h3 className="subsection-title">
              👥 Điểm ưu tiên theo đối tượng:
            </h3>
            <div className="info-card">
              <p>Được cộng cho các thí sinh thuộc diện:</p>
              <ul className="benefit-list">
                <li>Gia đình chính sách</li>
                <li>Người có công với cách mạng</li>
                <li>Các điều kiện ưu tiên khác theo quy định</li>
              </ul>
              <div className="highlight-box">
                <strong>Mức cộng tối đa: 2.0 điểm</strong>
              </div>
            </div>
          </div>

          <div className="important-note">
            <h4>⚠️ Lưu ý quan trọng:</h4>
            <p>
              Thí sinh chỉ được hưởng <strong>mức ưu tiên cao nhất</strong>{" "}
              trong trường hợp thuộc nhiều diện ưu tiên.
            </p>
          </div>
        </div>

        {/* Điểm Khuyến Khích */}
        <div className="info-section">
          <h2 className="section-title">🏆 Điểm Khuyến Khích</h2>

          <div className="subsection">
            <h3 className="subsection-title">🥇 Giải thưởng học sinh giỏi:</h3>
            <div className="info-card">
              <div className="score-table">
                <div className="score-row">
                  <span className="award-level gold">
                    Giải nhất, nhì, ba quốc gia
                  </span>
                  <span className="score-value">+2.0 điểm</span>
                </div>
                <div className="score-row">
                  <span className="award-level gold">Giải nhất cấp tỉnh</span>
                  <span className="score-value">+2.0 điểm</span>
                </div>
                <div className="score-row">
                  <span className="award-level silver">
                    Giải khuyến khích quốc gia
                  </span>
                  <span className="score-value">+1.5 điểm</span>
                </div>
                <div className="score-row">
                  <span className="award-level silver">Giải nhì cấp tỉnh</span>
                  <span className="score-value">+1.5 điểm</span>
                </div>
                <div className="score-row">
                  <span className="award-level bronze">Giải ba cấp tỉnh</span>
                  <span className="score-value">+1.0 điểm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="subsection">
            <h3 className="subsection-title">🔧 Giải thưởng thi nghề:</h3>
            <div className="info-card">
              <div className="score-table">
                <div className="score-row">
                  <span className="award-level excellent">Loại giỏi</span>
                  <span className="score-value">+2.0 điểm</span>
                </div>
                <div className="score-row">
                  <span className="award-level good">Loại khá</span>
                  <span className="score-value">+1.5 điểm</span>
                </div>
                <div className="score-row">
                  <span className="award-level average">Loại trung bình</span>
                  <span className="score-value">+1.0 điểm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="subsection">
            <h3 className="subsection-title">
              📜 Chứng chỉ nghề, ngoại ngữ, tin học:
            </h3>
            <div className="info-card">
              <div className="certificate-section">
                <h4>Chứng chỉ nghề:</h4>
                <div className="score-table">
                  <div className="score-row">
                    <span className="cert-level excellent">Loại giỏi</span>
                    <span className="score-value">+2.0 điểm</span>
                  </div>
                  <div className="score-row">
                    <span className="cert-level good">Loại khá</span>
                    <span className="score-value">+1.5 điểm</span>
                  </div>
                  <div className="score-row">
                    <span className="cert-level average">Loại trung bình</span>
                    <span className="score-value">+1.0 điểm</span>
                  </div>
                </div>
              </div>

              <div className="certificate-section">
                <h4>Dành cho học viên GDTX:</h4>
                <div className="score-table">
                  <div className="score-row">
                    <span className="cert-level special">
                      Chứng chỉ ngoại ngữ
                    </span>
                    <span className="score-value">+1.0 điểm</span>
                  </div>
                  <div className="score-row">
                    <span className="cert-level special">
                      Chứng chỉ tin học
                    </span>
                    <span className="score-value">+1.0 điểm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="important-note">
            <h4>⚠️ Giới hạn điểm khuyến khích:</h4>
            <p>
              Tổng điểm khuyến khích tối đa được cộng là{" "}
              <strong>4.0 điểm</strong>.
            </p>
          </div>
        </div>

        {/* Lưu ý chung */}
        <div className="info-section general-notes">
          <h2 className="section-title">📋 Lưu Ý Chung</h2>
          <div className="info-card">
            <ul className="general-list">
              <li>
                Thí sinh cần cung cấp đầy đủ giấy tờ chứng minh để được cộng
                điểm ưu tiên và khuyến khích
              </li>
              <li>
                Điểm ưu tiên và khuyến khích được cộng vào điểm xét tốt nghiệp,
                không ảnh hưởng đến điểm xét tuyển đại học
              </li>
              <li>
                Mọi thắc mắc về điểm ưu tiên và khuyến khích cần liên hệ với cơ
                quan giáo dục địa phương
              </li>
              <li>
                Các quy định có thể thay đổi theo từng năm học, cần cập nhật
                thông tin mới nhất
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityScoreInfo;
