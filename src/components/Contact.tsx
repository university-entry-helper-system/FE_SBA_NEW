import { useState } from "react";
import "../css/Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      {/* Header Section */}
      <div className="contact-header">
        <div className="header-content">
          <h1 className="page-title">Liên Hệ Với Chúng Tôi</h1>
          <p className="page-description">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn trong việc tìm hiểu thông tin
            tuyển sinh
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="contact-content">
        <div className="contact-grid">
          {/* Contact Information */}
          <div className="contact-info">
            <h2 className="section-title">Thông Tin Liên Hệ</h2>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="info-content">
                  <h3>Địa Chỉ</h3>
                  <p>
                    123 Đường ABC, Quận 1<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="info-content">
                  <h3>Điện Thoại</h3>
                  <p>
                    +84 123 456 789
                    <br />
                    +84 987 654 321
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="info-content">
                  <h3>Email</h3>
                  <p>
                    info@sba.edu.vn
                    <br />
                    support@sba.edu.vn
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                </div>
                <div className="info-content">
                  <h3>Giờ Làm Việc</h3>
                  <p>
                    Thứ 2 - Thứ 6: 8:00 - 17:00
                    <br />
                    Thứ 7: 8:00 - 12:00
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="social-section">
              <h3>Theo Dõi Chúng Tôi</h3>
              <div className="social-links">
                <a href="#" className="social-link facebook">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="social-link zalo">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169-.224-.442-.277-.676-.277-.079 0-.16.007-.239.023-.026-.006-.057-.008-.087-.008-.214 0-.423.057-.599.165l-.04.027-.04-.03c-.415-.289-.907-.445-1.419-.445-.22 0-.442.026-.659.077-1.792.421-3.097 2.002-3.097 3.824 0 .213.017.424.05.632-.764-.16-1.497-.488-2.138-.956-.764-.559-1.35-1.267-1.738-2.102-.047-.101-.096-.201-.147-.3a.424.424 0 0 0-.769.069c-.134.29-.134.619 0 .909.407.878 1.028 1.638 1.8 2.202.866.633 1.88.978 2.938.978.127 0 .254-.005.381-.014.893-.063 1.739-.394 2.448-.956.765-.606 1.314-1.41 1.585-2.329.12-.408.12-.84 0-1.248-.095-.322-.29-.609-.568-.799z" />
                  </svg>
                </a>
                <a href="#" className="social-link youtube">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <h2 className="section-title">Gửi Tin Nhắn</h2>

            {submitStatus === "success" && (
              <div className="alert alert-success">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất
                có thể.
              </div>
            )}

            {submitStatus === "error" && (
              <div className="alert alert-error">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Họ và Tên *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số Điện Thoại</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123 456 789"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Chủ Đề *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="admission">Tư vấn tuyển sinh</option>
                    <option value="university">Thông tin trường đại học</option>
                    <option value="major">Thông tin ngành học</option>
                    <option value="score">Điểm chuẩn</option>
                    <option value="support">Hỗ trợ kỹ thuật</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Tin Nhắn *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-small"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    Gửi Tin Nhắn
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22,2 15,22 11,13 2,9 22,2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="section-title">Câu Hỏi Thường Gặp</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Làm sao để tìm kiếm thông tin trường đại học?</h3>
              <p>
                Bạn có thể sử dụng chức năng tìm kiếm trên trang chủ hoặc truy
                cập trang "Trường đại học" để xem danh sách đầy đủ các trường.
              </p>
            </div>
            <div className="faq-item">
              <h3>Thông tin điểm chuẩn có chính xác không?</h3>
              <p>
                Chúng tôi cập nhật thông tin điểm chuẩn từ các nguồn chính thức
                và có uy tín, đảm bảo tính chính xác cao nhất.
              </p>
            </div>
            <div className="faq-item">
              <h3>Tôi có thể nhận tư vấn trực tiếp không?</h3>
              <p>
                Có, bạn có thể liên hệ qua hotline hoặc gửi tin nhắn qua form
                liên hệ để được tư vấn trực tiếp từ đội ngũ chuyên gia.
              </p>
            </div>
            <div className="faq-item">
              <h3>Website có hỗ trợ trên mobile không?</h3>
              <p>
                Website được thiết kế responsive, hoạt động tốt trên mọi thiết
                bị từ máy tính, tablet đến điện thoại di động.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
