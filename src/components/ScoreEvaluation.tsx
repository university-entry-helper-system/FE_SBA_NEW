import { useState, useEffect } from "react";
import "../css/ScoreEvaluation.css";
import {
  getAllSubjectCombinations,
  getEligibleMajors,
  type SubjectCombination,
  type EligibleMajor,
} from "../api/eligibleMajors";

const ScoreEvaluation = () => {
  const [score, setScore] = useState("");
  const [selectedCombination, setSelectedCombination] = useState("");
  const [combinations, setCombinations] = useState<SubjectCombination[]>([]);
  const [eligibleMajors, setEligibleMajors] = useState<EligibleMajor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [combinationsLoading, setCombinationsLoading] = useState(true);

  // Load subject combinations when component mounts
  useEffect(() => {
    const loadCombinations = async () => {
      try {
        setCombinationsLoading(true);
        const response = await getAllSubjectCombinations();
        if (response.code === 1000) {
          setCombinations(response.result.items);
        } else {
          setError("Không thể tải danh sách tổ hợp môn");
        }
      } catch (err) {
        setError("Lỗi khi tải danh sách tổ hợp môn");
        console.error("Error loading combinations:", err);
      } finally {
        setCombinationsLoading(false);
      }
    };

    loadCombinations();
  }, []);

  const handleEvaluate = async () => {
    if (!score.trim()) {
      setError("Vui lòng nhập điểm số");
      return;
    }

    if (!selectedCombination) {
      setError("Vui lòng chọn tổ hợp môn");
      return;
    }

    const scoreValue = parseFloat(score);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 30) {
      setError("Điểm số phải từ 0 đến 30");
      return;
    }

    setLoading(true);
    setError("");
    setEligibleMajors([]);

    try {
      const response = await getEligibleMajors({
        score: scoreValue,
        subjectCombinationId: parseInt(selectedCombination),
      });

      if (response.code === 1000) {
        setEligibleMajors(response.result);
        if (response.result.length === 0) {
          setError("Không tìm thấy ngành phù hợp với điểm số này");
        }
      } else {
        setError("Không thể tìm kiếm ngành phù hợp");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScore("");
    setSelectedCombination("");
    setEligibleMajors([]);
    setError("");
  };

  const getSelectedCombinationInfo = () => {
    if (!selectedCombination) return null;
    return combinations.find(
      (combo) => combo.id.toString() === selectedCombination
    );
  };

  const groupMajorsByUniversity = () => {
    const grouped: { [key: string]: EligibleMajor[] } = {};
    eligibleMajors.forEach((major) => {
      if (!grouped[major.universityName]) {
        grouped[major.universityName] = [];
      }
      grouped[major.universityName].push(major);
    });
    return grouped;
  };

  return (
    <div className="score-evaluation-container">
      {/* Header Section */}
      <div className="evaluation-header">
        <h1 className="page-title">Đánh Giá Điểm Thi</h1>
        <p className="page-description">
          Nhập điểm tổ hợp và chọn khối thi để xem các ngành có thể đậu
        </p>
      </div>

      <div className="evaluation-content">
        {/* Input Form */}
        <div className="score-input-section">
          <h2>Thông Tin Điểm Thi</h2>

          <div className="input-form">
            <div className="form-group">
              <label htmlFor="score">Điểm tổ hợp:</label>
              <input
                type="number"
                id="score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Nhập điểm tổ hợp (0-30)"
                min="0"
                max="30"
                step="0.01"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="combination">Tổ hợp môn:</label>
              {combinationsLoading ? (
                <div className="loading-select">Đang tải...</div>
              ) : (
                <select
                  id="combination"
                  value={selectedCombination}
                  onChange={(e) => setSelectedCombination(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Chọn tổ hợp môn</option>
                  {combinations.map((combo) => (
                    <option key={combo.id} value={combo.id.toString()}>
                      {combo.name} - {combo.block.name}(
                      {combo.examSubjects
                        .map((subject) => subject.shortName)
                        .join(", ")}
                      )
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Combination Info */}
            {selectedCombination && (
              <div className="combination-info">
                {(() => {
                  const comboInfo = getSelectedCombinationInfo();
                  return comboInfo ? (
                    <div className="combo-details">
                      <h4>
                        {comboInfo.name} - {comboInfo.block.name}
                      </h4>
                      <div className="subjects-list">
                        {comboInfo.examSubjects.map((subject) => (
                          <span key={subject.id} className="subject-tag">
                            {subject.name}
                          </span>
                        ))}
                      </div>
                      {comboInfo.description && (
                        <p className="combo-description">
                          {comboInfo.description}
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="form-actions">
              <button
                className="evaluate-btn"
                onClick={handleEvaluate}
                disabled={loading || combinationsLoading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Đang tìm kiếm...
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
                    Tìm Ngành Phù Hợp
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
                Làm Lại
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
        {eligibleMajors.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2>Ngành Có Thể Đậu</h2>
              <p>
                Tìm thấy <strong>{eligibleMajors.length}</strong> ngành phù hợp
                với điểm số <strong>{score}</strong> của bạn
              </p>
            </div>

            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Trường</th>
                    <th>Ngành</th>
                    <th>Điểm chuẩn</th>
                    <th>Điểm dư</th>
                    <th>Năm</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleMajors.map((major, index) => {
                    const userScore = parseFloat(score);
                    const extraPoints = userScore - major.score;
                    return (
                      <tr
                        key={`${major.universityId}-${major.majorId}`}
                        className="table-row"
                      >
                        <td className="stt-cell">{index + 1}</td>
                        <td className="university-cell">
                          <div className="university-name">
                            {major.universityName}
                          </div>
                        </td>
                        <td className="major-cell">
                          <div className="major-name">{major.majorName}</div>
                          {major.uniMajorName !== major.majorName && (
                            <div className="uni-major-name">
                              {major.uniMajorName}
                            </div>
                          )}
                        </td>
                        <td className="score-cell">
                          <span className="score-value">{major.score}</span>
                        </td>
                        <td className="extra-points-cell">
                          <span className="extra-points">
                            +{extraPoints.toFixed(2)}
                          </span>
                        </td>
                        <td className="year-cell">
                          <span className="year-badge">{major.year}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions-section">
          <h3>Hướng Dẫn Sử Dụng</h3>
          <div className="instructions-grid">
            <div className="instruction-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Nhập điểm tổ hợp</h4>
                <p>Nhập tổng điểm 3 môn trong tổ hợp thi (thang điểm 30)</p>
              </div>
            </div>
            <div className="instruction-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Chọn tổ hợp môn</h4>
                <p>Chọn tổ hợp môn thi phù hợp với nguyện vọng của bạn</p>
              </div>
            </div>
            <div className="instruction-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Xem kết quả</h4>
                <p>
                  Hệ thống sẽ hiển thị các ngành có thể đậu với điểm của bạn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreEvaluation;
