import React from "react";

const faqs = [
  {
    question: "Tôi cần chuẩn bị gì khi muốn được tư vấn?",
    answer:
      "Bạn chỉ cần cung cấp thông tin về ngành học, trường quan tâm, điểm số dự kiến hoặc đã có, và các thắc mắc cụ thể.",
  },
  {
    question: "Tư vấn có mất phí không?",
    answer:
      "Dịch vụ tư vấn tuyển sinh của chúng tôi hoàn toàn miễn phí cho học sinh và phụ huynh.",
  },
  {
    question: "Tôi có thể liên hệ tư vấn qua đâu?",
    answer:
      "Bạn có thể gọi hotline, gửi email hoặc chat trực tiếp trên website.",
  },
  {
    question: "Thông tin cá nhân của tôi có được bảo mật không?",
    answer:
      "Chúng tôi cam kết bảo mật tuyệt đối mọi thông tin cá nhân của bạn.",
  },
];

const AdmissionConsulting: React.FC = () => {
  return (
    <div
      style={{ maxWidth: 800, margin: "0 auto", padding: "32px 8px 40px 8px" }}
    >
      <h1
        style={{
          fontSize: "2.2rem",
          fontWeight: 700,
          color: "#222",
          marginBottom: 12,
        }}
      >
        Tư vấn tuyển sinh
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: 24 }}>
        Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn về thông tin tuyển
        sinh, chọn ngành, chọn trường, giải đáp thắc mắc về quy chế, hồ sơ, điểm
        chuẩn và các vấn đề liên quan đến đại học.
      </p>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 32 }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 220,
            background: "#f7f9fa",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(102,126,234,0.08)",
          }}
        >
          <h3 style={{ color: "#667eea", fontWeight: 600, marginBottom: 8 }}>
            Hotline tư vấn
          </h3>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#222" }}>
            1800 6868
          </div>
          <div style={{ color: "#888", fontSize: 13 }}>
            8:00 - 21:00 hàng ngày
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 220,
            background: "#f7f9fa",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(102,126,234,0.08)",
          }}
        >
          <h3 style={{ color: "#667eea", fontWeight: 600, marginBottom: 8 }}>
            Email hỗ trợ
          </h3>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#222" }}>
            tuyensinh@edupath.vn
          </div>
          <div style={{ color: "#888", fontSize: 13 }}>Phản hồi trong 24h</div>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 220,
            background: "#f7f9fa",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(102,126,234,0.08)",
          }}
        >
          <h3 style={{ color: "#667eea", fontWeight: 600, marginBottom: 8 }}>
            Chat trực tuyến
          </h3>
          <div style={{ fontSize: 15, color: "#222" }}>
            Nhấn vào biểu tượng <span style={{ fontSize: 18 }}>💬</span> góc
            phải dưới màn hình để chat với tư vấn viên.
          </div>
        </div>
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 2px 12px rgba(102,126,234,0.08)",
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#222",
            marginBottom: 12,
          }}
        >
          Quy trình tư vấn
        </h2>
        <ol
          style={{
            color: "#444",
            fontSize: "1.05rem",
            paddingLeft: 20,
            marginBottom: 0,
          }}
        >
          <li>
            Liên hệ với chúng tôi qua hotline, email hoặc chat trực tuyến.
          </li>
          <li>
            Trình bày nhu cầu, thắc mắc hoặc thông tin bạn muốn được tư vấn.
          </li>
          <li>
            Nhận phản hồi, giải đáp và tài liệu hướng dẫn từ đội ngũ tư vấn.
          </li>
          <li>Hỗ trợ bổ sung nếu cần cho đến khi bạn hoàn toàn hài lòng.</li>
        </ol>
      </div>
      <div
        style={{
          background: "#f7f9fa",
          borderRadius: 14,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "#222",
            marginBottom: 10,
          }}
        >
          Cam kết bảo mật
        </h2>
        <p style={{ color: "#555", fontSize: "1.02rem" }}>
          Mọi thông tin cá nhân, kết quả tư vấn và dữ liệu bạn cung cấp đều được
          bảo mật tuyệt đối, chỉ phục vụ cho mục đích tư vấn tuyển sinh.
        </p>
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 2px 12px rgba(102,126,234,0.08)",
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "#222",
            marginBottom: 10,
          }}
        >
          Câu hỏi thường gặp
        </h2>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {faqs.map((faq, idx) => (
            <li key={idx} style={{ marginBottom: 14 }}>
              <div
                style={{ fontWeight: 600, color: "#667eea", marginBottom: 2 }}
              >
                {faq.question}
              </div>
              <div style={{ color: "#444" }}>{faq.answer}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdmissionConsulting;
