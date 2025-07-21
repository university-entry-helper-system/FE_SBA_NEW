import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { downloadPdfFile } from "../utils/downloadFile";

interface SubjectCombination {
  subjectCombination: string;
  score: number;
  note: string;
}

interface Major {
  majorId: string;
  majorName: string;
  subjectCombinations: SubjectCombination[];
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
  years: YearData[];
}

const UniversityScoresPage = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!universityId) return;
    setLoading(true);
    setError("");
    axios
      .get(`/university-majors/admissions/university/${universityId}`)
      .then((res) => setData(res.data.result))
      .catch(() => setError("Không thể tải dữ liệu điểm chuẩn."))
      .finally(() => setLoading(false));
  }, [universityId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPdfFile(`/pdf-export/year-groups/download?universityId=${universityId}`, `diem-chuan-${universityId}.pdf`);
    } catch (e) {
      alert("Không thể tải file PDF.");
    }
    setDownloading(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  if (error) return <div style={{ padding: 40, color: "#e74c3c", textAlign: "center" }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#223a7a", marginBottom: 16 }}>
        Điểm chuẩn các ngành - {data.universityName}
      </h1>
      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          display: 'inline-block',
          marginBottom: 24,
          padding: '8px 20px',
          background: '#2260b4',
          color: '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 16,
          boxShadow: '0 1px 4px rgba(34,96,180,0.08)'
        }}
      >
        {downloading ? "Đang tải..." : "Tải PDF điểm chuẩn"}
      </button>
      {data.years.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32 }}>Không có dữ liệu điểm chuẩn.</div>
      ) : (
        data.years.map((yearData) => (
          <div key={yearData.year} style={{ marginBottom: 40 }}>
            <h2 style={{ background: "#fff7d6", color: "#223a7a", padding: "12px 20px", borderRadius: 6, fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
              Điểm chuẩn theo phương thức năm {yearData.year}
            </h2>
            {yearData.methods.map((method) => (
              <div key={method.method} style={{ marginBottom: 24 }}>
                <h3 style={{ color: "#2260b4", fontSize: 18, margin: "12px 0 8px 0" }}>{method.methodName}</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                    <thead>
                      <tr style={{ background: "#cbe5ff" }}>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>STT</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Mã ngành</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Tên ngành</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Tổ hợp môn</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Điểm chuẩn</th>
                        <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {method.majors.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>Không có dữ liệu ngành</td>
                        </tr>
                      ) : (
                        method.majors.map((major, idx) => (
                          <tr key={major.majorId} style={{ background: idx % 2 === 0 ? "#f9fbfd" : "#fff" }}>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5", textAlign: "center" }}>{idx + 1}</td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{major.majorId}</td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{major.majorName}</td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>
                              {major.subjectCombinations.map((sc, i) => (
                                <div key={i}>
                                  {sc.subjectCombination}
                                </div>
                              ))}
                            </td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5", textAlign: "center" }}>
                              {major.subjectCombinations.map((sc, i) => (
                                <div key={i}>{sc.score}</div>
                              ))}
                            </td>
                            <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>
                              {major.subjectCombinations.map((sc, i) => (
                                <div key={i}>{sc.note}</div>
                              ))}
                              {major.note && <div style={{ color: '#888', fontSize: 13 }}>{major.note}</div>}
                            </td>
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

export default UniversityScoresPage; 