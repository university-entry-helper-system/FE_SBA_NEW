import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../css/Home.css";
import { ImageCarousel } from "./ImageCarousel";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("de-an");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dữ liệu mẫu trường đại học (có thể thay bằng API sau)
  const schools = [
    {
      id: 1,
      name: "ĐH Bách Khoa Hà Nội",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f0/HCMCUT.svg",
    },
    {
      id: 2,
      name: "ĐH FPT",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b9/FPTUCT.png",
    },
    {
      id: 3,
      name: "ĐH Khoa học Tự nhiên",
      logo: "https://placehold.co/40x40?text=Logo",
    },
    {
      id: 4,
      name: "ĐH Y Dược Hà Nội",
      logo: "https://placehold.co/40x40?text=Logo",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="homepage-modern">
      <ImageCarousel />
      
      <section className="hero">
        <div className="hero-content">
         
          <h1 className="hero-title"><span className="name-hero-title">EDUPATH</span> - Sổ tay tuyển sinh đại học</h1>
          <p className="hero-desc">
            Tra cứu thông tin các trường đại học, ngành học, phương thức tuyển
            sinh và tin tức mới nhất!
          </p>
          <div className="hero-search" ref={dropdownRef}>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm trường, ngành, mã trường..."
              onFocus={() => setShowDropdown(true)}
            />
            <button className="search-btn">
              <SearchIcon />
            </button>
            {showDropdown && (
              <div className="search-dropdown">
                {schools.map((school) => (
                  <Link
                    key={school.id}
                    to={`/universities/${school.id}`}
                    className="search-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <img
                      src={school.logo}
                      alt={school.name}
                      className="search-dropdown-logo"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/40x40?text=Logo";
                      }}
                    />
                    <span className="search-dropdown-name">{school.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="tabs-section">
        <div className="tabs">
          <button
            className={`tab-btn${activeTab === "de-an" ? " active" : ""}`}
            onClick={() => setActiveTab("de-an")}
          >
            Đề án
          </button>
          <button
            className={`tab-btn${activeTab === "diem-chuan" ? " active" : ""}`}
            onClick={() => setActiveTab("diem-chuan")}
          >
            Điểm chuẩn
          </button>
          <button
            className={`tab-btn${activeTab === "khoi-mon" ? " active" : ""}`}
            onClick={() => setActiveTab("khoi-mon")}
          >
            Khối - Tổ hợp môn
          </button>
          <button
            className={`tab-btn${activeTab === "nganh" ? " active" : ""}`}
            onClick={() => setActiveTab("nganh")}
          >
            Danh sách ngành
          </button>
        </div>
      </section>

      <section className="features-section">
        <h2 className="features-title">Bạn có thể tra cứu</h2>
        <div className="features-list">
          <FeatureCard
            icon="🎓"
            title="Trường đại học"
            description="Xem danh sách các trường đại học trên cả nước"
            link="/universities"
          />
          <FeatureCard
            icon="📚"
            title="Ngành học"
            description="Tra cứu các ngành đào tạo, chỉ tiêu, tổ hợp môn"
            link="/majors"
          />
          <FeatureCard
            icon="📝"
            title="Phương thức tuyển sinh"
            description="Xem các phương thức xét tuyển mới nhất"
            link="/admission-methods"
          />
          <FeatureCard
            icon="📰"
            title="Tin tức tuyển sinh"
            description="Cập nhật thông tin tuyển sinh mới nhất từ các trường"
            link="/news"
          />
        </div>
      </section>

      <section className="news-section">
        <h2 className="news-title">Tin tức tuyển sinh mới nhất</h2>
        <ul className="news-list">
          <li>
            <Link to="/news/1">
              ĐH Bách Khoa Hà Nội công bố đề án tuyển sinh 2025
            </Link>
          </li>
          <li>
            <Link to="/news/2">ĐH FPT mở thêm ngành mới năm 2025</Link>
          </li>
          <li>
            <Link to="/news/3">
              Bộ GD&ĐT cập nhật phương thức xét tuyển đại học
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  link,
}: {
  icon: string;
  title: string;
  description: string;
  link: string;
}) => (
  <Link to={link} className="feature-card">
    <div className="feature-icon">{icon}</div>
    <div className="feature-info">
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  </Link>
);

const SearchIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default HomePage;
