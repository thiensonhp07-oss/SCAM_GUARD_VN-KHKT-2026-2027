# 🛡️ ScamGuard VN — Hệ Sinh Thái Giám Định Pháp Y AI & Huấn Luyện Phản Xạ Phòng Chống Lừa Đảo Số
**(Dự án Nghiên cứu Khoa học Kỹ thuật Cấp Quốc gia — ViSEF 2026–2027)**

> **Lĩnh vực dự thi:** Phần mềm Hệ thống (System Software — SOFT) & Khoa học Hành vi và Xã hội (Behavioral and Social Sciences — BEHA)  
> **Mã hồ sơ đạo đức nghiên cứu (IRB):** `#2026-HCMC-0092`  
> **Kiến trúc cốt lõi:** Dual-Engine Hybrid AI Forensics (Gemini Multimodal + Deterministic Heuristic Engine) · Bản đồ Gen Hành vi 10 trục (10D Scam DNA) · Chỉ số Năng lực Phòng thủ An ninh mạng (SDI)  
> **URL Triển khai Cloud Run 24/7:** `https://ais-pre-bzym5so7ap7nfxnbdhfluc-74730577245.asia-southeast1.run.app`

---

## 📌 1. Đặt Vấn Đề & Mục Tiêu Nghiên Cứu (Problem Statement & Vision)

Trong bối cảnh tội phạm mạng tại Việt Nam chuyển dịch mạnh sang các hình thức tấn công đa phương thức sử dụng Trí tuệ Nhân tạo (**Deepfake Video/Voice Call**, **Mã độc .APK giả mạo VNeID/Thuế điện tử chiếm quyền Trợ năng Accessibility**, **Biên lai chuyển khoản giả mạo chỉnh sửa quang học**, và **Quishing dán đè mã VietQR**), các giải pháp chặn lọc danh sách đen tĩnh truyền thống bộc lộ độ trễ lớn trước các tên miền và tài khoản trung gian (Mule Accounts) chỉ tồn tại trong vài giờ.

**ScamGuard VN** được nghiên cứu và phát triển nhằm giải quyết đồng thời **2 bài toán cốt lõi**:
1. **Giám định Pháp y Kỹ thuật số Tức thời (Real-Time Multimodal Digital Forensics):** Phát hiện, bóc tách và giải thích trực quan các dấu hiệu giả mạo kỹ thuật lẫn thao túng tâm lý trong tin nhắn, URL, biên lai ngân hàng (ELA Heatmap), mã VietQR (chuẩn EMVCo TLV), tệp `.APK` và âm thanh cuộc gọi.
2. **Huấn luyện Phản xạ Nhận thức & Khắc sâu Trí nhớ Vĩnh cửu (Cognitive Cyber-Immunization):** Đo lường định lượng lỗ hổng hành vi qua **Bản đồ 10 trục Scam DNA**, cá nhân hóa lộ trình học tập zích-zắc **12 Phân khu (Snake Path)** kết hợp phương pháp **Mã hóa kép (Dual-Coding)**, **Ôn tập ngắt quãng Leitner**, và **Kỹ thuật Feynman**.

---

## 🏗️ 2. Kiến Trúc Hệ Thống & Các Phân Hệ Chức Năng (Core Architecture)

### 🔬 A. Trung Tâm Giám Định Pháp Y Số Đa Phương Thức (`/check`)
Được thiết kế với cơ chế **Dual-Engine (Kết hợp Mô hình Ngôn ngữ/Thị giác Đa phương thức Gemini AI + Bộ máy Luật Heuristic Xác định tại Client)** đảm bảo thời gian phản hồi tức thì và hoạt động liên tục 100% ngay cả khi mất kết nối:
- **1. Giám định Tin nhắn, Liên kết & Ảnh chụp màn hình (`smart_link`):**
  - Phân tích ngữ nghĩa tiếng Việt, nhận diện 5 đòn thao túng tâm lý (*Authority, Urgency, Fear/Panic, Greed, Isolation*).
  - Hỗ trợ dán ảnh trực tiếp từ bộ nhớ tạm (`Ctrl + V`) để trích xuất văn bản và đánh giá rủi ro đa chiều theo 5 nhóm tuổi (*Trẻ em, Học sinh/Teen, Người trưởng thành, Người cao tuổi, Chuyên gia*).
- **2. Giám định Quang học Biên lai Ngân hàng & Công văn Giả mạo (`fake_bill`):**
  - Thuật toán **ELA (Error Level Analysis)** tính toán trực tiếp độ lệch mức nén điểm ảnh JPEG trên trình duyệt để phát hiện vùng chữ số tiền hoặc con dấu đỏ bị chèn ghép đồ họa.
  - Đối chiếu quy trình tố tụng hình sự để vạch trần các "Lệnh bắt tạm giam / Quyết định phong tỏa tài sản" giả mạo gửi qua Zalo.
- **3. Bộ 6 Công cụ Pháp y Kỹ thuật số Chuyên sâu (`threat_intel`):**
  - **Thẩm định Tên miền & DNS/TLS (Port 443):** Kiểm tra tuổi tên miền, chứng chỉ SSL/TLS, phát hiện Typosquatting và tự động gợi ý cổng thông tin chính thống (`.gov.vn`, hotline ngân hàng).
  - **Phòng thí nghiệm Mã QR & EMVCo VietQR (`qr_sandbox`):** Bóc tách cấu trúc TLV Napas247 (Mã BIN ngân hàng, Số tài khoản thụ hưởng, Số tiền khóa cứng, Nội dung chuyển khoản) và cô lập đường dẫn Quishing trong Sandbox.
  - **Giám định Âm học Cuộc gọi & Giọng nói Deepfake AI (`deepfake`):** Hỗ trợ ghi âm trực tiếp qua Microphone hoặc tải file âm thanh, lượng hóa 5 chiều thao túng tâm lý và cung cấp **Câu nói Phản đòn Trực tiếp (Counter-Script)** kèm tổng hợp giọng nói tiếng Việt (TTS).
  - **Phân tích Mã độc Tệp đính kèm `.APK` (`apk_malware`):** Tính toán mã băm `SHA-256` trực tiếp trên trình duyệt (Web Crypto API), quét chuỗi nhị phân tìm quyền nguy hiểm (`BIND_ACCESSIBILITY_SERVICE`, `READ_SMS`, `SYSTEM_ALERT_WINDOW`) và hướng dẫn quy trình cứu hộ 3 bước.
  - **Tra cứu Đa tầng OSINT (`osint`) & Cảnh báo Cộng đồng (`community`).**
- **4. Cổng Tra cứu Danh sách đen Quốc gia & Tự động Soạn Đơn Trình báo PA05 (`blacklist`):**
  - Tra cứu nhanh các đầu số VoIP giả danh Công an/Viện kiểm sát (`02473022626`), tài khoản ngân hàng trung gian nhận tiền lừa đảo (Mule Accounts), và tự động khởi tạo **Đơn trình báo tội phạm công nghệ cao (Mẫu chuẩn PA05/C05 trích dẫn Điều 174 & Điều 290 BLHS)** kèm hướng dẫn phong tỏa trong "24 Giờ Vàng".
- **5. Trình Khử Nhận Dạng Dữ Liệu Cá Nhân Thông Minh (`pii_redact`):**
  - Tuân thủ **Nghị định 13/2023/NĐ-CP**: Tự động bóc tách và che đen (Blackout) số CCCD 12 số, Số điện thoại, Số tài khoản, Mã OTP trong văn bản và hỗ trợ **vẽ vùng che trực tiếp trên Canvas ảnh chụp màn hình** trước khi người dùng chia sẻ bằng chứng lên mạng xã hội.

---

### 🧬 B. Bản Đồ Gen Hành Vi 10 Trục Scam DNA & Chỉ Số Phòng Vệ SDI (`/scamdna`)
Thay vì đánh giá chung chung, ScamGuard VN định lượng mức độ tổn thương của từng người dùng trên **Vector 10 chiều** chia làm 3 trụ cột:
1. **Trụ cột Tâm lý (Psychological Vulnerability — 40%):**
   - `Authority` (Phục tùng uy quyền giả mạo Công an/VKS)
   - `Urgency` (Hoảng loạn trước áp lực thời gian cấp bách)
   - `Greed` (Dễ bị thu hút bởi lợi nhuận ảo / việc nhẹ lương cao)
   - `Emotion` (Dao động cảm xúc / bẫy tình cảm & cấp cứu người thân)
2. **Trụ cột Kỹ thuật (Technical Susceptibility — 35%):**
   - `UrlIdentify` (Kỹ năng phân biệt tên miền giả mạo / Typosquatting)
   - `ApkInstall` (Nguy cơ cài đặt ứng dụng `.APK` ngoài luồng / cấp quyền Trợ năng)
   - `QrScan` (Thói quen quét mã QR không kiểm tra cấu trúc đích đến)
3. **Trụ cột Xác minh & Phản xạ (Verification Reflex — 25%):**
   - `OtpProtect` (Kỷ luật bảo vệ mã Smart OTP & Sinh trắc học)
   - `CrossCheck` (Phản xạ xác minh độc lập qua kênh thứ hai / Quy tắc 5 phút)
   - `IncidentResp` (Kỹ năng xử lý khủng hoảng & khóa tài khoản trong giờ vàng)

> **Bắt buộc Khảo sát Đầu vào (Mandatory Baseline Gate):** Mọi tài khoản mới đăng ký đều phải hoàn thành bài khảo sát định lượng đầu vào để hệ thống tính toán vector Scam DNA khởi điểm và mở khóa lộ trình huấn luyện cá nhân hóa.

---

### 🗺️ C. Lộ Trình Huấn Luyện 12 Phân Khu (Snake Path) & Thao Trường Mô Phỏng (`/roadmap` & `/train`)
- **Lộ trình 12 Phân khu Chuyên đề:** Bao phủ toàn diện từ *Bẫy quà tặng 0 đồng, Trạm BTS giả mạo SMS Brandname, Lừa đảo COD & Cộng tác viên, Pig Butchering, Sàn tài chính ảo, Giả danh Tư pháp/VNeID, Quishing QR, Cấp cứu Giờ vàng, Deepfake Video Call, Ví Web3 Drainer, WiFi Evil Twin* đến *Bẫy thu hồi vốn kép*.
- **Hệ thống Khắc sâu Trí nhớ 4 Tầng:**
  1. **Khẩu quyết Vần điệu 3 Giây (Rhyme Mnemonics):** Giúp người cao tuổi và học sinh nhớ ngay quy tắc sống còn.
  2. **Bàn Giải phẫu X-Ray (Interactive Scam Anatomy):** Bóc tách từng chi tiết giả mạo trên giao diện trực quan.
  3. **Hộp Thẻ lật Ngắt quãng Leitner (Spaced Repetition Flashcards).**
  4. **Thử thách Feynman:** Đóng vai giảng giải lại kiến thức cho người thân trong gia đình.
- **Thao trường Đối kháng AI (`/train`):** Thực hành hội thoại trực tiếp với kẻ lừa đảo mô phỏng, phòng lab bóc tách mã QR, phòng lab nhận diện Deepfake và luyện phản xạ tốc độ 60 giây.

---

### 📊 D. Trung Tâm Dữ Liệu Thực Nghiệm & Kiểm Định Thống Kê ViSEF (`/research`)
Phục vụ hội đồng giám khảo và nghiên cứu khoa học với dữ liệu thực tế đồng bộ thời gian thực trên **Cloud Firestore**:
- Tính toán tự động các chỉ số thống kê suy luận: **Kiểm định Paired Sample t-test**, **Kích thước hiệu ứng Cohen's d**, **Phân tích phương sai ANOVA**, **Độ tin cậy thang đo Cronbach's Alpha**, và **Ước lượng cỡ mẫu G*Power**.
- Phòng Lab tự thu thập mẫu (Live Corpus) và đối sánh hiệu năng các kiến trúc mô hình học máy (*Accuracy, Precision, Recall, F1-Score, ROC-AUC, Latency*).

---

## 🎨 3. Triết Lý Thiết Kế Giao Diện (Anti-Glare Daylight Security UI/UX)

Giao diện ScamGuard VN được tinh chỉnh theo chuẩn **Anti-Glare Daylight Security Palette** nhằm tối ưu hóa khả năng đọc hiểu cho cả học sinh lẫn người lớn tuổi, loại bỏ hoàn toàn hiện tượng chói mắt của nền trắng tinh hoặc sự nặng nề của nền đen thuần:
- **Nền Canvas Dịu Mắt (Anti-Glare Cool Alabaster):** `#EAF0F8` kết hợp lưới vi điểm an ninh tinh tế.
- **Bề mặt Thẻ (Pearlescent Security Cards):** Gradient trắng ngọc trai sang xanh băng nhạt (`#FFFFFF` → `#F4F8FD`).
- **Viền Khung Bảo Mật (Crisp Sky-Blue Borders):** `#C0DAF2` (`border-sky-200/90`) với điểm nhấn viền đỉnh xanh lam an ninh (`#0284C7`).
- **Độ tương phản văn bản chuẩn WCAG AAA:** Chữ tiêu đề `#0F172A` (Slate 900) và chữ nội dung `#334155` / `#475569` giúp biểu đồ Radar, đồ thị xu hướng và văn bản pháp lý luôn sắc nét tuyệt đối.
- **Hỗ trợ Song ngữ Tức thì (VI / EN):** Chuyển đổi ngôn ngữ Tiếng Việt / Tiếng Anh ngay trên thanh điều hướng chính.

---

## 🛠️ 4. Công Nghệ Sử Dụng (Tech Stack)

| Tầng Kiến Trúc | Công Nghệ & Thư Viện |
| :--- | :--- |
| **Frontend SPA** | React 19, TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), Motion (`motion/react`), Lucide Icons |
| **Backend & API** | Node.js, Express (`server.ts`), `tsx` runtime, RESTful Forensics & Research Endpoints (`/api/*`) |
| **AI & Forensics** | Google Gemini API (`@google/genai`), Client-Side Heuristic Forensics Engine, HTML5 Canvas Pixel ELA, Web Crypto SHA-256 |
| **Cloud & Auth** | Firebase Authentication (Email/Password & Google Sign-In) + Cloud Firestore (`firebase/auth`, `firebase/firestore`) |

---

## 🚀 5. Hướng Dẫn Cài Đặt & Chạy Dự Án (Installation & Local Development)

### Yêu cầu môi trường
- **Node.js** `>= 18.x` (khuyến nghị `v20+`)
- **npm** `>= 9.x`

### Bước 1: Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### Bước 2: Cấu hình Biến môi trường (`.env`)
Sao chép tệp `.env.example` thành `.env` và điền khóa API Gemini (nếu chạy tính năng AI phía máy chủ):
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```
*(Lưu ý: Cấu hình kết nối Cloud Firestore & Firebase Authentication đã được tích hợp sẵn trong `firebase-applet-config.json`. Ngay cả khi chưa cấu hình `GEMINI_API_KEY`, bộ máy Deterministic Client Forensics Engine của ScamGuard VN vẫn đảm bảo 100% tính năng giám định hoạt động bình thường).*

### Bước 3: Khởi chạy Máy chủ Phát triển (Full-Stack Dev Server)
```bash
npm run dev
```
Ứng dụng sẽ khởi chạy tại địa chỉ: `http://localhost:3000`

### Bước 4: Kiểm tra Kiểu dữ liệu (Typecheck) & Đóng gói Production
```bash
# Kiểm tra lỗi TypeScript toàn dự án
npm run lint

# Đóng gói bản dựng Production
npm run build

# Khởi chạy máy chủ Production
npm start
```

---

## 📂 6. Cấu Trúc Thư Mục Dự Án (Project Directory Structure)

```text
├── firebase-applet-config.json       # Cấu hình kết nối Firebase Auth & Cloud Firestore
├── firestore.rules                   # Quy tắc bảo mật cơ sở dữ liệu Cloud Firestore
├── server.ts                         # Máy chủ Express + API Giám định Pháp y AI & Thống kê ViSEF
├── index.html                        # Entry HTML với cấu hình SEO & OpenGraph
├── src/
│   ├── App.tsx                       # Bộ điều phối trung tâm, AuthGate, Lộ trình & Modals
│   ├── index.css                     # Hệ thống Token màu Anti-Glare Daylight Security (#EAF0F8)
│   ├── types.ts                      # Định nghĩa kiểu dữ liệu TypeScript toàn cục
│   ├── components/
│   │   ├── AuthGate.tsx              # Cổng Đăng nhập / Đăng ký đồng bộ hiệu ứng 2 cánh
│   │   ├── ExecutiveDashboardView.tsx# Bảng điều khiển Trung tâm Chỉ huy & Sơ khám Pháp y Tức thì
│   │   ├── CheckScamView.tsx         # Trung tâm Giám định AI, ELA Biên lai, DNS/QR/APK/PA05/PII
│   │   ├── DomainReputationTab.tsx   # 6 công cụ Pháp y Kỹ thuật số (DNS/TLS, VietQR, Deepfake, APK...)
│   │   ├── BlacklistSearchTab.tsx    # Tra cứu SĐT/STK lừa đảo & Tự động lập Đơn trình báo PA05
│   │   ├── PiiRedactTab.tsx          # Khử nhận dạng dữ liệu cá nhân (NĐ 13/2023) trên Văn bản & Ảnh
│   │   ├── ScamDnaView.tsx           # Bản đồ Gen 10 trục Scam DNA & Khảo sát bắt buộc đầu vào
│   │   ├── RoadmapSnakePath.tsx      # Lộ trình huấn luyện 12 phân khu (Snake Path) & Thi sát hạch
│   │   ├── TrainHubView.tsx          # Thao trường hội thoại AI, Quishing Lab, Deepfake Lab
│   │   ├── ResearchCenterView.tsx    # Báo cáo thống kê thực nghiệm ViSEF (t-test, Cohen's d, ANOVA)
│   │   └── EmergencyModal.tsx        # Quy trình Khẩn cấp 24/7 & Danh bạ Hotline Khóa thẻ Ngân hàng
│   ├── data/                         # Ngân hàng kịch bản, 12 phân khu, câu hỏi thích ứng & học liệu
│   ├── services/                     # Dịch vụ đồng bộ Firebase Firestore & tính toán thống kê ViSEF
│   └── utils/                        # Bộ máy Pháp y Client-side, Âm thanh phản hồi & Quản lý giao diện
└── README.md                         # Tài liệu hướng dẫn toàn diện dự án
```

---

## ☎️ 7. Danh Bạ Khẩn Cấp "24 Giờ Vàng" Tích Hợp Trong Hệ Thống

Khi phát hiện dấu hiệu vừa chuyển tiền cho đối tượng lừa đảo hoặc lỡ cài đặt tệp `.APK` độc hại, người dùng có thể kích hoạt nút **SOS Khẩn Cấp** trên thanh điều hướng để thực hiện quy trình phong tỏa tài sản ngay lập tức:
- **Cảnh sát Phản ứng nhanh:** `113`
- **Tổng đài Quốc gia Phản ánh Tin nhắn rác & Cuộc gọi Lừa đảo:** `156` (Miễn phí)
- **Cục An toàn thông tin (NCSC):** `https://canhbao.khonggianmang.vn`
- **Hotline Khóa thẻ Ngân hàng 24/7:**
  - **Vietcombank (VCB):** `1900 545413`
  - **Techcombank (TCB):** `1800 588822`
  - **BIDV:** `1900 9247`
  - **VietinBank (CTG):** `1900 558868`
  - **MB Bank:** `1900 545426`
  - **Agribank:** `1900 558818`
  - **ACB:** `1900 545486`
  - **VPBank:** `1900 545415`

---

© 2026–2027 **ScamGuard VN Research Team** — Dự án Khoa học Kỹ thuật Cấp Quốc gia (ViSEF). Phát triển vì một Không gian mạng Việt Nam An toàn, Nhân văn và Chủ động.
