import React, { useEffect, useState } from "react";
import "../css/Question.css";
import { getActiveFaqs } from "../api/faq";
import type { FaqItem } from "../api/faq";

// Mapping enum type sang tên nhóm tiếng Việt
const FAQ_TYPE_LABELS: Record<string, string> = {
  TONG_QUAN_TUYEN_SINH: "Tổng quan về tuyển sinh",
  XEM_DIEM_CHUAN: "Xem điểm chuẩn",
  TRA_CUU_TRUONG_HOC: "Tra cứu trường học",
  TRA_CUU_NGANH_HOC: "Tra cứu ngành học",
  HOI_DAP_HO_SO_QUY_TRINH: "Hỏi đáp về hồ sơ & quy trình",
  TIN_TUC_TUYEN_SINH: "Tin tức tuyển sinh",
  HOC_PHI_HOC_BONG: "Học phí & học bổng",
  HO_TRO_TU_VAN_CA_NHAN: "Hỗ trợ tư vấn cá nhân",
  THONG_TIN_BO_SUNG: "Thông tin bổ sung",
  VAN_DE_KY_THUAT_TAI_KHOAN: "Vấn đề kỹ thuật & tài khoản",
};
const Question: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getActiveFaqs()
      .then((data) => {
        setFaqs(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải dữ liệu câu hỏi thường gặp.");
        setLoading(false);
      });
  }, []);

  const [openIdx, setOpenIdx] = useState<string | null>(null);

  // Group by faqType
  const grouped = faqs.reduce<Record<string, FaqItem[]>>((acc, faq) => {
    const type = faq.faqType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(faq);
    return acc;
  }, {});

  return (
    <div className="question-page">
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div className="faq-group-list">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="faq-group">
              <h3 className="faq-group-title">
                {FAQ_TYPE_LABELS[type] || type}
              </h3>
              <div className="question-list">
                {items.map((q, idx) => {
                  const realIdx = `${type}-${idx}`;
                  return (
                    <div key={q.id} className="question-item">
                      <div
                        className={
                          "question-q" +
                          (openIdx === realIdx ? " question-q-active" : "")
                        }
                        onClick={() =>
                          setOpenIdx(openIdx === realIdx ? null : realIdx)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {q.question}
                      </div>
                      <div
                        className="question-a"
                        aria-hidden={openIdx !== realIdx}
                        style={
                          openIdx === realIdx ? {} : { pointerEvents: "none" }
                        }
                      >
                        {q.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Question;
