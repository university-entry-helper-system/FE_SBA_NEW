import "../css/PriorityScoreInfo.css";

const PriorityScoreInfo = () => {
  return (
    <div className="priority-score-info-container">
      <div className="info-header">
        <h1 className="info-title">Hướng Dẫn Điểm Ưu Tiên & Khuyến Khích</h1>
        <p className="info-description">
          Thông tin chi tiết về điểm ưu tiên và điểm khuyến khích trong xét tốt
          nghiệp THPT. Lưu ý: Điểm này khác hoàn toàn với điểm ưu tiên khu vực
          và đối tượng trong tuyển sinh Đại học.
        </p>
      </div>

      <div className="info-content">
        {/* Phân biệt điểm ưu tiên */}
        <div className="info-section">
          <div className="important-note">
            <h4>⚠️ Phân biệt điểm ưu tiên:</h4>
            <p>
              Như công thức tính điểm xét tốt nghiệp trên, có điểm ưu tiên và
              điểm khuyến khích. Nhiều bạn nhầm lẫn giữa điểm này với điểm ưu
              tiên khu vực và đối tượng trong tuyển sinh Đại học. Tuy nhiên, các
              điểm cộng này hoàn toàn khác nhau.
              <strong>
                Điểm ưu tiên và khuyến khích dưới đây chỉ dùng để cộng vào điểm
                xét tốt nghiệp.
              </strong>
            </p>
          </div>
        </div>

        {/* A. ĐIỂM ƯU TIÊN */}
        <div className="info-section">
          <h2 className="section-title">🏅 A. ĐIỂM ƯU TIÊN LÀ GÌ</h2>

          <div className="info-card">
            <p>
              <strong>Điểm ưu tiên</strong> là mức điểm mà được Nhà nước ưu ái
              dành cho các thí sinh, đặc biệt là những thí sinh thuộc những
              trường hợp đặc biệt hoặc một số khu vực được quy định.
            </p>
            <p>
              Cụ thể, điểm ưu tiên là số điểm được cộng thêm vào số điểm thi
              thực tế mà thí sinh đã đạt được trong kỳ thi của mình. Bao gồm các
              diện như dưới đây:
            </p>
          </div>

          {/* Diện 1 */}
          <div className="subsection">
            <h3 className="subsection-title">1️⃣ Diện 1:</h3>
            <div className="info-card">
              <div className="score-row">
                <span className="award-level">Xét tốt nghiệp bình thường</span>
                <span className="score-value">0 điểm</span>
              </div>
            </div>
          </div>

          {/* Diện 2 */}
          <div className="subsection">
            <h3 className="subsection-title">2️⃣ Diện 2:</h3>
            <div className="info-card">
              <div className="score-table">
                <div className="score-row">
                  <span className="cert-level">
                    a) Thương binh, bệnh binh (GDTX)
                  </span>
                  <span className="score-value">+0.25 điểm</span>
                </div>
                <p
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "1rem",
                    color: "#4a5568",
                  }}
                >
                  Thương binh, bệnh binh, người hưởng chính sách như thương binh
                  bị suy giảm khả năng lao động dưới 81% (đối với GDTX)
                </p>

                <div className="score-row">
                  <span className="cert-level">b) Con của người có công</span>
                  <span className="score-value">+0.25 điểm</span>
                </div>
                <p
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "1rem",
                    color: "#4a5568",
                  }}
                >
                  Con của thương binh, bệnh binh, người được hưởng chính sách
                  như thương binh bị suy giảm khả năng lao động dưới 81%; Anh
                  hùng lực lượng vũ trang nhân dân, Anh hùng lao động; con của
                  Bà mẹ Việt Nam anh hùng; con của Anh hùng lực lượng vũ trang
                  nhân dân, Anh hùng lao động
                </p>

                <div className="score-row">
                  <span className="cert-level">c) Người dân tộc thiểu số</span>
                  <span className="score-value">+0.25 điểm</span>
                </div>

                <div className="score-row">
                  <span className="cert-level">d) Người ở vùng khó khăn</span>
                  <span className="score-value">+0.25 điểm</span>
                </div>
                <p
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "1rem",
                    color: "#4a5568",
                  }}
                >
                  Người Kinh, người nước ngoài cư trú tại Việt Nam có nơi thường
                  trú trong thời gian học cấp THPT từ 03 năm trở lên ở xã đặc
                  biệt khó khăn, xã biên giới, xã an toàn khu thuộc diện đầu tư
                  của Chương trình 135 theo Quyết định số 135/QĐ-TTg ngày
                  31/7/1998 của Thủ tướng Chính phủ (tính từ thời điểm các xã
                  này hoàn thành Chương trình 135 trở về trước); xã đặc biệt khó
                  khăn vùng bãi ngang ven biển và hải đảo; xã khu vực I, II, III
                  và xã có thôn đặc biệt khó khăn vùng đồng bào dân tộc thiểu số
                  và miền núi theo quy định hiện hành của Thủ tướng Chính phủ
                  hoặc Bộ trưởng, Chủ nhiệm Ủy ban dân tộc, học tại các trường
                  phổ thông không nằm trên địa bàn các quận của các thành phố
                  trực thuộc Trung ương ít nhất 2 phần 3 thời gian học cấp THPT
                </p>

                <div className="score-row">
                  <span className="cert-level">
                    đ) Người bị nhiễm chất độc hóa học
                  </span>
                  <span className="score-value">+0.25 điểm</span>
                </div>
                <p
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "1rem",
                    color: "#4a5568",
                  }}
                >
                  Người bị nhiễm chất độc hóa học; con của người bị nhiễm chất
                  độc hóa học; con của người hoạt động kháng chiến bị nhiễm chất
                  độc hóa học; người được cơ quan có thẩm quyền công nhận bị dị
                  dạng, dị tật, suy giảm khả năng tự lực trong sinh hoạt hoặc
                  lao động do hậu quả của chất độc hóa học
                </p>

                <div className="score-row">
                  <span className="cert-level">
                    e) Tuổi từ 35 trở lên (GDTX)
                  </span>
                  <span className="score-value">+0.25 điểm</span>
                </div>
                <p style={{ fontSize: "0.95rem", color: "#4a5568" }}>
                  Có tuổi đời từ 35 trở lên, tính đến ngày thi (đối với thí sinh
                  GDTX)
                </p>
              </div>
            </div>
          </div>

          {/* Diện 3 */}
          <div className="subsection">
            <h3 className="subsection-title">3️⃣ Diện 3:</h3>
            <div className="info-card">
              <div className="score-table">
                <div className="score-row">
                  <span className="cert-level gold">
                    a) Dân tộc thiểu số vùng khó khăn
                  </span>
                  <span className="score-value">+0.5 điểm</span>
                </div>
                <p
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "1rem",
                    color: "#4a5568",
                  }}
                >
                  Người dân tộc thiểu số có nơi thường trú trong thời gian học
                  cấp THPT từ 03 năm trở lên ở xã đặc biệt khó khăn, xã biên
                  giới, xã an toàn khu thuộc diện đầu tư của Chương trình 135
                  theo Quyết định số 135/QĐ-TTg ngày 31/7/1998 của Thủ tướng
                  Chính phủ (tính từ thời điểm các xã này hoàn thành Chương
                  trình 135 trở về trước); xã đặc biệt khó khăn vùng bãi ngang
                  ven biển và hải đảo; xã khu vực I, II, III và xã có thôn đặc
                  biệt khó khăn thuộc vùng đồng bào dân tộc thiểu số và miền núi
                  theo quy định hiện hành của Thủ tướng Chính phủ hoặc Bộ
                  trưởng, Chủ nhiệm Ủy ban dân tộc, học tại các trường phổ thông
                  dân tộc nội trú hoặc học tại các trường phổ thông không nằm
                  trên địa bàn các quận của các thành phố trực thuộc Trung ương
                </p>

                <div className="score-row">
                  <span className="cert-level gold">
                    b) Thương binh, bệnh binh từ 81% (GDTX)
                  </span>
                  <span className="score-value">+0.5 điểm</span>
                </div>
                <p
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "1rem",
                    color: "#4a5568",
                  }}
                >
                  Thương binh, bệnh binh, người hưởng chính sách như thương binh
                  bị suy giảm khả năng lao động từ 81% trở lên (đối với GDTX)
                </p>

                <div className="score-row">
                  <span className="cert-level gold">
                    c) Con của liệt sĩ và thương binh từ 81%
                  </span>
                  <span className="score-value">+0.5 điểm</span>
                </div>
                <p style={{ fontSize: "0.95rem", color: "#4a5568" }}>
                  Con của liệt sĩ; con của thương binh, bệnh binh, người được
                  hưởng chính sách như thương binh bị suy giảm khả năng lao động
                  từ 81% trở lên
                </p>
              </div>
            </div>
          </div>

          {/* Quy định chung về điểm ưu tiên */}
          <div className="subsection">
            <h3 className="subsection-title">4️⃣ Quy định chung:</h3>
            <div className="info-card">
              <div className="important-note">
                <h4>⚠️ Lưu ý quan trọng:</h4>
                <ul>
                  <li>
                    <strong>
                      Thí sinh có nhiều tiêu chuẩn ưu tiên chỉ được hưởng tiêu
                      chuẩn ưu tiên cao nhất.
                    </strong>
                  </li>
                  <li>
                    Những diện ưu tiên khác đã được quy định trong các văn bản
                    pháp luật hiện hành sẽ do Bộ trưởng Bộ GDĐT xem xét, quyết
                    định.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* B. ĐIỂM KHUYẾN KHÍCH */}
        <div className="info-section">
          <h2 className="section-title">🏆 B. ĐIỂM KHUYẾN KHÍCH LÀ GÌ?</h2>

          <div className="info-card">
            <p>
              <strong>Điểm khuyến khích</strong> là số điểm được cộng thêm cho
              những học sinh tham gia và đạt được thành tích tốt trong những
              cuộc thi do Bộ Giáo dục và Đào tạo tổ chức.
            </p>
            <p>
              Người học tham gia các cuộc thi và các hoạt động dưới đây trong
              thời gian học ở cấp THPT được cộng điểm khuyến khích để xét công
              nhận tốt nghiệp THPT:
            </p>
          </div>

          {/* Giải học sinh giỏi */}
          <div className="subsection">
            <h3 className="subsection-title">
              1️⃣ Đoạt giải cá nhân trong kỳ thi chọn học sinh giỏi:
            </h3>
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

          {/* Giải cá nhân và đồng đội */}
          <div className="subsection">
            <h3 className="subsection-title">
              2️⃣ Đoạt giải cá nhân và đồng đội trong các kỳ thi:
            </h3>
            <div className="info-card">
              <h4
                style={{
                  color: "#667eea",
                  marginBottom: "1rem",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                }}
              >
                🏅 a) Đối với giải cá nhân:
              </h4>
              <div className="score-table">
                <div className="score-row">
                  <span className="award-level gold">
                    Giải nhất, nhì, ba quốc gia hoặc giải nhất cấp tỉnh hoặc Huy
                    chương Vàng
                  </span>
                  <span className="score-value">+2.0 điểm</span>
                </div>
                <div className="score-row">
                  <span className="award-level silver">
                    Giải khuyến khích quốc gia hoặc giải tư cuộc thi khoa học kỹ
                    thuật cấp quốc gia hoặc giải nhì cấp tỉnh hoặc Huy chương
                    Bạc
                  </span>
                  <span className="score-value">+1.5 điểm</span>
                </div>
                <div className="score-row">
                  <span className="award-level bronze">
                    Giải ba cấp tỉnh hoặc Huy chương Đồng
                  </span>
                  <span className="score-value">+1.0 điểm</span>
                </div>
              </div>

              <h4
                style={{
                  color: "#667eea",
                  margin: "1.5rem 0 1rem 0",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                }}
              >
                👥 b) Đối với giải đồng đội:
              </h4>
              <div className="important-note">
                <ul>
                  <li>
                    <strong>Chỉ cộng điểm đối với giải quốc gia</strong>
                  </li>
                  <li>
                    Số lượng cầu thủ, vận động viên, diễn viên của giải đồng đội
                    theo quy định cụ thể của Ban Tổ chức từng giải
                  </li>
                  <li>
                    Mức điểm khuyến khích được cộng cho các cá nhân trong giải
                    đồng đội được thực hiện như đối với giải cá nhân quy định
                    tại điểm này
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quy định về nhiều giải */}
          <div className="subsection">
            <h3 className="subsection-title">3️⃣ Quy định về nhiều giải:</h3>
            <div className="info-card">
              <div className="important-note">
                <h4>⚠️ Lưu ý quan trọng:</h4>
                <p>
                  <strong>
                    Những người học đoạt nhiều giải khác nhau trong nhiều cuộc
                    thi/kỳ thi chỉ được hưởng một mức cộng điểm của loại giải
                    cao nhất.
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lưu ý chung */}
        <div className="info-section general-notes">
          <h2 className="section-title">📋 Lưu Ý Chung Quan Trọng</h2>
          <div className="info-card">
            <ul className="general-list">
              <li>
                Điểm ưu tiên và điểm khuyến khích này{" "}
                <strong>CHỈ DÙNG ĐỂ XÉT TỐT NGHIỆP THPT</strong>, không áp dụng
                cho xét tuyển đại học
              </li>
              <li>
                Điểm ưu tiên khu vực và đối tượng trong tuyển sinh đại học là
                hoàn toàn khác biệt với điểm ưu tiên xét tốt nghiệp
              </li>
              <li>
                Thí sinh cần cung cấp đầy đủ hồ sơ, giấy tờ chứng minh hợp lệ để
                được xét cộng điểm
              </li>
              <li>
                Trường hợp có nhiều diện ưu tiên, chỉ được hưởng mức ưu tiên cao
                nhất
              </li>
              <li>
                Trường hợp có nhiều giải thưởng khuyến khích, chỉ được hưởng mức
                khuyến khích cao nhất
              </li>
              <li>
                Các quy định có thể được điều chỉnh theo thông tư mới của Bộ
                GDĐT, cần theo dõi thông tin cập nhật
              </li>
              <li>
                Mọi thắc mắc cần liên hệ với Sở GDĐT hoặc trường THPT nơi thí
                sinh học để được hướng dẫn cụ thể
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityScoreInfo;
