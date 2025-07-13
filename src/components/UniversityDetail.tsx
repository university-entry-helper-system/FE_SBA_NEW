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
}

const UniversityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
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

  if (loading) return <div className="university-loading">Đang tải...</div>;
  if (error) return <div className="university-error">{error}</div>;
  if (!university)
    return <div className="university-error">Không tìm thấy trường.</div>;

  return (
    <div className="university-detail-container">
      <button className="university-back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>
      <div className="university-detail-card">
        <img
          src={university.logoUrl || "/default-logo.png"}
          alt={university.name}
          className="university-logo-large"
        />
        <h2 className="university-detail-title">{university.name}</h2>
        <p className="university-detail-short">{university.shortName}</p>
        {university.foundingYear && (
          <p className="university-detail-founding">
            Năm thành lập: {university.foundingYear}
          </p>
        )}
        {university.province && (
          <p className="university-detail-province">
            Tỉnh/TP: {university.province.name}
          </p>
        )}
        <p className="university-detail-address">
          Địa chỉ: {university.address}
        </p>
        <p className="university-detail-contact">
          Email: {university.email} | Điện thoại: {university.phone}
        </p>
        <a
          href={university.website}
          target="_blank"
          rel="noopener noreferrer"
          className="university-website"
        >
          Website trường
        </a>
        {university.description && (
          <p className="university-detail-description">
            {university.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default UniversityDetail;
