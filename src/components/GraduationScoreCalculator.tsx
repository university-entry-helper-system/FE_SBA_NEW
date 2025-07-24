import { useState } from "react";
import { Link } from "react-router-dom";
import { calculateGraduationScore } from "../api/graduationCaculate";
import type {
  GraduationScoreRequest,
  GraduationScoreResponse,
  AllSubjectsScore,
} from "../types/graduationCaculate";
import "../css/GraduationScoreCalculator.css";
import congThucTN from "../assets/cong-thuc-diem-tnthpt_12.cb676337.png";
import congThucDTB from "../assets/cong-thuc-diem-tnthpt_3.baa1cc8f.png";
import congThucTN2 from "../assets/cong-thuc-diem-tnthpt_2.e43087c0.png";

const initialAllSubjectsScoreState: AllSubjectsScore = {
  literature: { grade10: null, grade11: null, grade12: null },
  math: { grade10: null, grade11: null, grade12: null },
  foreignLanguage: { grade10: null, grade11: null, grade12: null },
  nationalDefense: { grade10: null, grade11: null, grade12: null },
  history: { grade10: null, grade11: null, grade12: null },
  chemistry: { grade10: null, grade11: null, grade12: null },
  biology: { grade10: null, grade11: null, grade12: null },
  physics: { grade10: null, grade11: null, grade12: null },
  geography: { grade10: null, grade11: null, grade12: null },
  civicEducation: { grade10: null, grade11: null, grade12: null },
  informatics: { grade10: null, grade11: null, grade12: null },
  technology: { grade10: null, grade11: null, grade12: null },
};

const subjectNameMap: Record<string, string> = {
  literature: "Văn",
  math: "Toán",
  foreignLanguage: "Ngoại ngữ",
  nationalDefense: "GD Quốc phòng & An ninh",
  history: "Sử",
  chemistry: "Hóa",
  biology: "Sinh",
  physics: "Lí",
  geography: "Địa",
  civicEducation: "GDKTPL",
  informatics: "Tin học",
  technology: "Công nghệ",
};

const compulsorySubjects = [
  "literature",
  "math",
  "foreignLanguage",
  "nationalDefense",
  "history",
];
const electiveSubjects = [
  "chemistry",
  "biology",
  "physics",
  "geography",
  "civicEducation",
  "informatics",
  "technology",
];

