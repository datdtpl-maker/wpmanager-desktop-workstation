# WP Manager Desktop Workstation 🚀

<div align="center">
  <img src="public/img/wordpress_logo.png" alt="WP Manager Logo" width="90" height="90">
  <h3>Modern Desktop Profile & Cookie Workstation for WordPress Webmasters</h3>
  <p>Quản lý đa profile trình duyệt độc lập, tự động mở 3 trang quản trị WordPress và lưu phiên cookies cứng vĩnh viễn trên máy tính cục bộ.</p>
</div>

---

## 🌟 Tính Năng Nổi Bật (Key Features)

- 🔒 **Bảo Mật & Riêng Tư Tuyệt Đối (100% Local & Private):**
  - Mọi dữ liệu profile, phiên đăng nhập, cookie và mật khẩu được lưu trữ hoàn toàn trên ổ cứng máy tính cá nhân của bạn (Local Storage).
  - Không gửi dữ liệu lên bất kỳ máy chủ đám mây (cloud) nào, không lo lộ lọt thông tin quản trị website.
- 🌐 **Nhân Chromium Độc Lập Hoàn Toàn:**
  - Mỗi profile sở hữu một vùng dữ liệu tách biệt (`--user-data-dir`), không bao giờ bị trùng lặp cookie hay xung đột session giữa các tài khoản.
  - Đăng nhập một lần duy nhất, các lần sau mở profile là tự động vào thẳng trang quản trị.
- ⚡ **Tự Do Cấu Hình 3 Đường Dẫn Admin Khác Nhau:**
  - Tự do điền 3 đường link trang quản trị WordPress khác nhau cho từng profile (hỗ trợ cả các đường dẫn đăng nhập ẩn/bảo mật tùy biến).
  - Khi bấm **[▶ Mở Profile]**, Chrome tự động mở đồng thời 3 tab chứa 3 link đã lưu.
- 🎨 **Giao Diện Desktop Chuẩn SaaS Hiện Đại (Meta Ultra Style):**
  - Thanh bên Sidebar phân nhóm rõ ràng, thống kê trực quan với radar trạng thái thời gian thực.
  - Thao tác nhanh: Tìm kiếm tức thì (`Ctrl + K`), đổi tên profile trực tiếp (`Double-click`), mở/dừng hàng loạt profile.
- 🚀 **Nhẹ, Nhanh & Không Cần Cài Đặt Phức Tạp:**
  - Xây dựng trên nền tảng **Python + Edge WebView2**, khởi động tức thì, tiêu tốn rất ít RAM so với Electron.

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
wpmanager-desktop-workstation/
├── main.py                     # Ứng dụng Desktop chính (Python + WebView2 + Local API)
├── installer.py                # Trình đóng gói cài đặt Setup tự động cho Windows
├── make_zip.py                 # Script nén ứng dụng phục vụ build installer
├── build.bat                   # File đóng gói 1-click thành file .exe độc lập
├── requirements.txt            # Thư viện Python cần thiết
├── app.ico                     # Icon chuẩn Windows (16x16 đến 256x256)
├── data/
│   ├── config.example.json     # Cấu hình mẫu đường dẫn Chrome & link mặc định
│   └── profiles.example.json   # Danh sách profile mẫu
├── public/                     # Giao diện Web Desktop hiện đại
│   ├── index.html              # Layout chính phong cách Meta Ultra
│   ├── css/style.css           # Hiệu ứng Glassmorphism & UI Design System
│   ├── js/app.js               # Logic điều khiển, REST API Client & tương tác
│   └── img/                    # Logo & biểu tượng WordPress độ phân giải cao
└── profiles/                   # Thư mục chứa session & cookies (Tự sinh trên máy bạn)
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy (Quick Start)

### Cách 1: Chạy trực tiếp từ mã nguồn (Dành cho nhà phát triển)

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/datdtpl-maker/wpmanager-desktop-workstation.git
   cd wpmanager-desktop-workstation
   ```

2. **Cài đặt thư viện phụ thuộc:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Khởi chạy ứng dụng:**
   ```bash
   python main.py
   ```

Ứng dụng sẽ tự động phát hiện trình duyệt Chrome/Edge trên máy và khởi chạy cửa sổ Desktop cho bạn tạo profile đầu tiên!

---

### Cách 2: Đóng gói thành file `.exe` cài đặt trên máy Windows

Nếu bạn muốn tạo file cài đặt `.exe` độc lập để sử dụng lâu dài hoặc chia sẻ cho đồng nghiệp:

1. Chạy file script:
   ```cmd
   build.bat
   ```
2. Sau khi build xong:
   - File chạy trực tiếp (Portable): `dist\WP-Profile-Manager\WP-Profile-Manager.exe`
   - File cài đặt Setup: `dist\Setup-WP-Profile-Manager.exe`

---

## 🛠️ Hướng Dẫn Sử Dụng (Usage Guide)

1. **Tạo Profile:**
   - Bấm nút **"+ Thêm profile"**.
   - Nhập tên profile (ví dụ: *Admin Khải Hoàn Web*).
   - Tự điền 3 đường link trang quản trị WordPress của bạn vào 3 ô.
   - Bấm **"LƯU PROFILE & 3 LINK ADMIN"**.
2. **Đăng nhập & Lưu Cookies:**
   - Bấm nút **[▶ Mở Profile]**.
   - Cửa sổ trình duyệt riêng biệt sẽ bật lên với sẵn 3 tab tương ứng.
   - Đăng nhập tài khoản vào cả 3 trang. Cookies và phiên làm việc sẽ được lưu vĩnh viễn trên máy tính của bạn.
3. **Đổi tên & Sửa link nhanh:**
   - Nhấp đúp chuột trực tiếp vào tên profile trên danh sách để sửa tên nhanh.
   - Bấm vào icon sửa link để thay đổi đường dẫn bất kỳ lúc nào.

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án phát hành mã nguồn mở theo giấy phép [MIT License](LICENSE). Mọi người có thể tự do clone, sử dụng và tùy biến theo nhu cầu công việc.
