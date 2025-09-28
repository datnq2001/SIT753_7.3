# Jenkins Email Troubleshooting Guide

## 🚨 Vấn đề hiện tại
Pipeline chạy thành công nhưng gặp lỗi khi gửi email:
```
Connection error sending email, retrying once more in 10 seconds...
Failed after second try sending email
```

## 🔧 Giải pháp từng bước

### 1. Kiểm tra Jenkins System Configuration

**Truy cập Jenkins > Manage Jenkins > Configure System**

#### a) Jenkins Location
- **Jenkins URL**: Thay đổi từ `http://localhost:8080/` thành:
  ```
  http://your-machine-name.local:8080/
  ```
  hoặc sử dụng IP thực:
  ```
  http://192.168.1.x:8080/
  ```

- **System Admin e-mail address**: Đảm bảo là `datnq2001@gmail.com`

#### b) E-mail Notification (Extended E-mail Notification)
Cấu hình như sau:

```
SMTP server: smtp.gmail.com
Default user e-mail suffix: @gmail.com
Use SMTP Authentication: ✓ Checked
User Name: datnq2001@gmail.com
Password: [Your Gmail App Password]
Use SSL: ❌ Unchecked  
Use TLS: ✓ Checked
SMTP Port: 587
Reply-To Address: datnq2001@gmail.com
Charset: UTF-8
```

### 2. Tạo Gmail App Password

1. Đăng nhập Gmail → Google Account Settings
2. Security → 2-Step Verification (phải bật trước)
3. App passwords → Generate app password cho "Mail"
4. Copy password này vào Jenkins SMTP settings

### 3. Test Email Configuration

**Trong Jenkins System Configuration:**
- Scroll xuống "E-mail Notification" section
- Click "Test configuration by sending test e-mail"
- Nhập email: `datnq2001@gmail.com`
- Click "Test configuration"

### 4. Cải tiến Jenkinsfile (Đã thực hiện)

✅ Đã thêm try-catch cho email notifications
✅ Đã thêm replyTo và recipientProviders
✅ Đã cải thiện error handling

### 5. Kiểm tra Network & Firewall

```bash
# Test SMTP connection từ Jenkins server
telnet smtp.gmail.com 587

# Kiểm tra DNS resolution
nslookup smtp.gmail.com
```

### 6. Alternative: Sử dụng đường dẫn Jenkins khác

Nếu vẫn không được, thử thay đổi Jenkins URL:

```
# Thay vì localhost, sử dụng:
http://127.0.0.1:8080/
# hoặc
http://[your-computer-name]:8080/
```

## 🧪 Test Commands

Để test email sau khi cấu hình:

```bash
# Trigger pipeline để test email
git add .
git commit -m "🧪 Test email configuration"  
git push origin main
```

## 🚨 Troubleshooting thêm

### Nếu vẫn lỗi connection:

1. **Kiểm tra Gmail settings:**
   - Less secure app access (nếu không dùng App Password)
   - 2-factor authentication enabled

2. **Kiểm tra Jenkins logs:**
   ```bash
   tail -f /Users/datnq2001/.jenkins/logs/jenkins.log
   ```

3. **Thử SMTP settings khác:**
   ```
   SMTP server: smtp.gmail.com
   Port: 465 (SSL) thay vì 587 (TLS)
   Use SSL: ✓ Checked
   Use TLS: ❌ Unchecked
   ```

## 📧 Email Template đã cải thiện

Pipeline hiện tại sử dụng HTML email với:
- ✅ Proper mimeType: 'text/html'
- ✅ From field: 'datnq2001@gmail.com' 
- ✅ ReplyTo field
- ✅ RecipientProviders
- ✅ Error handling với try-catch

## 🎯 Next Steps

1. Cập nhật Jenkins URL (không dùng localhost)
2. Tạo Gmail App Password mới
3. Test email configuration trong Jenkins
4. Trigger pipeline để verify email hoạt động