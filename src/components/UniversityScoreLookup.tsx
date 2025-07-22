import { useState } from "react";
import "../css/ScoreLookup.css";

interface ScoreData {
  sbd: number;
  toan: number | null;
  ngu_van: number | null;
  ngoai_ngu: number | null;
  vat_li: number | null;
  hoa_hoc: number | null;
  sinh_hoc: number | null;
  lich_su: number | null;
  dia_li: number | null;
  gdcd: number | null;
  tin_hoc: number | null;
  cong_nghe_cong_nghiep: number | null;
  cong_nghe_nong_nghiep: number | null;
  giao_duc_kinh_te_va_phap_luat: number | null;
  ma_nn: string | null;
}

interface ApiResponse {
  msg: string;
  valid: boolean;
  data: ScoreData;
}

const UniversityScoreLookup = () => {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [error, setError] = useState("");

  const subjectNames: Record<keyof ScoreData, string> = {
    sbd: "Số báo danh",
    toan: "Toán",
    ngu_van: "Ngữ Văn",
    ngoai_ngu: "Tiếng Anh",
    vat_li: "Vật Lý",
    hoa_hoc: "Hóa Học",
    sinh_hoc: "Sinh Học",
    lich_su: "Lịch Sử",
    dia_li: "Địa Lý",
    gdcd: "GDCD",
    tin_hoc: "Tin Học",
    cong_nghe_cong_nghiep: "Công nghệ công nghiệp",
    cong_nghe_nong_nghiep: "Công nghệ nông nghiệp",
    giao_duc_kinh_te_va_phap_luat: "Kinh tế pháp luật",
    ma_nn: "Mã ngoại ngữ",
  };

  const handleSearch = async () => {
    if (!studentId.trim()) {
      setError("Vui lòng nhập số báo danh");
      return;
    }

    if (studentId.length < 7 || studentId.length > 8) {
      setError("Số báo danh phải có 7-8 chữ số");
      return;
    }

    setLoading(true);
    setError("");
    setScoreData(null);

    try {
      const response = await fetch(
        `https://api.xephangdiemthi.edu.vn/api/v1/score/sbd=${studentId}`
      );

      if (!response.ok) {
        throw new Error("Lỗi kết nối đến server");
      }

      const result: ApiResponse = await response.json();

      if (result.valid && result.data) {
        setScoreData(result.data);
      } else {
        setError("Không tìm thấy kết quả cho số báo danh này");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStudentId("");
    setScoreData(null);
    setError("");
  };

  const getScoresByCategory = () => {
    if (!scoreData)
      return { mandatory: [], science: [], social: [], other: [] };

    const mandatory = [
      {
        key: "toan" as keyof ScoreData,
        name: subjectNames.toan,
        score: scoreData.toan,
      },
      {
        key: "ngu_van" as keyof ScoreData,
        name: subjectNames.ngu_van,
        score: scoreData.ngu_van,
      },
      {
        key: "ngoai_ngu" as keyof ScoreData,
        name: subjectNames.ngoai_ngu,
        score: scoreData.ngoai_ngu,
      },
    ].filter((subject) => subject.score !== null);

    const science = [
      {
        key: "vat_li" as keyof ScoreData,
        name: subjectNames.vat_li,
        score: scoreData.vat_li,
      },
      {
        key: "hoa_hoc" as keyof ScoreData,
        name: subjectNames.hoa_hoc,
        score: scoreData.hoa_hoc,
      },
      {
        key: "sinh_hoc" as keyof ScoreData,
        name: subjectNames.sinh_hoc,
        score: scoreData.sinh_hoc,
      },
    ].filter((subject) => subject.score !== null);

    const social = [
      {
        key: "lich_su" as keyof ScoreData,
        name: subjectNames.lich_su,
        score: scoreData.lich_su,
      },
      {
        key: "dia_li" as keyof ScoreData,
        name: subjectNames.dia_li,
        score: scoreData.dia_li,
      },
      {
        key: "gdcd" as keyof ScoreData,
        name: subjectNames.gdcd,
        score: scoreData.gdcd,
      },
    ].filter((subject) => subject.score !== null);

    const other = [
      {
        key: "tin_hoc" as keyof ScoreData,
        name: subjectNames.tin_hoc,
        score: scoreData.tin_hoc,
      },
      {
        key: "cong_nghe_cong_nghiep" as keyof ScoreData,
        name: subjectNames.cong_nghe_cong_nghiep,
        score: scoreData.cong_nghe_cong_nghiep,
      },
      {
        key: "cong_nghe_nong_nghiep" as keyof ScoreData,
        name: subjectNames.cong_nghe_nong_nghiep,
        score: scoreData.cong_nghe_nong_nghiep,
      },
      {
        key: "giao_duc_kinh_te_va_phap_luat" as keyof ScoreData,
        name: subjectNames.giao_duc_kinh_te_va_phap_luat,
        score: scoreData.giao_duc_kinh_te_va_phap_luat,
      },
    ].filter((subject) => subject.score !== null);

    return { mandatory, science, social, other };
  };

  const calculateCombinationScores = () => {
    if (!scoreData) return [];

    const combinations = [];

    // Khối A (Toán, Lý, Hóa)
    if (
      scoreData.toan !== null &&
      scoreData.vat_li !== null &&
      scoreData.hoa_hoc !== null
    ) {
      combinations.push({
        name: "Khối A (Toán - Lý - Hóa)",
        total: scoreData.toan + scoreData.vat_li + scoreData.hoa_hoc,
        subjects: [
          `Toán: ${scoreData.toan}`,
          `Lý: ${scoreData.vat_li}`,
          `Hóa: ${scoreData.hoa_hoc}`,
        ],
      });
    }

    // Khối B (Toán, Hóa, Sinh)
    if (
      scoreData.toan !== null &&
      scoreData.hoa_hoc !== null &&
      scoreData.sinh_hoc !== null
    ) {
      combinations.push({
        name: "Khối B (Toán - Hóa - Sinh)",
        total: scoreData.toan + scoreData.hoa_hoc + scoreData.sinh_hoc,
        subjects: [
          `Toán: ${scoreData.toan}`,
          `Hóa: ${scoreData.hoa_hoc}`,
          `Sinh: ${scoreData.sinh_hoc}`,
        ],
      });
    }

    // Khối C (Văn, Sử, Địa)
    if (
      scoreData.ngu_van !== null &&
      scoreData.lich_su !== null &&
      scoreData.dia_li !== null
    ) {
      combinations.push({
        name: "Khối C (Văn - Sử - Địa)",
        total: scoreData.ngu_van + scoreData.lich_su + scoreData.dia_li,
        subjects: [
          `Văn: ${scoreData.ngu_van}`,
          `Sử: ${scoreData.lich_su}`,
          `Địa: ${scoreData.dia_li}`,
        ],
      });
    }

    // Khối D (Toán, Văn, Anh)
    if (
      scoreData.toan !== null &&
      scoreData.ngu_van !== null &&
      scoreData.ngoai_ngu !== null
    ) {
      combinations.push({
        name: "Khối D (Toán - Văn - Anh)",
        total: scoreData.toan + scoreData.ngu_van + scoreData.ngoai_ngu,
        subjects: [
          `Toán: ${scoreData.toan}`,
          `Văn: ${scoreData.ngu_van}`,
          `Anh: ${scoreData.ngoai_ngu}`,
        ],
      });
    }

    return combinations.sort((a, b) => b.total - a.total);
  };

  return (
    <div className="score-lookup-container">
      {/* Header Section */}
      <div className="score-lookup-header">
        <h1 className="page-title">Tra Cứu Điểm Thi Đại Học</h1>
        <p className="page-description">
          Tra cứu điểm thi THPT Quốc gia theo số báo danh
        </p>
      </div>

      {/* Search Form */}
      <div className="search-form-section">
        <div className="search-form">
          <div className="form-group">
            <label htmlFor="studentId">Số báo danh:</label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
              placeholder="Nhập số báo danh (7-8 chữ số)"
              maxLength={8}
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Đang tra cứu...
                </>
              ) : (
                <>
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
                  Tra cứu
                </>
              )}
            </button>
            <button
              className="reset-btn"
              onClick={handleReset}
              disabled={loading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="1,4 1,10 7,10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Làm lại
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {scoreData && (
        <div className="results-section">
          <div className="student-info">
            <h2>Kết quả tra cứu</h2>
            <p>
              Số báo danh: <strong>{scoreData.sbd}</strong>
            </p>
          </div>

          {/* Scores by Category */}
          <div className="scores-grid">
            {(() => {
              const { mandatory, science, social, other } =
                getScoresByCategory();
              return (
                <>
                  {mandatory.length > 0 && (
                    <div className="score-category">
                      <h3>Môn Bắt Buộc</h3>
                      <div className="score-list">
                        {mandatory.map((subject) => (
                          <div key={subject.key} className="score-item">
                            <span className="subject-name">{subject.name}</span>
                            <span className="score-value">
                              {subject.score?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {science.length > 0 && (
                    <div className="score-category">
                      <h3>Khoa học Tự nhiên</h3>
                      <div className="score-list">
                        {science.map((subject) => (
                          <div key={subject.key} className="score-item">
                            <span className="subject-name">{subject.name}</span>
                            <span className="score-value">
                              {subject.score?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {social.length > 0 && (
                    <div className="score-category">
                      <h3>Khoa học Xã hội</h3>
                      <div className="score-list">
                        {social.map((subject) => (
                          <div key={subject.key} className="score-item">
                            <span className="subject-name">{subject.name}</span>
                            <span className="score-value">
                              {subject.score?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {other.length > 0 && (
                    <div className="score-category">
                      <h3>Môn Khác</h3>
                      <div className="score-list">
                        {other.map((subject) => (
                          <div key={subject.key} className="score-item">
                            <span className="subject-name">{subject.name}</span>
                            <span className="score-value">
                              {subject.score?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Combination Scores */}
          {(() => {
            const combinations = calculateCombinationScores();
            return combinations.length > 0 ? (
              <div className="combinations-section">
                <h3>Điểm Tổ Hợp Khối Thi</h3>
                <div className="combinations-grid">
                  {combinations.map((combo, index) => (
                    <div key={index} className="combination-card">
                      <div className="combo-header">
                        <h4>{combo.name}</h4>
                        <span className="combo-total">
                          {combo.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="combo-details">
                        {combo.subjects.map((subject, idx) => (
                          <span key={idx} className="combo-subject">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Instructions */}
      <div className="instructions-section">
        <h3>Hướng Dẫn Sử Dụng</h3>
        <div className="instructions-grid">
          <div className="instruction-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Nhập số báo danh</h4>
              <p>Nhập chính xác số báo danh thi THPT Quốc gia (8 chữ số)</p>
            </div>
          </div>
          <div className="instruction-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Nhấn tra cứu</h4>
              <p>Hệ thống sẽ tìm kiếm và hiển thị kết quả điểm thi</p>
            </div>
          </div>
          <div className="instruction-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Xem kết quả</h4>
              <p>Xem điểm từng môn và điểm tổ hợp các khối thi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityScoreLookup;
