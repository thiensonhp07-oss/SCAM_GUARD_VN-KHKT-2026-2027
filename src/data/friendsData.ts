import {
  FriendUser,
  FriendActivityEvent,
  FriendDuelQuestion,
  DailyQuest,
  SocialPost,
} from '../types';

export const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'quest_check_scam',
    title: 'Giám Định 1 Tin Nhắn / URL',
    description: 'Sử dụng AI Check Scam để phân tích 1 tin nhắn hoặc đường dẫn bất kỳ',
    category: 'check',
    xpReward: 50,
    completed: false,
    claimed: false,
    current: 0,
    target: 1,
    icon: 'search',
  },
  {
    id: 'quest_arena',
    title: 'Đấu Trí AI Scam Arena',
    description: 'Hoàn thành 1 vòng đối thoại tác chiến phản xạ chống lừa đảo',
    category: 'arena',
    xpReward: 100,
    completed: false,
    claimed: false,
    current: 0,
    target: 1,
    icon: 'swords',
  },
  {
    id: 'quest_friend_shield',
    title: 'Bảo Vệ Đồng Đội',
    description: 'Tặng 1 Khiên Bảo Vệ Chuỗi hoặc Thách đấu 1 người bạn trong Biệt Đội',
    category: 'friends',
    xpReward: 80,
    completed: false,
    claimed: false,
    current: 0,
    target: 1,
    icon: 'shield',
  },
  {
    id: 'quest_social_share',
    title: 'Cập Nhật Bài Viết An Toàn',
    description: 'Đăng 1 bài viết hoặc chia sẻ cảnh báo lừa đảo lên Bảng Tin Mạng Xã Hội',
    category: 'friends',
    xpReward: 90,
    completed: false,
    claimed: false,
    current: 0,
    target: 1,
    icon: 'share-2',
  },
];

// Empty by default — populated ONLY from real authenticated users in Cloud Firestore
export const INITIAL_FRIENDS: FriendUser[] = [];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [];

export const INITIAL_ACTIVITY_FEED: FriendActivityEvent[] = [];

