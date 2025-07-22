import { useState } from "react";
import "../css/ScoreEvaluation.css";

const ScoreEvaluation = () => {
  const [scores, setScores] = useState({
    math: "",
    literature: "",
    english: "",
    physics: "",
    chemistry: "",
    biology: "",
    history: "",
    geography: "",
    civics: "",
  });

  const [evaluationResult, setEvaluationResult] = useState<{
    totalScore: number;
    averageScore: number;
    evaluation: string;
    recommendations: string[];
  } | null>(null);

  const handleScoreChange = (subject: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 10) return;

    setScores((prev) => ({
      ...prev,
      [subject]: value,
    }));
  };

  const evaluateScores = () => {
    const filledScores = Object.values(scores)
      .filter((score) => score !== "")
      .map((score) => parseFloat(score));

    if (filledScores.length === 0) return;

    const totalScore = filledScores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / filledScores.length;

    let evaluation = "";
    let recommendations: string[] = [];

    if (averageScore >= 8.5) {
      evaluation = "Xuất sắc";
      recommendations = [
        "Bạn có thể nhắm đến các trường đại học top đầu",
        "Cân nhắc các ngành học có điểm chuẩn cao",
        "Có thể tham gia các chương trình học bổng",
      ];
    } else if (averageScore >= 7.0) {
      evaluation = "Tốt";
      recommendations = [
        "Có nhiều lựa chọn trường đại học chất lượng",
        "Nên tìm hiểu kỹ về ngành học phù hợp",
        "Có thể cân nhắc các trường đại học quốc tế",
      ];
    } else if (averageScore >= 5.5) {
      evaluation = "Khá";
      recommendations = [
        "Nên chọn ngành học phù hợp với sở thích",
        "Tìm hiểu về các trường đại học vùng",
        "Cân nhắc các phương thức tuyển sinh khác",
      ];
    } else if (averageScore >= 4.0) {
      evaluation = "Trung bình";
      recommendations = [
        "Cần cải thiện kết quả học tập",
        "Tham khảo các trường cao đẳng chất lượng",
        "Cân nhắc học nghề hoặc đào tạo kỹ năng",
      ];
    } else {
      evaluation = "Cần cải thiện";
      recommendations = [
        "Nên tập trung cải thiện kết quả học tập",
        "Tìm hiểu về các chương trình đào tạo nghề",
        "Có thể cân nhắc thi lại để cải thiện điểm",
      ];
    }

    setEvaluationResult({
      totalScore,
      averageScore,
      evaluation,
      recommendations,
    });
  };

  const resetForm = () => {
    setScores({
      math: "",
      literature: "",
      english: "",
      physics: "",
      chemistry: "",
      biology: "",
      history: "",
      geography: "",
      civics: "",
    });
    setEvaluationResult(null);
  };

  return (
    <div className="score-evaluation-container">
      {/* Header */}
      <div className="evaluation-header">
        <h1 className="page-title">Đánh Giá Điểm Thi</h1>
        <p className="page-description">
          Nhập điểm các môn thi để nhận được đánh giá và tư vấn hướng nghiệp
        </p>
      </div>

      <div className="evaluation-content">
        {/* Score Input Form */}
        <div className="score-input-section">
          <h2>Nhập Điểm Các Môn Thi</h2>

          <div className="subjects-grid">
            <div className="subject-group">
              <h3>Môn Bắt Buộc</h3>
              <div className="score-inputs">
                <div className="score-input-item">
                  <label>Toán</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.math}
                    onChange={(e) => handleScoreChange("math", e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div className="score-input-item">
                  <label>Ngữ Văn</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.literature}
                    onChange={(e) =>
                      handleScoreChange("literature", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
                <div className="score-input-item">
                  <label>Tiếng Anh</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.english}
                    onChange={(e) =>
                      handleScoreChange("english", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            <div className="subject-group">
              <h3>Tổ hợp Khoa học Tự nhiên</h3>
              <div className="score-inputs">
                <div className="score-input-item">
                  <label>Vật Lý</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.physics}
                    onChange={(e) =>
                      handleScoreChange("physics", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
                <div className="score-input-item">
                  <label>Hóa Học</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.chemistry}
                    onChange={(e) =>
                      handleScoreChange("chemistry", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
                <div className="score-input-item">
                  <label>Sinh Học</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.biology}
                    onChange={(e) =>
                      handleScoreChange("biology", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            <div className="subject-group">
              <h3>Tổ hợp Khoa học Xã hội</h3>
              <div className="score-inputs">
                <div className="score-input-item">
                  <label>Lịch Sử</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.history}
                    onChange={(e) =>
                      handleScoreChange("history", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
                <div className="score-input-item">
                  <label>Địa Lý</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.geography}
                    onChange={(e) =>
                      handleScoreChange("geography", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
                <div className="score-input-item">
                  <label>GDCD</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.civics}
                    onChange={(e) =>
                      handleScoreChange("civics", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="evaluate-btn" onClick={evaluateScores}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                <path d="M3 12h6m6 0h6" />
              </svg>
              Đánh Giá Điểm
            </button>
            <button className="reset-btn" onClick={resetForm}>
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

        {/* Evaluation Result */}
        {evaluationResult && (
          <div className="evaluation-result">
            <h2>Kết Quả Đánh Giá</h2>

            <div className="result-summary">
              <div className="result-item">
                <label>Tổng điểm:</label>
                <span className="score-value">
                  {evaluationResult.totalScore.toFixed(1)}
                </span>
              </div>
              <div className="result-item">
                <label>Điểm trung bình:</label>
                <span className="score-value">
                  {evaluationResult.averageScore.toFixed(2)}
                </span>
              </div>
              <div className="result-item">
                <label>Xếp loại:</label>
                <span
                  className={`evaluation-level ${evaluationResult.evaluation
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {evaluationResult.evaluation}
                </span>
              </div>
            </div>

            <div className="recommendations">
              <h3>Gợi Ý Và Tư Vấn</h3>
              <ul>
                {evaluationResult.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreEvaluation;
