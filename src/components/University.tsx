import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../css/University.css";

interface University {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
  provinceId: number;
  address: string;
  website: string;
  email: string;
  phone: string;
}

const UniversityPage = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          "http://localhost:8080/api/v1/universities"
        );
        setUniversities(Array.isArray(res.data.result) ? res.data.result : []);
      } catch {
        setError("Không thể tải danh sách trường.");
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  return (
    <div className="university-container">
      <h2 className="university-title">Danh sách các trường đại học</h2>
      {error && <div className="university-error">{error}</div>}
      {loading ? (
        <div className="university-loading">Đang tải...</div>
      ) : (
        <div className="university-list">
          {universities.map((u) => (
            <Link
              to={`/universities/${u.id}`}
              key={u.id}
              className="university-card"
            >
              <img
                src={u.logoUrl || "/default-logo.png"}
                alt={u.name}
                className="university-logo"
              />
              <div className="university-info">
                <h3 className="university-name">{u.name}</h3>
                <p className="university-short">{u.shortName}</p>
                <p className="university-address">{u.address}</p>
                <p className="university-contact">
                  <span>{u.email}</span> | <span>{u.phone}</span>
                </p>
                <a
                  href={u.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="university-website"
                >
                  Website
                </a>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversityPage;
