# WP Manager Desktop Workstation 🚀

<div align="center">
  <img src="public/img/wordpress_logo.png" alt="WP Manager Logo" width="90" height="90">
  <h3>Modern Desktop Profile & Cookie Workstation for WordPress Webmasters</h3>
  <p><b>Trạm điều hành quản trị tập trung hàng loạt website WordPress trên máy tính để bàn (Desktop).</b><br>
  Tự do phân nhóm, gom toàn bộ các trang quản trị về chung các profile trình duyệt độc lập và lưu vĩnh viễn cookies phiên làm việc trên máy tính cục bộ.</p>
</div>

---

## 🎯 Mục Đích & Sứ Mệnh (Purpose & Vision)

Khi vận hành nhiều website WordPress (từ 5, 10, 20 cho đến hàng trăm site), các webmaster, agency và SEOer thường xuyên đối mặt với:
- **Tình trạng văng phiên liên tục:** Mỗi ngày phải đăng nhập lại hàng chục lần, nhập mật khẩu và mã 2FA tốn thời gian.
- **Xung đột Cookies & Cache:** Trình duyệt thông thường dễ bị dính chùm tài khoản hoặc đè session giữa các website cùng hệ sinh thái.
- **Quản lý phân tán:** Đường dẫn quản trị và thông tin đăng nhập bị phân mảnh khắp nơi.

**WP Manager Desktop Workstation** ra đời nhằm giải quyết triệt để vấn đề này:
> **Gộp tất cả trang quản trị WordPress về chung một trạm làm việc duy nhất trên Desktop. Mỗi profile sở hữu vùng dữ liệu Chromium riêng biệt, lưu cookies vĩnh viễn trên máy tính cục bộ (Local Storage) — Đăng nhập một lần, sử dụng mãi mãi!**

---

## 🌟 Tính Năng Nổi Bật (Key Features)

- 🔒 **Bảo Mật & Riêng Tư Tuyệt Đối (100% Local & Offline First):**
  - Mọi dữ liệu profile, phiên đăng nhập, cookie và mật khẩu được lưu trữ hoàn toàn trên ổ cứng máy tính cá nhân của bạn.
  - **Tuyệt đối không gửi dữ liệu lên bất kỳ máy chủ đám mây (cloud) nào**, loại bỏ 100% rủi ro rò rỉ thông tin quản trị nhạy cảm.
- 🌐 **Nhân Chromium Độc Lập Hoàn Toàn (Isolated Browser Profiles):**
  - Mỗi profile sở hữu một thư mục dữ liệu riêng biệt (`--user-data-dir`), hoàn toàn cách ly với trình duyệt chính và các profile khác.
  - Không bao giờ bị xung đột cookies, không bao giờ bị dính chùm session giữa các tài khoản WordPress khác nhau.
- ⚡ **Quản Lý Không Giới Hạn Website (Unlimited Websites & Profiles):**
  - Tự do cấu hình số lượng profile theo từng dự án, từng khách hàng hoặc từng cụm website vệ tinh (PBN).
  - Tự do điền và lưu trữ các đường dẫn đăng nhập quản trị riêng biệt cho từng website (hỗ trợ cả các URL admin ẩn bảo mật như `/wp-login.php`, `/admin_custom/`,...).
  - Mở đồng thời tất cả các tab quản trị của profile chỉ bằng 1 cú nhấp chuột.
- 🎨 **Giao Diện Chuẩn SaaS Chuyên Nghiệp (Meta Ultra Style):**
  - Bảng điều khiển tối ưu hiển thị: Phân loại theo nhóm danh mục, bộ lọc thông minh, thống kê trạng thái thời gian thực.
  - Thao tác siêu tốc: Tìm kiếm tức thì (`Ctrl + K`), đổi tên profile trực tiếp (`Double-click` inline edit), mở/dừng hàng loạt profile chỉ trong 1 giây.
- 🚀 **Siêu Nhẹ, Mở Nhanh & Tối Ưu Tài Nguyên:**
  - Xây dựng trên nền tảng **Python + Edge WebView2**, khởi động tức thì, tiêu tốn cực ít RAM và CPU so với các giải pháp cồng kềnh như Electron.

---

## 💼 Trường Hợp Sử Dụng Thực Tế (Use Cases)

1. **Digital Agency & Freelancer phát triển Web:**
   - Quản trị cùng lúc hàng chục website của khách hàng mà không cần phải ghi nhớ hay tìm kiếm mật khẩu mỗi ngày.
2. **Hệ thống Website Vệ tinh & Mạng lưới Blog (PBN / SEO):**
   - Gom các cụm site SEO vệ tinh về từng profile tương ứng, mở nhanh hàng loạt trang quản trị để đăng bài, gắn link và kiểm tra chỉ mục.
3. **Doanh nghiệp sở hữu nhiều thương hiệu (Multi-brand E-commerce):**
   - Phân chia các trang thương mại điện tử theo từng phòng ban, ngành hàng (Mỹ phẩm, Dược phẩm, Thời trang...) với môi trường làm việc tách biệt.

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
wpmanager-desktop-workstation/
├── main.py                     # Ứng dụng Desktop chính (Python + WebView2 + Local API)
├── installer.py                # Trình đóng gói cài đặt Setup tự động cho Windows
├── make_zip.py                 # Script nén ứng dụng phục vụ build installer
├── build.bat                   # File đóng gói 1-click thành file .exe độc lập
├── requirements.txt            # Thư viện Python phụ thuộc
├── app.ico                     # Icon chuẩn Windows (16x16 đến 256x256)
├── data/
│   ├── config.example.json     # Cấu hình mẫu đường dẫn trình duyệt & URL mặc định
│   └── profiles.example.json   # Cấu hình profile mẫu
├── public/                     # Giao diện Web Desktop hiện đại
│   ├── index.html              # Layout chính phong cách Meta Ultra
│   ├── css/style.css           # Hiệu ứng Glassmorphism & UI Design System
│   ├── js/app.js               # Logic điều khiển, REST API Client & tương tác
│   └── img/                    # Logo & biểu tượng WordPress độ phân giải cao
└── profiles/                   # Thư mục chứa session & cookies (Tự sinh trên máy cục bộ)
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### Cách 1: Chạy trực tiếp từ mã nguồn (Dành cho Developer)

1. **Clone repository về máy tính:**
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

Ứng dụng sẽ tự động phát hiện trình duyệt Chromium (Google Chrome, Microsoft Edge, Brave) sẵn có trên máy và mở giao diện trạm làm việc.

---

### Cách 2: Đóng gói thành file `.exe` cài đặt cho Windows

Nếu bạn muốn tạo file cài đặt `.exe` độc lập để sử dụng cá nhân hoặc chia sẻ nội bộ:

1. Chạy file batch đóng gói:
   ```cmd
   build.bat
   ```
2. Sau khi build hoàn tất, các file thực thi sẽ nằm trong thư mục `dist/`:
   - **Bản Portable chạy ngay không cần cài đặt:** `dist\WP-Profile-Manager\WP-Profile-Manager.exe`
   - **Bản Setup cài đặt tự động:** `dist\Setup-WP-Profile-Manager.exe`

---

## 🛠️ Hướng Dẫn Sử Dụng (Usage Guide)

1. **Thêm Profile Mới:**
   - Bấm nút **"+ Thêm profile"**.
   - Đặt tên gợi nhớ cho profile (ví dụ: *Cụm Web Bán Hàng*, *Khách Hàng Công Ty A*, *Blog Tin Tức*...).
   - Nhập các đường link quản trị WordPress của các website cần quản lý vào các ô tương ứng.
   - Bấm **"LƯU PROFILE"**.
2. **Đăng nhập & Lưu Cookies Vĩnh Viễn:**
   - Bấm nút **[▶ Mở Profile]**.
   - Cửa sổ trình duyệt độc lập sẽ xuất hiện với sẵn các tab trang quản trị tương ứng.
   - Đăng nhập tài khoản vào các website. Toàn bộ Cookies, phiên đăng nhập và dữ liệu duyệt web sẽ được lưu vĩnh viễn trên máy tính cục bộ của bạn.
   - Lần sau, bạn chỉ cần mở profile là hệ thống tự động vào thẳng bảng điều khiển quản trị (Dashboard) mà không cần đăng nhập lại.
3. **Thao Tác Nhanh:**
   - **Đổi tên:** Nhấp đúp chuột (`Double-click`) trực tiếp vào tên profile trên danh sách để sửa tên nhanh.
   - **Sửa đường link:** Bấm biểu tượng bánh răng để thay đổi hoặc bổ sung URL admin bất kỳ lúc nào.
   - **Mở hàng loạt:** Sử dụng nút **"▶ Mở tất cả"** hoặc **"⏹ Dừng tất cả"** để điều khiển nhanh toàn bộ các phiên làm việc.

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án được phát hành mã nguồn mở theo giấy phép [MIT License](LICENSE). Bạn hoàn toàn có quyền tự do clone, sử dụng, đóng góp và tùy biến theo nhu cầu công việc của mình.
