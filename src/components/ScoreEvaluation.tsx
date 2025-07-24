import { useState, useEffect } from "react";
import "../css/ScoreEvaluation.css";
import {
  getAllSubjectCombinations,
  getAllProvinces,
  getEligibleMajors,
  type SubjectCombination,
  type Province,
  type EligibleMajor,
} from "../api/eligibleMajors";
import { getScoresBySubject, getSubjectCode, type Score } from "../api/scores";

const ScoreEvaluation = () => {
  const [score, setScore] = useState("");
  const [maxGap, setMaxGap] = useState("");
  const [selectedCombination, setSelectedCombination] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [combinations, setCombinations] = useState<SubjectCombination[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [eligibleMajors, setEligibleMajors] = useState<EligibleMajor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [combinationsLoading, setCombinationsLoading] = useState(true);
  const [provincesLoading, setProvincesLoading] = useState(true);

  // State cho phổ điểm tham khảo
  const [showScoreDistribution, setShowScoreDistribution] = useState(false);
  const [scoreDistributions, setScoreDistributions] = useState<{
    [key: string]: Score[];
  }>({});
  const [loadingScores, setLoadingScores] = useState(false);

  // Load subject combinations and provinces when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setCombinationsLoading(true);
        setProvincesLoading(true);

        // Load combinations and provinces in parallel
        const [combinationsResponse, provincesResponse] = await Promise.all([
          getAllSubjectCombinations(),
          getAllProvinces(),
        ]);

        if (combinationsResponse.code === 1000) {
          setCombinations(combinationsResponse.result.items);
        } else {
          setError("Không thể tải danh sách tổ hợp môn");
        }

        if (provincesResponse.code === 1000) {
          setProvinces(provincesResponse.result.items);
        } else {
          setError("Không thể tải danh sách tỉnh thành");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu");
        console.error("Error loading data:", err);
      } finally {
        setCombinationsLoading(false);
        setProvincesLoading(false);
      }
    };

    loadData();
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
      const requestData = {
        score: scoreValue,
        subjectCombinationId: parseInt(selectedCombination),
        maxGap: maxGap.trim()
          ? parseFloat(maxGap) >= 0
            ? parseFloat(maxGap)
            : null
          : null,
        provinceId: selectedProvince ? parseInt(selectedProvince) : null,
      };

      const response = await getEligibleMajors(requestData);

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
    setMaxGap("");
    setSelectedCombination("");
    setSelectedProvince("");
    setEligibleMajors([]);
    setError("");
    setShowScoreDistribution(false);
    setScoreDistributions({});
  };

  const getSelectedCombinationInfo = () => {
    if (!selectedCombination) return null;
    return combinations.find(
      (combo) => combo.id.toString() === selectedCombination
    );
  };

  const getSelectedProvinceInfo = () => {
    if (!selectedProvince) return null;
    return provinces.find(
      (province) => province.id.toString() === selectedProvince
    );
  };

  // Function để load phổ điểm của các môn trong tổ hợp
  const loadScoreDistribution = async () => {
    if (!selectedCombination) return;

    const comboInfo = getSelectedCombinationInfo();
    if (!comboInfo) return;

    setLoadingScores(true);
    const newScoreDistributions: { [key: string]: Score[] } = {};

    try {
      // Load phổ điểm cho từng môn trong tổ hợp cho cả 2024 và 2025
      for (const subject of comboInfo.examSubjects) {
        const subjectCode = getSubjectCode(subject.name);
        console.log(
          "Loading scores for subject:",
          subject.name,
          "code:",
          subjectCode
        );

        // Load cho năm 2024 và 2025
        const [scores2024, scores2025] = await Promise.all([
          getScoresBySubject(2024, "THPT", subjectCode),
          getScoresBySubject(2025, "THPT", subjectCode),
        ]);

        console.log(`Scores for ${subject.name} 2024:`, scores2024);
        console.log(`Scores for ${subject.name} 2025:`, scores2025);

        newScoreDistributions[`${subject.name}_2024`] = scores2024;
        newScoreDistributions[`${subject.name}_2025`] = scores2025;
      }

      console.log("Final score distributions:", newScoreDistributions);
      setScoreDistributions(newScoreDistributions);
    } catch (error) {
      console.error("Error loading score distributions:", error);
    } finally {
      setLoadingScores(false);
    }
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
              <label htmlFor="maxGap">Khoảng điểm chênh lệch (tùy chọn):</label>
              <input
                type="number"
                id="maxGap"
                value={maxGap}
                onChange={(e) => setMaxGap(e.target.value)}
                placeholder="Ví dụ: 1 (sẽ tìm trong khoảng ±1 điểm)"
                min="0"
                max="10"
                step="0.1"
                disabled={loading}
              />
              <small className="form-hint">
                Để trống để xem tất cả ngành có thể đậu, hoặc nhập số để giới
                hạn khoảng điểm
              </small>
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

            <div className="form-group">
              <label htmlFor="province">Tỉnh/Thành phố (tùy chọn):</label>
              {provincesLoading ? (
                <div className="loading-select">Đang tải...</div>
              ) : (
                <select
                  id="province"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Tất cả tỉnh thành</option>
                  <optgroup label="Miền Bắc">
                    {provinces
                      .filter((province) => province.region === "BAC")
                      .map((province) => (
                        <option
                          key={province.id}
                          value={province.id.toString()}
                        >
                          {province.name}
                          {province.description && ` - ${province.description}`}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Miền Trung">
                    {provinces
                      .filter((province) => province.region === "TRUNG")
                      .map((province) => (
                        <option
                          key={province.id}
                          value={province.id.toString()}
                        >
                          {province.name}
                          {province.description && ` - ${province.description}`}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Miền Nam">
                    {provinces
                      .filter((province) => province.region === "NAM")
                      .map((province) => (
                        <option
                          key={province.id}
                          value={province.id.toString()}
                        >
                          {province.name}
                          {province.description && ` - ${province.description}`}
                        </option>
                      ))}
                  </optgroup>
                </select>
              )}
              <small className="form-hint">
                Chọn tỉnh/thành phố để lọc các trường đại học tại khu vực này
              </small>
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
                disabled={loading || combinationsLoading || provincesLoading}
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

              {selectedCombination && (
                <button
                  className="score-distribution-btn"
                  onClick={() => {
                    loadScoreDistribution();
                    setShowScoreDistribution(true);
                  }}
                  disabled={loading || loadingScores}
                >
                  {loadingScores ? (
                    <>
                      <div className="spinner"></div>
                      Đang tải...
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
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Xem Phổ Điểm
                    </>
                  )}
                </button>
              )}

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
                {(() => {
                  const provinceInfo = getSelectedProvinceInfo();
                  return provinceInfo ? (
                    <span>
                      {" "}
                      tại <strong>{provinceInfo.name}</strong>
                    </span>
                  ) : null;
                })()}
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
                    <th>Điểm chênh lệch</th>
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
                          <span
                            className={`score-difference ${
                              extraPoints >= 0 ? "positive" : "negative"
                            }`}
                          >
                            {extraPoints >= 0 ? "+" : ""}
                            {extraPoints.toFixed(2)}
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
                <h4>Lọc theo tỉnh (tùy chọn)</h4>
                <p>Chọn tỉnh/thành phố để tìm trường trong khu vực mong muốn</p>
              </div>
            </div>
            <div className="instruction-item">
              <div className="step-number">4</div>
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

      {/* Score Distribution Modal */}
      {showScoreDistribution && (
        <div
          className="score-distribution-modal"
          onClick={() => setShowScoreDistribution(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phổ Điểm Tham Khảo - {getSelectedCombinationInfo()?.name}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowScoreDistribution(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {loadingScores ? (
                <div className="loading-section">
                  <div className="spinner"></div>
                  <p>Đang tải phổ điểm...</p>
                </div>
              ) : (
                <div className="score-distribution-grid">
                  {getSelectedCombinationInfo()?.examSubjects.map((subject) => (
                    <div key={subject.id} className="subject-distribution">
                      <h4>{subject.name}</h4>
                      <div className="year-comparison">
                        <div className="year-column">
                          <h5>Năm 2024</h5>
                          {scoreDistributions[`${subject.name}_2024`]?.length >
                          0 ? (
                            scoreDistributions[`${subject.name}_2024`].map(
                              (score) => (
                                <div
                                  key={score.id}
                                  className="score-image-container"
                                >
                                  <img
                                    src={score.scoreUrl}
                                    alt={`Phổ điểm ${subject.name} 2024`}
                                    className="score-distribution-image"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                </div>
                              )
                            )
                          ) : (
                            <p className="no-data">Chưa có dữ liệu</p>
                          )}
                        </div>

                        <div className="year-column">
                          <h5>Năm 2025</h5>
                          {scoreDistributions[`${subject.name}_2025`]?.length >
                          0 ? (
                            scoreDistributions[`${subject.name}_2025`].map(
                              (score) => (
                                <div
                                  key={score.id}
                                  className="score-image-container"
                                >
                                  <img
                                    src={score.scoreUrl}
                                    alt={`Phổ điểm ${subject.name} 2025`}
                                    className="score-distribution-image"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                </div>
                              )
                            )
                          ) : (
                            <p className="no-data">Chưa có dữ liệu</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreEvaluation;