export default function GraduationScoreCalculator() {
  const [form, setForm] = useState<GraduationScoreRequest>({
    literatureScore: null,
    mathScore: null,
    foreignLanguageScore: null,
    electiveScore: null,
    bonusScore: null,
    priorityScore: null,
    allSubjectsScore: initialAllSubjectsScoreState,
    exemptedFromForeignLanguage: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GraduationScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("allSubjectsScore.")) {
      const [, subject, grade] = name.split(".");
      setForm((prev) => ({
        ...prev,
        allSubjectsScore: {
          ...prev.allSubjectsScore,
          [subject]: {
            ...prev.allSubjectsScore[subject as keyof AllSubjectsScore],
            [grade]: value === "" ? null : Number(value),
          },
        },
      }));
    } else if (name === "exemptedFromForeignLanguage") {
      setForm((prev) => ({
        ...prev,
        exemptedFromForeignLanguage: value === "true",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
    }
  };

  const convertToNumberOrNull = (val: string | number | null | undefined) => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "number") return val;
    return Number(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Prepare data: convert all "" to null, others to number
      const data: GraduationScoreRequest = {
        literatureScore: convertToNumberOrNull(form.literatureScore),
        mathScore: convertToNumberOrNull(form.mathScore),
        foreignLanguageScore: convertToNumberOrNull(form.foreignLanguageScore),
        electiveScore: convertToNumberOrNull(form.electiveScore),
        bonusScore: convertToNumberOrNull(form.bonusScore),
        priorityScore: convertToNumberOrNull(form.priorityScore),
        exemptedFromForeignLanguage: form.exemptedFromForeignLanguage,
        allSubjectsScore: Object.fromEntries(
          Object.entries(form.allSubjectsScore as Record<string, any>).map(
            ([subject, grades]) => [
              subject,
              Object.fromEntries(
                Object.entries(grades).map(([grade, val]) => [
                  grade,
                  convertToNumberOrNull(
                    val as string | number | null | undefined
                  ),
                ])
              ),
            ]
          )
        ) as any,
      };
      const res = await calculateGraduationScore(data);
      setResult(res.data.result);
    } catch (err) {
      console.error("Calculation error:", err);
      if (err instanceof Error) {
        setError(`Lỗi: ${err.message}`);
      } else {
        setError(
          "Có lỗi xảy ra khi tính điểm. Vui lòng kiểm tra lại thông tin đã nhập."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="graduation-score-calculator-container">
      <h2 className="gsc-title">
        CÔNG CỤ TÍNH ĐIỂM TỐT NGHIỆP THPT NHANH NHẤT, CHÍNH XÁC NHẤT
      </h2>
      <div className="gsc-formula-block">
        <div className="gsc-formula-title">
          Công thức tính điểm xét tốt nghiệp THPT:
        </div>
        <img
          src={congThucTN}
          alt="Công thức tính điểm tốt nghiệp"
          className="gsc-formula-img"
        />
        <div className="gsc-formula-title">
          Trong đó, điểm trung bình các năm học được tính theo công thức sau:
        </div>
        <img
          src={congThucDTB}
          alt="Công thức tính điểm trung bình các năm học"
          className="gsc-formula-img"
        />
        <div className="gsc-formula-desc">
          Điểm trung bình lớp 10, 11 và 12 là điểm trung bình cộng của tất cả
          môn học được đánh giá bằng điểm số.
          <br />
          <b>Lưu ý:</b> Đối với học sinh sử dụng chứng chỉ ngoại ngữ để miễn thi
          môn ngoại ngữ được tính với công thức khác.
        </div>
        <img
          src={congThucTN2}
          alt="Công thức tính điểm trung bình các năm học"
          className="gsc-formula-img"
        />
      </div>
      <form className="gsc-form" onSubmit={handleSubmit}>
        {/* Bước 1 */}
        <div className="gsc-step">
          <div className="gsc-step-title">
            Bước 1. Nhập điểm thi tốt nghiệp THPT 2025
          </div>
          <div className="gsc-row gsc-row-exam">
            <div className="gsc-exam-table">
              <table>
                <thead>
                  <tr>
                    <th>Môn thi</th>
                    <th>Điểm thi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Văn</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name="literatureScore"
                        value={form.literatureScore ?? ""}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Toán</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name="mathScore"
                        value={form.mathScore ?? ""}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="gsc-exam-table">
              <table>
                <thead>
                  <tr>
                    <th>Môn thi</th>
                    <th>Điểm thi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tự chọn 1</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name="electiveScore"
                        value={form.electiveScore ?? ""}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Tự chọn 2</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name="foreignLanguageScore"
                        value={form.foreignLanguageScore ?? ""}
                        onChange={handleChange}
                        required={!form.exemptedFromForeignLanguage}
                        disabled={form.exemptedFromForeignLanguage}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="gsc-row gsc-row-select">
            <label>
              Miễn thi ngoại ngữ:
              <select
                name="exemptedFromForeignLanguage"
                value={form.exemptedFromForeignLanguage ? "true" : "false"}
                onChange={handleChange}
              >
                <option value="false">Không</option>
                <option value="true">Có</option>
              </select>
            </label>
          </div>
        </div>
        {/* Bước 2 */}
        <div className="gsc-step">
          <div className="gsc-step-title">
            Bước 2. Nhập điểm các môn học đánh giá bằng điểm số
          </div>
          <div className="gsc-table-block">
            <div className="gsc-table-title">Môn bắt buộc học trên lớp:</div>
            <table className="gsc-table">
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th>Cả năm lớp 10</th>
                  <th>Cả năm lớp 11</th>
                  <th>Cả năm lớp 12</th>
                </tr>
              </thead>
              <tbody>
                {compulsorySubjects.map((subject) => (
                  <tr key={subject}>
                    <td>{subjectNameMap[subject]}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name={`allSubjectsScore.${subject}.grade10`}
                        value={
                          form.allSubjectsScore[
                            subject as keyof AllSubjectsScore
                          ].grade10 ?? ""
                        }
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name={`allSubjectsScore.${subject}.grade11`}
                        value={
                          form.allSubjectsScore[
                            subject as keyof AllSubjectsScore
                          ].grade11 ?? ""
                        }
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name={`allSubjectsScore.${subject}.grade12`}
                        value={
                          form.allSubjectsScore[
                            subject as keyof AllSubjectsScore
                          ].grade12 ?? ""
                        }
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="gsc-table-title">Môn lựa chọn học trên lớp:</div>
            <table className="gsc-table">
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th>Cả năm lớp 10</th>
                  <th>Cả năm lớp 11</th>
                  <th>Cả năm lớp 12</th>
                </tr>
              </thead>
              <tbody>
                {electiveSubjects.map((subject) => (
                  <tr key={subject}>
                    <td>{subjectNameMap[subject]}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name={`allSubjectsScore.${subject}.grade10`}
                        value={
                          form.allSubjectsScore[
                            subject as keyof AllSubjectsScore
                          ].grade10 ?? ""
                        }
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name={`allSubjectsScore.${subject}.grade11`}
                        value={
                          form.allSubjectsScore[
                            subject as keyof AllSubjectsScore
                          ].grade11 ?? ""
                        }
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name={`allSubjectsScore.${subject}.grade12`}
                        value={
                          form.allSubjectsScore[
                            subject as keyof AllSubjectsScore
                          ].grade12 ?? ""
                        }
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="gsc-note">
              *Mẹo nhập nhanh: Nhập 66 =&gt; 6.6; 625 =&gt; 6.25; ...
            </div>
          </div>
        </div>
        {/* Bước 3 */}
        <div className="gsc-step">
          <div className="gsc-step-title">
            Bước 3. Nhập điểm ưu tiên, khuyến khích
          </div>

          <div className="gsc-info-section">
            <div className="gsc-info-card">
              <h4>💡 Thông tin quan trọng về điểm ưu tiên và khuyến khích:</h4>
              <div className="gsc-info-content">
                <div className="gsc-info-item">
                  <strong>🎯 Điểm ưu tiên theo đối tượng:</strong>
                  <p>
                    Được cộng cho các thí sinh thuộc diện gia đình chính sách,
                    người có công với cách mạng, hoặc có các điều kiện ưu tiên
                    khác. <strong>Mức cộng tối đa: 2.0 điểm</strong>
                  </p>
                </div>
                <div className="gsc-info-item">
                  <strong>🏆 Tổng điểm khuyến khích:</strong>
                  <p>
                    Tổng điểm khuyến khích tối đa được cộng là{" "}
                    <strong>4.0 điểm</strong>.
                  </p>
                </div>
              </div>
              <Link
                to="/priority-score-info"
                className="gsc-info-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                📋 Xem chi tiết luật điểm ưu tiên & khuyến khích
              </Link>
            </div>
          </div>

          <div className="gsc-row gsc-row-priority">
            <label>
              Điểm ưu tiên
              <input
                type="number"
                step="0.01"
                min="0"
                max="2"
                name="priorityScore"
                value={form.priorityScore ?? ""}
                onChange={handleChange}
                placeholder="Tối đa 2.0 điểm"
              />
              <small className="gsc-input-hint">Tối đa 2.0 điểm</small>
            </label>
            <label>
              Điểm khuyến khích
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                name="bonusScore"
                value={form.bonusScore ?? ""}
                onChange={handleChange}
                placeholder="Tối đa 4.0 điểm"
              />
              <small className="gsc-input-hint">Tối đa 4.0 điểm</small>
            </label>
          </div>
        </div>
        {/* Bước 4 */}
        <div className="gsc-step">
          <div className="gsc-step-title">
            Bước 4. Chọn "xem kết quả" để xem điểm xét tốt nghiệp THPT 2025
          </div>
          <button className="gsc-submit" type="submit" disabled={loading}>
            {loading ? "Đang tính..." : "Xem kết quả"}
          </button>
        </div>
      </form>
      {error && <div className="gsc-error">{error}</div>}
      {result && (
        <div className="gsc-result">
          <h3>Kết quả chi tiết:</h3>
          <div className="gsc-row-result">
            <b>Tổng điểm các môn thi:</b> {result.totalExamScore}
          </div>
          <div className="gsc-row-result">
            <b>Điểm khuyến khích:</b> {result.bonusScore}
          </div>
          <div className="gsc-row-result">
            <b>Điểm trung bình các năm học:</b> {result.averageSchoolScore}
          </div>
          <div className="gsc-row-result">
            <b>Điểm ưu tiên:</b> {result.priorityScore}
          </div>
          <div className="gsc-score">
            Điểm tốt nghiệp: <b>{result.finalGraduationScore}</b>
          </div>
          <div className="gsc-status">
            <b>{result.resultMessage}</b>
          </div>
          {result.reason && (
            <div className="gsc-details-info">{result.reason}</div>
          )}
        </div>
      )}
    </div>
  );
}
