import { useEffect, useState } from "react";
import axios from "axios";
import { Link ,useNavigate } from "react-router-dom";
import { getScholarshipsByUniversity } from "../api/scholarshipService.ts";
import type { ScholarshipResponse } from "../types/scholarshipTypes.ts";
import "../css/scholarship-review.css";



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

interface UniversityWithScholarships extends University {
    scholarships: ScholarshipResponse[];
}

const ScholarshipReview = () => {
    const [universities, setUniversities] = useState<UniversityWithScholarships[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const universitiesPerPage = 12;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUniversitiesAndScholarships = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get("http://localhost:8080/api/v1/universities");
                const universityData = Array.isArray(res.data.result?.items) ? res.data.result.items : [];

                const universitiesWithScholarships = await Promise.all(
                    universityData.map(async (university: University) => {
                        try {
                            const scholarshipRes = await getScholarshipsByUniversity(university.id);
                            return { ...university, scholarships: scholarshipRes.data.result };
                        } catch {
                            return { ...university, scholarships: [] };
                        }
                    })
                );

                setUniversities(universitiesWithScholarships);
            } catch {
                setError("Không thể tải danh sách trường và học bổng.");
            } finally {
                setLoading(false);
            }
        };
        fetchUniversitiesAndScholarships();
    }, []);

    // const getLogoUrl = (logoUrl?: string) => {
    //     if (!logoUrl) return "/default-logo.png";
    //     if (logoUrl.startsWith("http")) {
    //         let url = logoUrl.split("?")[0];
    //         url = url.replace("minio:9000", "localhost:9000");
    //         return url;
    //     }
    //     return `http://localhost:9000/mybucket/${logoUrl}`;
    // };

    const formatValueType = (valueType: string, valueAmount: number) => {
        switch (valueType) {
            case "PERCENTAGE":
                return `${valueAmount}% học phí`;
            case "FIXED_AMOUNT":
                return `${valueAmount.toLocaleString()} VNĐ`;
            case "ACADEMIC_YEAR":
                return `${valueAmount} năm Học bổng toàn khóa`;
            default:
                return valueAmount.toString();
        }
    };

    const formatEligibilityType = (eligibilityType: string, minScore : number ) => {
        switch (eligibilityType) {
            case "GPA":
                return `${minScore}  Điểm trung bình học bạ `;
            case "EXAM_SCORE":
                return `${minScore}  Điểm thi THPT Quốc gia`;
            case "EVALUATION":
                return `${minScore}  Điểm ĐGNL`;
            default:
                return minScore.toString();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    // Pagination logic
    const totalPages = Math.ceil(universities.length / universitiesPerPage);
    const startIndex = (currentPage - 1) * universitiesPerPage;
    const endIndex = startIndex + universitiesPerPage;
    const currentUniversities = universities.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const generatePageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };



    const handleApplyClick = (id : number) => {
        // Điều hướng đến trang user-profile với scholarship.id
        navigate(`/user-profile/${id}`);
    };

    return (
        <div className="university-container">
            <h2 className="university-title">Danh sách các trường đại học và học bổng</h2>



            {/* Info bar */}
            {!loading && !error && universities.length > 0 && (
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "24px",
                        color: "#6b7280",
                        fontSize: "0.95rem",
                    }}
                >
                    Hiển thị {startIndex + 1}-{Math.min(endIndex, universities.length)}{" "}
                    trong tổng số {universities.length} trường
                    {totalPages > 1 && (
                        <span>
              {" "} | Trang {currentPage}/{totalPages}
            </span>
                    )}
                </div>
            )}

            {error && <div className="university-error">{error}</div>}

            {loading ? (
                <div className="university-loading">Đang tải...</div>
            ) : (
                <>
                    <div className="university-list">
                        {currentUniversities.map((u) => (
                            <div key={u.id} className="university-card">
                                <div className="university-card-link">
                                    <Link to={`/universities/${u.id}`}>
                                        {/*<img*/}
                                        {/*    src={getLogoUrl(u.logoUrl)}*/}
                                        {/*    alt={u.name}*/}
                                        {/*    className="university-logo"*/}
                                        {/*    onError={(e) => {*/}
                                        {/*        e.currentTarget.src = "/default-logo.png";*/}
                                        {/*    }}*/}
                                        {/*/>*/}
                                        <div className="university-info">
                                            <h3 className="university-name">{u.name}</h3>
                                            <p className="university-short">{u.shortName}</p>
                                            <p className="university-address">{u.address}</p>
                                            <p className="university-contact">
                                                <span>{u.email}</span> | <span>{u.phone}</span>
                                            </p>
                                        </div>
                                    </Link>
                                    <a
                                        href={u.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="university-website"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Website
                                    </a>
                                </div>
                                {u.scholarships.length > 0 && (
                                    <div className="scholarship-list">
                                        <h4 className="scholarship-title">Học bổng</h4>
                                        <div className="scholarship-items-container">
                                            {u.scholarships.map((scholarship) => (
                                                <div key={scholarship.id} className="scholarship-item">
                                                    <h5 className="scholarship-name">{scholarship.name}</h5>
                                                    <p className="scholarship-details">
                                                        <strong>Giá trị:</strong> {formatValueType(scholarship.valueType, scholarship.valueAmount)}
                                                        <br />
                                                        <strong>Cách thức:</strong> {formatEligibilityType(scholarship.eligibilityType, scholarship.minScore)}
                                                        <br />
                                                        <strong>Hạn nộp:</strong> {formatDate(scholarship.applicationDeadline)}
                                                    </p>
                                                    {scholarship.id && (
                                                        <button
                                                            onClick={() => handleApplyClick(scholarship.id)}
                                                            className="scholarship-apply-btn"
                                                        >
                                                            Đăng ký xét tuyển
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: "40px",
                                gap: "8px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: "8px 12px",
                                    border: "1px solid rgba(56, 217, 169, 0.3)",
                                    borderRadius: "6px",
                                    background:
                                        currentPage === 1 ? "#f3f4f6" : "rgba(56, 217, 169, 0.05)",
                                    color: currentPage === 1 ? "#9ca3af" : "#38d9a9",
                                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                ← Trước
                            </button>

                            {generatePageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        typeof page === "number" && handlePageChange(page)
                                    }
                                    disabled={page === "..."}
                                    style={{
                                        padding: "8px 12px",
                                        border: "1px solid rgba(56, 217, 169, 0.3)",
                                        borderRadius: "6px",
                                        background:
                                            page === currentPage
                                                ? "rgba(56, 217, 169, 0.2)"
                                                : "rgba(56, 217, 169, 0.05)",
                                        color: page === currentPage ? "#38d9a9" : "#374151",
                                        cursor: page === "..." ? "not-allowed" : "pointer",
                                        fontSize: "0.9rem",
                                        fontWeight: "500",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: "8px 12px",
                                    border: "1px solid rgba(56, 217, 169, 0.3)",
                                    borderRadius: "6px",
                                    background:
                                        currentPage === totalPages
                                            ? "#f3f4f6"
                                            : "rgba(56, 217, 169, 0.05)",
                                    color: currentPage === totalPages ? "#9ca3af" : "#38d9a9",
                                    cursor:
                                        currentPage === totalPages ? "not-allowed" : "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Sau →
                            </button>
                        </div>
                    )}

                    {!loading && !error && universities.length === 0 && (
                        <div className="university-empty">
                            <div className="university-empty-icon">🏫</div>
                            <div className="university-empty-text">
                                Không tìm thấy trường hoặc học bổng nào
                            </div>
                            <div className="university-empty-subtext">
                                Vui lòng thử lại sau
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ScholarshipReview;