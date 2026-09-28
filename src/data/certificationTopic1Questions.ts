export interface CertificationOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface CertificationQuestion {
  id: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  scenario: string;
  options: CertificationOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  threatType: string;
  targetDomain: string;
}

// 20 CÂU HỎI SÁT HẠCH CHỨNG CHỈ NĂNG LỰC PHÒNG THỦ SỐ - CHỦ ĐỀ 1 (VISEF 2026)
// TIÊU CHUẨN: > 50% (TỐI THIỂU 11/20 CÂU ĐÚNG) LÀ VƯỢT QUA
// ĐẶC BIỆT: Các câu hỏi khó tuyệt đối không chứa dấu hiệu đoán mò qua từ "Không", "Chỉ", "Luôn luôn".
export const CERTIFICATION_TOPIC_1_QUESTIONS: CertificationQuestion[] = [
  // --- NHÓM 1: DỄ (6 CÂU) - Nhận thức nền tảng & cờ đỏ cơ bản ---
  {
    id: 1,
    difficulty: 'EASY',
    topic: 'Cảnh giác cuộc gọi đe dọa tố tụng',
    scenario: 'Bạn nhận được cuộc gọi từ số lạ tự xưng cán bộ điều tra hình sự, thông báo tài khoản của bạn liên quan đến đường dây rửa tiền xuyên quốc gia và yêu cầu cung cấp mã xác thực OTP gửi về máy để kiểm tra tính trong sạch.',
    options: [
      { id: 'A', text: 'Lập tức đọc mã OTP nếu người gọi đã đọc chính xác số CCCD và họ tên của bạn.' },
      { id: 'B', text: 'Chủ động ngắt máy và đến trực tiếp Công an xã/phường nơi cư trú để xác minh theo quy trình pháp luật.' },
      { id: 'C', text: 'Ghi lại số tài khoản ngân hàng của cơ quan điều tra do người gọi cung cấp rồi chuyển tiền tạm giữ.' },
      { id: 'D', text: 'Chuyển hướng cuộc gọi sang máy người thân để họ giải quyết thay bạn.' },
    ],
    correctAnswer: 'B',
    explanation: 'Cơ quan Công an, Viện kiểm sát nhân dân chỉ làm việc trực tiếp tại trụ sở hoặc gửi giấy mời/giấy triệu tập hợp pháp, tuyệt đối không làm việc qua điện thoại và không bao giờ yêu cầu người dân đọc mã OTP hay chuyển tiền.',
    threatType: 'Impersonating Law Enforcement',
    targetDomain: 'Tâm lý học hành vi / Quyền lực pháp lý',
  },
  {
    id: 2,
    difficulty: 'EASY',
    topic: 'Nhận diện tin nhắn SMS thông báo điểm thưởng',
    scenario: 'Điện thoại nhận tin nhắn hiển thị tên ngân hàng với nội dung: "Tài khoản của quý khách nhận được 1.500.000 điểm thưởng tri ân. Bấm vào vietcom-quatang.top để quy đổi tiền mặt trong 12 giờ".',
    options: [
      { id: 'A', text: 'Mở ứng dụng ngân hàng chính thức trên điện thoại để đối chiếu mục Ưu đãi / Đổi thưởng.' },
      { id: 'B', text: 'Bấm ngay vào liên kết để kiểm tra xem quà tặng có còn hạn sử dụng hay đã hết lượt.' },
      { id: 'C', text: 'Điền tên đăng nhập và mật khẩu ngân hàng vào trang web được dẫn tới để nhận tiền vào ví.' },
      { id: 'D', text: 'Chụp ảnh màn hình gửi lên các hội nhóm mạng xã hội nhờ người khác bấm thử hộ.' },
    ],
    correctAnswer: 'A',
    explanation: 'Tên miền .top là tên miền giá rẻ thường bị tin tặc lạm dụng. Cổng thông tin đổi thưởng chính thức của ngân hàng luôn tích hợp sẵn trong ứng dụng Mobile Banking cài từ kho ứng dụng chính thức.',
    threatType: 'Phishing SMS Brandname Fake',
    targetDomain: 'Phishing & Tên miền độc hại',
  },
  {
    id: 3,
    difficulty: 'EASY',
    topic: 'Ứng phó bẫy việc làm online cộng tác viên',
    scenario: 'Một tài khoản lạ nhắn tin mời bạn làm việc bán thời gian tại nhà với nhiệm vụ "thả tim video mạng xã hội và đánh giá sản phẩm", cam kết nhận hoa hồng 300.000đ/ngày, yêu cầu nạp trước 200.000đ tiền ký quỹ.',
    options: [
      { id: 'A', text: 'Thực hiện nạp tiền vì số vốn 200.000đ nhỏ và có thể thu hồi hoa hồng ngay trong ngày.' },
      { id: 'B', text: 'Chặn cuộc trò chuyện và báo cáo tài khoản lừa đảo tới nền tảng mạng xã hội.' },
      { id: 'C', text: 'Rủ thêm bạn bè cùng nạp tiền để được nâng cấp lên mức hoa hồng đại lý cấp 1.' },
      { id: 'D', text: 'Gửi ảnh chụp mặt trước và mặt sau thẻ ngân hàng cho người tuyển dụng để làm hồ sơ.' },
    ],
    correctAnswer: 'B',
    explanation: 'Chiêu trò cộng tác viên online mồi chài hoa hồng nhỏ ở nhiệm vụ đầu rồi yêu cầu nạp số tiền lớn dần (tiền ký quỹ, phí mở khóa hạn mức) là mô hình lừa đảo nhiệm vụ phổ biến nhất.',
    threatType: 'Task Scam / Fake Employment',
    targetDomain: 'Bẫy thao túng lòng tham & Nhiệm vụ',
  },
  {
    id: 4,
    difficulty: 'EASY',
    topic: 'Quét mã QR thanh toán tại quầy hàng',
    scenario: 'Khi thanh toán tiền tại quán nước vỉa hè, bạn thấy tờ giấy in mã QR dán trên bàn có vết bong tróc và một góc tem dán đè lên phần mã gốc.',
    options: [
      { id: 'A', text: 'Tiến hành quét mã và chuyển khoản ngay để kịp giờ đi học.' },
      { id: 'B', text: 'Đề nghị chủ quán đưa mã QR gốc hoặc trực tiếp đọc số tài khoản để kiểm tra trùng khớp.' },
      { id: 'C', text: 'Quét mã rồi bấm đồng ý với mọi liên kết trang web lạ nhảy ra trên màn hình.' },
      { id: 'D', text: 'Tải hình ảnh mã đó về máy rồi dùng công cụ giải mã trực tuyến trên Google.' },
    ],
    correctAnswer: 'B',
    explanation: 'Thủ đoạn dán đè mã QR (Quishing / QR Swap) tại các điểm thanh toán công cộng là hình thức chuyển hướng dòng tiền của khách hàng vào tài khoản của kẻ gian.',
    threatType: 'Quishing / Physical QR Tampering',
    targetDomain: 'An toàn thanh toán QR Code',
  },
  {
    id: 5,
    difficulty: 'EASY',
    topic: 'Lời nhờ chuyển tiền từ người quen qua mạng xã hội',
    scenario: 'Tài khoản Facebook của người bạn thân gửi tin nhắn: "Tớ đang có việc gấp cần mượn 3 triệu đóng tiền viện phí, chuyển ngay vào số tài khoản lạ này giúp tớ với".',
    options: [
      { id: 'A', text: 'Chuyển khoản ngay vì bạn bè thân thiết trong lúc hoạn nạn cần giúp đỡ kịp thời.' },
      { id: 'B', text: 'Bấm vào liên kết bình chọn cuộc thi ảnh do người đó vừa chia sẻ trên trang cá nhân.' },
      { id: 'C', text: 'Gọi điện thoại thoại trực tiếp bằng số viễn thông thông thường để xác nhận tình hình.' },
      { id: 'D', text: 'Nhắn tin hỏi số thẻ tín dụng của người bạn đó để chuyển qua hình thức quốc tế.' },
    ],
    correctAnswer: 'C',
    explanation: 'Khi tài khoản mạng xã hội bị hack hoặc chiếm quyền điều khiển, kẻ gian sẽ khai thác mối quan hệ tin cậy để mượn tiền chuyển về tài khoản rác (tài khoản mua bán). Gọi trực tiếp qua số viễn thông là phương án xác thực an toàn nhất.',
    threatType: 'Social Engineering / Account Takeover',
    targetDomain: 'Khai thác lòng tin người thân',
  },
  {
    id: 6,
    difficulty: 'EASY',
    topic: 'Cài đặt ứng dụng từ tập tin gửi qua tin nhắn',
    scenario: 'Bạn nhận được tin nhắn Zalo từ một người lạ gửi kèm tệp tin "Bo_de_thi_tot_nghiep_2026.apk" và hướng dẫn bạn mở tệp tin để cài đặt vào máy điện thoại Android.',
    options: [
      { id: 'A', text: 'Mở tệp và chọn Cho phép cài đặt ứng dụng từ nguồn không xác định để xem tài liệu.' },
      { id: 'B', text: 'Xóa tệp tin và chỉ tải ứng dụng từ cửa hàng chính thức Google Play / App Store.' },
      { id: 'C', text: 'Cắm cáp chuyển tệp tin này sang máy tính của trường để giải nén.' },
      { id: 'D', text: 'Gửi tệp tin vào nhóm học tập của lớp để các bạn cùng mở thử.' },
    ],
    correctAnswer: 'B',
    explanation: 'Tệp tin có đuôi .apk cài ngoài cửa hàng ứng dụng thường chứa mã độc gián điệp (Trojan/Spyware), có khả năng đánh cắp thông tin đăng nhập và tự động đọc mã OTP gửi về máy.',
    threatType: 'Malicious APK / Sideloading Trojan',
    targetDomain: 'An toàn thiết bị di động & Quyền ứng dụng',
  },

  // --- NHÓM 2: TRUNG BÌNH (8 CÂU) - Kịch bản tinh vi, bẫy đa bước ---
  {
    id: 7,
    difficulty: 'MEDIUM',
    topic: 'SMS Brandname giả mạo cùng luồng ngân hàng',
    scenario: 'Một tin nhắn xuất hiện trong chính luồng tin nhắn SMS mà ngân hàng bạn vẫn thường gửi thông báo biến động số dư hàng ngày, có nội dung: "Phát hiện đăng nhập lạ tại nước ngoài, truy cập m-bank-security.vn để xác thực".',
    options: [
      { id: 'A', text: 'Tin nhắn nằm trong luồng chính thức chứng minh hệ thống ngân hàng đã chủ động gửi cảnh báo.' },
      { id: 'B', text: 'Kẻ xấu đã sử dụng trạm phát sóng di động giả (Fake BTS) để chèn tin nhắn mạo danh thương hiệu.' },
      { id: 'C', text: 'Điện thoại của bạn đã bị lỗi phần cứng hiển thị nên gom chung các tin nhắn khác nhau.' },
      { id: 'D', text: 'Tổng đài viễn thông đang chạy thử nghiệm hệ thống cảnh báo mới cho toàn bộ thuê bao.' },
    ],
    correctAnswer: 'B',
    explanation: 'Kẻ lừa đảo sử dụng thiết bị phát sóng BTS giả mạo để chèn tin nhắn SMS Brandname vào luồng tin nhắn thật mà không cần thông qua mạng viễn thông. Luôn mở app ngân hàng chính thức thay vì bấm link trong SMS.',
    threatType: 'Fake BTS / SMS Spoofing Attack',
    targetDomain: 'Hạ tầng viễn thông & Trạm sóng giả',
  },
  {
    id: 8,
    difficulty: 'MEDIUM',
    topic: 'Nâng cấp SIM 4G lên 5G từ xa',
    scenario: 'Đối tượng xưng là nhân viên chăm sóc khách hàng của nhà mạng gọi đến hướng dẫn bạn nhắn tin theo cú pháp "DS gửi 901" để nhận gói cước 5G miễn phí trong 1 năm.',
    options: [
      { id: 'A', text: 'Thực hiện soạn tin nhắn theo hướng dẫn để được trải nghiệm mạng tốc độ cao miễn phí.' },
      { id: 'B', text: 'Đây là cú pháp yêu cầu đổi phôi SIM/eSIM nhằm chiếm đoạt quyền kiểm soát số điện thoại của bạn.' },
      { id: 'C', text: 'Soạn tin nhắn đổi SIM và gửi thêm số CMND/CCCD để nhân viên hỗ trợ kích hoạt nhanh.' },
      { id: 'D', text: 'Chuyển tiền phí kích hoạt 50.000đ vào số tài khoản cá nhân của nhân viên gọi đến.' },
    ],
    correctAnswer: 'B',
    explanation: 'Cú pháp gửi tổng đài đổi SIM từ xa là chiêu trò "SIM Swap" (cướp SIM). Khi kẻ gian chiếm được quyền sở hữu SIM, chúng sẽ nhận toàn bộ mã OTP ngân hàng, mạng xã hội để chiếm đoạt tài khoản.',
    threatType: 'SIM Swap / Carrier Identity Theft',
    targetDomain: 'Bảo mật viễn thông & Danh tính SIM',
  },
  {
    id: 9,
    difficulty: 'MEDIUM',
    topic: 'Xử lý tình huống chuyển nhầm tiền vào tài khoản',
    scenario: 'Tài khoản ngân hàng của bạn bỗng dưng nhận được 10 triệu đồng kèm nội dung chuyển tiền lạ. Sau 15 phút, một người gọi điện xưng là chủ số tiền, yêu cầu bạn chuyển trả ngay vào tài khoản mới do tài khoản cũ đang bị khóa.',
    options: [
      { id: 'A', text: 'Lập tức chuyển trả số tiền vào tài khoản mới do người gọi cung cấp để tránh rắc rối.' },
      { id: 'B', text: 'Chủ động liên hệ chi nhánh ngân hàng quản lý tài khoản để yêu cầu phối hợp hoàn tiền theo đúng biên bản.' },
      { id: 'C', text: 'Rút toàn bộ số tiền 10 triệu đồng ra chi tiêu cá nhân vì đó là sai sót của người chuyển.' },
      { id: 'D', text: 'Chuyển số tiền sang một ví điện tử trung gian để bảo quản tạm thời trong 3 tháng.' },
    ],
    correctAnswer: 'B',
    explanation: 'Đây là kịch bản "chuyển nhầm tiền" để ép người nhận vào bẫy vay nặng lãi hoặc rửa tiền. Người nhận cần làm việc trực tiếp với ngân hàng để tra soát dòng tiền, tuyệt đối không tự ý chuyển sang tài khoản thứ ba.',
    threatType: 'Accidental Transfer Extortion / Loan Shark Trap',
    targetDomain: 'Giao dịch ngân hàng & Pháp lý tiền tệ',
  },
  {
    id: 10,
    difficulty: 'MEDIUM',
    topic: 'Giao nhận bưu kiện COD 0 đồng kèm quà tặng',
    scenario: 'Nhân viên giao hàng gọi bạn nhận gói bưu kiện với giá trị tiền hàng 0đ nhưng yêu cầu trả 35.000đ phí vận chuyển. Khi bóc gói hàng, bên trong là thiệp tri ân khách hàng chứa mã QR hướng dẫn "quét mã cào trúng thưởng 50 triệu đồng".',
    options: [
      { id: 'A', text: 'Dùng camera quét mã QR trên thiệp và tham gia nhóm chat nhận thưởng theo hướng dẫn.' },
      { id: 'B', text: 'Xác minh kỹ đơn hàng trên ứng dụng thương mại điện tử cá nhân trước khi quyết định nhận gói hàng lạ.' },
      { id: 'C', text: 'Điền thông tin thẻ ngân hàng vào trang web hiển thị sau khi quét mã để nhận tiền thưởng.' },
      { id: 'D', text: 'Gửi mã trúng thưởng cho bạn bè để cùng nhau chia sẻ giải thưởng.' },
    ],
    correctAnswer: 'B',
    explanation: 'Chiêu thức "rải bưu phẩm tri ân COD giá rẻ" nhắm vào việc dẫn dụ nạn nhân quét mã QR để truy cập các hội nhóm Telegram lừa đảo đầu tư hoặc tải phần mềm độc hại.',
    threatType: 'Brushing / Malicious Physical Mailer Trap',
    targetDomain: 'Thương mại điện tử & Chuỗi bưu phẩm',
  },
  {
    id: 11,
    difficulty: 'MEDIUM',
    topic: 'Vay tiền online qua app yêu cầu cấp quyền hệ thống',
    scenario: 'Một ứng dụng vay vốn tài chính cam kết duyệt hồ sơ trong 5 phút với lãi suất 0%, nhưng trong quá trình cài đặt yêu cầu bạn cấp quyền truy cập toàn bộ Danh bạ, Tin nhắn SMS, Định vị vị trí và Thư viện ảnh.',
    options: [
      { id: 'A', text: 'Cấp đủ các quyền vì đây là điều kiện thông thường để các công ty tài chính chấm điểm tín dụng.' },
      { id: 'B', text: 'Đây là ứng dụng tín dụng đen thu thập dữ liệu cá nhân để đe dọa, khủng bố người thân khi đòi nợ.' },
      { id: 'C', text: 'Tải thêm ứng dụng hỗ trợ khác do bên cho vay đề xuất để giảm bớt số quyền cần cấp.' },
      { id: 'D', text: 'Chụp ảnh căn cước công dân và cung cấp thêm mật khẩu hòm thư điện tử cá nhân để được giải ngân.' },
    ],
    correctAnswer: 'B',
    explanation: 'Các app cho vay bất hợp pháp lợi dụng quyền Danh bạ, SMS và Ảnh để sao lưu toàn bộ thông tin nhạy cảm của nạn nhân, sau đó cắt ghép hình ảnh bôi nhọ để tống tiền khủng bố.',
    threatType: 'Predatory Lending App / Data Blackmail',
    targetDomain: 'Quyền riêng tư dữ liệu & Tín dụng đen',
  },
  {
    id: 12,
    difficulty: 'MEDIUM',
    topic: 'Giao dịch trung gian mua bán tài khoản game trực tuyến',
    scenario: 'Bạn rao bán tài khoản game, có người mua đề nghị thanh toán qua một "Sàn trung gian uy tín" và gửi đường link trang web có giao diện giống hệt cổng nạp game lớn, yêu cầu bạn nhập mật khẩu game và mã Smart OTP để nhận tiền.',
    options: [
      { id: 'A', text: 'Nhập thông tin tài khoản vì trang web trung gian sẽ bảo đảm quyền lợi cho cả hai bên.' },
      { id: 'B', text: 'Chỉ chấp nhận các hình thức giao dịch trực tiếp hoặc kiểm tra tên miền trang web có thuộc cổng chính thống.' },
      { id: 'C', text: 'Gửi thêm thông tin thẻ ngân hàng liên kết tài khoản game cho người mua để họ thanh toán nhanh.' },
      { id: 'D', text: 'Tắt tính năng xác thực 2 bước của tài khoản game để người mua kiểm tra thử trước.' },
    ],
    correctAnswer: 'B',
    explanation: 'Kẻ gian thường tạo lập các sàn trung gian ảo (Fake Escrow) để chiếm đoạt tài khoản số và tiền của người dùng. Không bao giờ cung cấp mã OTP cho các trang web trung gian trôi nổi.',
    threatType: 'Fake Escrow Service / Phishing Portal',
    targetDomain: 'Giao dịch tài sản số & Sàn trung gian',
  },
  {
    id: 13,
    difficulty: 'MEDIUM',
    topic: 'Đăng nhập mạng WiFi công cộng miễn phí',
    scenario: 'Tại nhà ga xe lửa, bạn thấy mạng WiFi mở tên "Free_HighSpeed_WiFi_GaTau" không có mật khẩu. Khi kết nối, một trang web hiện ra yêu cầu bạn "Đăng nhập bằng tài khoản Zalo hoặc Facebook để sử dụng Internet miễn phí".',
    options: [
      { id: 'A', text: 'Nhập thông tin tài khoản mạng xã hội để có kết nối mạng phục vụ công việc.' },
      { id: 'B', text: 'Sử dụng mạng dữ liệu di động 4G/5G cá nhân hoặc kết nối qua mạng riêng ảo VPN tin cậy.' },
      { id: 'C', text: 'Nhập số điện thoại kèm mật khẩu ngân hàng trực tuyến để vượt qua trang đăng nhập.' },
      { id: 'D', text: 'Chia sẻ điểm phát sóng mạng này cho các thiết bị xung quanh cùng dùng.' },
    ],
    correctAnswer: 'B',
    explanation: 'Điểm phát sóng WiFi giả mạo (Evil Twin / Rogue AP) sử dụng cổng đăng nhập ảo (Captive Portal) để đánh cắp tài khoản mạng xã hội và theo dõi các gói tin truyền qua mạng.',
    threatType: 'Evil Twin WiFi / Rogue Captive Portal',
    targetDomain: 'An toàn mạng vô tuyến & Truyền thông',
  },
  {
    id: 14,
    difficulty: 'MEDIUM',
    topic: 'Quyền trợ năng Accessibility trên thiết bị Android',
    scenario: 'Bạn cài đặt một ứng dụng hỗ trợ tải video từ mạng xã hội, ứng dụng liên tục hiện thông báo yêu cầu bạn vào phần Cài đặt của điện thoại để bật "Dịch vụ Hỗ trợ tiếp cận (Accessibility Service)" cho ứng dụng đó.',
    options: [
      { id: 'A', text: 'Bật quyền này vì đó là tính năng cần thiết để ứng dụng phát huy tối đa tốc độ tải tệp.' },
      { id: 'B', text: 'Quyền này cho phép ứng dụng đọc nội dung trên màn hình và tự động bấm nút chuyển tiền mà bạn không hay biết.' },
      { id: 'C', text: 'Bật quyền này và tắt màn hình điện thoại đi để ứng dụng tự động xử lý ngầm.' },
      { id: 'D', text: 'Cắm sạc liên tục để hỗ trợ tính năng tiếp cận hoạt động ổn định.' },
    ],
    correctAnswer: 'B',
    explanation: 'Quyền Trợ năng (Accessibility Service) là quyền cực kỳ nguy hiểm trên Android, giúp mã độc có thể ghi lại thao tác bàn phím (Keylogger), chụp màn hình và tự động thực hiện thao tác chuyển tiền trong tài khoản.',
    threatType: 'Accessibility Abuse / Android Banking Trojan',
    targetDomain: 'Bảo mật hệ điều hành di động',
  },

  // --- NHÓM 3: KHÓ (6 CÂU) - Kịch bản chuyên sâu, bẫy tâm lý cao cấp ---
  // QUAN TRỌNG: TUYỆT ĐỐI KHÔNG CÓ DẤU HIỆU ĐOÁN MÒ BẰNG TỪ "KHÔNG" Ở CÁC PHƯƠNG ÁN!
  {
    id: 15,
    difficulty: 'HARD',
    topic: 'Deepfake AI thời gian thực mạo danh người thân gọi video',
    scenario: 'Bạn nhận cuộc gọi video qua Messenger từ người anh trai đang du học tại Châu Âu. Hình ảnh và giọng nói giống hệt anh bạn nhưng khuôn mặt có hiện tượng mờ viền khi chuyển động và cuộc gọi bị ngắt sau 12 giây với lý do sóng yếu, kèm tin nhắn đề nghị chuyển gấp 40 triệu đồng đóng học phí.',
    options: [
      { id: 'A', text: 'Xác thực bằng cách đặt câu hỏi về một chi tiết kỷ niệm riêng tư trong đời thực chỉ hai người cùng biết.' },
      { id: 'B', text: 'Xem lại ảnh đại diện của tài khoản gọi đến để đảm bảo đúng trang cá nhân đã kết bạn lâu năm.' },
      { id: 'C', text: 'Thực hiện chuyển trước một nửa số tiền 20 triệu đồng để hỗ trợ kịp thời việc đóng học phí.' },
      { id: 'D', text: 'Yêu cầu đối phương chụp lại thẻ sinh viên kèm căn cước công dân gửi qua tin nhắn trò chuyện.' },
    ],
    correctAnswer: 'A',
    explanation: 'Công nghệ Deepfake hoán đổi khuôn mặt và nhân bản giọng nói (Voice Cloning) có thể giả mạo hình ảnh trong vài giây, nhưng AI không thể biết được những trải nghiệm ngoại tuyến cá nhân. Đặt câu hỏi bí mật riêng tư hoặc gọi số viễn thông trực tiếp là phương pháp phá vỡ bẫy Deepfake hữu hiệu nhất.',
    threatType: 'Real-time Deepfake & Voice Cloning',
    targetDomain: 'Trí tuệ nhân tạo tạo sinh & Lừa đảo sinh trắc',
  },
  {
    id: 16,
    difficulty: 'HARD',
    topic: 'Bẫy lừa đảo kép - Dịch vụ thu hồi vốn treo',
    scenario: 'Sau khi một người bị mất 50 triệu đồng vào sàn đầu tư tiền ảo lừa đảo, người này tìm thấy trang mạng "Văn phòng Luật sư & Cục An ninh mạng hỗ trợ thu hồi tiền treo", nơi cam kết lấy lại 100% số tiền với điều kiện đóng phí ủy thác hồ sơ 5 triệu đồng vào tài khoản tạm giữ của chuyên viên.',
    options: [
      { id: 'A', text: 'Chuyển 5 triệu đồng phí ủy thác vì trang có hiển thị đầy đủ con dấu và hình ảnh trụ sở cơ quan pháp luật.' },
      { id: 'B', text: 'Mang toàn bộ chứng từ sao kê và nhật ký tin nhắn đến nộp đơn trình báo tại Cơ quan Cảnh sát điều tra.' },
      { id: 'C', text: 'Cung cấp mã Smart OTP của ngân hàng để chuyên viên kỹ thuật tiến hành truy vết dòng tiền.' },
      { id: 'D', text: 'Chia sẻ thông tin đăng nhập tài khoản sàn đầu tư cũ để chuyên viên can thiệp vào máy chủ dữ liệu.' },
    ],
    correctAnswer: 'B',
    explanation: 'Đây là chiêu bài "Lừa đảo phục hồi" (Recovery Scam) nhắm vào tâm lý tiếc của của nạn nhân. Trên thực tế, các cơ quan chức năng nhà nước giải quyết tố giác tội phạm hoàn toàn theo quy trình tố tụng hình sự, không bao giờ thu phí dịch vụ qua mạng.',
    threatType: 'Recovery Scam / Double Victimization',
    targetDomain: 'Tâm lý nạn nhân & Lừa đảo phục hồi vốn',
  },
  {
    id: 17,
    difficulty: 'HARD',
    topic: 'Tấn công tráo mã QR động tại máy POS nhà hàng',
    scenario: 'Khi thanh toán tại một nhà hàng cao cấp, nhân viên đưa ra màn hình thiết bị hiển thị mã QR động để bạn quét chuyển khoản. Sau khi quét bằng ứng dụng ngân hàng, tên đơn vị thụ hưởng trên màn hình điện thoại hiển thị là "DNTN DICH VU TM DUC PHAT" trong khi hóa đơn in tên "Nha Hang Sen Vang".',
    options: [
      { id: 'A', text: 'Bấm nút chuyển khoản ngay vì tài khoản doanh nghiệp đã được ngân hàng kiểm duyệt pháp lý.' },
      { id: 'B', text: 'Yêu cầu quản lý nhà hàng đối soát và giải trình sự khác biệt về danh tính trước khi bấm chuyển.' },
      { id: 'C', text: 'Tăng số tiền chuyển khoản thêm 10% tiền tip để hệ thống tự động nhận diện hóa đơn.' },
      { id: 'D', text: 'Lưu mã QR đó lại để thực hiện chuyển tiền sau khi đã rời khỏi nhà hàng.' },
    ],
    correctAnswer: 'B',
    explanation: 'Mã QR động trên máy POS có thể bị can thiệp bởi mã độc cài trên phần mềm thu ngân hoặc nhân viên nội bộ gian lận tráo mã thụ hưởng. Luôn đối chiếu tên người thụ hưởng hiển thị trên ứng dụng ngân hàng với hóa đơn chính thức.',
    threatType: 'Dynamic QR Injection / POS Tampering',
    targetDomain: 'Gian lận điểm bán & Quishing tinh vi',
  },
  {
    id: 18,
    difficulty: 'HARD',
    topic: 'Tấn công bằng tệp tin nén chứa mã độc RAT có đuôi mở rộng kép',
    scenario: 'Một đối tác kinh doanh gửi email trao đổi hợp đồng với tệp đính kèm có tên "Bang_Bao_Gia_Chi_Tiet_V2.pdf.exe". Khi bạn mở thử trên máy tính, biểu tượng tệp hiển thị hình trang tài liệu PDF màu đỏ quen thuộc.',
    options: [
      { id: 'A', text: 'Nhấp đúp chuột để mở tệp vì biểu tượng PDF đảm bảo đây là tài liệu văn bản an toàn.' },
      { id: 'B', text: 'Kiểm tra phần mở rộng thực tế của tệp và tiến hành quét bằng phần mềm phòng chống mã độc chuyên dụng.' },
      { id: 'C', text: 'Đổi tên tệp thành tập tin hình ảnh rồi mở bằng trình duyệt web để xem trước nội dung.' },
      { id: 'D', text: 'Tải tệp tin lên hệ thống lưu trữ đám mây dùng chung của cơ quan để chia sẻ cho đồng nghiệp.' },
    ],
    correctAnswer: 'B',
    explanation: 'Tin tặc sử dụng kỹ thuật che giấu đuôi mở rộng kép (Double Extension) và thay đổi icon giả làm tệp PDF để đánh lừa người dùng. Thực chất đây là tệp tin thực thi (.exe) chứa mã độc điều khiển từ xa (Remote Access Trojan - RAT).',
    threatType: 'Double Extension Trojan / Advanced Malware',
    targetDomain: 'Mã độc tống tiền & Tấn công doanh nghiệp',
  },
  {
    id: 19,
    difficulty: 'HARD',
    topic: 'Trang web lừa đảo sở hữu chứng chỉ bảo mật HTTPS hợp lệ',
    scenario: 'Bạn cần thanh toán vé máy bay và truy cập vào trang web có biểu tượng ổ khóa xanh HTTPS bảo mật trên thanh địa chỉ, nhưng tên miền hiển thị là "vietnamairlines-booking-secure.com".',
    options: [
      { id: 'A', text: 'Yên tâm nhập đầy đủ thông tin thẻ tín dụng vì biểu tượng ổ khóa chứng minh đây là website chính thức.' },
      { id: 'B', text: 'Tra cứu tên miền gốc của hãng hàng không trên các nguồn chính thống và kiểm tra tổ chức sở hữu chứng chỉ.' },
      { id: 'C', text: 'Lưu trang web vào mục yêu thích của trình duyệt để sử dụng cho các lần mua vé tiếp theo.' },
      { id: 'D', text: 'Gửi liên kết cho người thân để nhờ họ thanh toán hộ bằng thẻ ghi nợ quốc tế.' },
    ],
    correctAnswer: 'B',
    explanation: 'Chứng chỉ HTTPS (ổ khóa) chỉ chứng minh đường truyền dữ liệu được mã hóa giữa máy tính và máy chủ web, chứ hoàn toàn không bảo đảm chủ sở hữu website đó là tổ chức uy tín. Kẻ lừa đảo có thể đăng ký chứng chỉ SSL/TLS miễn phí cho tên miền lừa đảo chỉ trong vài phút.',
    threatType: 'Homograph & SSL Fallacy Phishing',
    targetDomain: 'Mật mã học & Lỗ hổng nhận thức HTTPS',
  },
  {
    id: 20,
    difficulty: 'HARD',
    topic: 'Ký duyệt giao dịch hợp đồng thông minh / Ủy quyền số',
    scenario: 'Một dự án tiền số gửi thông báo ví của bạn nhận được 5.000 USD phần thưởng Airdrop. Khi bấm vào trang nhận thưởng, ví điện tử của bạn hiện cửa sổ yêu cầu ký thông điệp ủy quyền với hàm "SetApprovalForAll" hoặc "Unlimited Allowance".',
    options: [
      { id: 'A', text: 'Xác nhận phê duyệt ngay lập tức để kịp thời gian nhận thưởng trước khi hết lượt.' },
      { id: 'B', text: 'Từ chối giao dịch và hủy kết nối ví vì đây là lệnh cấp toàn quyền rút sạch tài sản trong ví của bạn.' },
      { id: 'C', text: 'Nạp thêm tiền mã hóa vào ví để đáp ứng điều kiện số dư tối thiểu của hợp đồng thông minh.' },
      { id: 'D', text: 'Chụp ảnh khóa bí mật (Private Key) gửi cho nhóm hỗ trợ của dự án để họ xử lý lỗi.' },
    ],
    correctAnswer: 'B',
    explanation: 'Lệnh "SetApprovalForAll" hoặc cấp quyền chi tiêu không giới hạn (Unlimited Allowance) là hình thức bòn rút ví (Wallet Drainer). Một khi ký duyệt, kẻ tấn công có quyền chuyển toàn bộ token và NFT có trong ví mà không cần bạn xác nhận thêm bất kỳ lần nào.',
    threatType: 'Web3 Wallet Drainer / Smart Contract Phishing',
    targetDomain: 'Tài sản số & An ninh Web3',
  },
];

// DEDICATED SECTOR SPECIFIC QUESTION POOLS FOR ALL 12 SECTORS
export const SECTOR_QUESTIONS_MAP: Record<number, CertificationQuestion[]> = {
  1: [
    CERTIFICATION_TOPIC_1_QUESTIONS[1], // SMS Quà tặng
    {
      id: 101,
      difficulty: 'MEDIUM',
      topic: 'Vòng quay trúng thưởng iPhone 16 Pro Max 0 đồng',
      scenario: 'Một trang mạng xã hội thông báo bạn trúng thưởng ô tô điện hoặc điện thoại cao cấp trong chương trình tri ân ngẫu nhiên, yêu cầu nạp 500.000đ tiền phí vận chuyển và thuế trước bạ vào tài khoản cá nhân của thủ quỹ.',
      options: [
        { id: 'A', text: 'Chuyển tiền phí ngay vì giá trị quà tặng lớn hơn rất nhiều so với phí vận chuyển.' },
        { id: 'B', text: 'Yêu cầu bên tặng trừ trực tiếp chi phí vận chuyển vào giá trị phần thưởng hoặc từ chối nhận quà.' },
        { id: 'C', text: 'Cung cấp số thẻ ngân hàng và mã CVC để họ làm thủ tục chuyển quyền sở hữu.' },
        { id: 'D', text: 'Mời bạn bè bấm like bài viết để tăng cơ hội giải ngân quà tặng sớm.' },
      ],
      correctAnswer: 'B',
      explanation: 'Chiêu trò quà tặng 0 đồng nhưng bắt đóng phí hải quan, phí trước bạ hoặc tiền cọc là bẫy mồi nhử kinh điển.',
      threatType: 'Zero-Dollar Gift Baiting',
      targetDomain: 'Bẫy mồi nhử & Quà tặng ảo',
    },
    {
      id: 102,
      difficulty: 'HARD',
      topic: 'Hội thảo tặng sữa hạt miễn phí kèm bán hàng đa cấp',
      scenario: 'Người cao tuổi trong gia đình được mời tham dự hội thảo dinh dưỡng miễn phí kèm tặng quà chảo chống dính, sau đó bị thuyết phục mua bộ máy lọc nước 40 triệu đồng với lời hứa chữa khỏi bách bệnh.',
      options: [
        { id: 'A', text: 'Ủng hộ người thân mua máy vì có giấy chứng nhận in hình các giáo sư nước ngoài.' },
        { id: 'B', text: 'Đồng hành cùng người thân, yêu cầu hóa đơn đỏ và kiểm tra giấy phép công bố sản phẩm tại Bộ Y tế trước khi quyết định.' },
        { id: 'C', text: 'Để người thân tự vay mượn hàng xóm để rèn luyện kỹ năng tự chủ tài chính.' },
        { id: 'D', text: 'Chuyển khoản đặt cọc trước 5 triệu đồng để giữ chỗ nhận quà ưu đãi.' },
      ],
      correctAnswer: 'B',
      explanation: 'Thao túng tâm lý tặng quà giá trị nhỏ để bán sản phẩm đội giá gấp 10 lần nhắm vào sự nhẹ dạ của người lớn tuổi.',
      threatType: 'Elderly Wellness Product Exploitation',
      targetDomain: 'Thao túng tâm lý tri ân',
    },
    CERTIFICATION_TOPIC_1_QUESTIONS[5],
    CERTIFICATION_TOPIC_1_QUESTIONS[9],
  ],
  2: [
    CERTIFICATION_TOPIC_1_QUESTIONS[6], // Fake BTS
    CERTIFICATION_TOPIC_1_QUESTIONS[7], // SIM swap
    {
      id: 201,
      difficulty: 'HARD',
      topic: 'Trạm phát sóng di động giả mạo mang vác (Backpack Fake BTS)',
      scenario: 'Khi đi vào khu vực trung tâm thương mại đông người, điện thoại của bạn đột ngột rớt mạng từ 4G xuống 2G rồi nhận được tin nhắn SMS xưng tên ngân hàng yêu cầu hủy lệnh chuyển tiền 50 triệu đồng.',
      options: [
        { id: 'A', text: 'Sóng 2G chứng minh tin nhắn có tính khẩn cấp cao do ngân hàng kích hoạt giao thức bảo vệ.' },
        { id: 'B', text: 'Kẻ tấn công đang dùng thiết bị BTS giả mạo ép điện thoại hạ băng tần xuống 2G để gửi SMS Brandname lừa đảo.' },
        { id: 'C', text: 'Nhà mạng đang nâng cấp cột sóng khu vực nên tín hiệu bị xáo trộn bình thường.' },
        { id: 'D', text: 'Bấm ngay vào liên kết trong SMS và nhập mã Smart OTP để chặn lệnh giao dịch.' },
      ],
      correctAnswer: 'B',
      explanation: 'Thiết bị trạm BTS giả mạo thường cưỡng bức thiết bị di động hạ xuống mạng 2G GSM vốn không có cơ chế xác thực 2 chiều giữa trạm phát và điện thoại.',
      threatType: 'Fake BTS Downgrade Attack',
      targetDomain: 'Hạ tầng viễn thông & Trạm sóng giả',
    },
    {
      id: 202,
      difficulty: 'MEDIUM',
      topic: 'Cuộc gọi Flash Call nháy máy 1 giây từ đầu số quốc tế',
      scenario: 'Bạn liên tục nhận được các cuộc gọi nhỡ chỉ đổ chuông 1 tiếng từ các đầu số lạ có mã vùng quốc tế (+882, +252, +881) vào lúc nửa đêm.',
      options: [
        { id: 'A', text: 'Gọi lại ngay vào số điện thoại đó vì lo sợ có người thân ở nước ngoài gặp chuyện nguy cấp.' },
        { id: 'B', text: 'Không gọi lại và chủ động chặn các đầu số lạ để tránh bị trừ cước viễn thông quốc tế giá cắt cổ.' },
        { id: 'C', text: 'Nhắn tin hỏi danh tính người gọi qua ứng dụng tin nhắn SMS thông thường.' },
        { id: 'D', text: 'Chuyển hướng toàn bộ cuộc gọi đến sang số hotline của cơ quan công an.' },
      ],
      correctAnswer: 'B',
      explanation: 'Chiêu trò Wangiri (nháy máy từ nước ngoài) dụ nạn nhân gọi lại vào các đầu số vệ tinh tính cước phí hàng trăm nghìn đồng mỗi phút.',
      threatType: 'Wangiri Telephony Scam',
      targetDomain: 'Viễn thông quốc tế',
    },
    CERTIFICATION_TOPIC_1_QUESTIONS[1],
  ],
  3: [
    CERTIFICATION_TOPIC_1_QUESTIONS[3], // QR swap
    CERTIFICATION_TOPIC_1_QUESTIONS[9], // COD 0d
    CERTIFICATION_TOPIC_1_QUESTIONS[16], // QR POS
    {
      id: 301,
      difficulty: 'HARD',
      topic: 'Giả danh shipper báo bưu phẩm giao không thành công',
      scenario: 'Một shipper gọi thông báo đơn hàng quần áo Shopee bạn đặt trị giá 450.000đ đã để ở cổng nhà, yêu cầu bạn chuyển khoản vào số tài khoản cá nhân, sau đó gửi link "xác nhận đã nhận hàng" để hoàn tất đơn.',
      options: [
        { id: 'A', text: 'Chuyển khoản ngay và bấm vào link để hỗ trợ shipper hoàn thành chỉ tiêu giao hàng trong ngày.' },
        { id: 'B', text: 'Mở ứng dụng Shopee chính thức kiểm tra trạng thái đơn hàng và chỉ thanh toán khi đã cầm trực tiếp kiện hàng trên tay.' },
        { id: 'C', text: 'Gửi ảnh chụp mã OTP ngân hàng cho shipper để họ tự trừ tiền trên hệ thống máy chủ sàn.' },
        { id: 'D', text: 'Chia sẻ vị trí định vị thời gian thực của ngôi nhà cho số điện thoại lạ.' },
      ],
      correctAnswer: 'B',
      explanation: 'Thủ đoạn shipper giả mạo theo dõi lịch sử mua hàng công khai để lừa thu tiền COD hoặc gửi link độc hại chiếm đoạt tài khoản.',
      threatType: 'Fake Delivery Logistics Trap',
      targetDomain: 'Thương mại điện tử & Vận chuyển',
    },
  ],
  4: [
    {
      id: 401,
      difficulty: 'HARD',
      topic: 'Bẫy tình cảm đầu tư "Mổ heo" (Romance / Pig-Butchering)',
      scenario: 'Một người bạn ngoại quốc quen qua ứng dụng hẹn hò sau 3 tháng trò chuyện ngọt ngào tâm sự bắt đầu chia sẻ rằng họ có bác ruột làm quản lý cấp cao ở sàn đầu tư tài chính và rủ bạn cùng nạp 2.000 USD để hưởng lãi 25%/tuần cho tương lai hai đứa.',
      options: [
        { id: 'A', text: 'Nạp thử 200 USD trước vì thời gian trò chuyện 3 tháng đã xây dựng đủ lòng tin giữa hai người.' },
        { id: 'B', text: 'Nhận diện ngay đây là kịch bản lừa đảo mổ heo (Pig-Butchering Scam), lập tức ngắt liên lạc và không chuyển bất kỳ khoản tiền nào.' },
        { id: 'C', text: 'Rủ người đó gọi video call để kiểm tra xem khuôn mặt có đúng như ảnh đại diện trên ứng dụng.' },
        { id: 'D', text: 'Chuyển tiền vào tài khoản trung gian của ngân hàng Việt Nam để người đó hỗ trợ giao dịch hộ.' },
      ],
      correctAnswer: 'B',
      explanation: 'Tội phạm lừa tình cảm đầu tư (Pig-Butchering) kiên nhẫn xây dựng mối quan hệ tình cảm nhiều tháng trước khi dẫn dụ nạn nhân vào sàn giao dịch giả mạo.',
      threatType: 'Pig-Butchering Romance Scam',
      targetDomain: 'Thao túng tâm lý tình cảm',
    },
    {
      id: 402,
      difficulty: 'MEDIUM',
      topic: 'Kịch bản bưu kiện quà tặng ngoại quốc bị hải quan giữ',
      scenario: 'Người bạn quen qua mạng thông báo vừa gửi tặng bạn một thùng quà chứa 100.000 USD tiền mặt và đồng hồ đắt tiền. Hôm sau, một người xưng là nhân viên hải quan sân bay Nội Bài gọi yêu cầu bạn nộp 15 triệu đồng "phí soi chiếu chống rửa tiền".',
      options: [
        { id: 'A', text: 'Đóng 15 triệu đồng vì món quà có giá trị lên tới hàng tỷ đồng.' },
        { id: 'B', text: 'Quy định pháp luật cấm gửi tiền mặt qua bưu chính; đây là bẫy lừa đảo mạo danh hải quan kinh điển.' },
        { id: 'C', text: 'Vay mượn thêm bạn bè để đóng thêm phí bảo lãnh xuất nhập cảnh nếu bị yêu cầu.' },
        { id: 'D', text: 'Gửi ảnh căn cước công dân và sổ hộ khẩu cho nhân viên hải quan qua Zalo.' },
      ],
      correctAnswer: 'B',
      explanation: 'Gửi ngoại tệ tiền mặt qua đường bưu kiện quốc tế là hành vi vi phạm pháp luật và không có bất kỳ cơ quan hải quan nào yêu cầu nộp phạt qua tài khoản cá nhân.',
      threatType: 'Customs Parcel Extortion',
      targetDomain: 'Lừa đảo bưu kiện quà tặng ngoại quốc',
    },
    CERTIFICATION_TOPIC_1_QUESTIONS[4],
    CERTIFICATION_TOPIC_1_QUESTIONS[14],
  ],
  5: [
    CERTIFICATION_TOPIC_1_QUESTIONS[2], // Việc làm online
    {
      id: 501,
      difficulty: 'HARD',
      topic: 'Sàn giao dịch Forex / Tiền ảo can thiệp nến giá',
      scenario: 'Bạn được đưa vào nhóm Telegram có các "chuyên gia đọc lệnh", tài khoản demo của bạn liên tục thắng gấp 3 lần số dư. Khi bạn nạp 50 triệu tiền thật và muốn rút vốn, sàn báo lỗi "tài khoản bị đóng băng do nghi vấn rửa tiền, cần nạp thêm 25 triệu để đối ứng xác thực".',
      options: [
        { id: 'A', text: 'Nạp thêm 25 triệu để hoàn tất thủ tục mở khóa và rút toàn bộ 75 triệu đồng về.' },
        { id: 'B', text: 'Dừng nạp tiền ngay lập tức vì sàn hoàn toàn do kẻ gian thao túng; nạp thêm sẽ chỉ làm tăng thêm số tiền bị chiếm đoạt.' },
        { id: 'C', text: 'Nhờ chuyên gia đọc lệnh hỗ trợ rút vốn bằng cách cung cấp mật khẩu hòm thư cá nhân.' },
        { id: 'D', text: 'Tải ứng dụng khác do các thành viên trong nhóm giới thiệu để chuyển số dư sang.' },
      ],
      correctAnswer: 'B',
      explanation: 'Các sàn giao dịch lừa đảo sử dụng mã nguồn tự tạo để chỉnh sửa đồ thị nến ảo. Yêu cầu nạp "phí bảo lãnh", "phí thuế" để rút tiền là chiêu bài bòn rút thêm vốn.',
      threatType: 'Rigged Forex & Fake Broker Platform',
      targetDomain: 'Sàn tài chính Ponzi & Lệnh giả',
    },
    {
      id: 502,
      difficulty: 'MEDIUM',
      topic: 'Nhiệm vụ giật đơn sàn TMĐT nhận hoa hồng phân cấp',
      scenario: 'Người hướng dẫn yêu cầu bạn chuyển khoản 5 triệu đồng để "giật đơn hàng thứ 5" với cam kết sau 10 phút sẽ nhận lại 6 triệu đồng gốc và hoa hồng.',
      options: [
        { id: 'A', text: 'Chuyển tiền vì các đơn hàng số 1, 2, 3 trước đó bạn đều nhận lại tiền thật thành công.' },
        { id: 'B', text: 'Nhận biết các đơn hàng nhỏ ban đầu chỉ là mồi câu (nhử mồi) để ép nạn nhân nạp số tiền lớn ở các vòng sau.' },
        { id: 'C', text: 'Rủ thêm người thân cùng nạp chung số tiền để chia nhỏ rủi ro tài chính.' },
        { id: 'D', text: 'Gửi ảnh chụp màn hình số dư tài khoản ngân hàng để xin giảm mức tiền nạp.' },
      ],
      correctAnswer: 'B',
      explanation: 'Thủ đoạn trả hoa hồng nhỏ vài chục nghìn đồng nhằm tạo ảo tưởng tin cậy trước khi nuốt trọn số tiền lớn hàng chục triệu ở nhiệm vụ cuối.',
      threatType: 'Task Escalation Sunk-Cost Trap',
      targetDomain: 'Bẫy nhiệm vụ phân cấp',
    },
    CERTIFICATION_TOPIC_1_QUESTIONS[15],
  ],
  6: [
    CERTIFICATION_TOPIC_1_QUESTIONS[0], // Giả danh công an
    {
      id: 601,
      difficulty: 'HARD',
      topic: 'Lệnh bắt giam và phong tỏa tài sản giả mạo qua Zalo',
      scenario: 'Một đối tượng gọi video tự xưng Viện Kiểm Sát Nhân Dân Tối Cao, mặc trang phục ngành và giơ tờ "Lệnh bắt tạm giam, Lệnh phong tỏa tài sản" có đóng dấu đỏ mang tên bạn, yêu cầu bạn mở tài khoản mới và chuyển tiền vào để phục vụ giám định tư pháp.',
      options: [
        { id: 'A', text: 'Lập tức làm theo vì lệnh bắt có dấu đỏ quốc huy và đầy đủ họ tên, ngày tháng năm sinh của bạn.' },
        { id: 'B', text: 'Cơ quan tư pháp Việt Nam không bao giờ tống đạt quyết định tố tụng qua Zalo hay yêu cầu chuyển tiền vào tài khoản cá nhân phục vụ điều tra.' },
        { id: 'C', text: 'Nhắn tin xin đối tượng lùi thời hạn chuyển tiền sang tuần sau để thu xếp tài chính.' },
        { id: 'D', text: 'Chuyển một khoản tiền nhỏ 2 triệu đồng làm lệ phí xác minh hồ sơ tư pháp.' },
      ],
      correctAnswer: 'B',
      explanation: 'Mọi hoạt động tố tụng hình sự đều phải lập biên bản trực tiếp và trao văn bản tại trụ sở cơ quan tiến hành tố tụng hoặc chính quyền địa phương.',
      threatType: 'Fake Judicial Arrest Warrant Extortion',
      targetDomain: 'Mạo danh quyền lực tư pháp',
    },
    {
      id: 602,
      difficulty: 'MEDIUM',
      topic: 'Hướng dẫn cài đặt ứng dụng Dịch vụ công VNeID giả mạo',
      scenario: 'Một người tự xưng là Cán bộ Công an Phường hướng dẫn bạn tải ứng dụng "DichVuCong_CapNhatVNeID.apk" để kích hoạt định danh mức 2 do dữ liệu hồ sơ bị sai lệch ngày cấp.',
      options: [
        { id: 'A', text: 'Tải và cài đặt tệp tin theo hướng dẫn để tránh bị phạt hành chính về đăng ký cư trú.' },
        { id: 'B', text: 'Đến trực tiếp Công an xã/phường để được hướng dẫn; tuyệt đối không cài tệp .apk từ đường link do người lạ gửi.' },
        { id: 'C', text: 'Cung cấp mật khẩu tài khoản VNeID và mã xác thực OTP gửi về máy cho người gọi.' },
        { id: 'D', text: 'Mở ứng dụng ngân hàng trên cùng điện thoại để kiểm tra xem hệ thống đã liên kết chưa.' },
      ],
      correctAnswer: 'B',
      explanation: 'Ứng dụng Dịch vụ công giả mạo chứa mã độc gián điệp chiếm quyền điều khiển điện thoại (Accessibility) để tự động rút sạch tiền trong tài khoản ngân hàng.',
      threatType: 'Fake Gov Public Service App',
      targetDomain: 'Giả mạo cổng dịch vụ công',
    },
    CERTIFICATION_TOPIC_1_QUESTIONS[13],
  ],
  7: [
    CERTIFICATION_TOPIC_1_QUESTIONS[14], // Deepfake Video
    CERTIFICATION_TOPIC_1_QUESTIONS[16], // Dynamic QR
    {
      id: 701,
      difficulty: 'HARD',
      topic: 'Nhận biết dấu hiệu giả mạo trong cuộc gọi video Deepfake',
      scenario: 'Trong cuộc gọi video với người thân, bạn nghi ngờ hình ảnh là do AI tạo ra. Hành động nào sau đây giúp phát hiện Deepfake hiệu quả nhất?',
      options: [
        { id: 'A', text: 'Quan sát kỹ ảnh đại diện của tài khoản trên trang cá nhân mạng xã hội.' },
        { id: 'B', text: 'Yêu cầu người đó quay nghiêng mặt 90 độ, vẫy tay qua mặt hoặc hỏi một câu hỏi đời thực mà chỉ hai người biết.' },
        { id: 'C', text: 'Tắt camera của mình đi để tăng băng thông truyền hình ảnh của đối phương.' },
        { id: 'D', text: 'Yêu cầu người đó đọc to số thẻ căn cước công dân của họ.' },
      ],
      correctAnswer: 'B',
      explanation: 'Khi quay nghiêng 90 độ hoặc vẫy tay trước mặt, thuật toán Deepfake thời gian thực thường bị lỗi biến dạng hình ảnh (Artifacts) ở vùng cằm và tai. Câu hỏi ngoại tuyến phá vỡ hoàn toàn trí thông minh nhân tạo.',
      threatType: 'Deepfake Facial Artifact Detection',
      targetDomain: 'Công nghệ cao AI & Deepfake',
    },
    CERTIFICATION_TOPIC_1_QUESTIONS[3],
  ],
  8: [
    {
      id: 801,
      difficulty: 'HARD',
      topic: 'Quy trình sơ cứu 3 bước trong giờ vàng khi lỡ chuyển tiền cho kẻ lừa đảo',
      scenario: 'Ngay sau khi nhận ra mình vừa chuyển 30 triệu đồng vào số tài khoản của kẻ lừa đảo cách đây 3 phút, bạn cần thực hiện hành động nào đầu tiên?',
      options: [
        { id: 'A', text: 'Lên mạng tìm kiếm dịch vụ luật sư cam kết thu hồi tiền treo trên không gian mạng.' },
        { id: 'B', text: 'Gọi ngay hotline ngân hàng yêu cầu phong tỏa khẩn cấp / khóa thẻ, sau đó lưu giữ bằng chứng trình báo cơ quan công an.' },
        { id: 'C', text: 'Nhắn tin van xin kẻ lừa đảo hoàn trả lại một nửa số tiền đã chuyển.' },
        { id: 'D', text: 'Đăng bài bóc phốt lên các hội nhóm Facebook để nhờ cộng đồng mạng hỗ trợ đòi tiền.' },
      ],
      correctAnswer: 'B',
      explanation: 'Trong "giờ vàng" (vài phút đầu tiên), liên hệ ngân hàng khóa giao dịch và yêu cầu tra soát tài khoản đích là cơ hội duy nhất ngăn chặn dòng tiền bị tẩu tán qua các tài khoản rác.',
      threatType: 'Financial Golden Hour Emergency Response',
      targetDomain: 'Sơ cứu tài chính giờ vàng',
    },
    CERTIFICATION_TOPIC_1_QUESTIONS[15],
    CERTIFICATION_TOPIC_1_QUESTIONS[8],
  ],
  9: [
    {
      id: 901,
      difficulty: 'HARD',
      topic: 'Nhân bản giọng nói AI (Voice Cloning) gọi điện báo tin cấp cứu',
      scenario: 'Bạn nhận được cuộc gọi từ số lạ với giọng nói khóc lóc van xin giống hệt con bạn: "Bố ơi con đang bị tai nạn giao thông nặng tại viện Chợ Rẫy, bác sĩ bảo nộp viện phí mổ gấp 50 triệu".',
      options: [
        { id: 'A', text: 'Chuyển tiền vào tài khoản do người nghe máy cung cấp ngay để cứu mạng người thân.' },
        { id: 'B', text: 'Giữ bình tĩnh, ngắt cuộc gọi và bấm trực tiếp số điện thoại của con hoặc gọi cho nhà trường / thầy cô để xác minh.' },
        { id: 'C', text: 'Đọc mã OTP ngân hàng để nhân viên y tế tự động trừ viện phí trên cổng bảo hiểm.' },
        { id: 'D', text: 'Chụp ảnh sổ hộ khẩu gửi qua Zalo để chứng minh nhân thân.' },
      ],
      correctAnswer: 'B',
      explanation: 'Kẻ xấu chỉ cần mẫu âm thanh 3 giây từ video TikTok/Facebook là có thể nhân bản giọng nói AI. Luôn xác minh độc lập qua kênh liên lạc chính thức.',
      threatType: 'AI Voice Cloning Medical Emergency Trap',
      targetDomain: 'Sinh trắc học giọng nói AI',
    },
    CERTIFICATION_TOPIC_1_QUESTIONS[14],
  ],
  10: [
    CERTIFICATION_TOPIC_1_QUESTIONS[19], // Web3 Drainer
    {
      id: 1001,
      difficulty: 'HARD',
      topic: 'Bảo mật 12 ký tự khôi phục ví (Seed Phrase / Private Key)',
      scenario: 'Một nhân viên chăm sóc khách hàng của sàn giao dịch tiền số nhắn tin thông báo ví của bạn gặp lỗi đồng bộ chuỗi khối và yêu cầu cung cấp 12 từ khôi phục bí mật (Seed Phrase) để kỹ sư sửa lỗi trên máy chủ.',
      options: [
        { id: 'A', text: 'Cung cấp 12 từ vì nhân viên kỹ thuật có nghĩa vụ bảo mật thông tin khách hàng.' },
        { id: 'B', text: 'Tuyệt đối không bao giờ chia sẻ 12 từ khôi phục cho bất kỳ ai dưới mọi hình thức vì người có 12 từ này sở hữu toàn bộ tài sản trong ví.' },
        { id: 'C', text: 'Chụp ảnh 12 từ lưu vào ghi chú đám mây để tiện gửi cho đội ngũ hỗ trợ.' },
        { id: 'D', text: 'Đảo ngược thứ tự các từ rồi mới cung cấp cho kỹ sư.' },
      ],
      correctAnswer: 'B',
      explanation: 'Không có bất kỳ dự án Web3 chân chính nào yêu cầu người dùng cung cấp Private Key hay Seed Phrase. Cung cấp 12 từ đồng nghĩa với việc mất toàn bộ tài sản vĩnh viễn.',
      threatType: 'Seed Phrase Phishing / Wallet Takeover',
      targetDomain: 'Tài sản số & An ninh Web3',
    },
  ],
  11: [
    CERTIFICATION_TOPIC_1_QUESTIONS[12], // Evil Twin Wifi
    {
      id: 1101,
      difficulty: 'HARD',
      topic: 'Tấn công Juice Jacking qua cổng sạc USB nơi công cộng',
      scenario: 'Tại sân bay, bạn thấy các cổng sạc USB miễn phí gắn trên tường. Khi cắm cáp sạc điện thoại vào, màn hình điện thoại hiện hộp thoại hỏi "Tin cậy máy tính này (Trust this computer)?" hoặc "Bật truyền tệp (MTP)?".',
      options: [
        { id: 'A', text: 'Bấm Tin cậy để tăng công suất dòng điện sạc nhanh hơn.' },
        { id: 'B', text: 'Bấm Từ chối (Chỉ sạc) và rút cáp; sử dụng củ sạc cắm ổ điện 220V hoặc pin dự phòng cá nhân.' },
        { id: 'C', text: 'Mở ứng dụng ngân hàng để kiểm tra tính tương thích của cổng sạc.' },
        { id: 'D', text: 'Bật chế độ gỡ lỗi USB (USB Debugging) để hỗ trợ quá trình kết nối pin.' },
      ],
      correctAnswer: 'B',
      explanation: 'Cổng sạc USB công cộng có thể bị gắn vi mạch đánh cắp dữ liệu (Juice Jacking). Hộp thoại "Tin cậy máy tính" cho thấy cổng sạc đang cố gắng truy cập dữ liệu trong bộ nhớ điện thoại.',
      threatType: 'Juice Jacking USB Data Theft',
      targetDomain: 'An toàn phần cứng & Điểm sạc công cộng',
    },
  ],
  12: [
    CERTIFICATION_TOPIC_1_QUESTIONS[15], // Recovery Scam
    {
      id: 1201,
      difficulty: 'HARD',
      topic: 'Thao túng tâm lý nạn nhân bị lừa đảo qua dịch vụ "Hacker hoàn tiền"',
      scenario: 'Sau khi bị mất tiền, một tài khoản Telegram xưng là "Hacker mũ trắng" cam kết dùng phần mềm xâm nhập máy chủ của kẻ lừa đảo để rút lại tiền cho bạn, nhưng yêu cầu bạn nạp 10 triệu đồng tiền "mua mã giải mã dữ liệu".',
      options: [
        { id: 'A', text: 'Nạp tiền ngay vì hacker có trình độ kỹ thuật cao có thể can thiệp hệ thống máy chủ.' },
        { id: 'B', text: 'Nhận diện đây là bẫy lừa đảo kép (Double Victimization); chỉ có cơ quan điều tra công an mới có thẩm quyền phong tỏa và thu hồi tài sản theo luật.' },
        { id: 'C', text: 'Chuyển một nửa số tiền 5 triệu đồng để hacker chạy thử mã giải mã trước.' },
        { id: 'D', text: 'Cung cấp thông tin thẻ tín dụng của bố mẹ để hacker hỗ trợ thanh toán quốc tế.' },
      ],
      correctAnswer: 'B',
      explanation: 'Dịch vụ hacker lấy lại tiền hay văn phòng luật sư hỗ trợ đòi tiền online 100% là các nhóm tội phạm lừa đảo thứ cấp nhắm vào tâm lý tuyệt vọng của nạn nhân.',
      threatType: 'Secondary Recovery Scam Trap',
      targetDomain: 'Bẻ gãy lừa đảo kép & Thu hồi vốn',
    },
  ],
};

// Helper to get questions for a specific sector
export function getQuestionsForSector(sectorNumber: number): CertificationQuestion[] {
  const specific = SECTOR_QUESTIONS_MAP[sectorNumber];
  if (specific && specific.length >= 4) {
    // If specific questions exist, combine with a few curated core questions to make a balanced test
    const needed = Math.max(10, specific.length);
    const result = [...specific];
    for (const q of CERTIFICATION_TOPIC_1_QUESTIONS) {
      if (result.length >= needed) break;
      if (!result.some((existing) => existing.id === q.id)) {
        result.push(q);
      }
    }
    return result;
  }
  return CERTIFICATION_TOPIC_1_QUESTIONS;
}

