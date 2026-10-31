import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Award,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Clock,
  Flag,
  FileText,
  Trophy,
  Terminal,
  Check,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getActiveSessionUser } from '../services/firebaseAuthService';

export interface CyberGuardianExamQuestion {
  id: string;
  sectorNumber: number;
  sectorName: string;
  complexityLevel: 'TỔNG HỢP ĐA TẦNG' | 'PHÁP Y KỸ THUẬT SỐ' | 'PHẢN XẠ TÂM LÝ HỌC';
  cognitiveVector: string;
  scenarioContext: string;
  question: string;
  options: string[];
  correctIndex: number;
  forensicBreakdown: string;
  threeSecondRule: string;
}

export interface CyberGuardianCertificationRecord {
  id: string;
  certificateCode: string;
  studentName: string;
  grade: string;
  school: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  isPassed: boolean;
  preAppScore: number;
  postAppScore: number;
  improvementDelta: number;
  timeSpentSeconds: number;
  completedSectorsCount: number;
  completedLessonsCount: number;
  domainScores: Record<number, { correct: number; total: number }>;
  timestamp: string;
}

export const CYBER_GUARDIAN_FINAL_QUESTIONS: CyberGuardianExamQuestion[] = [
  {
    id: 'cg-q1',
    sectorNumber: 1,
    sectorName: 'Phân khu 01 · Bẫy Miễn Phí & Quà Tặng Ảo',
    complexityLevel: 'TỔNG HỢP ĐA TẦNG',
    cognitiveVector: 'Lợi dụng lòng tham + Hiệu ứng mồi nhử chi phí nhỏ (Micro-fee Trap)',
    scenarioContext:
      '[TIN NHẮN TIKTOK SHOP GIẢ MẠO]: "Chúc mừng tài khoản của bạn trúng Giải Đặc Biệt Tri Ân: 01 iPhone 16 Pro Max 256GB. Vui lòng truy cập cổng xác nhận giải thưởng tại https://tiktok-vn-event.top/claim và thanh toán 38.000đ phí bảo hiểm vận chuyển quốc tế để hệ thống xuất kho trong 15 phút."',
    question:
      'Trong kịch bản đa tầng trên, mục đích thực sự nguy hiểm nhất đằng sau yêu cầu thanh toán khoản phí nhỏ 38.000đ qua cổng web lạ là gì?',
    options: [
      'Chỉ nhằm chiếm đoạt đúng 38.000đ tiền lẻ của nhiều người dùng',
      'Thu thập thông tin thẻ/tài khoản ngân hàng, kịch bản dẫn dụ nạp tiếp "phí giải ngân/thuế VAT" hàng triệu đồng hoặc đánh cắp phiên đăng nhập qua biểu mẫu giả',
      'Để xác minh địa chỉ giao hàng thật của bưu cục chuyển phát nhanh',
      'Do quy định bắt buộc của sàn thương mại điện tử đối với hàng quà tặng giá trị cao',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Tên miền ".top" là tên miền rác giá rẻ hoàn toàn không thuộc TikTok. Khoản phí 38.000đ đóng vai trò "Cam kết ban đầu" (Foot-in-the-door) vừa để lấy thông tin thanh toán, vừa kích hoạt hiệu ứng tiếc nuối chi phí chìm khiến nạn nhân nộp tiếp phí thuế 10%, phí kích hoạt mã bảo hành... lên tới hàng chục triệu đồng.',
    threeSecondRule: 'Quà trúng thưởng đòi đóng phí trước + tên miền lạ = 100% bẫy lừa đảo liên hoàn.',
  },
  {
    id: 'cg-q2',
    sectorNumber: 1,
    sectorName: 'Phân khu 01 · Bẫy Miễn Phí & Quà Tặng Ảo',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Giả mạo học bổng / tài trợ giáo dục học đường',
    scenarioContext:
      '[EMAIL GỬI HỌC SINH]: Từ: "Ban Tuyển Sinh Quỹ Học Bổng Quốc Tế <support@edu-scholarship-vn.org>". Nội dung yêu cầu học sinh điền Số CCCD, ảnh chụp 2 mặt CCCD của phụ huynh và chuyển khoản "Lệ phí giữ chỗ quỹ tài trợ 500.000đ (hoàn lại 100% sau phỏng vấn)".',
    question:
      'Dấu hiệu pháp y nào cho thấy đây là chiến dịch thu thập dữ liệu định danh (Identity Harvesting) kết hợp lừa đảo tài chính?',
    options: [
      'Email có sử dụng tiếng Việt có dấu đầy đủ',
      'Tổ chức học bổng chính thống không bao giờ thu "phí giữ chỗ" qua tài khoản cá nhân và việc thu thập CCCD 2 mặt của phụ huynh nhằm phục vụ mở tài khoản ngân hàng rác hoặc vay tín dụng đen',
      'Tên miền có chứa từ khóa "scholarship" nên hoàn toàn đáng tin cậy',
      'Số tiền 500.000đ nhỏ nên có thể thử chuyển để kiểm tra thật giả',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Các quỹ học bổng hợp pháp được thẩm định qua nhà trường hoặc Sở GD&ĐT, tuyệt đối không thu tiền đặt cọc giữ chỗ. Nguy hiểm hơn, hình ảnh CCCD 2 mặt + thông tin cá nhân bị tội phạm mạng dùng để eKYC giả mạo hoặc tạo hồ sơ vay app.',
    threeSecondRule: 'Học bổng/Quà tặng đòi tiền cọc & ảnh CCCD = Đóng trang ngay lập tức.',
  },
  {
    id: 'cg-q3',
    sectorNumber: 2,
    sectorName: 'Phân khu 02 · Giả Mạo SMS Brandname Ngân Hàng',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Trạm BTS giả (IMSI Catcher) + Thao túng nỗi sợ khóa tài khoản',
    scenarioContext:
      '[TIN NHẮN TRONG CÙNG LUỒNG VIETCOMBANK THẬT]: "Thông báo khẩn: Tài khoản của Quý khách vừa đăng nhập trên thiết bị lạ tại Campuchia và đăng ký gói Phí Quản Lý VIP 2.200.000đ/tháng. Truy cập ngay https://vcb-digibank-huy.vn-authn.com để hủy dịch vụ và khóa thiết bị lạ trong 10 phút."',
    question:
      'Tại sao tin nhắn lừa đảo này lại chui vào đúng luồng SMS Brandname thật của ngân hàng trên điện thoại nạn nhân, và đâu là thao tác xử lý chuẩn xác nhất?',
    options: [
      'Do hệ thống máy chủ của ngân hàng bị tin tặc chiếm quyền điều khiển hoàn toàn',
      'Do kẻ gian sử dụng thiết bị phát sóng trạm BTS giả (Stingray/IMSI Catcher) phủ sóng cục bộ để giả mạo trường Sender ID; tuyệt đối không bấm link mà mở trực tiếp ứng dụng ngân hàng để kiểm tra',
      'Vì nằm chung luồng tin nhắn thật nên đường link chắc chắn là của ngân hàng phát hành',
      'Cần bấm ngay vào link để nhập mật khẩu và mã Smart OTP nhằm hủy gói phí 2,2 triệu đồng',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Trạm BTS giả ép điện thoại hạ cấp xuống sóng 2G (không xác thực chiều mạng phát), cho phép phát tán SMS với bất kỳ tên thương hiệu (Brandname) nào. Phân tích URL "vcb-digibank-huy.vn-authn.com" cho thấy tên miền gốc thực sự là "vn-authn.com" (phía trước dấu gạch chéo đơn), hoàn toàn là trang Phishing đánh cắp Smart OTP.',
    threeSecondRule: 'SMS nằm chung luồng ngân hàng nhưng có link = Không bấm! Mở App chính thức kiểm tra.',
  },
  {
    id: 'cg-q4',
    sectorNumber: 2,
    sectorName: 'Phân khu 02 · Giả Mạo SMS Brandname Ngân Hàng',
    complexityLevel: 'TỔNG HỢP ĐA TẦNG',
    cognitiveVector: 'Vishing (Giả nhân viên ngân hàng) + Chiếm đoạt mã kích hoạt Sinh trắc học',
    scenarioContext:
      '[CUỘC GỌI ĐẾN]: Kẻ tự xưng chuyên viên Hỗ trợ Sinh trắc học Ngân hàng đọc đúng Họ tên, 6 số cuối CCCD của bạn và nói: "Hệ thống cập nhật sinh trắc học của bạn bị lỗi đồng bộ. Tôi vừa gửi 1 mã OTP 6 số về máy bạn, hãy đọc mã đó để tôi đồng bộ từ xa giúp bạn không bị khóa chuyển khoản."',
    question:
      'Bản chất kỹ thuật của mã OTP 6 số vừa gửi về máy bạn trong tình huống này là gì?',
    options: [
      'Là mã xác nhận đồng bộ dữ liệu sinh trắc học từ tổng đài viên ngân hàng',
      'Là mã kích hoạt thiết bị mới (New Device Activation) hoặc mã xác nhận giao dịch chuyển tiền/đổi mật khẩu do kẻ gian đang đăng nhập tài khoản của bạn trên thiết bị của chúng',
      'Là mã kiểm tra đường truyền sóng viễn thông thông thường',
      'Có thể đọc cho nhân viên vì họ đã biết đúng 6 số cuối CCCD của mình',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Dữ liệu Họ tên và CCCD có thể bị lộ từ các vụ rò rỉ dữ liệu cũ. Khi kẻ gian có thông tin đăng nhập hoặc đang thực hiện tính năng "Quên mật khẩu / Đăng nhập thiết bị mới", ngân hàng gửi OTP về máy chủ tài khoản. Nếu đọc mã này, bạn chính thức trao quyền kiểm soát Smart OTP sang máy của kẻ lừa đảo.',
    threeSecondRule: 'Nhân viên ngân hàng thật KHÔNG BAO GIỜ hỏi mã OTP hay mật khẩu qua điện thoại.',
  },
  {
    id: 'cg-q5',
    sectorNumber: 3,
    sectorName: 'Phân khu 03 · Bẫy Đơn Hàng COD & Biên Lai Chỉnh Sửa',
    complexityLevel: 'TỔNG HỢP ĐA TẦNG',
    cognitiveVector: 'Giả Shipper gọi nhận hàng + Kịch bản "Chuyển nhầm tài khoản hội viên"',
    scenarioContext:
      '[CUỘC GỌI SHIPPER GIẢ]: "Em giao đơn hàng 280.000đ đặt trên sàn, em để ở bảo vệ rồi anh chuyển khoản cho em nhé." Sau khi nạn nhân chuyển 280.000đ, đối tượng lập tức gọi lại hoảng hốt: "Chết rồi anh chuyển vào số tài khoản Đăng Ký Thẻ Hội Viên Shipper của công ty em, mỗi tháng nó sẽ tự trừ 3.500.000đ! Bấm ngay vào link huydangky-giaohang.com để hủy tự động trừ tiền!"',
    question:
      'Trong kịch bản "Shipper báo chuyển nhầm tài khoản hội viên" này, đòn đánh thực sự gây thiệt hại hàng chục triệu đồng nằm ở bước nào?',
    options: [
      'Ở khoản tiền 280.000đ ban đầu mà nạn nhân đã chuyển',
      'Ở bước thao túng tâm lý hoảng sợ bị trừ 3,5 triệu/tháng để dụ nạn nhân truy cập link giả mạo, chia sẻ màn hình hoặc chuyển khoản theo "mã lệnh hủy" (thực chất là số tiền chuyển đi)',
      'Hệ thống ngân hàng thực sự có tính năng tự động trừ 3,5 triệu/tháng khi chuyển khoản thông thường',
      'Shipper thật sự muốn hoàn trả lại 280.000đ cho khách hàng',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Trong hệ thống chuyển khoản Napas 24/7 tại Việt Nam, việc bạn chuyển tiền vào một số tài khoản bất kỳ HOÀN TOÀN KHÔNG THỂ kích hoạt chế độ tự động trích nợ hàng tháng. Đây là lời bịa đặt 100% để gây hoảng loạn, ép nạn nhân làm theo hướng dẫn "nhập mã lệnh hủy 3500000" vào ô Số tiền chuyển khoản.',
    threeSecondRule: 'Chuyển khoản thường không bao giờ làm "tự động trừ tiền hàng tháng" — Ngắt máy ngay!',
  },
  {
    id: 'cg-q6',
    sectorNumber: 3,
    sectorName: 'Phân khu 03 · Bẫy Đơn Hàng COD & Biên Lai Chỉnh Sửa',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Fake Bill Generator + Lừa hoàn tiền chênh lệch',
    scenarioContext:
      '[GIAO DỊCH MUA BÁN]: Khách mua hàng gửi ảnh chụp màn hình "Chuyển khoản thành công 15.000.000đ" (lẽ ra chỉ 1.500.000đ) kèm lời nhắn: "Ôi mình bấm dư một số 0 rồi! Hiện mạng ngân hàng đang nghẽn chưa nổi tiền ngay, bạn chuyển trả gấp giúp mình 13.500.000đ vào số tài khoản này để mình đóng viện phí nhé!"',
    question:
      'Nguyên tắc phòng thủ tài chính bất di bất dịch nào giúp bạn miễn nhiễm 100% với thủ đoạn Fake Bill và hoàn tiền chênh lệch?',
    options: [
      'Kiểm tra kỹ phông chữ trên ảnh chụp biên lai, nếu thấy sắc nét thì chuyển hoàn lại ngay',
      'Chỉ xác nhận giao dịch khi số dư khả dụng thực tế trong ứng dụng ngân hàng của chính bạn đã tăng lên; tuyệt đối không hoàn tiền khi tiền chưa thực sự vào tài khoản và chỉ hoàn trả về đúng số tài khoản gốc đã chuyển đến',
      'Chuyển trả trước 50% số tiền chênh lệch để giữ uy tín với khách hàng',
      'Tin tưởng vì khách hàng nói đang cần đóng viện phí gấp',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Các công cụ tạo biên lai giả (Fake Bill) tạo ra ảnh chụp giống thật 99% chỉ trong 3 giây. Hơn nữa, nếu có trường hợp chuyển nhầm thật, kẻ gian thường dùng tài khoản của nạn nhân thứ 3 (tiền bẩn) rồi bảo bạn hoàn tiền sang tài khoản của chúng, biến bạn thành mắt xích rửa tiền.',
    threeSecondRule: 'Ảnh chụp biên lai = Vô giá trị. Chỉ tin Biến động số dư thực trong App của mình!',
  },
  {
    id: 'cg-q7',
    sectorNumber: 4,
    sectorName: 'Phân khu 04 · Bẫy Tình Cảm & Dẫn Dụ Đầu Tư (Pig Butchering)',
    complexityLevel: 'PHẢN XẠ TÂM LÝ HỌC',
    cognitiveVector: 'Love Bombing + Dopamine Mồi Nhử Rút Tiền Lần Đầu + Sunk Cost Fallacy',
    scenarioContext:
      '[KỊCH BẢN NUÔI MỒI 30 NGÀY]: Một người bạn quen qua mạng xã hội có ngoại hình hoàn hảo, trò chuyện tâm sự suốt 1 tháng, sau đó tiết lộ "khung giờ vàng chênh lệch tỷ giá vàng/ngoại hối quốc tế". Khi bạn nạp thử 2 triệu, bạn rút về tài khoản ngân hàng thật được 2,6 triệu trong 5 phút. Sau khi bạn gom 300 triệu nạp vào, hệ thống báo: "Tài khoản đóng băng do nghi ngờ rửa tiền, cần nộp thêm 20% thuế xác minh nguồn vốn (60 triệu) để mở khóa rút toàn bộ 420 triệu."',
    question:
      'Tại sao ở giai đoạn đầu kẻ lừa đảo lại chuyển trả tiền lãi thật về tài khoản ngân hàng của bạn, và điều gì xảy ra nếu bạn nộp thêm 60 triệu "thuế xác minh"?',
    options: [
      'Vì sàn giao dịch đó là sàn quốc tế thật nhưng đang gặp sự cố kiểm toán tạm thời',
      'Đó là "tiền mồi nhử" từ túi tội phạm nhằm xóa bỏ sự nghi ngờ và kích hoạt lòng tham; mọi con số trên web đều do admin chỉnh tay, nếu nộp thêm 60 triệu bạn sẽ mất trắng cả 360 triệu và bị đòi tiếp "phí bảo lãnh"',
      'Nộp nốt 60 triệu sẽ rút được toàn bộ 420 triệu vì hệ thống tự động giải ngân sau khi đóng thuế',
      'Chỉ cần thương lượng với bộ phận CSKH của sàn để trừ thuế trực tiếp vào số dư trên web',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Đây là mô hình "Pig Butchering" (Mổ heo) điển hình: Nuôi niềm tin bằng tình cảm → Cho ăn mồi lãi thật 1-2 lần đầu → Dụ nạp vốn lớn → Khóa cổng rút và vẽ ra hàng loạt loại phí (thuế thu nhập, phí chống rửa tiền, phí đường truyền VIP). Không một sàn tài chính hợp pháp nào bắt nộp thêm tiền mặt từ bên ngoài mới cho rút tiền gốc.',
    threeSecondRule: 'Sàn đầu tư bắt nạp thêm tiền thuế/phí mới cho rút tiền gốc = Dừng nạp 100%, báo Công an ngay!',
  },
  {
    id: 'cg-q8',
    sectorNumber: 4,
    sectorName: 'Phân khu 04 · Bẫy Tình Cảm & Dẫn Dụ Đầu Tư (Pig Butchering)',
    complexityLevel: 'TỔNG HỢP ĐA TẦNG',
    cognitiveVector: 'Tống tiền hình ảnh nhạy cảm (Sextortion) & Bẫy quà tặng hải quan',
    scenarioContext:
      '[TÌNH HUỐNG KÉP]: Một tài khoản làm quen qua mạng dụ dỗ gọi video riêng tư rồi dùng phần mềm quay/ghép mặt đe dọa phát tán cho toàn bộ danh sách bạn bè trường học nếu không chuyển 10.000.000đ để "xóa file gốc".',
    question:
      'Phản ứng nào dưới đây là đúng đắn nhất để bảo vệ bản thân trước tội phạm cưỡng đoạt tài sản qua mạng (Sextortion)?',
    options: [
      'Chuyển ngay 10.000.000đ theo yêu cầu vì tin rằng kẻ tống tiền sẽ giữ lời hứa xóa video',
      'Tuyệt đối không chuyển tiền (vì chuyển lần 1 chắc chắn sẽ bị tống tiền lần 2, lần 3), khóa bảo mật danh sách bạn bè, chụp toàn bộ bằng chứng tin nhắn/tài khoản nhận tiền và báo ngay cho Phụ huynh / Cơ quan Công an',
      'Xóa toàn bộ tin nhắn bằng chứng trên máy của mình rồi tự vay tiền qua app để trả cho kẻ gian',
      'Tiếp tục gửi thêm thông tin cá nhân để xin kẻ gian thương tình',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Thống kê tội phạm học chỉ ra 98% kẻ tống tiền qua mạng sẽ tiếp tục đòi tiền nhiều lần nữa nếu nạn nhân chuyển tiền lần đầu (vì chúng xác định được nạn nhân sợ hãi và có khả năng xoay tiền). Giữ nguyên bằng chứng số, khóa quyền riêng tư mạng xã hội và trình báo cơ quan chức năng là cách duy nhất cắt đứt chuỗi cưỡng đoạt.',
    threeSecondRule: 'Bị đe dọa tống tiền qua mạng: Không chuyển tiền — Giữ bằng chứng — Báo người lớn & Công an.',
  },
  {
    id: 'cg-q9',
    sectorNumber: 5,
    sectorName: 'Phân khu 05 · Tuyển CTV Làm Nhiệm Vụ Telegram',
    complexityLevel: 'PHẢN XẠ TÂM LÝ HỌC',
    cognitiveVector: 'Bằng chứng xã hội giả (Echo Chamber / Chim mồi) + Nhiệm vụ liên hoàn',
    scenarioContext:
      '[NHÓM TELEGRAM "CTV DUYỆT ĐƠN THƯƠNG MẠI ĐIỆN TỬ"]: Trong nhóm có 400 thành viên liên tục gửi ảnh nhận hoa hồng 500k - 2 triệu/ngày. Sau 3 nhiệm vụ bấm Thích video nhận được 90.000đ thật, "Điều phối viên" đưa bạn vào Nhiệm vụ Liên Hoàn 3 đơn: Đơn 1 (500k) hoàn thành, Đơn 2 (3 triệu) hoàn thành, nhưng đến Đơn 3 hệ thống nhảy ra "Đơn hàng Đặc Biệt 25.000.000đ" và báo bạn thao tác sai cú pháp nội dung chuyển khoản nên phải nạp thêm 25.000.000đ nữa để sửa lỗi.',
    question:
      'Sự thật đằng sau nhóm 400 thành viên khoe lãi và thông báo "sai cú pháp nội dung chuyển khoản" là gì?',
    options: [
      '399 thành viên còn lại trong nhóm đều là tài khoản Bot/Chim mồi của đường dây lừa đảo, và lỗi "sai cú pháp" là kịch bản được lập trình sẵn để ép nạn nhân nạp gấp đôi số tiền mà không bao giờ rút ra được',
      'Do bạn thực sự gõ nhầm dấu cách trong nội dung chuyển khoản nên hệ thống kế toán tự động bị treo',
      'Những người khoe biên lai trong nhóm là cộng tác viên thật đã làm việc lâu năm',
      'Chỉ cần vay bạn bè nạp nốt 25 triệu sửa lỗi cú pháp là rút được cả 53,5 triệu về',
    ],
    correctIndex: 0,
    forensicBreakdown:
      'Tội phạm sử dụng phần mềm điều khiển hàng trăm tài khoản Telegram ảo (Seeding Bots) tung hứng kịch bản để tạo hiệu ứng tâm lý đám đông (Social Proof). Cái bẫy "Nhiệm vụ liên hoàn vượt quá số dư" và "Sai cú pháp chuyển khoản" là hai kịch bản kinh điển để khóa tiền của nạn nhân.',
    threeSecondRule: 'Việc làm thêm online bắt nạp tiền trước để làm nhiệm vụ = 100% Lừa đảo CTV.',
  },
  {
    id: 'cg-q10',
    sectorNumber: 5,
    sectorName: 'Phân khu 05 · Tuyển CTV Làm Nhiệm Vụ Telegram',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Lừa thuê/mua tài khoản ngân hàng & CTV nhận hộ tiền hoa hồng',
    scenarioContext:
      '[TIN TUYỂN DỤNG HỌC SINH/SINH VIÊN]: "Tuyển CTV nhận tiền thanh toán hộ cho công ty game nước ngoài: Chỉ cần cho thuê tài khoản ngân hàng hoặc nhận tiền chuyển vào rồi chuyển tiếp sang tài khoản chỉ định, hưởng ngay 5% hoa hồng mỗi giao dịch (kiếm 1-2 triệu/ngày không cần vốn)."',
    question:
      'Rủi ro pháp lý nghiêm trọng nhất khi học sinh, sinh viên tham gia công việc "nhận tiền hộ hưởng hoa hồng" hoặc cho thuê tài khoản ngân hàng là gì?',
    options: [
      'Không có rủi ro gì vì mình không phải bỏ vốn cá nhân',
      'Trực tiếp tiếp tay cho hành vi Rửa tiền hoặc Tiêu thụ tài sản do người khác phạm tội mà có; khi nạn nhân bị lừa báo Công an, chủ tài khoản nhận tiền sẽ bị phong tỏa toàn bộ tài khoản và bị truy cứu trách nhiệm pháp lý',
      'Chỉ bị ngân hàng nhắc nhở qua tin nhắn SMS',
      'Là công việc làm thêm hợp pháp phổ biến trong lĩnh vực tài chính số',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Theo quy định pháp luật Việt Nam (Nghị định 144/2021/NĐ-CP và Bộ luật Hình sự), hành vi mua bán, cho thuê, cho mượn tài khoản ngân hàng hoặc nhận-chuyển tiền bẩn giúp tội phạm lừa đảo bị xử phạt rất nặng và liên đới trách nhiệm hình sự về tội Rửa tiền (Điều 324 BLHS).',
    threeSecondRule: 'Tuyệt đối không cho thuê, cho mượn tài khoản ngân hàng hoặc nhận chuyển tiền hộ người lạ.',
  },
  {
    id: 'cg-q11',
    sectorNumber: 6,
    sectorName: 'Phân khu 06 · Giả Danh Công An / Viện Kiểm Sát',
    complexityLevel: 'PHẢN XẠ TÂM LÝ HỌC',
    cognitiveVector: 'Uy hiếp quyền lực (Authority Bias) + Cô lập thông tin ("Bắt cóc online")',
    scenarioContext:
      '[CUỘC GỌI VIDEO ZALO]: Đối tượng mặc trang phục Công an/Kiểm sát viên, chiếu hình ảnh "Lệnh bắt tạm giam và Phong tỏa tài sản" có đúng Họ tên, số CCCD của bạn vì liên quan đường dây rửa tiền. Đối tượng ra lệnh: "Đây là chuyên án mật cấp Quốc gia, yêu cầu em thuê nhà nghỉ ở một mình, tuyệt đối không báo cho bố mẹ, bật camera 24/24 và chuyển toàn bộ tiền tiết kiệm của gia đình vào Tài Khoản Tạm Giữ Thanh Tra để chứng minh trong sạch!"',
    question:
      'Đâu là 3 vi phạm tố tụng chứng minh 100% đây là tội phạm giả danh Công an thực hiện kịch bản "Bắt cóc online / Thao túng cô lập"?',
    options: [
      'Cơ quan Công an, Viện Kiểm sát KHÔNG BAO GIỜ làm việc hay tống đạt Lệnh bắt qua Zalo/điện thoại; KHÔNG BAO GIỜ yêu cầu công dân chuyển tiền vào tài khoản để "chứng minh trong sạch"; và KHÔNG BAO GIỜ yêu cầu công dân tự nhốt mình trong nhà nghỉ cắt liên lạc với gia đình',
      'Lệnh bắt có con dấu đỏ trên màn hình điện thoại nên có giá trị pháp lý tạm thời',
      'Cần làm theo yêu cầu giữ bí mật tuyệt đối với bố mẹ để tránh ảnh hưởng điều tra',
      'Chỉ chuyển 50% số tiền vào tài khoản tạm giữ để thể hiện thiện chí hợp tác',
    ],
    correctIndex: 0,
    forensicBreakdown:
      'Theo Bộ luật Tố tụng Hình sự Việt Nam, mọi hoạt động triệu tập, làm việc đều phải có Giấy triệu tập gửi trực tiếp qua chính quyền/công an địa phương và làm việc tại trụ sở cơ quan nhà nước. Đặc biệt, cụm từ "Tài khoản tạm giữ xác minh trong sạch" hoàn toàn không tồn tại trong hệ thống pháp luật.',
    threeSecondRule: 'Công an không làm việc qua Zalo, không gửi lệnh bắt qua mạng, không đòi chuyển tiền chứng minh trong sạch!',
  },
  {
    id: 'cg-q12',
    sectorNumber: 6,
    sectorName: 'Phân khu 06 · Giả Danh Công An / Viện Kiểm Sát',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Giả danh Cán bộ Công an Phường hướng dẫn đồng bộ VNeID Mức 2',
    scenarioContext:
      '[CUỘC GỌI]: "Chào anh/chị, tôi là cán bộ Công an phường phụ trách hộ khẩu. Dữ liệu tích hợp Giấy phép lái xe và Bảo hiểm y tế trên VNeID của anh/chị bị sai lệch. Anh/chị kết bạn Zalo với tôi và truy cập cổng dichvucong-capnhat-vneid.com để tải bản vá đồng bộ ngay hôm nay."',
    question:
      'Cách kiểm tra pháp y tên miền nào giúp nhận diện ngay lập tức trang web Cổng Dịch Vụ Công / VNeID giả mạo?',
    options: [
      'Trang web có quốc huy và giao diện màu đỏ vàng giống ứng dụng thật là trang an toàn',
      'Mọi cổng thông tin cơ quan nhà nước Việt Nam bắt buộc có đuôi tên miền cấp cao là ".gov.vn" (ví dụ dichvucong.gov.vn, vneid.gov.vn); tên miền có đuôi ".com", ".net", ".org", ".vn" ghép từ khóa đều là giả mạo',
      'Nếu người gọi biết đúng địa chỉ thường trú của mình thì đường link đó là thật',
      'Tải thử tệp tin về máy rồi mới kiểm tra sau',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Tên miền ".gov.vn" được Trung tâm Internet Việt Nam (VNNIC) cấp phát độc quyền và kiểm duyệt nghiêm ngặt cho cơ quan Nhà nước. Kẻ lừa đảo không thể đăng ký ".gov.vn" nên phải tạo các tên miền thương mại như "dichvucong-vneid.com" để lừa người dùng tải mã độc APK.',
    threeSecondRule: 'Cơ quan Nhà nước chỉ dùng tên miền .gov.vn — Tuyệt đối không tải app VNeID qua đường link ngoài!',
  },
  {
    id: 'cg-q13',
    sectorNumber: 7,
    sectorName: 'Phân khu 07 · Mã Độc Quishing QR & Chiếm Quyền Thiết Bị',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Malware APK + Quyền Trợ năng (Accessibility Service) + Overlay Screen',
    scenarioContext:
      '[QUÉT MÃ QR LẠ]: Sau khi quét một mã QR dán tại điểm công cộng hoặc trong tin nhắn, điện thoại Android tải về tệp "VNeID_Sync_v4.2.apk". Khi cài đặt, ứng dụng yêu cầu bật quyền "Dịch vụ hỗ trợ tiếp cận (Accessibility Service)" và sau đó màn hình điện thoại bỗng tối đen, hiển thị dòng chữ "Đang cập nhật hệ thống 15%... Vui lòng không tắt máy".',
    question:
      'Điều gì đang thực sự diễn ra bên dưới màn hình đen "Đang cập nhật hệ thống 15%..." và bạn phải xử lý khẩn cấp như thế nào trong 5 giây đầu tiên?',
    options: [
      'Điện thoại đang cập nhật phần mềm chính hãng, cần chờ chạy đủ 100%',
      'Tin tặc đang dùng lớp phủ màn hình (Screen Overlay) che mắt bạn trong khi điều khiển ngầm điện thoại mở App ngân hàng, tự đọc mã Smart OTP và rút sạch tiền; phải lập tức NGẮT KẾT NỐI MẠNG (Tắt Wi-Fi, rút khay SIM hoặc tắt nguồn cưỡng bức bằng phím cứng)',
      'Chỉ cần bấm nút Quay lại (Back) trên màn hình cảm ứng là thoát được',
      'Gọi điện cho người gửi mã QR để hỏi mật khẩu mở khóa màn hình',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Quyền Accessibility Service cho phép phần mềm độc hại đọc mọi ký tự trên màn hình (kể cả mật khẩu, mã PIN Smart OTP) và tự động thực hiện thao tác chạm/vuốt thay người dùng. Lớp phủ "Đang cập nhật..." dùng để vô hiệu hóa cảm ứng của nạn nhân. Rút khay SIM + Tắt nguồn bộ định tuyến Wi-Fi sẽ cắt đứt ngay lập tức kênh điều khiển từ xa (C2 Server) của hacker.',
    threeSecondRule: 'Máy tự nhảy cảm ứng hoặc hiện màn hình cập nhật lạ: Rút SIM + Tắt Wi-Fi + Tắt nguồn cứng ngay lập tức!',
  },
  {
    id: 'cg-q14',
    sectorNumber: 7,
    sectorName: 'Phân khu 07 · Mã Độc Quishing QR & Chiếm Quyền Thiết Bị',
    complexityLevel: 'TỔNG HỢP ĐA TẦNG',
    cognitiveVector: 'Dán đè mã QR tại quán ăn / cửa hàng & QR đánh cắp phiên đăng nhập Zalo',
    scenarioContext:
      '[TÌNH HUỐNG QUÉT QR]: Bạn nhận được tin nhắn từ một trang bình chọn cuộc thi học sinh yêu cầu: "Mở ứng dụng Zalo, quét mã QR trên màn hình web và bấm nút [Đăng nhập] để xác nhận phiếu bầu hợp lệ".',
    question:
      'Hậu quả kỹ thuật tức thời khi bạn dùng Zalo quét mã QR đó và bấm xác nhận là gì?',
    options: [
      'Phiếu bầu của bạn được hệ thống cuộc thi ghi nhận thành công',
      'Bạn vừa trao toàn bộ phiên đăng nhập Zalo Web (Session Token) cho máy tính của kẻ lừa đảo; chỉ trong 30 giây, bot tự động của chúng sẽ nhắn tin vay tiền hoặc gửi link lừa đảo cho toàn bộ người thân, bạn bè trong danh bạ của bạn',
      'Zalo không cho phép đăng nhập trên thiết bị khác qua mã QR',
      'Chỉ lộ ảnh đại diện công khai chứ không lộ tin nhắn',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Đây là kỹ thuật QRLJacking (Quick Response Code Login Jacking). Mã QR trên trang web lừa đảo thực chất là mã QR đăng nhập Zalo Web trên trình duyệt của tin tặc được phát trực tiếp (stream) lên trang bình chọn giả.',
    threeSecondRule: 'Không bao giờ dùng Zalo/Ngân hàng quét mã QR để "bình chọn" hay "xác nhận tài khoản".',
  },
  {
    id: 'cg-q15',
    sectorNumber: 8,
    sectorName: 'Phân khu 08 · Áp Lực Thời Gian Khẩn Cấp & Đánh Cắp OTP',
    complexityLevel: 'PHẢN XẠ TÂM LÝ HỌC',
    cognitiveVector: 'Bắt cóc Hạch hạnh nhân (Amygdala Hijack) — Cấp cứu bệnh viện giả',
    scenarioContext:
      '[CUỘC GỌI KHẨN CẤP ĐẾN PHỤ HUYNH]: "Alo phụ huynh em Minh lớp 10A phải không? Tôi là bác sĩ khoa Cấp cứu Bệnh viện Chợ Rẫy! Cháu vừa bị tai nạn chấn thương sọ não trên đường đi học về, đang xuất huyết não nguy kịch, phải chuyển gấp 30.000.000đ tiền mổ và huyết thanh đặc trị vào tài khoản cá nhân của bác sĩ trực ca trong 5 phút nếu không sẽ không kịp cứu cháu!"',
    question:
      'Cơ chế thần kinh học nào khiến nhiều phụ huynh sập bẫy ngay trong 5 phút đầu, và quy trình xác minh 3 bước chuẩn xác nhất là gì?',
    options: [
      'Cơn hoảng loạn kích hoạt Hạch hạnh nhân (Amygdala Hijack) làm tê liệt Vỏ não trước trán (tư duy logic); Quy trình chuẩn: (1) Hít thở sâu ngắt nhịp ép thời gian, (2) Gọi trực tiếp cho Giáo viên chủ nhiệm / Nhà trường / Bạn cùng lớp của con, (3) Tuyệt đối không chuyển tiền viện phí vào tài khoản cá nhân',
      'Phải chuyển ngay 30 triệu vào tài khoản cá nhân của người gọi rồi mới gọi cho giáo viên chủ nhiệm sau',
      'Bệnh viện công lập thường yêu cầu chuyển viện phí vào tài khoản cá nhân của bác sĩ trước khi cấp cứu',
      'Tiếp tục giữ máy nói chuyện với người lạ để họ không tắt máy',
    ],
    correctIndex: 0,
    forensicBreakdown:
      'Theo quy định của Bộ Y tế (Luật Khám bệnh, chữa bệnh), mọi trường hợp cấp cứu nguy kịch đến tính mạng đều được bệnh viện ưu tiên cấp cứu ngay lập tức trước khi làm thủ tục viện phí, và viện phí chỉ thu qua tài khoản kho bạc/phòng tài vụ của bệnh viện, không bao giờ chuyển vào tài khoản cá nhân bác sĩ.',
    threeSecondRule: 'Tin dữ khẩn cấp đòi chuyển tiền trong 5 phút = Dừng lại 60 giây, gọi Giáo viên chủ nhiệm & Trường học xác minh!',
  },
  {
    id: 'cg-q16',
    sectorNumber: 8,
    sectorName: 'Phân khu 08 · Áp Lực Thời Gian Khẩn Cấp & Đánh Cắp OTP',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'SIM Swap (Chiếm quyền eSIM / Đổi SIM trắng) qua cú pháp nhà mạng',
    scenarioContext:
      '[KỊCH BẢN GIẢ NHÂN VIÊN VIỄN THÔNG]: "Thuê bao của quý khách sắp bị khóa 2 chiều sau 2 giờ nữa do chuẩn hóa thông tin thuê bao. Vui lòng soạn tin nhắn theo cú pháp DS [Số Seri SIM: 898404...] gửi 900 hoặc đọc mã OTP từ tổng đài nhà mạng gửi về để giữ sóng."',
    question:
      'Nếu bạn thực hiện cú pháp tin nhắn hoặc đọc mã OTP nhà mạng trên, điều gì sẽ xảy ra với chiếc SIM trong máy bạn sau 60 giây?',
    options: [
      'SIM của bạn được nâng cấp lên sóng 5G miễn phí',
      'SIM vật lý trên máy bạn lập tức mất sóng ("Không có dịch vụ") vì số điện thoại của bạn đã bị chuyển sang phôi SIM trắng/eSIM trong tay kẻ lừa đảo (SIM Swap); từ đó chúng nhận toàn bộ mã OTP ngân hàng của bạn',
      'Chỉ thay đổi gói cước dữ liệu di động hàng tháng',
      'Không ảnh hưởng gì đến tài khoản ngân hàng',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Dãy số 19-20 chữ số bắt đầu bằng 8984... chính là số seri của phôi SIM trắng mà kẻ gian đang cầm sẵn. Khi bạn nhắn tin cú pháp đổi SIM hoặc đọc OTP nhà mạng, hệ thống viễn thông sẽ hủy SIM cũ của bạn và kích hoạt SIM mới cho kẻ gian.',
    threeSecondRule: 'Không bao giờ nhắn tin cú pháp lạ hay đọc OTP nhà mạng — Điện thoại bỗng dưng mất sóng bất thường phải khóa ngân hàng ngay!',
  },
  {
    id: 'cg-q17',
    sectorNumber: 9,
    sectorName: 'Phân khu 09 · Deepfake Video Call & Nhân Bản Giọng Nói AI',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Real-time Face-Swap Deepfake + Rclone Voice Synthesis',
    scenarioContext:
      '[CUỘC GỌI VIDEO MESSENGER 8 GIÂY]: Tài khoản Facebook của người chú ruột gọi video cho bạn. Trên màn hình đúng là khuôn mặt của chú và giọng chú nói: "Chú đang ở ngân hàng bị lỗi hạn mức, cháu chuyển gấp giúp chú 15 triệu qua số tài khoản của đối tác chú gửi bên dưới nhé, mạng yếu quá..." rồi cuộc gọi tự ngắt sau 8 giây.',
    question:
      'Sự kết hợp của những dấu hiệu pháp y nào vạch trần đây là cuộc gọi AI Deepfake và đâu là bài kiểm tra vật lý (Physical Challenge) mà AI thời gian thực dễ bị lộ nhất?',
    options: [
      'Khuôn mặt và giọng nói giống chú nên chắc chắn 100% là người thật',
      'Thời lượng cực ngắn (<10s) viện cớ sóng yếu để cắt máy + chuyển tiền vào số tài khoản tên người lạ; nếu gọi lại trực tiếp qua số điện thoại di động hoặc yêu cầu người trong video vẫy bàn tay cắt ngang trước mặt / quay nghiêng góc 90 độ, mô hình Deepfake sẽ bị vỡ khung hình (glitch) ngay lập tức',
      'Chỉ cần nhắn tin hỏi lại trên chính tài khoản Messenger vừa gọi xem có phải chú thật không',
      'AI hiện nay chưa thể giả giọng nói tiếng Việt theo vùng miền',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Chỉ cần 3-5 giây âm thanh và một đoạn video ngắn công khai trên mạng xã hội, AI có thể tổng hợp giọng nói (Voice Cloning) và ghép mặt (Deepfake). Tuy nhiên, mô hình Deepfake rất sợ các tương tác vật lý thời gian thực (che mặt nghiêng đầu) nên kẻ gian luôn phát đoạn video dựng sẵn dài 5-10 giây rồi tự cúp máy đổ lỗi cho mạng yếu.',
    threeSecondRule: 'Video call ngắn mượn tiền chuyển sang tên người lạ = Gọi lại bằng SĐT di động thường + Hỏi Mật khẩu gia đình!',
  },
  {
    id: 'cg-q18',
    sectorNumber: 9,
    sectorName: 'Phân khu 09 · Deepfake Video Call & Nhân Bản Giọng Nói AI',
    complexityLevel: 'PHẢN XẠ TÂM LÝ HỌC',
    cognitiveVector: 'Thiết lập Giao thức Mật khẩu Gia đình (Family Safe-Word Protocol)',
    scenarioContext:
      '[KỊCH BẢN PHÒNG THỦ CHỦ ĐỘNG]: Gia đình bạn muốn thiết lập một "Mật khẩu xác thực gia đình (Safe-Word)" để chống lại mọi công nghệ AI giả giọng nói và Deepfake trong tương lai.',
    question:
      'Tiêu chí nào dưới đây tạo nên một "Mật khẩu gia đình (Safe-Word)" an toàn tuyệt đối mà tin tặc và AI không thể khai thác từ mạng xã hội (OSINT)?',
    options: [
      'Đặt mật khẩu là ngày tháng năm sinh của con hoặc tên trường học của con',
      'Đặt mật khẩu là tên thú cưng hoặc biệt danh hay đăng công khai trên Facebook',
      'Một câu hỏi - đáp ngẫu nhiên chỉ thống nhất trực tiếp bằng lời nói giữa các thành viên trong nhà (tuyệt đối không lưu trên tin nhắn Zalo/Messenger và không liên quan thông tin công khai), ví dụ: Hỏi "Tối qua nhà mình ăn món gì?" thì đáp án mật định luôn là "Món cá kho tộ"',
      'Gửi mật khẩu gia đình vào nhóm chat Messenger của gia đình và ghim lên đầu cuộc trò chuyện',
    ],
    correctIndex: 2,
    forensicBreakdown:
      'Nếu lưu mật khẩu gia đình trong nhóm chat Messenger/Zalo, khi một tài khoản trong gia đình bị hack, kẻ gian sẽ đọc được tin nhắn ghim và biết luôn mật khẩu đó. Do đó, Safe-Word phải được thỏa thuận ngoại tuyến (offline) và không thể suy đoán từ thông tin công khai.',
    threeSecondRule: 'Mật khẩu gia đình phải thỏa thuận trực tiếp ngoài đời — Không bao giờ nhắn hay ghim trên mạng xã hội!',
  },
  {
    id: 'cg-q19',
    sectorNumber: 10,
    sectorName: 'Phân khu 10 · Lừa Đảo Web3, Ví Tiền Số & Đầu Tư Ảo',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Malicious Smart Contract Approval (Unlimited Token Allowance / Wallet Drainer)',
    scenarioContext:
      '[AIRDROP WEB3]: Bạn nhận được một đồng NFT/Token lạ miễn phí trong ví tiền mã hóa kèm thông báo truy cập trang web nhận thưởng. Khi kết nối ví, cửa sổ ký giao dịch hiện yêu cầu: "SetApprovalForAll / Approve Unlimited USDT Allowance to Spender 0x8f9c...dead".',
    question:
      'Nếu bạn bấm nút "Xác nhận / Sign" giao dịch cấp quyền (Approve Unlimited Allowance) trên, hậu quả kỹ thuật nào sẽ xảy ra mặc dù bạn KHÔNG hề tiết lộ cụm 12 từ khóa khôi phục (Seed Phrase)?',
    options: [
      'Không thể mất tiền vì bạn chưa nhập 12 từ khóa Seed Phrase cho ai',
      'Hợp đồng thông minh độc hại (Wallet Drainer) được cấp toàn quyền rút cạn toàn bộ số dư USDT/NFT trong ví của bạn bất cứ lúc nào mà không cần hỏi lại chữ ký của bạn',
      'Chỉ tốn một khoản phí mạng (Gas fee) vài xu nhỏ',
      'Ví của bạn sẽ nhận được gấp đôi số lượng Token thưởng',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Trong kiến trúc EVM/Web3, hàm `approve(spender, uint256.max)` hoặc `setApprovalForAll(operator, true)` trao quyền điều khiển toàn bộ tài sản trong ví của bạn cho địa chỉ hợp đồng của kẻ tấn công. Chúng có thể gọi hàm `transferFrom` để rút sạch ví mà không cần biết Seed Phrase.',
    threeSecondRule: 'Không tương tác Token lạ rơi vào ví; kiểm tra kỹ hàm Approve trước khi ký và thu hồi quyền tại Revoke.cash.',
  },
  {
    id: 'cg-q20',
    sectorNumber: 10,
    sectorName: 'Phân khu 10 · Lừa Đảo Web3, Ví Tiền Số & Đầu Tư Ảo',
    complexityLevel: 'TỔNG HỢP ĐA TẦNG',
    cognitiveVector: 'Bẫy nhờ rút hộ ví USDT với Seed Phrase công khai (Honey-pot Gas Trap)',
    scenarioContext:
      '[BÌNH LUẬN TRÊN YOUTUBE / TELEGRAM]: Một tài khoản đăng tải công khai 12 từ khóa khôi phục ví (Seed Phrase) kèm lời nhắn: "Tôi ở nước ngoài không biết cách rút tiền, trong ví của tôi có 12.000 USDT, ai vào rút giúp tôi xin tặng lại 2.000 USDT!". Khi bạn nhập 12 từ khóa đó vào ví, bạn thấy đúng là có 12.000 USDT thật nhưng thiếu 15 USD phí mạng (TRX/ETH) để chuyển đi.',
    question:
      'Điều gì sẽ xảy ra ngay trong tích tắc bạn nạp 15 USD phí mạng (Gas fee) vào chiếc ví có sẵn 12.000 USDT đó?',
    options: [
      'Bạn sẽ rút thành công toàn bộ 12.000 USDT về ví cá nhân của mình',
      'Đây là "Ví bẫy mật ngọt (Honey-pot Wallet)" đã bị khóa quyền chuyển USDT bằng cơ chế Đa chữ ký (Multi-sig); ngay trong 0,5 giây khi bạn nạp 15 USD phí mạng vào, Bot tự động (Sweeper Bot) của kẻ lừa đảo sẽ quét sạch 15 USD của bạn',
      'Do mạng blockchain bị nghẽn nên cần nạp thêm 50 USD phí mạng nữa mới rút được',
      'Chủ ví thật sự là người tốt bụng muốn tặng tiền cho cộng đồng',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Kẻ lừa đảo cố tình công khai Seed Phrase của một chiếc ví đã được cấu hình Multi-sig (cần chữ ký của ví thứ 2 mới rút được 12.000 USDT) và cài sẵn Sweeper Bot giám sát từng block. Hàng ngàn người tham lam nạp 10-20 USD phí mạng vào để cố rút 12.000 USDT đều bị Bot rút sạch số tiền phí đó.',
    threeSecondRule: 'Seed Phrase đăng công khai có sẵn hàng ngàn đô = 100% Ví bẫy Sweeper Bot ăn cắp phí Gas!',
  },
  {
    id: 'cg-q21',
    sectorNumber: 11,
    sectorName: 'Phân khu 11 · Mạng Wi-Fi Evil Twin & Trạm Sạc Công Cộng',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Evil Twin Wi-Fi + Captive Portal Credential Harvesting',
    scenarioContext:
      '[TẠI QUÁN CÀ PHÊ / SÂN BAY]: Bạn kết nối vào mạng Wi-Fi không mật khẩu có tên "Free_Highlands_VIP_5G". Ngay khi kết nối, trình duyệt tự động bật lên trang đăng nhập (Captive Portal) yêu cầu: "Đăng nhập bằng tài khoản Facebook hoặc Google của bạn để kích hoạt 2 giờ truy cập Internet tốc độ cao miễn phí".',
    question:
      'Cơ chế tấn công nào đang diễn ra và cách phòng vệ an toàn nhất khi buộc phải dùng Internet ở nơi công cộng là gì?',
    options: [
      'Đây là tính năng xác thực an toàn tiêu chuẩn của các quán cà phê lớn',
      'Kẻ tấn công đang phát sóng trạm Wi-Fi giả mạo (Evil Twin AP) kết hợp trang Captive Portal giả để đánh cắp mật khẩu & Cookie phiên đăng nhập mạng xã hội; tuyệt đối không nhập tài khoản trên trang chào Wi-Fi và ưu tiên dùng dữ liệu di động 4G/5G cá nhân cho các giao dịch quan trọng',
      'Chỉ cần bật chế độ Ẩn danh (Incognito) trên trình duyệt là trang Captive Portal không lấy được mật khẩu',
      'Mạng có chữ "5G" và "VIP" luôn được mã hóa phần cứng an toàn',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Chỉ với một thiết bị Wi-Fi Pineapple nhỏ gọn trong ba lô, tin tặc có thể phát sóng một SSID trùng tên quán cà phê với cường độ mạnh hơn để thiết bị tự động kết nối, sau đó dựng trang Captive Portal giả mạo giao diện đăng nhập Google/Facebook nhằm thu hoạch tài khoản.',
    threeSecondRule: 'Wi-Fi công cộng đòi đăng nhập Facebook/Email hoặc khi cần chuyển khoản ngân hàng = Tắt Wi-Fi, bật 4G/5G!',
  },
  {
    id: 'cg-q22',
    sectorNumber: 11,
    sectorName: 'Phân khu 11 · Mạng Wi-Fi Evil Twin & Trạm Sạc Công Cộng',
    complexityLevel: 'PHÁP Y KỸ THUẬT SỐ',
    cognitiveVector: 'Juice Jacking (Cáp sạc USB tích hợp vi mạch HID / Truyền dữ liệu)',
    scenarioContext:
      '[TẠI BẾN XE / TRUNG TÂM THƯƠNG MẠI]: Điện thoại của bạn còn 5% pin. Bạn cắm điện thoại vào một sợi cáp sạc có sẵn tại trụ sạc miễn phí. Ngay lập tức trên màn hình điện thoại hiện thông báo: "Cho phép thiết bị này truy cập dữ liệu / Tin cậy máy tính này (Trust This Computer)?"',
    question:
      'Thông báo "Tin cậy máy tính này / Truyền tệp" khi cắm cáp sạc công cộng cảnh báo mối nguy hiểm nào?',
    options: [
      'Trụ sạc đang kích hoạt công nghệ sạc siêu nhanh nên cần quyền truy cập bộ nhớ',
      'Đầu cáp sạc hoặc cổng USB đã bị gắn vi mạch độc hại (như O.MG Cable / Juice Jacking) đang cố thiết lập kết nối truyền dữ liệu (Data Pins D+/D-) để sao chép dữ liệu hoặc tiêm mã độc; phải bấm "Không tin cậy / Chỉ sạc" và rút cáp ra ngay',
      'Chỉ cần bấm "Cho phép" để pin vào nhanh hơn 50%',
      'Cáp sạc USB chỉ có dây dẫn điện chứ không có dây truyền dữ liệu',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Cổng USB tiêu chuẩn có 4-5 chân tiếp xúc, trong đó ngoài chân nguồn (VCC/GND) còn có các chân truyền dữ liệu (D+/D-). Tội phạm có thể giấu một máy tính siêu nhỏ ngay trong đầu cáp sạc. Hãy luôn mang theo củ sạc cắm ổ điện 220V, pin dự phòng cá nhân hoặc dùng đầu chặn dữ liệu (USB Data Blocker).',
    threeSecondRule: 'Cắm sạc nơi công cộng mà máy hỏi "Tin cậy thiết bị / Truyền dữ liệu" = Rút cáp ra ngay lập tức!',
  },
  {
    id: 'cg-q23',
    sectorNumber: 12,
    sectorName: 'Phân khu 12 · Dịch Vụ Thu Hồi Tiền Lừa Đảo (Bẫy Kép)',
    complexityLevel: 'TỔNG HỢP ĐA TẦNG',
    cognitiveVector: 'Double-Dip Recovery Scam — Đánh vào tâm lý tuyệt vọng muốn gỡ gạc',
    scenarioContext:
      '[QUẢNG CÁO FACEBOOK SAU KHI BỊ LỪA]: Một trang có tích xanh giả tên "Trung Tâm Luật Sư & An Ninh Mạng Hỗ Trợ Thu Hồi Vốn Treo 24/7" chạy quảng cáo kèm hình ảnh trụ sở Cục An ninh mạng. Khi nạn nhân nhắn tin, trang này gửi một ảnh chụp màn hình "Hệ thống Cổng Thanh Toán Quốc Tế đã tìm thấy và đóng băng khoản tiền 85.000.000đ của bạn" và yêu cầu nộp 8.500.000đ (10% phí mở cổng giải ngân & thuế phí luật sư) để bắn tiền về tài khoản trong 30 phút.',
    question:
      'Tại sao đây được gọi là "Đòn sát thương kép (Double-Dip Scam)" và đâu là quy trình pháp lý DUY NHẤT có thẩm quyền phong tỏa, thu hồi tiền bị lừa đảo tại Việt Nam?',
    options: [
      'Nên đóng thử 8,5 triệu vì họ đã gửi ảnh chụp màn hình thấy đúng số tiền 85 triệu của mình bị treo',
      '100% các trang mạng nhận "thu hồi tiền lừa đảo / kéo vốn treo / hacker mũ trắng lấy lại tiền" đều là lừa đảo (thậm chí chính là nhóm đã lừa bạn ở lần 1 đổi vai); tại Việt Nam, CHỈ CÓ Cơ quan Công an phối hợp với Ngân hàng theo trình tự tố tụng mới có thẩm quyền tra soát, phong tỏa tài khoản tội phạm và hoàn toàn KHÔNG thu "phí giải ngân"',
      'Các văn phòng luật sư trên Facebook có quyền truy cập hệ thống liên ngân hàng Napas để rút tiền từ tài khoản kẻ gian trả lại cho bạn',
      'Trang có chạy quảng cáo được tài trợ trên Facebook thì đã được kiểm duyệt pháp lý',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Không một cá nhân, hacker hay văn phòng luật sư nào có quyền can thiệp vào hệ thống lõi của ngân hàng (Core Banking) để "kéo tiền" từ tài khoản người khác. Hình ảnh "Tìm thấy khoản tiền 85.000.000đ bị đóng băng" chỉ là một mẫu HTML giả mạo điền lại đúng con số mà nạn nhân vừa kể cho chúng nghe.',
    threeSecondRule: 'Mọi dịch vụ "Thu hồi tiền lừa đảo / Kéo vốn treo" trên mạng = 100% Lừa đảo lần 2! Chỉ trình báo trực tiếp tại Công an.',
  },
  {
    id: 'cg-q24',
    sectorNumber: 12,
    sectorName: 'Phân khu 12 · Dịch Vụ Thu Hồi Tiền Lừa Đảo (Bẫy Kép)',
    complexityLevel: 'TỔNG HỢP ĐA TẦNG',
    cognitiveVector: 'Quy trình Ứng cứu Khẩn cấp Giờ Vàng (Golden Hour Incident Response)',
    scenarioContext:
      '[TÌNH HUỐNG THỰC CHIẾN CUỐI CÙNG]: Một người thân trong gia đình bạn vừa phát hiện mình vừa chuyển khoản 50.000.000đ cho đối tượng lừa đảo cách đây 3 phút và đồng thời vừa cài đặt một ứng dụng lạ trên điện thoại.',
    question:
      'Với tư cách là một "Cyber Guardian (Vệ Binh Không Gian Mạng)", thứ tự 4 bước ứng cứu khẩn cấp trong "Giờ Vàng" chuẩn xác nhất bạn cần thực hiện ngay lập tức là gì?',
    options: [
      'Bước 1: Lên Facebook tìm dịch vụ lấy lại tiền → Bước 2: Nhắn tin thương lượng với kẻ lừa đảo → Bước 3: Xóa hết lịch sử chat cho đỡ xấu hổ → Bước 4: Đợi vài ngày xem tiền có hoàn lại không',
      'Bước 1: Ngắt mạng thiết bị (Tắt Wi-Fi/Rút SIM) nếu đã cài app lạ để chặn chiếm quyền → Bước 2: Gọi Hotline Ngân hàng của mình khóa khẩn cấp thẻ/tài khoản và yêu cầu tra soát lệnh chuyển tiền → Bước 3: Giữ nguyên vẹn toàn bộ bằng chứng (Sao kê, Mã giao dịch FT, URL, SĐT, Tin nhắn) → Bước 4: Đến trực tiếp Cơ quan Công an xã/phường gần nhất để lập biên bản trình báo',
      'Bước 1: Khôi phục cài đặt gốc (Factory Reset) điện thoại ngay lập tức làm mất hết bằng chứng tin nhắn → Bước 2: Chuyển thêm 10.000đ kèm lời nhắn xin lại tiền',
      'Bước 1: Đăng số điện thoại và CCCD của mình lên các hội nhóm mạng xã hội để nhờ cộng đồng mạng đòi tiền giúp',
    ],
    correctIndex: 1,
    forensicBreakdown:
      'Quy trình 4 bước Giờ Vàng (Ngắt kết nối độc hại → Khóa ngân hàng & yêu cầu tra soát → Bảo toàn nguyên trạng chứng cứ số → Trình báo trực tiếp tại Công an cơ sở) là chuẩn mực ứng cứu sự cố an ninh mạng quốc gia giúp ngăn chặn thiệt hại lan rộng và tối đa hóa khả năng phong tỏa dòng tiền.',
    threeSecondRule: 'Giờ Vàng 4 Bước: Ngắt mạng app lạ → Gọi Ngân hàng khóa & tra soát → Giữ nguyên bằng chứng → Ra Công an phường ngay!',
  },
];

interface SectorProgressSummary {
  id: string;
  sectorNumber: number;
  title: string;
  completedNodes: number;
  totalNodes: number;
  isExamPassed: boolean;
}

interface CyberGuardianFinalExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasCompletedSurvey: boolean;
  sectorsProgress: SectorProgressSummary[];
  forceAllowExam?: boolean;
  preAppScore?: number;
  onSelectSectorIndex?: (index: number) => void;
  onOpenSurvey?: () => void;
  onGuardianCertified?: (record: CyberGuardianCertificationRecord) => void;
}

export const CyberGuardianFinalExamModal: React.FC<CyberGuardianFinalExamModalProps> = ({
  isOpen,
  onClose,
  hasCompletedSurvey,
  sectorsProgress,
  forceAllowExam = false,
  preAppScore = 42,
  onSelectSectorIndex,
  onOpenSurvey,
  onGuardianCertified,
}) => {
  const totalLessonsCompleted = useMemo(
    () => sectorsProgress.reduce((acc, s) => acc + s.completedNodes, 0),
    [sectorsProgress]
  );
  const totalLessonsRequired = useMemo(
    () => sectorsProgress.reduce((acc, s) => acc + s.totalNodes, 0),
    [sectorsProgress]
  );
  const totalSectorsExamPassed = useMemo(
    () => sectorsProgress.filter((s) => s.isExamPassed).length,
    [sectorsProgress]
  );
  const totalSectorsCount = sectorsProgress.length || 12;

  const isAllLessonsCompleted =
    totalLessonsRequired > 0 && totalLessonsCompleted >= totalLessonsRequired;
  const isAllSectorExamsPassed = totalSectorsExamPassed >= totalSectorsCount;

  const isStrictlyUnlocked =
    hasCompletedSurvey && isAllLessonsCompleted && isAllSectorExamsPassed;
  const canTakeFinalExam = isStrictlyUnlocked || forceAllowExam;

  const [step, setStep] = useState<'GATE_OVERVIEW' | 'EXAM_ACTIVE' | 'CERTIFICATE_RESULT'>(
    'GATE_OVERVIEW'
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [confirmUnansweredPrompt, setConfirmUnansweredPrompt] = useState(false);
  const [examStartTime, setExamStartTime] = useState<number>(Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60); // 25 minutes
  const [existingCert, setExistingCert] = useState<CyberGuardianCertificationRecord | null>(null);
  const [latestResult, setLatestResult] = useState<CyberGuardianCertificationRecord | null>(null);
  const [studentNameInput, setStudentNameInput] = useState<string>('');
  const [filterReviewMode, setFilterReviewMode] = useState<'ALL' | 'WRONG'>('ALL');

  const PASS_THRESHOLD_SCORE = 80; // Requires >= 80% (at least 20/24 or 19.2 -> 20/24)
  const MIN_CORRECT_REQUIRED = Math.ceil(
    (CYBER_GUARDIAN_FINAL_QUESTIONS.length * PASS_THRESHOLD_SCORE) / 100
  );

  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedCertRaw = localStorage.getItem('scamguard_cyber_guardian_cert');
      if (savedCertRaw) {
        const parsed: CyberGuardianCertificationRecord = JSON.parse(savedCertRaw);
        setExistingCert(parsed);
      } else {
        setExistingCert(null);
      }

      const session = getActiveSessionUser();
      const realLoggedInName =
        session?.name && session.name !== 'Chưa đăng nhập' && session.name !== 'Vệ Binh Khách'
          ? session.name
          : session?.profile?.name && session.profile.name !== 'Chưa đăng nhập'
          ? session.profile.name
          : auth.currentUser?.displayName || null;

      const surveyRaw = localStorage.getItem('visef_my_latest_survey');
      const authRaw = localStorage.getItem('scamguard_auth_user');
      let defaultName = realLoggedInName || 'Học viên Phòng thủ Không gian mạng';
      if (!realLoggedInName && surveyRaw) {
        const s = JSON.parse(surveyRaw);
        if (s.fullName) defaultName = s.fullName;
        else if (s.participantName && !s.participantName.startsWith('Khảo nghiệm viên Ẩn danh')) defaultName = s.participantName;
      } else if (!realLoggedInName && authRaw) {
        const a = JSON.parse(authRaw);
        if (a.name) defaultName = a.name;
      }
      setStudentNameInput(defaultName);
    } catch {
      // ignore
    }
    setStep('GATE_OVERVIEW');
    setConfirmUnansweredPrompt(false);
  }, [isOpen]);

  // Countdown timer when EXAM_ACTIVE
  useEffect(() => {
    if (!isOpen || step !== 'EXAM_ACTIVE') return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step]);

  if (!isOpen) return null;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    if (!canTakeFinalExam) return;
    setAnswers({});
    setFlaggedIds([]);
    setCurrentIdx(0);
    setConfirmUnansweredPrompt(false);
    setExamStartTime(Date.now());
    setRemainingSeconds(25 * 60);
    setStep('EXAM_ACTIVE');
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
    setConfirmUnansweredPrompt(false);
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const finalizeAndGradeExam = async () => {
    let correctCount = 0;
    const domainScores: Record<number, { correct: number; total: number }> = {};

    CYBER_GUARDIAN_FINAL_QUESTIONS.forEach((q) => {
      if (!domainScores[q.sectorNumber]) {
        domainScores[q.sectorNumber] = { correct: 0, total: 0 };
      }
      domainScores[q.sectorNumber].total += 1;

      if (answers[q.id] === q.correctIndex) {
        correctCount += 1;
        domainScores[q.sectorNumber].correct += 1;
      }
    });

    const totalQuestions = CYBER_GUARDIAN_FINAL_QUESTIONS.length;
    const finalScore = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = correctCount >= MIN_CORRECT_REQUIRED;
    const elapsedSeconds = Math.max(15, Math.round((Date.now() - examStartTime) / 1000));

    let studentGrade = 'THPT';
    let studentSchool = 'Việt Nam';
    try {
      const surveyRaw = localStorage.getItem('visef_my_latest_survey');
      if (surveyRaw) {
        const parsed = JSON.parse(surveyRaw);
        if (parsed.grade) studentGrade = parsed.grade;
        if (parsed.school) studentSchool = parsed.school;
      }
    } catch {
      // ignore
    }

    const certCode = `CG-VISEF-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const record: CyberGuardianCertificationRecord = {
      id: `cyber-guardian-${Date.now()}`,
      certificateCode: certCode,
      studentName: studentNameInput.trim() || 'Học viên Cyber Guardian',
      grade: studentGrade,
      school: studentSchool,
      score: finalScore,
      correctCount,
      totalQuestions,
      isPassed,
      preAppScore,
      postAppScore: finalScore,
      improvementDelta: finalScore - preAppScore,
      timeSpentSeconds: elapsedSeconds,
      completedSectorsCount: totalSectorsExamPassed,
      completedLessonsCount: totalLessonsCompleted,
      domainScores,
      timestamp: new Date().toISOString(),
    };

    setLatestResult(record);
    setConfirmUnansweredPrompt(false);
    setStep('CERTIFICATE_RESULT');

    if (isPassed) {
      setExistingCert(record);
      try {
        localStorage.setItem('scamguard_cyber_guardian_cert', JSON.stringify(record));
        window.dispatchEvent(new Event('visef_cyber_guardian_updated'));
      } catch {
        // ignore
      }

      if (onGuardianCertified) {
        onGuardianCertified(record);
      }
    }

    // Sync with research analytics & Firestore post_app_certifications
    try {
      const existingRaw = localStorage.getItem('visef_post_app_certifications');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const filteredList = existingList.filter((r: any) => r.sectorNumber !== 99);
      const postCertCompat = {
        id: record.id,
        studentName: record.studentName,
        grade: record.grade,
        school: record.school,
        sectorNumber: 99,
        sectorTitle: 'Cyber Guardian Master Certification (12 Phân Khu)',
        score: record.score,
        correctCount: record.correctCount,
        totalQuestions: record.totalQuestions,
        isPassed: record.isPassed,
        preAppScore: record.preAppScore,
        postAppScore: record.postAppScore,
        improvementDelta: record.improvementDelta,
        timestamp: record.timestamp,
      };
      const updatedList = [postCertCompat, ...filteredList];
      localStorage.setItem('visef_post_app_certifications', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('visef_post_cert_updated'));

      fetch('/api/research/post-app-certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postCertCompat),
      }).catch(() => {});

      await addDoc(collection(db, 'post_app_certifications'), postCertCompat);
    } catch {
      // ignore offline or permission errors
    }
  };

  const handleRequestSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (
      answeredCount < CYBER_GUARDIAN_FINAL_QUESTIONS.length &&
      !confirmUnansweredPrompt &&
      remainingSeconds > 0
    ) {
      setConfirmUnansweredPrompt(true);
      return;
    }
    finalizeAndGradeExam();
  };

  const currentQuestion = CYBER_GUARDIAN_FINAL_QUESTIONS[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const firstIncompleteSectorIdx = sectorsProgress.findIndex(
    (s) => s.completedNodes < s.totalNodes || !s.isExamPassed
  );

  const displayedResult = latestResult || existingCert;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#090D16] border border-[#1E293B] rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* TOP HEADER */}
        <div className="p-4 sm:p-5 bg-[#111827] border-b border-[#1E293B] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="text-amber-400 font-bold uppercase">
                  HỘI ĐỒNG SÁT HẠCH TỐI THƯỢNG · VISEF 2026
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">
                  {CYBER_GUARDIAN_FINAL_QUESTIONS.length} Câu Hỏi Tổng Hợp 12 Phân Khu
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Kỳ Thi Tốt Nghiệp & Cấp Chứng Chỉ &ldquo;Cyber Guardian&rdquo; (Vệ Binh Không Gian Mạng)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step === 'EXAM_ACTIVE' && (
              <div
                className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 ${
                  remainingSeconds <= 180
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    : 'bg-[#090D16] border-[#1E293B] text-amber-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#090D16] hover:bg-slate-800 text-slate-400 hover:text-white border border-[#1E293B] transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: GATE OVERVIEW & PREREQUISITE VERIFICATION */}
          {step === 'GATE_OVERVIEW' && (
            <div className="space-y-6">
              {/* Existing Certificate Banner if already passed */}
              {existingCert && existingCert.isPassed && (
                <div className="p-5 rounded-xl bg-emerald-950/25 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase block">
                        ĐÃ ĐẠT DANH HIỆU CYBER GUARDIAN · MÃ {existingCert.certificateCode}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        Chúc mừng {existingCert.studentName}! Bạn đã vượt qua Kỳ Thi Tối Thượng với số điểm {existingCert.score}/100 ({existingCert.correctCount}/{existingCert.totalQuestions} câu).
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Bạn có thể mở xem lại Chứng chỉ Cyber Guardian chính thức hoặc thực hiện bài thi lại để nâng cao điểm tuyệt đối.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLatestResult(existingCert);
                      setStep('CERTIFICATE_RESULT');
                    }}
                    className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer transition"
                  >
                    <Award className="w-4 h-4" />
                    <span>Xem Chứng Chỉ Cyber Guardian</span>
                  </button>
                </div>
              )}

              {/* Path-Based Progression Checklist (4 Mandatory Prerequisites) */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3.5">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-400 uppercase block">
                      KIỂM ĐỊNH ĐIỀU KIỆN TIÊN QUYẾT THEO LỘ TRÌNH TUẦN TỰ
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                       Quy Chuẩn 4 Bước Để Mở Khóa Kỳ Thi Tốt Nghiệp &ldquo;Cyber Guardian&rdquo;
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                      isStrictlyUnlocked
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                        : forceAllowExam
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {isStrictlyUnlocked
                      ? '✓ ĐỦ ĐIỀU KIỆN CHÍNH THỨC'
                      : forceAllowExam
                      ? '⚡ MỞ KHÓA CHẾ ĐỘ GIẢNG VIÊN'
                      : '🔒 CHƯA HOÀN TẤT LỘ TRÌNH 12 TRẠM'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Prerequisite 1: Survey */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      hasCompletedSurvey
                        ? 'bg-emerald-950/15 border-emerald-500/40'
                        : 'bg-[#090D16] border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase mb-1">
                      <span className={hasCompletedSurvey ? 'text-emerald-400' : 'text-amber-400'}>
                        ĐIỀU KIỆN 01 · KHẢO SÁT
                      </span>
                      <span className={hasCompletedSurvey ? 'text-emerald-400' : 'text-amber-400'}>
                        {hasCompletedSurvey ? '✓ ĐẠT' : 'CHƯA ĐẠT'}
                      </span>
                    </div>
                    <p className="font-bold text-white">Khảo sát Phân lộ trình ViSEF</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {hasCompletedSurvey
                        ? 'Đã phân tích chỉ số rủi ro và xếp thứ tự 12 trạm.'
                        : 'Cần hoàn thành bài khảo sát đầu vào 12 câu.'}
                    </p>
                  </div>

                  {/* Prerequisite 2: 120 Lessons */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isAllLessonsCompleted
                        ? 'bg-emerald-950/15 border-emerald-500/40'
                        : 'bg-[#090D16] border-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase mb-1">
                      <span className={isAllLessonsCompleted ? 'text-emerald-400' : 'text-blue-400'}>
                        ĐIỀU KIỆN 02 · BÀI HỌC
                      </span>
                      <span className="text-white">
                        {totalLessonsCompleted}/{totalLessonsRequired} BÀI
                      </span>
                    </div>
                    <p className="font-bold text-white">Hoàn thành tuần tự 120 Bài học</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Học hết bài trước mới mở bài sau xuyên suốt 12 phân khu.
                    </p>
                  </div>

                  {/* Prerequisite 3: 12 Station Exams */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isAllSectorExamsPassed
                        ? 'bg-emerald-950/15 border-emerald-500/40'
                        : 'bg-[#090D16] border-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase mb-1">
                      <span className={isAllSectorExamsPassed ? 'text-emerald-400' : 'text-purple-400'}>
                        ĐIỀU KIỆN 03 · VƯỢT TRẠM
                      </span>
                      <span className="text-white">
                        {totalSectorsExamPassed}/{totalSectorsCount} TRẠM PASS
                      </span>
                    </div>
                    <p className="font-bold text-white">Đỗ 12 Bài Kiểm Tra Cuối Trạm</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Vượt qua bài kiểm tra 20 câu ở từng trạm để mở khóa trạm kế tiếp.
                    </p>
                  </div>

                  {/* Prerequisite 4: Final Exam Threshold */}
                  <div className="p-3.5 rounded-xl bg-[#090D16] border border-amber-500/30">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold text-amber-400 uppercase mb-1">
                      <span>ĐIỀU KIỆN 04 · SÁT HẠCH</span>
                      <span>CHUẨN &ge; {PASS_THRESHOLD_SCORE}%</span>
                    </div>
                    <p className="font-bold text-white">
                      Đạt tối thiểu {MIN_CORRECT_REQUIRED}/{CYBER_GUARDIAN_FINAL_QUESTIONS.length} câu
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Giải quyết 24 kịch bản pháp y & tâm lý đa tầng trong 25 phút.
                    </p>
                  </div>
                </div>

                {/* 12-Station Sequential Matrix Status */}
                <div className="pt-3 border-t border-[#1E293B] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-slate-400 uppercase text-[11px]">
                      BẢNG TIẾN ĐỘ 12 TRẠM TRÊN LỘ TRÌNH CÁ NHÂN HÓA CỦA BẠN:
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Nhấp vào trạm chưa hoàn tất để quay lại học & thi qua trạm
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {sectorsProgress.map((sec, idx) => {
                      const isDone =
                        sec.completedNodes >= sec.totalNodes && sec.isExamPassed;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            if (onSelectSectorIndex) {
                              onSelectSectorIndex(idx);
                              onClose();
                            }
                          }}
                          className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 hover:border-emerald-400'
                              : 'bg-[#090D16] border-[#1E293B] text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className={isDone ? 'text-emerald-400 font-bold' : 'text-blue-400'}>
                              TRẠM #{idx + 1} (KHU {sec.sectorNumber})
                            </span>
                            <span>
                              {isDone ? '✓ ĐÃ PASS' : `${sec.completedNodes}/${sec.totalNodes} bài`}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white truncate">
                            {sec.title}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {sec.isExamPassed
                              ? 'Đã đỗ bài kiểm tra trạm'
                              : sec.completedNodes >= sec.totalNodes
                              ? 'Cần thi đỗ Bài Kiểm Tra Trạm'
                              : `Còn ${sec.totalNodes - sec.completedNodes} bài học`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Exam Structure & Rules Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-7 bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono font-bold text-amber-400 uppercase block">
                      CẤU TRÚC ĐỀ THI TỐT NGHIỆP CYBER GUARDIAN
                    </span>
                    <h4 className="text-base font-bold text-white">
                      Thử Thách Tổng Hợp Đa Tầng: Pháp Y Kỹ Thuật Số & Giải Phẫu Tâm Lý Học Tội Phạm
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Khác với bài kiểm tra từng trạm đơn lẻ, kỳ thi cuối khóa <strong className="text-white">Cyber Guardian</strong> đặt bạn vào 24 hồ sơ thực chiến kết hợp nhiều chiêu trò cùng lúc (Trạm BTS giả + Phishing URL, Shipper COD + Lệnh hủy hội viên giả, AI Deepfake + Thao túng cô lập, Mã độc Accessibility + Lớp phủ màn hình đen, Bẫy kép thu hồi vốn treo).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B]">
                        <span className="text-[10px] font-mono text-blue-400 font-bold block">
                          TẦNG 01 · NHẬN DIỆN
                        </span>
                        <span className="text-white font-semibold mt-0.5 block">
                          Soi bằng chứng số (URL, SMS, QR, Smart Contract)
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B]">
                        <span className="text-[10px] font-mono text-purple-400 font-bold block">
                          TẦNG 02 · TÂM LÝ HỌC
                        </span>
                        <span className="text-white font-semibold mt-0.5 block">
                          Bóc tách điểm mù nhận thức & thao túng cảm xúc
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B]">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                          TẦNG 03 · ỨNG CỨU
                        </span>
                        <span className="text-white font-semibold mt-0.5 block">
                          Quy trình xử lý Giờ Vàng & Pháp luật Việt Nam
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Examinee Name Input */}
                  <div className="pt-4 border-t border-[#1E293B] space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Họ và tên Học viên in trên Chứng chỉ &ldquo;Cyber Guardian&rdquo;:
                    </label>
                    <input
                      type="text"
                      value={studentNameInput}
                      onChange={(e) => setStudentNameInput(e.target.value)}
                      placeholder="Nhập họ và tên đầy đủ của bạn..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Right Launch / Lock Action Box */}
                <div className="lg:col-span-5 bg-[#111827] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between space-y-4">
                  {canTakeFinalExam ? (
                    <>
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase block">
                          CỔNG SÁT HẠCH TỐI THƯỢNG ĐÃ MỞ KHÓA
                        </span>
                        <h4 className="text-base font-bold text-white">
                          Sẵn Sàng Bước Vào Kỳ Thi Tốt Nghiệp Cyber Guardian
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-300">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Số lượng: 24 câu hỏi tình huống phức hợp (12 phân khu)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Thời gian làm bài: 25 phút (Có bộ đếm ngược & đánh dấu câu hỏi)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              Điểm chuẩn cấp chứng chỉ: &ge; {PASS_THRESHOLD_SCORE}% ({MIN_CORRECT_REQUIRED}/{CYBER_GUARDIAN_FINAL_QUESTIONS.length} câu đúng)
                            </span>
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={handleStartExam}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Bắt Đầu Kỳ Thi Cyber Guardian (24 Câu)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <Lock className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-rose-400 uppercase block">
                          CỔNG SÁT HẠCH TỐI THƯỢNG ĐANG KHÓA THEO LỘ TRÌNH
                        </span>
                        <h4 className="text-base font-bold text-white">
                          Cần Hoàn Thành Đủ 12 Trạm Đào Tạo & Kiểm Tra Trước Khi Thi Tốt Nghiệp
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Theo quy chuẩn đào tạo tuần tự, Chứng chỉ Tối thượng <strong className="text-white">Cyber Guardian</strong> chỉ mở khóa khi bạn đã hoàn tất khảo sát chẩn đoán, học đủ 120 bài học và vượt qua cả 12 Bài Kiểm Tra Cuối Trạm.
                        </p>
                        <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Bài học đã hoàn thành:</span>
                            <span className="font-mono font-bold text-white">
                              {totalLessonsCompleted} / {totalLessonsRequired} bài
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Trạm đã thi Pass:</span>
                            <span className="font-mono font-bold text-emerald-400">
                              {totalSectorsExamPassed} / {totalSectorsCount} trạm
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {!hasCompletedSurvey && onOpenSurvey ? (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenSurvey();
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Bước 1: Làm Bài Khảo Sát Phân Lộ Trình Ngay</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectSectorIndex && firstIncompleteSectorIdx >= 0) {
                                onSelectSectorIndex(firstIncompleteSectorIdx);
                              }
                              onClose();
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <ArrowRight className="w-4 h-4" />
                            <span>
                              Tiếp Tục Học & Vượt Trạm #{firstIncompleteSectorIdx >= 0 ? firstIncompleteSectorIdx + 1 : 1} Đang Mở
                            </span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACTIVE COMPLEX MULTI-QUESTION EXAMINATION */}
          {step === 'EXAM_ACTIVE' && currentQuestion && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 8 Cols: Active Scenario & Question */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-4">
                  {/* Question Metadata Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono font-bold text-blue-400 uppercase block">
                        CÂU HỎI {(currentIdx + 1).toString().padStart(2, '0')} / {CYBER_GUARDIAN_FINAL_QUESTIONS.length} · {currentQuestion.sectorName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Cơ chế tấn công: {currentQuestion.cognitiveVector}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#090D16] border border-[#1E293B] text-[10px] font-mono font-bold text-amber-400">
                        {currentQuestion.complexityLevel}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFlagQuestion(currentQuestion.id)}
                        className={`px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                          flaggedIds.includes(currentQuestion.id)
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:text-white'
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>
                          {flaggedIds.includes(currentQuestion.id)
                            ? 'Đã đánh dấu xem lại'
                            : 'Đánh dấu'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Forensic Evidence / Scenario Context Box */}
                  <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-400 uppercase">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>HỒ SƠ TÌNH HUỐNG & BẰNG CHỨNG SỐ GHI NHẬN:</span>
                    </div>
                    <p className="text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
                      {currentQuestion.scenarioContext}
                    </p>
                  </div>

                  {/* Question Stem */}
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {currentQuestion.question}
                  </h3>

                  {/* 4 Tactical Options */}
                  <div className="space-y-2.5 pt-1">
                    {currentQuestion.options.map((optionText, optIdx) => {
                      const isSelected = answers[currentQuestion.id] === optIdx;
                      const optionLabel = String.fromCharCode(65 + optIdx);
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                              : 'bg-[#090D16] border-[#1E293B] text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-400 text-white'
                                : 'bg-[#111827] border-[#1E293B] text-slate-400'
                            }`}
                          >
                            {optionLabel}
                          </span>
                          <span className="text-xs sm:text-sm leading-relaxed">
                            {optionText}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Controls */}
                  <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={currentIdx === 0}
                      onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                        currentIdx > 0
                          ? 'bg-[#090D16] border-[#1E293B] text-slate-200 hover:border-slate-700 cursor-pointer'
                          : 'bg-[#090D16]/40 border-[#1E293B]/40 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Câu trước</span>
                    </button>

                    <span className="text-xs font-mono text-slate-400">
                      Đã trả lời: <strong className="text-white">{answeredCount}</strong> / {CYBER_GUARDIAN_FINAL_QUESTIONS.length} câu
                    </span>

                    {currentIdx < CYBER_GUARDIAN_FINAL_QUESTIONS.length - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentIdx((i) =>
                            Math.min(CYBER_GUARDIAN_FINAL_QUESTIONS.length - 1, i + 1)
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>Câu tiếp theo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestSubmit}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Nộp Bài & Chấm Điểm</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: Question Matrix Navigator & Submit Panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                    <span className="text-xs font-bold text-white">
                      Bản Đồ 24 Câu Hỏi Sát Hạch
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Chuẩn đỗ: {MIN_CORRECT_REQUIRED}/24
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {CYBER_GUARDIAN_FINAL_QUESTIONS.map((q, qIdx) => {
                      const isAnswered = answers[q.id] !== undefined;
                      const isCurrent = currentIdx === qIdx;
                      const isFlagged = flaggedIds.includes(q.id);
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setCurrentIdx(qIdx)}
                          className={`h-9 rounded-lg font-mono text-xs font-bold border transition cursor-pointer relative flex items-center justify-center ${
                            isCurrent
                              ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-500/40'
                              : isAnswered
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                              : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {(qIdx + 1).toString().padStart(2, '0')}
                          {isFlagged && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500/60 inline-block" />
                      <span>Đã chọn ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-[#090D16] border border-[#1E293B] inline-block" />
                      <span>Chưa làm ({CYBER_GUARDIAN_FINAL_QUESTIONS.length - answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      <span>Đánh dấu ({flaggedIds.length})</span>
                    </div>
                  </div>

                  {/* Inline Confirmation if unanswered questions remain */}
                  {confirmUnansweredPrompt && (
                    <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2.5 text-xs">
                      <div className="flex items-start gap-2 text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          Bạn còn{' '}
                          <strong>
                            {CYBER_GUARDIAN_FINAL_QUESTIONS.length - answeredCount} câu hỏi
                          </strong>{' '}
                          chưa chọn đáp án. Các câu bỏ trống sẽ tính là 0 điểm. Bạn có chắc chắn muốn nộp bài ngay?
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={finalizeAndGradeExam}
                          className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                        >
                          Xác nhận nộp ngay
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmUnansweredPrompt(false)}
                          className="px-3 py-2 rounded-lg bg-[#090D16] border border-[#1E293B] text-slate-300 cursor-pointer"
                        >
                          Làm tiếp
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRequestSubmit}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hoàn Tất & Chấm Điểm Kỳ Thi</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CERTIFICATE & FORENSIC BREAKDOWN RESULT */}
          {step === 'CERTIFICATE_RESULT' && displayedResult && (
            <div className="space-y-6">
              {/* Official Cyber Guardian Certificate Display or Retry Banner */}
              {displayedResult.isPassed ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#111827] to-[#090D16] border-2 border-amber-500/60 shadow-2xl space-y-6 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                          CHỨNG NHẬN NĂNG LỰC TỐI THƯỢNG · VISEF NATIONAL CYBER DEFENSE
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                          CHỨNG CHỈ &ldquo;CYBER GUARDIAN&rdquo; — VỆ BINH KHÔNG GIAN MẠNG
                        </h3>
                      </div>
                    </div>

                    <div className="bg-[#090D16] border border-amber-500/40 px-4 py-2.5 rounded-xl text-right font-mono">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        MÃ ĐỊNH DANH CHỨNG CHỈ
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-amber-400">
                        {displayedResult.certificateCode}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-7 space-y-3">
                      <p className="text-xs uppercase font-mono text-slate-400">
                        Hội đồng Khảo thí & Huấn luyện Phòng thủ Nhận thức xác nhận học viên:
                      </p>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {displayedResult.studentName}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Đã hoàn thành xuất sắc toàn bộ <strong className="text-white">12 Phân khu Đào tạo (120 Trạm huấn luyện)</strong>, vượt qua 12 Kỳ sát hạch Phân khu và đỗ Kỳ thi Tốt nghiệp Phức hợp với kết quả{' '}
                        <strong className="text-emerald-400">
                          {displayedResult.correctCount}/{displayedResult.totalQuestions} câu chính xác ({displayedResult.score}/100 điểm)
                        </strong>
                        , đủ năng lực nhận diện pháp y số, miễn nhiễm thao túng tâm lý và bảo vệ cộng đồng trước tội phạm công nghệ cao.
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 font-mono">
                        <span>
                          Ngày cấp: {new Date(displayedResult.timestamp).toLocaleDateString('vi-VN')}
                        </span>
                        <span>·</span>
                        <span>
                          Thời gian hoàn thành: {Math.floor(displayedResult.timeSpentSeconds / 60)}p {displayedResult.timeSpentSeconds % 60}s
                        </span>
                        <span>·</span>
                        <span className="text-emerald-400 font-bold">
                          Tăng trưởng SDI: +{displayedResult.improvementDelta} điểm
                        </span>
                      </div>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">
                          ĐIỂM TỔNG KẾT
                        </span>
                        <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                          {displayedResult.score}/100
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({displayedResult.correctCount}/{displayedResult.totalQuestions} câu đúng)
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">
                          XẾP HẠNG BẢO MẬT
                        </span>
                        <span className="text-base font-black text-amber-400 font-mono mt-1.5 block">
                          CYBER GUARDIAN
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          ✓ Đã xác thực
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-rose-400 uppercase block">
                          CHƯA ĐẠT CHUẨN CẤP CHỨNG CHỈ CYBER GUARDIAN (YÊU CẦU &ge; {PASS_THRESHOLD_SCORE}%)
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">
                          Kết quả của bạn: {displayedResult.score}/100 điểm ({displayedResult.correctCount}/{displayedResult.totalQuestions} câu đúng)
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          Bạn cần trả lời đúng tối thiểu <strong>{MIN_CORRECT_REQUIRED}/{displayedResult.totalQuestions} câu</strong> để mở khóa danh hiệu Cyber Guardian. Hãy xem kỹ phân tích pháp y của các câu trả lời sai bên dưới và thực hiện thi lại!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartExam}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Làm Lại Kỳ Thi Ngay</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Detailed Forensic Answer Review */}
              {Object.keys(answers).length > 0 && (
                <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3.5">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-blue-400 uppercase block">
                        HỒ SƠ GIẢI PHẪU ĐÁP ÁN & KHẨU QUYẾT 3 GIÂY
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        Chi Tiết 24 Kịch Bản Trong Bài Thi Của Bạn
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterReviewMode('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          filterReviewMode === 'ALL'
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-[#090D16] border-[#1E293B] text-slate-300'
                        }`}
                      >
                        Tất cả (24)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterReviewMode('WRONG')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          filterReviewMode === 'WRONG'
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-[#090D16] border-[#1E293B] text-slate-300'
                        }`}
                      >
                        Câu cần khắc phục
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {CYBER_GUARDIAN_FINAL_QUESTIONS.filter((q) => {
                      if (filterReviewMode === 'WRONG') {
                        return answers[q.id] !== q.correctIndex;
                      }
                      return true;
                    }).map((q, idx) => {
                      const userChoice = answers[q.id];
                      const isCorrect = userChoice === q.correctIndex;
                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                            isCorrect
                              ? 'bg-[#090D16] border-emerald-500/30'
                              : 'bg-rose-950/15 border-rose-500/40'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-bold text-blue-400">
                              {q.sectorName}
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                isCorrect ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isCorrect ? '✓ CHÍNH XÁC' : '✗ CẦN LƯU Ý'}
                            </span>
                          </div>
                          <p className="font-bold text-white text-xs sm:text-sm">
                            Câu {idx + 1}: {q.question}
                          </p>
                          {userChoice !== undefined && !isCorrect && (
                            <p className="text-rose-300">
                              <strong>Lựa chọn của bạn:</strong> {q.options[userChoice]}
                            </p>
                          )}
                          <p className="text-emerald-300">
                            <strong>Đáp án chuẩn:</strong> {q.options[q.correctIndex]}
                          </p>
                          <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B] text-slate-300 leading-relaxed space-y-1">
                            <div>
                              <strong className="text-white">Giải phẫu pháp y: </strong>
                              {q.forensicBreakdown}
                            </div>
                            <div className="text-amber-300 font-semibold pt-1">
                              ⚡ Khẩu quyết 3 giây: {q.threeSecondRule}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('GATE_OVERVIEW')}
                  className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-slate-800 border border-[#1E293B] text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Quay lại Bảng Kiểm Định Điều Kiện
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStartExam}
                    className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-slate-800 border border-[#1E293B] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                    <span>Thi Lại Nâng Điểm</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition"
                  >
                    Hoàn Tất & Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
