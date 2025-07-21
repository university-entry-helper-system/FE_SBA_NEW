# Hướng dẫn Deploy Contact Form với EmailJS

## 📧 Thiết lập EmailJS

### 1. Tạo tài khoản EmailJS

1. Truy cập https://www.emailjs.com/
2. Đăng ký tài khoản miễn phí
3. Xác thực email

### 2. Thiết lập Email Service

1. Vào "Email Services" trong dashboard
2. Chọn "Add New Service"
3. Chọn email provider (Gmail, Outlook, v.v.)
4. Làm theo hướng dẫn thiết lập
5. Lưu Service ID (mặc định: `service_xkvi6fi`)

### 3. Tạo Email Template

1. Vào "Email Templates" trong dashboard
2. Chọn "Create New Template"
3. Sử dụng Template ID: `template_wt73syk`
4. Copy và paste nội dung template từ file `EMAIL_TEMPLATE.html`

### 4. Lấy Public Key

1. Vào "Account" trong EmailJS dashboard
2. Tìm và copy Public Key của bạn

### 5. Cấu hình Environment Variables

Cập nhật file `.env` với thông tin thực tế:

```env
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
```

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

**Lưu ý:** Đảm bảo các environment variables được set đúng trong production environment.

## ✅ Testing

1. Chạy website ở local
2. Điền form liên hệ
3. Kiểm tra email đến
4. Verify format email template

## 🔧 Troubleshooting

### Lỗi thường gặp:

- **CORS Error:** Kiểm tra domain whitelist trong EmailJS
- **Template Error:** Đảm bảo field names match với template variables
- **Public Key Error:** Verify public key đã được set đúng

### Variables trong template:

- `{{name}}` - Tên người gửi
- `{{email}}` - Email người gửi
- `{{phone}}` - Số điện thoại
- `{{subject}}` - Chủ đề
- `{{message}}` - Nội dung tin nhắn

## 📊 Giới hạn Free Plan

- 200 emails/tháng
- Branding "Powered by EmailJS"
- Cân nhắc upgrade nếu cần nhiều hơn

## 🔒 Security

- Không commit file `.env` vào git
- Sử dụng environment variables cho production
- Định kỳ rotate keys nếu cần
