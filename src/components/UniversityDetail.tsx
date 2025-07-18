import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/University.css";

interface Province {
  id: number;
  name: string;
  status?: string;
  region?: string | null;
}

interface University {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
  foundingYear?: number;
  province?: Province;
  address: string;
  website: string;
  email: string;
  phone: string;
  description?: string;
  universityCode?: string;
  nameEn?: string;
  category?: { id: number; name: string };
  admissionMethodIds?: number[];
  fanpage?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  status?: string;
}

interface AdmissionMethod {
  id: number;
  name: string;
}

const UniversityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [admissionMethods, setAdmissionMethods] = useState<AdmissionMethod[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversity = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `http://localhost:8080/api/v1/universities/${id}`
        );
        setUniversity(res.data.result || null);
      } catch {
        setError("Không thể tải thông tin trường.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUniversity();
  }, [id]);

  useEffect(() => {
    // Lấy danh sách phương thức tuyển sinh
    import("../api/admissionMethod").then((api) => {
      api.getAdmissionMethods({ page: 0, size: 100 }).then((res) => {
        setAdmissionMethods(res.data.result.items || []);
      });
    });
  }, []);

  if (loading) return <div className="university-loading">Đang tải...</div>;
  if (error) return <div className="university-error">{error}</div>;
  if (!university)
    return <div className="university-error">Không tìm thấy trường.</div>;

  // Thêm hàm getLogoUrl
  const getLogoUrl = (logoUrl?: string) => {
    if (!logoUrl) return "/default-logo.png";
    if (logoUrl.startsWith("http")) {
      let url = logoUrl.split("?")[0];
      url = url.replace("minio:9000", "localhost:9000");
      return url;
    }
    return `http://localhost:9000/mybucket/${logoUrl}`;
  };

  // Map id sang tên phương thức tuyển sinh
  const admissionNames = (university.admissionMethodIds || [])
    .map((id) => admissionMethods.find((m) => m.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="university-detail-container">
      <button className="university-back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="university-detail-card">
        {/* Header với Logo ở giữa */}
        <div
          style={{ width: "100%", textAlign: "center", marginBottom: "32px" }}
        >
          <img
            src={getLogoUrl(university.logoUrl)}
            alt={university.name}
            className="university-logo-large"
            style={{ margin: "0 auto", display: "block" }}
            onError={(e) => {
              e.currentTarget.src = "/default-logo.png";
            }}
          />
          <h2 className="university-detail-title" style={{ marginTop: "20px" }}>
            {university.name}
          </h2>
          <div
            className="university-detail-badges"
            style={{ justifyContent: "center", marginBottom: "24px" }}
          >
            <span className="admin-badge admin-badge-info">
              {university.universityCode}
            </span>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <span className="admin-badge admin-badge-info">
              {university.shortName}
            </span>
          </div>
        </div>

        {/* Two Columns Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            width: "100%",
            alignItems: "start",
          }}
        >
          {/* Left Column - Basic Info */}
          <div style={{ textAlign: "left" }}>
            <h3
              style={{
                color: "#38d9a9",
                marginBottom: "16px",
                fontSize: "1.2rem",
                borderBottom: "2px solid rgba(56, 217, 169, 0.2)",
                paddingBottom: "8px",
              }}
            >
              Thông tin cơ bản
            </h3>

            <div style={{ marginBottom: "12px" }}>
              <strong>Tên tiếng Anh:</strong>
              <br />
              <span style={{ color: "#6b7280" }}>
                {university.nameEn || "Chưa cập nhật"}
              </span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>Loại trường:</strong>
              <br />
              <span style={{ color: "#6b7280" }}>
                {university.category?.name || "Chưa cập nhật"}
              </span>
            </div>

            {university.foundingYear && (
              <div style={{ marginBottom: "12px" }}>
                <strong>Năm thành lập:</strong>
                <br />
                <span style={{ color: "#6b7280" }}>
                  {university.foundingYear}
                </span>
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <strong>Địa chỉ:</strong>
              <br />
              <span style={{ color: "#6b7280" }}>{university.address}</span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>Tỉnh/Thành:</strong>
              <br />
              <span style={{ color: "#6b7280" }}>
                {university.province?.name || "Chưa cập nhật"}
              </span>
            </div>
          </div>

          {/* Right Column - Contact & Links */}
          <div style={{ textAlign: "left" }}>
            <h3
              style={{
                color: "#38d9a9",
                marginBottom: "16px",
                fontSize: "1.2rem",
                borderBottom: "2px solid rgba(56, 217, 169, 0.2)",
                paddingBottom: "8px",
              }}
            >
              Liên hệ & Thông tin
            </h3>

            <div style={{ marginBottom: "12px" }}>
              <strong>Email:</strong>
              <br />
              <span style={{ color: "#6b7280" }}>
                {university.email || "Chưa có email"}
              </span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>Điện thoại:</strong>
              <br />
              <span style={{ color: "#6b7280" }}>
                {university.phone || "Chưa có số điện thoại"}
              </span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>Website:</strong>
              <br />
              {university.website ? (
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#38d9a9", textDecoration: "none" }}
                >
                  {university.website}
                </a>
              ) : (
                <span style={{ color: "#6b7280" }}>Chưa cập nhật</span>
              )}
            </div>

            {university.fanpage && (
              <div style={{ marginBottom: "12px" }}>
                <strong>Fanpage:</strong>
                <br />
                <a
                  href={university.fanpage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#38d9a9", textDecoration: "none" }}
                >
                  {university.fanpage}
                </a>
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <strong>Phương thức tuyển sinh:</strong>
              <br />
              <span style={{ color: "#6b7280" }}>
                {admissionNames.length > 0
                  ? admissionNames.join(", ")
                  : "Chưa cập nhật"}
              </span>
            </div>
          </div>
        </div>

        {/* Full Width Description */}
        {university.description && (
          <div style={{ marginTop: "32px", width: "100%" }}>
            <h3
              style={{
                color: "#38d9a9",
                marginBottom: "16px",
                fontSize: "1.2rem",
                borderBottom: "2px solid rgba(56, 217, 169, 0.2)",
                paddingBottom: "8px",
              }}
            >
              Mô tả
            </h3>
            <div className="university-detail-description">
              {university.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityDetail;
