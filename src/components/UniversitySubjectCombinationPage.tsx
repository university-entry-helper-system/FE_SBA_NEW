import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

interface Major {
  majorId: string;
  majorName: string;
  score: number;
  note: string;
}

interface Method {
  method: string;
  methodName: string;
  majors: Major[];
}

interface YearData {
  year: number;
  methods: Method[];
}

interface ApiResult {
  universityId: string;
  universityName: string;
  subjectCombination: string;
  years: YearData[];
}

const UniversitySubjectCombinationPage = () => {
  const { universityId, subjectCombinationId } = useParams<{ universityId: string; subjectCombinationId: string }>();
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!universityId || !subjectCombinationId) return;
    setLoading(true);
    setError("");
    axios
      .get(`/university-majors/admissions/university/${subjectCombinationId}/subject-combination/${universityId}`)
      .then((res) => setData(res.data.result))
      .catch(() => setError("Không thể tải dữ liệu chi tiết."))
      .finally(() => setLoading(false));
  }, [universityId, subjectCombinationId]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  if (error) return <div style={{ padding: 40, color: "#e74c3c", textAlign: "center" }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#223a7a", marginBottom: 12 }}>
        Danh sách các ngành xét tuyển khối {data.subjectCombination} - {data.universityName}
      </h1>
    
      {data.years.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32 }}>Không có dữ liệu.</div>
      ) : (
        data.years.map((yearData) => (
          <div key={yearData.year} style={{ marginBottom: 40 }}>
            <h2 style={{ color: "#223a7a", fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
              Năm {yearData.year}
            </h2>
            {yearData.methods.map((method) => (
              <div key={method.method} style={{ marginBottom: 24 }}>
                <h3 style={{ color: "#2260b4", fontSize: 18, margin: "12px 0 8px 0" }}>{method.methodName}</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                    <thead>
                      <tr style={{ background: "#cbe5ff" }}>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>STT</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Mã Ngành</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Tên Ngành</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Điểm chuẩn</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {method.majors.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>Không có dữ liệu ngành</td>
                        </tr>
                      ) : (
                        method.majors.map((major, idx) => (
                          <tr key={major.majorId} style={{ background: idx % 2 === 0 ? "#f9fbfd" : "#fff" }}>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5", textAlign: "center" }}>{idx + 1}</td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{major.majorId}</td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{major.majorName}</td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5", textAlign: "center" }}>{major.score}</td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{major.note}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default UniversitySubjectCombinationPage; 