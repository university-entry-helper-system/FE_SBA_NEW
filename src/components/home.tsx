import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ImageCarousel } from "./ImageCarousel";
import "../css/home.css"; // Đảm bảo import file CSS

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("de-an");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // TODO: Replace with actual data from the database
  const schools = [
    {
      id: 1,
      name: "Trường Đại Học Hàng Hải Việt Nam",
      logo: "/school-logos/maritime.png",
    },
    {
      id: 2,
      name: "Trường Đại Học Công Nghệ - Đại Học Quốc Gia Hà Nội",
      logo: "/school-logos/uet.png",
    },
    {
      id: 3,
      name: "Trường Đại Học Khoa Học Xã Hội và Nhân Văn Hà Nội",
      logo: "/school-logos/ussh.png",
    },
    {
      id: 4,
      name: "Trường Đại Học Khoa Học Tự Nhiên Hà Nội",
      logo: "/school-logos/hus.png",
    },
    {
      id: 5,
      name: "Trường Khoa học liên ngành và Nghệ thuật Hà Nội",
      logo: "/school-logos/isi.png",
    },
    {
      id: 6,
      name: "Trường Quản Trị và Kinh Doanh - ĐHQG Hà Nội",
      logo: "/school-logos/hsb.png",
    },
    {
      id: 7,
      name: "Trường Đại học Y Dược - ĐHQG Hà Nội",
      logo: "/school-logos/hmu.png",
    },
    {
      id: 8,
      name: "Trường Quốc Tế - ĐHQG Hà Nội",
      logo: "/school-logos/is.png",
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
    <div className="home-container">
      <ImageCarousel />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button
                className={`tab-button ${
                  activeTab === "de-an" ? "active" : ""
                }`}
                onClick={() => setActiveTab("de-an")}
              >
                Đề án
              </button>
              <button
                className={`tab-button ${
                  activeTab === "diem-chuan" ? "active" : ""
                }`}
                onClick={() => setActiveTab("diem-chuan")}
              >
                Điểm chuẩn
              </button>
              <button
                className={`tab-button ${
                  activeTab === "khoi-mon" ? "active" : ""
                }`}
                onClick={() => setActiveTab("khoi-mon")}
              >
                Khối - Tổ hợp môn
              </button>
              <button
                className={`tab-button ${
                  activeTab === "nganh" ? "active" : ""
                }`}
                onClick={() => setActiveTab("nganh")}
              >
                Danh sách ngành
              </button>
            </div>

            {/* Search Box */}
            <div className="search-container" ref={dropdownRef}>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Nhập tên trường/mã trường để xem đề án"
                  className="search-input"
                  onFocus={() => setShowDropdown(true)}
                />
                <button className="search-button" aria-label="Search">
                  <SearchIcon className="icon-small" />
                </button>
              </div>

              {/* Dropdown Schools */}
              {showDropdown && (
                <div className="school-dropdown">
                  {schools.map((school) => (
                    <button
                      key={school.id}
                      className="school-item"
                      onClick={() => {
                        setShowDropdown(false);
                      }}
                    >
                      <div className="school-content">
                        <img
                          src={school.logo}
                          alt={school.name}
                          className="school-logo"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://placehold.co/40x40?text=Logo";
                          }}
                        />
                        <div className="school-info">
                          <p className="school-name">{school.name}</p>
                          <p className="school-id">Mã trường: {school.id}</p>
                        </div>
                      </div>
                      <svg
                        className="arrow-icon"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              <div className="search-alt">
                Hoặc{" "}
                <Link to="/search" className="search-link">
                  Tìm theo địa phương hoặc ngành
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            <span className="text-gradient">EDUPATH.COM</span> SẼ GIÚP CÁC EM
          </h2>
          <div className="feature-grid">
            <FeatureCard
              icon="📚"
              title="Tra cứu đề án tuyển sinh"
              description="Của các trường Đại học trên cả nước"
              link="/admission-search"
            />
            <FeatureCard
              icon="🎓"
              title="Các ngành đào tạo"
              description="Xem danh sách ngành nghề đào tạo Đại học 2025"
              link="/majors"
            />
            <FeatureCard
              icon="📋"
              title="Khối - Tổ hợp môn"
              description="Tra cứu ngay các khối thi, tổ hợp thi Đại học chính xác nhất"
              link="/subject-combinations"
            />
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="updates-section">
        <div className="container">
          <h2 className="section-title-medium">
            THÔNG TIN TUYỂN SINH MỚI NHẤT {new Date().getFullYear()}
          </h2>
          <p className="section-description">
            Bộ Giáo dục và Đào tạo mới đây đã công bố danh mục 17 phương thức
            xét tuyển đại học năm {new Date().getFullYear()} như: Xét kết quả
            thi tốt nghiệp THPT, xét kết quả học tập cấp THPT (học bạ), xét kết
            quả thi đánh giá năng lực, xét kết quả thi đánh giá tư duy...
          </p>
          <div className="exam-grid">
            <ExamTypeCard
              title="HSA"
              subtitle="Đánh giá năng lực đại học quốc gia Hà Nội"
              description="Thêm cơ hội trúng tuyển từ phương thức xét điểm thi HSA đánh giá năng lực ĐH Quốc gia Hà Nội của 100 trường Đại học."
              color="exam-red"
              textColor="text-red"
              icon={<HSAIcon />}
            />
            <ExamTypeCard
              title="V-ACT"
              subtitle="Đánh giá năng lực ĐHQG TP HCM"
              description="EduPath tổng hợp đầy đủ các trường xét tuyển bằng điểm Đánh giá năng lực của ĐHQG TP HCM."
              color="exam-green"
              textColor="text-green"
              icon={<VACTIcon />}
            />
            <ExamTypeCard
              title="TSA"
              subtitle="Đánh giá tư duy"
              description="Gần 40 trường đại học sử dụng kết quả thi Đánh giá tư duy để xét tuyển năm 2025."
              color="exam-blue"
              textColor="text-blue"
              icon={<TSAIcon />}
            />
            <ExamTypeCard
              title="HỌC BẠ"
              subtitle="Xét tuyển học bạ"
              description="EduPath tổng hợp đầy đủ danh sách trường xét học bạ năm 2025, giúp học sinh tăng cơ hội Đỗ Đại học sớm nhất."
              color="exam-purple"
              textColor="text-purple"
              icon={<GradeIcon />}
            />
          </div>
        </div>
      </section>

      {/* Recent Admission Announcements Section */}
      <section className="announcements-section">
        <div className="container">
          {/* Main Announcement and Schools */}
          <div className="announcement-box">
            <h2 className="announcement-title">
              Trường đại học mới công bố đề án tuyển sinh{" "}
              {new Date().getFullYear()}
            </h2>
            <p className="announcement-text">
              Các trường Đại học đã bắt đầu công bố thông tin tuyển sinh năm{" "}
              {new Date().getFullYear()}. Theo đó phương thức xét tuyển của các
              trường đa số gồm: xét kết quả thi tốt nghiệp THPT, xét học bạ, xét
              kết quả thi ĐGNL, xét kết quả thi đánh giá tư duy. Chỉ tiêu tuyển
              sinh của ngành, tổ hợp xét tuyển của ngành đó vào các trường cũng
              là thông tin quan trọng giúp các em có những lựa chọn đăng ký xét
              tuyển vào các trường.
            </p>
            <div className="school-grid">
              {schools.map((school) => (
                <Link key={school.id} to="#" className="school-link">
                  <img
                    src={school.logo}
                    alt={school.name}
                    className="school-link-logo"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/48x48?text=Logo";
                    }}
                  />
                  <span className="school-link-name">{school.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Other News */}
          <div className="news-box">
            <h3 className="news-title">Các tin khác</h3>
            <div className="news-list">
              {[
                `Danh sách trường công bố đề án tuyển sinh ${new Date().getFullYear()} - Mới nhất(24/05/${new Date().getFullYear()})`,
                `Thông tin tuyển sinh Đại học Văn hóa Hà Nội năm ${new Date().getFullYear()}(24/05/${new Date().getFullYear()})`,
                `Danh sách các trường mở cổng đăng ký nộp hồ sơ xét tuyển ${new Date().getFullYear()}(24/05/${new Date().getFullYear()})`,
                `Danh sách các trường Đại học xét học bạ ${new Date().getFullYear()} - Mới nhất(24/05/${new Date().getFullYear()})`,
                `Đại học Giao thông vận tải công bố thông tin tuyển sinh ${new Date().getFullYear()}(24/05/${new Date().getFullYear()})`,
              ].map((news, index) => (
                <Link key={index} to="#" className="news-item">
                  <svg
                    className="news-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <span className="news-text">{news}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  link: string;
}

const FeatureCard = ({ icon, title, description, link }: FeatureCardProps) => (
  <Link to={link} className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </Link>
);

interface ExamTypeCardProps {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  textColor: string;
  icon: React.ReactNode;
}

const ExamTypeCard = ({
  title,
  subtitle,
  description,
  color,
  textColor,
  icon,
}: ExamTypeCardProps) => (
  <div className={`exam-card ${color}`}>
    <div className="exam-icon">{icon}</div>
    <h3 className={`exam-title ${textColor}`}>{title}</h3>
    <h4 className="exam-subtitle">{subtitle}</h4>
    <p className="exam-description">{description}</p>
  </div>
);

// Icons components
const SearchIcon = ({ className = "icon" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const HSAIcon = () => (
  <svg className="icon-large text-red" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const VACTIcon = () => (
  <svg
    className="icon-large text-green"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TSAIcon = () => (
  <svg className="icon-large text-blue" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 6v8l4-4-4-4zm-6 4l4 4V6l-4 4z" />
  </svg>
);

const GradeIcon = () => (
  <svg
    className="icon-large text-purple"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);

export default HomePage;
