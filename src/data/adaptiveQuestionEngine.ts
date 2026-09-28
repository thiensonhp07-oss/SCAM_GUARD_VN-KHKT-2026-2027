import { PracticeQuestion, DuolingoLesson } from './duolingoLessons';

// Comprehensive adaptive replacement question bank & dynamic generator
// Generates identical question types with alternative real-world scenarios

export function generateAdaptiveReplacementQuestion(
  failedQuestion: PracticeQuestion,
  lesson: DuolingoLesson,
  attemptCount: number = 1
): PracticeQuestion {
  const type = failedQuestion.type;
  const uniqueId = `${failedQuestion.id}-retry-${attemptCount}-${Date.now()}`;
  const lessonTitle = lesson.title;

  switch (type) {
    case 'multiple_choice': {
      const mcBank: PracticeQuestion[] = [
        {
          id: uniqueId,
          type: 'multiple_choice',
          prompt: `[TÌNH HUỐNG THAY THẾ] Bạn nhận được một cảnh báo bảo mật khẩn cấp từ "Hệ thống giám sát", yêu cầu nhấp vào liên kết để hủy giao dịch 25 triệu VNĐ vừa phát sinh. Hành động chuẩn xác nhất là gì?`,
          options: [
            {
              id: 'opt-a',
              text: 'Bình tĩnh thoát ứng dụng, tự mở app ngân hàng chính thức kiểm tra số dư và liên hệ hotline mặt sau thẻ.',
              isCorrect: true,
              explanation: 'Chính xác! Luôn áp dụng nguyên tắc kiểm tra chéo qua kênh độc lập, không bấm vào link trong tin nhắn báo động giả.',
            },
            {
              id: 'opt-b',
              text: 'Bấm ngay vào link để hủy giao dịch trong 3 phút kẻo mất tiền.',
              isCorrect: false,
              explanation: 'Sai! Đây chính là bẫy tạo tâm lý hoảng loạn để lừa bạn nhập mật khẩu và OTP vào trang web giả mạo.',
            },
            {
              id: 'opt-c',
              text: 'Chụp ảnh màn hình rồi gửi cho người gửi tin nhắn để hỏi rõ chi tiết.',
              isCorrect: false,
              explanation: 'Sai! Người gửi tin nhắn chính là kẻ lừa đảo hoặc tài khoản bot tự động.',
            },
            {
              id: 'opt-d',
              text: 'Gọi lại trực tiếp vào số điện thoại vừa gửi tin nhắn cảnh báo.',
              isCorrect: false,
              explanation: 'Sai! Số điện thoại gửi đến thường là SIM rác hoặc số ảo được điều khiển bởi nhóm lừa đảo.',
            },
          ],
        },
        {
          id: uniqueId,
          type: 'multiple_choice',
          prompt: `[TÌNH HUỐNG THAY THẾ] Một người tự xưng là "Cán bộ điều tra" gọi điện qua Zalo thông báo bạn có lệnh triệu tập và yêu cầu giữ bí mật tuyệt đối, không kể cho người nhà. Dấu hiệu này chỉ ra điều gì?`,
          options: [
            {
              id: 'opt-a',
              text: 'Đây là quy trình bảo mật nghiệp vụ thông thường của cơ quan pháp luật.',
              isCorrect: false,
              explanation: 'Sai! Cơ quan chức năng tuyệt đối không làm việc, tống đạt văn bản hay triệu tập qua mạng xã hội.',
            },
            {
              id: 'opt-b',
              text: 'Dấu hiệu lừa đảo 100%! Kẻ gian cô lập tâm lý nạn nhân để dễ dàng đe dọa và ép chuyển tiền.',
              isCorrect: true,
              explanation: 'Chính xác! Yêu cầu "giữ bí mật không kể cho người thân" là đòn tâm lý cô lập đặc trưng của tội phạm công nghệ cao.',
            },
            {
              id: 'opt-c',
              text: 'Bạn nên chuyển tiền vào "Tài khoản tạm giữ của cơ quan điều tra" để chứng minh trong sạch.',
              isCorrect: false,
              explanation: 'Sai! Không có bất kỳ cơ quan nhà nước nào yêu cầu công dân chuyển tiền để thanh tra chứng minh vô tội.',
            },
          ],
        },
        {
          id: uniqueId,
          type: 'multiple_choice',
          prompt: `[TÌNH HUỐNG THAY THẾ] Bạn nhận được thông báo "Trúng thưởng xe máy SH hoặc 100 triệu tiền mặt", nhưng điều kiện là phải nộp 10% phí trước bạ vào tài khoản cá nhân. Bạn nên xử lý thế nào?`,
          options: [
            {
              id: 'opt-a',
              text: 'Yêu cầu trừ trực tiếp phí trước bạ vào tiền thưởng hoặc từ chối ngay lập tức vì đây là bẫy nạp phí nhận thưởng.',
              isCorrect: true,
              explanation: 'Chính xác! Các chương trình trúng thưởng chân chính đều khấu trừ thuế trực tiếp hoặc trao giải tại trụ sở công khai.',
            },
            {
              id: 'opt-b',
              text: 'Vay mượn tiền chuyển ngay 10 triệu để kịp nhận giải xe SH trong ngày.',
              isCorrect: false,
              explanation: 'Sai! Khi chuyển 10 triệu, kẻ lừa đảo sẽ tiếp tục đòi thêm phí vận chuyển, phí bảo hiểm rồi chặn liên lạc.',
            },
            {
              id: 'opt-c',
              text: 'Gửi CCCD và tài khoản ngân hàng để họ làm thủ tục giúp.',
              isCorrect: false,
              explanation: 'Sai! Bạn vừa mất tiền vừa bị đánh cắp thông tin danh tính để mở tài khoản rác vay nợ app đen.',
            },
          ],
        },
      ];
      return mcBank[Math.floor(Math.random() * mcBank.length)];
    }

    case 'true_false': {
      const tfBank: PracticeQuestion[] = [
        {
          id: uniqueId,
          type: 'true_false',
          prompt: `[THỬ THÁCH THAY THẾ] Tin nhắn đến từ tên hiển thị chính danh thương hiệu (Brandname như Techcombank, VNeID, Momo) thì chắc chắn 100% là an toàn và có thể tin tưởng hoàn toàn.`,
          trueFalseAnswer: {
            isTrue: false,
            explanation: 'Sai hoàn toàn! Kẻ lừa đảo sử dụng trạm phát sóng giả BTS (IMSI Catcher) để phát tán tin nhắn mạo danh Brandname chèn thẳng vào luồng tin nhắn thật.',
          },
        },
        {
          id: uniqueId,
          type: 'true_false',
          prompt: `[THỬ THÁCH THAY THẾ] Mã OTP (One-Time Password) là chìa khóa bảo mật tối thượng, nhân viên ngân hàng và công an tuyệt đối không bao giờ được phép yêu cầu khách hàng cung cấp.`,
          trueFalseAnswer: {
            isTrue: true,
            explanation: 'Chính xác! Bất kỳ ai yêu cầu đọc mã OTP, dù xưng danh bất kỳ chức vụ nào, 100% là kẻ lừa đảo.',
          },
        },
        {
          id: uniqueId,
          type: 'true_false',
          prompt: `[THỬ THÁCH THAY THẾ] Khi người thân gọi video call thấy hình ảnh và giọng nói quen thuộc nhắn mượn tiền gấp, ta có thể chuyển tiền ngay mà không cần gọi điện thoại thông thường để xác minh.`,
          trueFalseAnswer: {
            isTrue: false,
            explanation: 'Sai! Công nghệ Deepfake AI có thể giả mạo khuôn mặt và giọng nói chân thực trong vài giây. Luôn phải gọi điện thoại trực tiếp hoặc hỏi câu hỏi bí mật.',
          },
        },
      ];
      return tfBank[Math.floor(Math.random() * tfBank.length)];
    }

    case 'matching': {
      return {
        id: uniqueId,
        type: 'matching',
        prompt: `[THAY THẾ - GHÉP CẶP PHÒNG THỦ] Hãy ghép nối đúng chiêu thức lừa đảo với hành động phản xạ chuẩn xác:`,
        matchingPairs: [
          {
            left: { id: 'm-left-1', text: 'Mã QR dán đè nơi công cộng' },
            right: { id: 'm-right-1', text: 'Kiểm tra kỹ tên chủ tài khoản và URL trước khi xác nhận', matchesLeftId: 'm-left-1' },
          },
          {
            left: { id: 'm-left-2', text: 'Cuộc gọi đe dọa khóa thuê bao SIM' },
            right: { id: 'm-right-2', text: 'Cúp máy, tự gọi lên tổng đài chính hãng (1800xxxx) kiểm tra', matchesLeftId: 'm-left-2' },
          },
          {
            left: { id: 'm-left-3', text: 'Bưu tá giao đơn hàng COD không nhớ đã đặt' },
            right: { id: 'm-right-3', text: 'Mở app mua sắm kiểm tra mã vận đơn, không nhận đơn lạ', matchesLeftId: 'm-left-3' },
          },
        ],
      };
    }

    case 'spot_red_flags': {
      return {
        id: uniqueId,
        type: 'spot_red_flags',
        prompt: `[THAY THẾ - SOI CỜ ĐỎ] Hãy quan sát tin nhắn thông báo trúng thưởng dưới đây và nhấp chọn tất cả các điểm nghi vấn (Red Flags):`,
        spotData: {
          channel: 'sms',
          header: 'THÔNG BÁO TỔNG ĐÀI',
          sender: 'CSKH-KHUYENMAI-VIP',
          bodyText: 'Chuc mung ban da duoc chon nhan Voucher 50.000.000d tu chuong trinh Tri an! Vui long truy cap http://tri-an-khach-hang-2026.top de xac nhan so tai khoan nhan tien truoc 24h. Phi xac minh chi 200k duoc hoan lai.',
          spots: [
            {
              id: 'spot-1',
              labelText: 'Tên người gửi CSKH-KHUYENMAI-VIP',
              isRedFlag: true,
              explanation: 'Cờ đỏ: Brandname không chính thức, dùng tên chung chung để tạo vẻ uy tín giả mạo.',
            },
            {
              id: 'spot-2',
              labelText: 'Voucher 50.000.000đ từ chương trình không tham gia',
              isRedFlag: true,
              explanation: 'Cờ đỏ: Bẫy quà tặng miễn phí giá trị cao đánh vào lòng tham.',
            },
            {
              id: 'spot-3',
              labelText: 'Đường dẫn http://tri-an-khach-hang-2026.top',
              isRedFlag: true,
              explanation: 'Cờ đỏ: Tên miền lạ đuôi .top, sử dụng giao thức không an toàn HTTP để đánh cắp thông tin.',
            },
            {
              id: 'spot-4',
              labelText: 'Phí xác minh 200k',
              isRedFlag: true,
              explanation: 'Cờ đỏ chí mạng: Yêu cầu nạp phí trước để nhận tiền thưởng là công thức lừa đảo kinh điển.',
            },
          ],
        },
      };
    }

    case 'drag_drop_zone': {
      return {
        id: uniqueId,
        type: 'drag_drop_zone',
        prompt: `[THAY THẾ - PHÂN LOẠI AN TOÀN] Hãy phân loại mức độ rủi ro của các thông điệp dưới đây vào đúng nhóm:`,
        dragDropItems: [
          {
            id: 'dd-item-1',
            sender: 'Tổng đài 1900xxxx',
            text: 'Mã OTP của bạn là 849201. Tuyệt đối KHÔNG chia sẻ mã này cho bất kỳ ai, kể cả nhân viên ngân hàng.',
            correctCategory: 'safe',
            explanation: 'Tin nhắn OTP chuẩn xác luôn có cảnh báo bảo mật rõ ràng và không chứa liên kết độc hại.',
          },
          {
            id: 'dd-item-2',
            sender: 'Bạn bè Facebook',
            text: 'Anh ơi em đang kẹt ở bệnh viện gấp quá, anh chuyển khoản giúp em 5 triệu vào số tài khoản này tí em về gửi lại!',
            correctCategory: 'suspicious',
            explanation: 'Nghi vấn cao bị hack nick hoặc mượn tiền gấp. Cần gọi điện thoại thoại trực tiếp xác thực.',
          },
          {
            id: 'dd-item-3',
            sender: 'Cục An Ninh Mạng Giả',
            text: 'Cam kết hỗ trợ nạn nhân thu hồi 100% tiền bị lừa online. Liên hệ Zalo luật sư ngay, chỉ thu phí 5% khi tiền về.',
            correctCategory: 'scam',
            explanation: 'Lừa đảo bẫy kép 100%! Không có dịch vụ tư nhân nào có thể can thiệp thu hồi tiền lừa đảo.',
          },
        ],
      };
    }

    case 'order_sequence': {
      return {
        id: uniqueId,
        type: 'order_sequence',
        prompt: `[THAY THẾ - SẮP XẾP QUY TRÌNH] Khi phát hiện vừa lỡ bấm vào liên kết lạ và nhập mật khẩu ngân hàng, hãy sắp xếp quy trình xử lý khẩn cấp theo đúng thứ tự 1-4:`,
        sequenceItems: [
          {
            id: 'seq-1',
            stepText: 'Ngay lập tức đăng nhập app ngân hàng chính thống để đổi mật khẩu và bật tính năng khóa thẻ/tài khoản tạm thời',
            correctOrder: 1,
            explanation: 'Bước 1: Chặn đứng đường rút tiền của kẻ gian ngay trong những giây đầu tiên.',
          },
          {
            id: 'seq-2',
            stepText: 'Gọi hotline ngân hàng khẩn cấp để yêu cầu phong tỏa tài khoản và ngừng mọi lệnh chuyển tiền tự động',
            correctOrder: 2,
            explanation: 'Bước 2: Yêu cầu ngân hàng hỗ trợ kiểm soát dòng tiền ở tầng hạ tầng.',
          },
          {
            id: 'seq-3',
            stepText: 'Chụp lại toàn bộ bằng chứng (tin nhắn, link giả mạo, số tài khoản nhận tiền lừa đảo)',
            correctOrder: 3,
            explanation: 'Bước 3: Lưu trữ dữ liệu số phục vụ điều tra của cơ quan chức năng.',
          },
          {
            id: 'seq-4',
            stepText: 'Trình báo sự việc tới cơ quan Công an và Trung tâm An toàn không gian mạng Quốc gia (NCSC)',
            correctOrder: 4,
            explanation: 'Bước 4: Báo cáo chính thức để ngăn chặn đường dây tội phạm và hỗ trợ điều tra.',
          },
        ],
      };
    }

    case 'url_dissection': {
      return {
        id: uniqueId,
        type: 'url_dissection',
        prompt: `[THAY THẾ - PHẪU THUẬT URL] Hãy chọn thành phần chứa bẫy giả mạo nguy hiểm nhất trong đường dẫn: "https://online-banking.vietcombank.vn-security-check.com/login"`,
        urlData: {
          protocol: 'https://',
          subdomain: 'online-banking.vietcombank',
          registrableDomain: 'vn-security-check',
          tld: '.com',
          path: '/login',
          deceptivePart: 'registrableDomain',
          explanation: 'Tên miền đăng ký thực sự ở đây là "vn-security-check.com", chữ "vietcombank" chỉ là Subdomain giả mạo nằm phía trước để đánh lừa mắt thường!',
        },
      };
    }

    case 'chat_decision':
    default: {
      return {
        id: uniqueId,
        type: 'chat_decision',
        prompt: `[THAY THẾ - HỘI THOẠI NHẬP VAI] Kẻ gian đang cố thuyết phục bạn cài đặt ứng dụng Dịch Vụ Công qua file APK. Hãy chọn phản ứng an toàn nhất:`,
        chatData: {
          id: 'chat-step-retry',
          senderName: 'Cán Bộ Hỗ Trợ Ảo',
          scammerText: 'Do hệ thống máy chủ Bộ Công An đang nâng cấp, anh không tải được trên CH Play đâu. Anh bấm vào link này tải file DVC_CapNhat.apk về rồi cấp quyền Trợ năng (Accessibility) để em hướng dẫn định danh từ xa nhé!',
          choices: [
            {
              id: 'c1',
              text: 'Tuyệt đối không tải file APK từ liên kết ngoài! Mọi ứng dụng nhà nước chỉ cài qua Google Play hoặc App Store chính thống.',
              isSafe: true,
              feedback: 'Tuyệt vời! File APK yêu cầu quyền Trợ năng sẽ chiếm toàn quyền điều khiển điện thoại để đọc mã OTP và tự chuyển tiền ngân hàng.',
            },
            {
              id: 'c2',
              text: 'Tải về máy nhưng chưa mở vội, đợi cán bộ gọi lại mới mở.',
              isSafe: false,
              feedback: 'Nguy hiểm! File APK độc hại có thể tự kích hoạt hoặc chứa mã độc lây nhiễm thiết bị.',
            },
            {
              id: 'c3',
              text: 'Cấp quyền trợ năng cho ứng dụng để cán bộ cài đặt giúp cho nhanh.',
              isSafe: false,
              feedback: 'Cực kỳ nguy hiểm! Cấp quyền Accessibility là bạn đã trao chìa khóa tài khoản ngân hàng cho kẻ cướp.',
            },
          ],
        },
      };
    }
  }
}
