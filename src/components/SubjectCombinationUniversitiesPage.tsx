import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";

interface UniversityResult {
  universityId: number;
  universityName: string;
  universityMajorCountBySubjectCombination: number;
}

const SubjectCombinationUniversitiesPage = () => {
  const { subjectCombinationId } = useParams<{ subjectCombinationId: string }>();
  const [universities, setUniversities] = useState<UniversityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = (subjectCombinationId: string, universityName: string) => {
    setLoading(true);
    setError("");
    axios
      .get(`/university-majors/search/subject-combination/${subjectCombinationId}`, {
        params: universityName ? { universityName } : {},
      })
      .then((res) => setUniversities(res.data.result || []))
      .catch(() => setError("Không thể tải dữ liệu tổ hợp môn."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!subjectCombinationId) return;
    fetchData(subjectCombinationId, search);
    // eslint-disable-next-line
  }, [subjectCombinationId]);

  useEffect(() => {
    if (!subjectCombinationId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData(subjectCombinationId, search);
    }, 400);
    // eslint-disable-next-line
  }, [search]);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#223a7a", marginBottom: 16 }}>
        Danh sách trường theo tổ hợp môn
      </h1>
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Tìm trường..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #b3d7f6", width: 300 }}
        />
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>Đang tải...</div>
      ) : error ? (
        <div style={{ textAlign: "center", color: "#e74c3c", padding: 40 }}>{error}</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#cbe5ff" }}>
              <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>STT</th>
              <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Tên trường</th>
              <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}>Kết quả</th>
              <th style={{ padding: "8px 6px", border: "1px solid #b3d7f6" }}></th>
            </tr>
          </thead>
          <tbody>
            {universities.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>Không có trường phù hợp</td>
              </tr>
            ) : (
              universities.map((u, idx) => (
                <tr key={u.universityId} style={{ background: idx % 2 === 0 ? "#f9fbfd" : "#fff" }}>
                  <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>
                    <Link to={`/university-subject-combination/${u.universityId}/${subjectCombinationId}`} style={{ color: "#2260b4", fontWeight: 500, textDecoration: "underline" }}>{u.universityName}</Link>
                  </td>
                  <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>{u.universityMajorCountBySubjectCombination} ngành</td>
                  <td style={{ padding: "8px 6px", border: "1px solid #e3eaf5" }}>
                    <Link to={`/university-subject-combination/${u.universityId}/${subjectCombinationId}`} style={{ color: "#2260b4", textDecoration: "underline", cursor: "pointer" }}>Xem chi tiết</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubjectCombinationUniversitiesPage; 