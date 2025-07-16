import React, { useEffect, useState } from "react";
import "../css/Question.css";
import { getActiveFaqs } from "../api/faq";
import type { FaqItem } from "../api/faq";

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

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // Chia thành 2 cột
  const col1 = faqs.filter((_, i) => i % 2 === 0);
  const col2 = faqs.filter((_, i) => i % 2 === 1);

  return (
    <div className="question-page">
      <h2 className="question-title">Các câu hỏi thường gặp</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div className="question-list-2col">
          <div className="question-col">
            {col1.map((q, idx) => {
              const realIdx = idx * 2;
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
                    style={openIdx === realIdx ? {} : { pointerEvents: "none" }}
                  >
                    {q.answer}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="question-col">
            {col2.map((q, idx) => {
              const realIdx = idx * 2 + 1;
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
                    style={openIdx === realIdx ? {} : { pointerEvents: "none" }}
                  >
                    {q.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;
