import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAdmissionMethodsByUniversity } from "../api/admissionMethod";

interface AdmissionMethod {
  methodId: number;
  methodName: string;
  year: number;
  notes: string;
  conditions: string;
  regulations: string;
  admissionTime: string;
}

interface UniversityAdmissionMethodsResult {
  universityId: number;
  universityName: string;
  methods: AdmissionMethod[];
}

const UniversityAdmissionMethodsPage = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const [data, setData] = useState<UniversityAdmissionMethodsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!universityId) return;
    setLoading(true);
    setError("");
    getAdmissionMethodsByUniversity(Number(universityId))
      .then((res) => {
        setData(res.data.result);
      })
      .catch(() => setError("Không thể tải thông tin phương thức tuyển sinh của trường."))
      .finally(() => setLoading(false));
  }, [universityId]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  if (error) return <div style={{ padding: 40, color: "#e74c3c", textAlign: "center" }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#223a7a", marginBottom: 16 }}>
        Phương án tuyển sinh - {data.universityName}
      </h1>
      {data.methods.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32 }}>Không có dữ liệu phương thức tuyển sinh.</div>
      ) : (
        data.methods.map((method) => (
          <div key={method.methodId} style={{ marginBottom: 32, border: "1px solid #e3eaf5", borderRadius: 8, padding: 24 }}>
            <h2 style={{ color: "#2260b4", fontSize: 22, marginBottom: 8 }}>{method.methodName} ({method.year})</h2>
            <div style={{ marginBottom: 8 }}><strong>Ghi chú:</strong> <span>{method.notes || "-"}</span></div>
            <div style={{ marginBottom: 8 }}><strong>Điều kiện:</strong> <span>{method.conditions || "-"}</span></div>
            <div style={{ marginBottom: 8 }}><strong>Quy chế:</strong> <span>{method.regulations || "-"}</span></div>
            <div style={{ marginBottom: 8 }}><strong>Thời gian tuyển sinh:</strong> <span>{method.admissionTime || "-"}</span></div>
          </div>
        ))
      )}
    </div>
  );
};

export default UniversityAdmissionMethodsPage; 