export const DUEL_QUESTIONS_POOL: FriendDuelQuestion[] = [
  {
    id: 'duel_q1',
    title: 'Tin nhắn SMS thông báo trừ tiền',
    scenario:
      'Bạn nhận tin nhắn: "Tài khoản VCB của bạn bị trừ 15.200.000đ tại Agoda. Nếu không phải bạn, hãy truy cập ngay https://vietcombank-xacthuc247.com để hủy giao dịch trong 3 phút."',
    sender: 'SMS giả mạo Brandname VCB',
    isScam: true,
    tactics: ['Urgency', 'Fear', 'Synthetic Media'],
    options: [
      { label: 'Bấm ngay vào link để hủy lệnh trừ tiền gấp', isCorrect: false, points: 0 },
      {
        label:
          'Không bấm link, mở trực tiếp app VCB chính thống hoặc gọi hotline 1900 54 54 13 để kiểm tra',
        isCorrect: true,
        points: 100,
      },
      { label: 'Nhắn lại hỏi xem ai đã thực hiện giao dịch', isCorrect: false, points: 0 },
      { label: 'Chụp màn hình gửi cho bạn bè bấm thử', isCorrect: false, points: 0 },
    ],
    explanation:
      'Tên miền vietcombank-xacthuc247.com là trang phishing lừa đảo đánh cắp thông tin đăng nhập và OTP. Ngân hàng không bao giờ gửi link hủy tiền qua SMS.',
    redFlags: [
      'Tên miền lạ đuôi .com không phải vietcombank.com.vn',
      'Tạo tâm lý hoảng loạn và đếm ngược thời gian gấp',
    ],
  },
  {
    id: 'duel_q2',
    title: 'Cuộc gọi Video người thân mượn tiền',
    scenario:
      'Bạn nhận video call từ tài khoản Facebook của bạn thân, hình ảnh mờ và giật, tiếng đứt quãng: "Tao bị tai nạn đang ở viện cần 5 triệu đóng viện phí gấp, chuyển vào số tài khoản viện này giúp tao với: 0987... MBBank tên NGUYEN VAN X".',
    sender: 'Video Call Deepfake Face Swap',
    isScam: true,
    tactics: ['Urgency', 'Sympathy', 'Synthetic Media'],
    options: [
      {
        label: 'Thấy mặt bạn thân rồi nên chuyển tiền ngay lập tức cứu bạn',
        isCorrect: false,
        points: 0,
      },
      { label: 'Bảo bạn gửi thêm ảnh căn cước công dân rồi mới chuyển', isCorrect: false, points: 0 },
      {
        label:
          'Cúp máy, gọi điện thoại di động trực tiếp bằng SIM thông thường hoặc hỏi câu hỏi bí mật riêng tư',
        isCorrect: true,
        points: 100,
      },
      { label: 'Chuyển trước 1 triệu để bạn đóng viện phí trước', isCorrect: false, points: 0 },
    ],
    explanation:
      'Đây là thủ đoạn Deepfake AI hoán đổi khuôn mặt kèm hack Facebook. Kẻ gian dùng video dựng sẵn kết hợp tài khoản ngân hàng rác để chiếm đoạt tiền.',
    redFlags: [
      'Video giật lag, cử động miệng không khớp tiếng',
      'Tên chủ tài khoản nhận tiền không trùng tên bạn thân',
    ],
  },
  {
    id: 'duel_q3',
    title: 'Mã QR dán đè tại bàn ăn nhà hàng',
    scenario:
      'Khi thanh toán tại quán ăn, bạn thấy mã QR trên bàn có góc mép bị phồng lên. Quét thử thấy trình duyệt mở link "https://pay-bill-qr.xyz/order?table=8" và yêu cầu đăng nhập tài khoản ngân hàng số.',
    sender: 'Mã QR độc hại (Quishing Phishing)',
    isScam: true,
    tactics: ['Convenience Bias', 'Authority'],
    options: [
      {
        label: 'Nhập thông tin tài khoản và mật khẩu ngân hàng để thanh toán cho tiện',
        isCorrect: false,
        points: 0,
      },
      {
        label: 'Dừng lại ngay, báo nhân viên quán kiểm tra mã QR gốc tại quầy thu ngân',
        isCorrect: true,
        points: 100,
      },
      { label: 'Chỉ nhập số điện thoại và mã PIN thẻ ATM', isCorrect: false, points: 0 },
      { label: 'Quét lại bằng Zalo xem có được không', isCorrect: false, points: 0 },
    ],
    explanation:
      'Kẻ xấu đã dán đè mã QR lừa đảo dẫn tới trang web giả mạo cổng thanh toán nhằm chiếm đoạt tài khoản ngân hàng.',
    redFlags: [
      'Mã QR bị dán đè, viền cong vênh',
      'Tên miền lạ .xyz yêu cầu mật khẩu ngân hàng số',
    ],
  },
  {
    id: 'duel_q4',
    title: 'Bẫy việc làm tuyển dụng Online lương cao',
    scenario:
      'Một "trợ lý nhân sự Shopee" nhắn tin Telegram: "Mời bạn tham gia bình chọn sản phẩm tăng tương tác, mỗi lượt vote nhận 50.000đ. Để nhận nhiệm vụ VIP nhận 2.000.000đ/ngày, bạn cần nạp cọc trước 300.000đ và được hoàn tiền sau 5 phút."',
    sender: 'Lừa đảo nhiệm vụ nạp tiền Telegram',
    isScam: true,
    tactics: ['Greed', 'Social Proof', 'Isolation'],
    options: [
      { label: 'Nạp thử 300.000đ xem có được hoàn tiền thật không', isCorrect: false, points: 0 },
      {
        label: 'Chặn và báo cáo tài khoản lừa đảo, tuyệt đối không chuyển tiền đặt cọc',
        isCorrect: true,
        points: 100,
      },
      { label: 'Rủ bạn bè cùng nạp để chia hoa hồng VIP', isCorrect: false, points: 0 },
      { label: 'Xin hợp đồng lao động có dấu đỏ qua tin nhắn rồi mới nạp', isCorrect: false, points: 0 },
    ],
    explanation:
      'Đây là cái bẫy nhiệm vụ kinh điển. Ban đầu kẻ lừa đảo có thể trả bạn vài chục nghìn, nhưng sau đó sẽ bắt bạn nạp các gói tiền hàng chục triệu rồi khóa tiền vĩnh viễn.',
    redFlags: [
      'Việc nhẹ lương cao bất thường',
      'Yêu cầu chuyển tiền đặt cọc trước để làm nhiệm vụ',
    ],
  },
  {
    id: 'duel_q5',
    title: 'Cán bộ Viện Kiểm Sát đe dọa lệnh bắt giam',
    scenario:
      'Giọng nói tự xưng Đại Úy Công An: "Tài khoản của anh liên quan đường dây rửa tiền ma túy 50 tỷ. Nếu không muốn bị bắt tạm giam ngay trong chiều nay, anh phải giữ bí mật với người thân và chuyển toàn bộ tiền vào tài khoản tạm giữ của cơ quan điều tra để thanh tra."',
    sender: 'Mạo danh Cơ quan Cảnh sát Điều tra',
    isScam: true,
    tactics: ['Authority', 'Fear', 'Isolation', 'Urgency'],
    options: [
      {
        label: 'Lo sợ bị bắt nên chuyển ngay tiền vào số tài khoản cán bộ yêu cầu',
        isCorrect: false,
        points: 0,
      },
      { label: 'Giữ bí mật không dám kể với ai', isCorrect: false, points: 0 },
      {
        label:
          'Khẳng định cơ quan công an không làm việc qua điện thoại, yêu cầu gửi giấy triệu tập về công an địa phương hoặc gọi 113',
        isCorrect: true,
        points: 100,
      },
      { label: 'Năn nỉ xin cán bộ giảm án và xin gửi phong bì', isCorrect: false, points: 0 },
    ],
    explanation:
      'Cơ quan công an, viện kiểm sát, tòa án tuyệt đối KHÔNG làm việc, điều tra hay yêu cầu chuyển tiền thanh tra qua điện thoại hay mạng xã hội.',
    redFlags: [
      'Đe dọa bắt giam khẩn cấp',
      'Yêu cầu giữ bí mật tuyệt đối với gia đình',
      'Yêu cầu chuyển tiền vào tài khoản cá nhân',
    ],
  },
];
