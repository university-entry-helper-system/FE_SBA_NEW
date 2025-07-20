import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

interface SubjectCombination {
  subjectCombination: string;
}

interface Method {
  universityMajorName: string;
  score: number;
  note: string;
  subjectCombinations: SubjectCombination[];
}

interface YearData {
  year: number;
  methodName: string;
  methods: Method[];
}

interface ApiResult {
  universityId: string;
  universityName: string;
  majorId: string;
  years: YearData[];
}

const UniversityMajorPage = () => {
  const { universityId, majorId } = useParams<{ universityId: string; majorId: string }>();
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!universityId || !majorId) return;
    setLoading(true);
    setError("");
    axios
      .get(`/university-majors/admissions/university/${universityId}/major/${majorId}`)
      .then((res) => setData(res.data.result))
      .catch(() => setError("Không thể tải dữ liệu chi tiết."))
      .finally(() => setLoading(false));
  }, [universityId, majorId]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  if (error) return <div style={{ padding: 40, color: "#e74c3c", textAlign: "center" }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#223a7a", marginBottom: 12 }}>
        Điểm chuẩn theo ngành - {data.universityName}
      </h1>
      {data.years.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32 }}>Không có dữ liệu.</div>
      ) : (
        data.years.map((yearData, yearIdx) => (
          <div key={yearIdx} style={{ marginBottom: 40 }}>
            <h2 style={{ color: "#223a7a", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Năm {yearData.year}
            </h2>
            <h3 style={{ color: "#2260b4", fontSize: 18, margin: "8px 0 12px 0" }}>{yearData.methodName}</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                <thead>
                  <tr style={{ background: "#cbe5ff" }}>
                    <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>STT</th>
                    <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Tên ngành</th>
                    <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Tổ hợp môn</th>
                    <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Điểm chuẩn</th>
                    <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {yearData.methods.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>Không có dữ liệu</td>
                    </tr>
                  ) : (
                    yearData.methods.map((method, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? "#f9fbfd" : "#fff" }}>
                        <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{method.universityMajorName}</td>
                        <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{method.subjectCombinations.map(sc => sc.subjectCombination).join('; ')}</td>
                        <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5", textAlign: "center" }}>{method.score}</td>
                        <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{method.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UniversityMajorPage; 