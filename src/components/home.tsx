import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../css/Home.css";
import { ImageCarousel } from "./ImageCarousel";
import { getAdmissionMethods } from "../api/admissionMethod";
import AdmissionMethodsCarousel from "./AdmissionMethodsCarousel"; // Import the new component
import { getAllUniversities, searchUniversities } from "../api/university";
import { getMajors } from "../api/major";
import { getSubjectCombinations } from "../api/subjectCombination";
import type { University } from "../types/university";
import type { Major } from "../types/major";
import type { SubjectCombination } from "../types/subjectCombination";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("de-an");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [admissionMethods, setAdmissionMethods] = useState<any[]>([]);
  const [loadingAdmission, setLoadingAdmission] = useState(false);
  const [errorAdmission, setErrorAdmission] = useState("");

  // API data states
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjectCombinations, setSubjectCombinations] = useState<SubjectCombination[]>([]);
  const [loadingSearchData, setLoadingSearchData] = useState(false);
  const [errorSearchData, setErrorSearchData] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLoadingAdmission(true);
    setErrorAdmission("");
    getAdmissionMethods({ page: 0, size: 8 })
      .then((res) => {
        setAdmissionMethods(res.data.result.items || []);
      })
      .catch(() => setErrorAdmission("Không thể tải phương thức tuyển sinh"))
      .finally(() => setLoadingAdmission(false));
  }, []);

  // Fetch search data (universities, majors, combinations)
  useEffect(() => {
    setLoadingSearchData(true);
    setErrorSearchData("");
    Promise.all([
      searchUniversities({ page: 0, size: 50 }),
      getMajors({ page: 0, size: 50, sort: "name,asc" }),
      getSubjectCombinations({ page: 0, size: 50, sort: "name,asc" })
    ])
      .then(([uniRes, majorRes, comboRes]) => {
        setUniversities(uniRes.data.result.items || []);
        setMajors(majorRes.data.result.items || []);
        setSubjectCombinations(comboRes.data.result.items || []);
      })
      .catch((error) => {
        console.error("API ERROR:", error);
        setErrorSearchData("Không thể tải dữ liệu tìm kiếm");
      })
      .finally(() => setLoadingSearchData(false));
  }, []);

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

  // Filtered suggestions based on tab and input
  let suggestions: any[] = [];
  if (activeTab === "de-an" || activeTab === "diem-chuan") {
    if (searchInput.trim()) {
      suggestions = universities.filter((school) =>
        school.name.toLowerCase().includes(searchInput.toLowerCase())
      ).slice(0, 4);
    } else if (showDropdown) {
      suggestions = universities.slice(0, 4);
    }
  } else if (activeTab === "khoi-mon") {
    if (searchInput.trim()) {
      suggestions = subjectCombinations.filter((combo) =>
        combo.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        (Array.isArray(combo.examSubjects) && combo.examSubjects.some(subj =>
          subj.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          subj.shortName.toLowerCase().includes(searchInput.toLowerCase())
        ))
      ).slice(0, 4);
    } else if (showDropdown) {
      suggestions = subjectCombinations.slice(0, 4);
    }
  } else if (activeTab === "nganh") {
    if (searchInput.trim()) {
      suggestions = majors.filter((major) =>
        major.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        major.code.toLowerCase().includes(searchInput.toLowerCase())
      ).slice(0, 4);
    } else if (showDropdown) {
      suggestions = majors.slice(0, 4);
    }
  }


  // Placeholder for navigation on suggestion click
  const handleSuggestionClick = (item: any) => {
    setShowDropdown(false);
    setSearchInput("");
    if (activeTab === "de-an") {
      navigate(`/university-admission-methods/${item.id}`);
    } else if (activeTab === "diem-chuan") {
      navigate(`/university-scores/${item.id}`);
    } else if (activeTab === "khoi-mon") {
      navigate(`/subject-combination-universities/${item.id}`);
    } else if (activeTab === "nganh") {
      navigate(`/major-universities/${item.id}`);
    } else {
      // TODO: Implement navigation for other tabs if needed
    }
  };



  return (
    <div className="homepage-modern">
      <ImageCarousel />

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="name-hero-title">EDUPATH</span> - Sổ tay tuyển sinh
            đại học
          </h1>
          <p className="hero-desc">
            Tra cứu thông tin các trường đại học, ngành học, phương thức tuyển
            sinh và tin tức mới nhất!
          </p>
          <div className="hero-search" ref={dropdownRef}>
            <input
              type="text"
              className="search-input"
              placeholder={
                activeTab === "de-an" || activeTab === "diem-chuan"
                  ? "Tìm trường, ngành, mã trường..."
                  : activeTab === "khoi-mon"
                  ? "Tìm tổ hợp môn..."
                  : "Tìm ngành, mã ngành..."
              }
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                setShowDropdown(true);
              }}
              autoComplete="off"
            />
            <button className="search-btn">
              <SearchIcon />
            </button>
            {showDropdown && (
              <div className="search-dropdown">
                {loadingSearchData ? (
                  <div className="search-dropdown-item">Đang tải...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="search-dropdown-item"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {activeTab === "de-an" || activeTab === "diem-chuan" ? (
                        <>
                          <img
                            src={item.logoUrl || "https://placehold.co/40x40?text=Logo"}
                            alt={item.name}
                            className="search-dropdown-logo"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://placehold.co/40x40?text=Logo";
                            }}
                          />
                          <span className="search-dropdown-name">{item.name}</span>
                        </>
                      ) : activeTab === "khoi-mon" ? (
                        <>
                          <span className="search-dropdown-name">{item.name}</span>
                          <span className="search-dropdown-desc">
                            {Array.isArray(item.examSubjects)
                              ? item.examSubjects.map((subj: any) => subj.shortName || subj.name).join(', ')
                              : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="search-dropdown-name">{item.name}</span>
                          <span className="search-dropdown-desc">{item.code}</span>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="search-dropdown-item">Không có dữ liệu</div>
                )}
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

      {/* Replace the old admission methods section with the new carousel component */}
      <AdmissionMethodsCarousel 
        admissionMethods={admissionMethods}
        loading={loadingAdmission}
        error={errorAdmission}
      />

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