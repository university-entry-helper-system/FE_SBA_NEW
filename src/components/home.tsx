import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ImageCarousel } from "./ImageCarousel";

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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <ImageCarousel />

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-white to-primary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 p-1 bg-white rounded-lg shadow-sm">
              <button
                className={`btn flex-1 rounded-md transition-colors border-primary-700 border-2 ${
                  activeTab === "de-an"
                    ? "bg-primary-700 text-white"
                    : "bg-white text-primary-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("de-an")}
              >
                Đề án
              </button>
              <button
                className={`btn flex-1 rounded-md transition-colors border-primary-700 border-2 ${
                  activeTab === "diem-chuan"
                    ? "bg-primary-700 text-white"
                    : "bg-white text-primary-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("diem-chuan")}
              >
                Điểm chuẩn
              </button>
              <button
                className={`btn flex-1 rounded-md transition-colors border-primary-700 border-2 ${
                  activeTab === "khoi-mon"
                    ? "bg-primary-700 text-white"
                    : "bg-white text-primary-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("khoi-mon")}
              >
                Khối - Tổ hợp môn
              </button>
              <button
                className={`btn flex-1 rounded-md transition-colors border-primary-700 border-2 ${
                  activeTab === "nganh"
                    ? "bg-primary-700 text-white"
                    : "bg-white text-primary-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("nganh")}
              >
                Danh sách ngành
              </button>
            </div>

            {/* Search Box */}
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên trường/mã trường để xem đề án"
                  className="input w-full pr-12"
                  onFocus={() => setShowDropdown(true)}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                  aria-label="Search"
                >
                  <SearchIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Dropdown Schools */}
              {showDropdown && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                  {schools.map((school) => (
                    <button
                      key={school.id}
                      className="flex items-center w-full px-4 py-3 hover:bg-primary-50 text-left transition-colors duration-200 group"
                      onClick={() => {
                        setShowDropdown(false);
                      }}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <img
                          src={school.logo}
                          alt={school.name}
                          className="w-10 h-10 object-contain rounded-full bg-white border border-gray-200 p-1 group-hover:border-primary-200 transition-colors"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://placehold.co/40x40?text=Logo";
                          }}
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                            {school.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate group-hover:text-primary-500">
                            Mã trường: {school.id}
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"
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

              <div className="mt-3 text-center text-gray-600">
                Hoặc{" "}
                <Link
                  to="/search"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Tìm theo địa phương hoặc ngành
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient">EDUPATH.COM</span> SẼ GIÚP CÁC EM
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            THÔNG TIN TUYỂN SINH MỚI NHẤT {new Date().getFullYear()}
          </h2>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Bộ Giáo dục và Đào tạo mới đây đã công bố danh mục 17 phương thức
            xét tuyển đại học năm {new Date().getFullYear()} như: Xét kết quả
            thi tốt nghiệp THPT, xét kết quả học tập cấp THPT (học bạ), xét kết
            quả thi đánh giá năng lực, xét kết quả thi đánh giá tư duy...
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ExamTypeCard
              title="HSA"
              subtitle="Đánh giá năng lực đại học quốc gia Hà Nội"
              description="Thêm cơ hội trúng tuyển từ phương thức xét điểm thi HSA đánh giá năng lực ĐH Quốc gia Hà Nội của 100 trường Đại học."
              color="bg-red-50"
              textColor="text-red-500"
              icon={<HSAIcon />}
            />
            <ExamTypeCard
              title="V-ACT"
              subtitle="Đánh giá năng lực ĐHQG TP HCM"
              description="EduPath tổng hợp đầy đủ các trường xét tuyển bằng điểm Đánh giá năng lực của ĐHQG TP HCM."
              color="bg-green-50"
              textColor="text-green-500"
              icon={<VACTIcon />}
            />
            <ExamTypeCard
              title="TSA"
              subtitle="Đánh giá tư duy"
              description="Gần 40 trường đại học sử dụng kết quả thi Đánh giá tư duy để xét tuyển năm 2025."
              color="bg-blue-50"
              textColor="text-blue-500"
              icon={<TSAIcon />}
            />
            <ExamTypeCard
              title="HỌC BẠ"
              subtitle="Xét tuyển học bạ"
              description="EduPath tổng hợp đầy đủ danh sách trường xét học bạ năm 2025, giúp học sinh tăng cơ hội Đỗ Đại học sớm nhất."
              color="bg-purple-50"
              textColor="text-purple-500"
              icon={<GradeIcon />}
            />
          </div>
        </div>
      </section>

      {/* Recent Admission Announcements Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Main Announcement and Schools */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Trường đại học mới công bố đề án tuyển sinh{" "}
              {new Date().getFullYear()}
            </h2>
            <p className="text-gray-600 mb-6">
              Các trường Đại học đã bắt đầu công bố thông tin tuyển sinh năm{" "}
              {new Date().getFullYear()}. Theo đó phương thức xét tuyển của các
              trường đa số gồm: xét kết quả thi tốt nghiệp THPT, xét học bạ, xét
              kết quả thi ĐGNL, xét kết quả thi đánh giá tư duy. Chỉ tiêu tuyển
              sinh của ngành, tổ hợp xét tuyển của ngành đó vào các trường cũng
              là thông tin quan trọng giúp các em có những lựa chọn đăng ký xét
              tuyển vào các trường.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schools.map((school) => (
                <Link
                  key={school.id}
                  to="#"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={school.logo}
                    alt={school.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/48x48?text=Logo";
                    }}
                  />
                  <span className="ml-4 text-gray-800 font-medium">
                    {school.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Other News */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4">Các tin khác</h3>
            <div className="space-y-4">
              {[
                `Danh sách trường công bố đề án tuyển sinh ${new Date().getFullYear()} - Mới nhất(24/05/${new Date().getFullYear()})`,
                `Thông tin tuyển sinh Đại học Văn hóa Hà Nội năm ${new Date().getFullYear()}(24/05/${new Date().getFullYear()})`,
                `Danh sách các trường mở cổng đăng ký nộp hồ sơ xét tuyển ${new Date().getFullYear()}(24/05/${new Date().getFullYear()})`,
                `Danh sách các trường Đại học xét học bạ ${new Date().getFullYear()} - Mới nhất(24/05/${new Date().getFullYear()})`,
                `Đại học Giao thông vận tải công bố thông tin tuyển sinh ${new Date().getFullYear()}(24/05/${new Date().getFullYear()})`,
              ].map((news, index) => (
                <Link
                  key={index}
                  to="#"
                  className="flex items-center group hover:bg-gray-50 p-2 rounded-md transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform"
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
                  <span className="ml-2 text-gray-700 group-hover:text-primary-600">
                    {news}
                  </span>
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
  <Link
    to={link}
    className="card p-6 group hover:border-primary-500 hover:border-2 transition-all duration-300"
  >
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600">
      {title}
    </h3>
    <p className="text-gray-600">{description}</p>
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
  <div
    className={`card p-6 ${color} group hover:scale-[1.02] transition-transform duration-300`}
  >
    <div className="mb-4">{icon}</div>
    <h3 className={`text-xl font-bold mb-2 ${textColor}`}>{title}</h3>
    <h4 className="font-semibold mb-2 text-gray-800">{subtitle}</h4>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// Icons components
const SearchIcon = ({ className = "w-6 h-6" }) => (
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
  <svg
    className="w-12 h-12 text-red-500"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const VACTIcon = () => (
  <svg
    className="w-12 h-12 text-green-500"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TSAIcon = () => (
  <svg
    className="w-12 h-12 text-blue-500"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13 6v8l4-4-4-4zm-6 4l4 4V6l-4 4z" />
  </svg>
);

const GradeIcon = () => (
  <svg
    className="w-12 h-12 text-purple-500"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);
export default HomePage;
