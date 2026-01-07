# 📦 Fullstack Auction / E-Commerce Project

Dự án web fullstack gồm **Backend (Node.js)**, **Frontend (React)** và **Database (PostgreSQL – Supabase)**.  
Hệ thống hỗ trợ đăng nhập OAuth (Google), đấu giá sản phẩm, email, captcha và quản lý người dùng.

---

## 🧩 Công nghệ sử dụng

### Backend
- Node.js
- Express
- Knex.js
- PostgreSQL
- OAuth2 (Google)
- Nodemailer
- reCAPTCHA

### Frontend
- React
- React Router
- Axios
- TailwindCSS
- React Quill (WYSIWYG Editor)

### Database
- PostgreSQL
- Supabase (khuyến nghị)

---


## 🚀 1. Thiết lập Database (Supabase – PostgreSQL)

### 1.1 Tạo project Supabase
1. Truy cập https://supabase.com
2. Tạo **New Project**
3. Lưu lại thông tin kết nối:
   - Host
   - Port
   - User
   - Password
   - Database

---

### 1.2 Chạy script tạo bảng & dữ liệu

1. Vào **Supabase Dashboard**
2. Mở **SQL Editor**
3. Copy toàn bộ nội dung file:

```
schema.sql sau khi giải nén thư mục schema
```

4. Nhấn **Run**

---

### 1.3 Tài khoản mẫu để test hệ thống

Sau khi chạy thành công script tạo database, hệ thống đã được khởi tạo sẵn **các tài khoản mẫu** nhằm phục vụ cho việc **test chức năng và kiểm tra phân quyền (role)**.

### Tài khoản mẫu để test hệ thống

**Tài khoản 1**
- Email: vvvu23@clc.fitus.edu.vn
- Password: 123456
- Vai trò: ADMIN
- Mô tả: Quản trị hệ thống, toàn quyền quản lý

**Tài khoản 2**
- Email: Vanvu151105@gmail.com
- Password: 123456
- Vai trò: SELLER
- Mô tả: Người bán, đăng và quản lý sản phẩm

**Tài khoản 3**
- Email: luyentuvung@gmail.com
- Password: 123456
- Vai trò: BIDDER
- Mô tả: Người mua, tham gia đấu giá

**Tài khoản 4**
- Email: luyentuvung+1@gmail.com
- Password: 123456
- Vai trò: BIDDER
- Mô tả: Người mua, tham gia đấu giá


📎 **Nguồn dữ liệu:**  
Các tài khoản trên được khởi tạo sẵn trong file database (`schema.sql`) để phục vụ mục đích test và phát triển hệ thống.

---

## ⚙️ 2. Thiết lập Backend

### 2.1 Cài đặt dependencies

```bash
cd Backend
npm install
```

---

### 2.2 Cấu hình biến môi trường (.env)

Truy cập file `Backend/.env` và cập nhật:

```env
SECRET_KEY=YOUR_SECRET_KEY
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
FB_APP_ID=YOUR_FACEBOOK_APP_ID
FB_SECRET=YOUR_FACEBOOK_SECRET
RECAPTCHA_SECRET=YOUR_RECAPTCHA_SECRET
EMAIL_USER=YOUR_EMAIL_ADDRESS
EMAIL_PASS=YOUR_EMAIL_APP_PASSWORD
DB_HOST=YOUR_DB_HOST
DB_PORT=YOUR_DB_PORT
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
```

---


### 2.3 Chạy Backend

```bash
nodemon app.js
```

---

## 🎨 3. Thiết lập Frontend

### 3.1 Cài đặt dependencies

```bash
cd Frontend
npm install
```

---

### 3.2 Cấu hình biến môi trường (.env)

Truy cập file `Frontend/.env` và cập nhật:
```env
VITE_RECAPTCHA_SITE_KEY=YOUR_RECAPTCHA_KEY
```

---

### 3.3 Chạy Frontend

```bash
npm run dev
```

---

### 3.4 Truy cập ứng dụng

Mở trình duyệt và truy cập:
http://localhost:5173/

---

## 📌 License

MIT
