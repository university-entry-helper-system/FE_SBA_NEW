import React from "react";
import "../css/Question.css";

const questions = [
  {
    question: "Làm thế nào để đăng ký tài khoản?",
    answer:
      "Bạn nhấn vào nút Đăng ký trên thanh điều hướng và điền đầy đủ thông tin theo yêu cầu.",
  },
  {
    question: "Tôi quên mật khẩu, phải làm sao?",
    answer:
      "Bạn chọn chức năng Quên mật khẩu ở trang đăng nhập để nhận hướng dẫn lấy lại mật khẩu qua email.",
  },
  {
    question: "Làm sao để xem thông tin các trường đại học?",
    answer:
      "Bạn vào mục Các trường trên thanh điều hướng để xem danh sách và chi tiết từng trường.",
  },
  {
    question: "Tôi có thể liên hệ tư vấn tuyển sinh ở đâu?",
    answer:
      "Bạn vào mục Tư vấn tuyển sinh hoặc Liên hệ để gửi câu hỏi cho đội ngũ tư vấn viên.",
  },
];

const Question: React.FC = () => {
  return (
    <div className="question-page">
      <h2 className="question-title">Các câu hỏi thường gặp</h2>
      <div className="question-list">
        {questions.map((q, idx) => (
          <div key={idx} className="question-item">
            <div className="question-q">{q.question}</div>
            <div className="question-a">{q.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Question;
