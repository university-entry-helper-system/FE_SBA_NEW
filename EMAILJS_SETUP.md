# EmailJS Setup Instructions

## 1. Install EmailJS

```bash
npm install @emailjs/browser
```

## 2. Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email

## 3. Create Email Service

1. Go to "Email Services" in your EmailJS dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note your Service ID: `service_xkvi6fi`

## 4. Create Email Template

1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Use Template ID: `template_wt73syk`
4. Set up your template with this content:

### Subject:

```
Tin nhắn mới từ trang liên hệ SBA - {{subject}}
```

### Body:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background: linear-gradient(135deg, #38d9a9 0%, #60a5fa 100%);
        color: white;
        padding: 20px;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 0 0 10px 10px;
      }
      .field {
        margin-bottom: 15px;
      }
      .label {
        font-weight: bold;
        color: #38d9a9;
      }
      .message-box {
        background: white;
        padding: 15px;
        border-radius: 5px;
        border-left: 4px solid #38d9a9;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        color: #666;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>📧 Tin nhắn mới từ trang liên hệ</h2>
        <p>Bạn có một tin nhắn mới từ website SBA</p>
      </div>

      <div class="content">
        <div class="field">
          <span class="label">👤 Họ và tên:</span><br />
          {{name}}
        </div>

        <div class="field">
          <span class="label">📧 Email:</span><br />
          <a href="mailto:{{email}}">{{email}}</a>
        </div>

        <div class="field">
          <span class="label">📱 Số điện thoại:</span><br />
          {{phone}}
        </div>

        <div class="field">
          <span class="label">📝 Chủ đề:</span><br />
          {{subject}}
        </div>

        <div class="field">
          <span class="label">💬 Tin nhắn:</span>
          <div class="message-box">{{message}}</div>
        </div>
      </div>

      <div class="footer">
        <p>---</p>
        <p>Gửi từ trang liên hệ SBA System 🚀</p>
        <p>Vui lòng phản hồi khách hàng sớm nhất có thể.</p>
      </div>
    </div>
  </body>
</html>
```

## 5. Get Public Key

1. Go to "Account" in your EmailJS dashboard
2. Find your Public Key
3. Replace `"YOUR_PUBLIC_KEY_HERE"` in the Contact.tsx file with your actual public key

## 6. Update Contact.tsx

Replace the placeholder in the Contact component:

```typescript
"YOUR_PUBLIC_KEY_HERE"; // Replace with your actual EmailJS public key
```

## 7. Template Variables

Make sure your EmailJS template uses these variable names:

- `{{name}}` - User's name
- `{{email}}` - User's email
- `{{phone}}` - User's phone number
- `{{subject}}` - Message subject
- `{{message}}` - Message content

## 8. Testing

1. Make sure your form field names match the template variables
2. Test the contact form
3. Check your email for received messages

## Important Notes:

- Keep your EmailJS keys secure
- Don't commit sensitive keys to version control
- Consider using environment variables for production
- EmailJS free plan has limitations (200 emails/month)

## Troubleshooting:

- Verify service ID and template ID are correct
- Check that your email service is properly connected
- Ensure all required form fields have the correct `name` attributes
- Check browser console for any JavaScript errors
