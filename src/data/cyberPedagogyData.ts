export interface SectorMemoryBlueprint {
  sectorNumber: number;
  sectorId: string;
  coreTheme: string;
  studentContext: string;
  mnemonicRhyme: string;
  threeSecondReflex: {
    step1: string;
    step2: string;
    step3: string;
  };
  brainMechanism: {
    hijackTarget: string;
    whyStudentsFall: string;
    cognitiveShield: string;
  };
  sideBySideComparison: {
    trapSignal: string;
    authenticSignal: string;
  };
  feynmanChallenge: {
    question: string;
    options: {
      id: string;
      text: string;
      isBestExplanation: boolean;
      feedback: string;
    }[];
  };
  keyTakeawayForever: string;
}

export interface InteractiveScamAnatomyCase {
  id: string;
  title: string;
  targetAudience: string;
  channel: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  rawMessage: string;
  senderDisplay: string;
  layers: {
    id: string;
    layerType: 'PSYCHOLOGY' | 'TECHNICAL' | 'FINANCE' | 'DEFENSE';
    label: string;
    highlightedSnippet: string;
    analysis: string;
    memoryRule: string;
  }[];
  goldenReflex: string;
}

export interface MemoryFlashcard {
  id: string;
  category: 'Tâm lý' | 'Tên miền & Link' | 'Tài chính & OTP' | 'Deepfake & AI' | 'Mạng xã hội & Game';
  frontTrigger: string;
  frontScenario: string;
  backMnemonic: string;
  backActionSteps: string[];
  whyItWorks: string;
}

export interface PedagogyMethodPillar {
  id: string;
  stepNumber: string;
  title: string;
  scientificPrinciple: string;
  retentionRate: number;
  studentActivity: string;
  classroomArrangement: string;
  practicalExample: string;
}

export const SECTOR_MEMORY_BLUEPRINTS: Record<number, SectorMemoryBlueprint> = {
  1: {
    sectorNumber: 1,
    sectorId: 'sector-1',
    coreTheme: 'Bẫy Mồi Nhử, Quà Tặng 0 Đồng & Vòng Quay Trúng Thưởng',
    studentContext: 'Tặng skin Liên Quân/Valorant miễn phí, trúng iPhone 16, học bổng/voucher trà sữa 0đ yêu cầu đăng nhập tài khoản.',
    mnemonicRhyme: 'Quà trên trời rơi xuống chỉ có nước mưa — Đòi phí nhận thưởng chắc chắn là lừa!',
    threeSecondReflex: {
      step1: 'DỪNG: Không bấm vào link rút gọn hay nút "Nhận quà ngay".',
      step2: 'SOI: Kiểm tra tên miền gốc trước dấu "/" đầu tiên và yêu cầu thu phí.',
      step3: 'ĐÓNG: Tắt ngay trang web nếu đòi nhập mật khẩu Facebook/Google hoặc nộp phí ship.',
    },
    brainMechanism: {
      hijackTarget: 'Hệ thống phần thưởng Dopamine & Hiệu ứng Khan hiếm giả (FOMO)',
      whyStudentsFall: 'Đồng hồ đếm ngược "Còn 02:59 giây" kích hoạt hạch hạnh nhân (Amygdala), làm vỏ não trước trán (tư duy logic) ngừng kiểm tra đường link.',
      cognitiveShield: 'Hễ thấy đồng hồ đếm ngược giục nhận quà -> Tự động lùi lại 5 giây vì hàng thật không bao giờ ép bấm trong 3 phút.',
    },
    sideBySideComparison: {
      trapSignal: 'Yêu cầu đóng "phí hồ sơ/phí vận chuyển/phí kích hoạt" trước hoặc bắt đăng nhập Facebook/Gmail trên web lạ.',
      authenticSignal: 'Giải thưởng chính thống công bố trên fanpage tích xanh/website chính thức, không bao giờ thu phí trước khi trao giải.',
    },
    feynmanChallenge: {
      question: 'Nếu em gái lớp 6 của bạn khoe "Em vừa quay trúng iPad miễn phí, chỉ cần chuyển 50k tiền ship!", bạn sẽ giải thích thế nào để em nhớ suốt đời?',
      options: [
        {
          id: 'f1-a',
          text: 'Quà trúng thưởng thật thì người trao trả phí hoặc trừ trực tiếp; hễ bắt chuyển tiền trước dù chỉ 20k-50k thì 100% là bẫy cướp tiền rồi chặn nick.',
          isBestExplanation: true,
          feedback: 'Chính xác! Giải thích ngắn gọn, đánh thẳng vào nghịch lý "trúng thưởng nhưng phải nộp tiền trước".',
        },
        {
          id: 'f1-b',
          text: 'Cứ chuyển thử 50k xem sao vì số tiền nhỏ không đáng lo.',
          isBestExplanation: false,
          feedback: 'Sai! Sau 50k phí ship, kẻ gian sẽ đòi tiếp 500k phí bảo hiểm, 2 triệu phí hải quan theo tâm lý tiếc tiền (Sunk Cost).',
        },
        {
          id: 'f1-c',
          text: 'Bảo em đọc kỹ điều khoản sử dụng dài 10 trang trên trang web đó.',
          isBestExplanation: false,
          feedback: 'Chưa tối ưu. Trang web lừa đảo cũng copy điều khoản giả; quy tắc nhớ nhanh là "Không nộp phí trước".',
        },
      ],
    },
    keyTakeawayForever: 'Không có bữa trưa miễn phí trên mạng: Trúng thưởng thật không bao giờ đòi chuyển phí trước.',
  },
  2: {
    sectorNumber: 2,
    sectorId: 'sector-2',
    coreTheme: 'Giả Mạo Trạm BTS, SMS Brandname Ngân Hàng & Phishing Tên Miền',
    studentContext: 'Tin nhắn SMS nằm chung luồng với tin nhắn ngân hàng thật báo "Tài khoản bị khóa, bấm link xác thực ngay".',
    mnemonicRhyme: 'Đọc link từ phải sang trái — Thấy đuôi lạ (.xyz, .top, .cc) là né ngay lập tức!',
    threeSecondReflex: {
      step1: 'KHÔNG BẤM LINK trong tin nhắn SMS dù tên người gửi giống hệt ngân hàng.',
      step2: 'ĐỌC NGƯỢC tên miền từ phải sang trái (ngay trước dấu "/" đơn đầu tiên).',
      step3: 'MỞ APP CHÍNH THỨC trên điện thoại để kiểm tra thông báo thay vì vào web qua SMS.',
    },
    brainMechanism: {
      hijackTarget: 'Thiên kiến Tin tưởng Giao diện (Visual Authority Bias)',
      whyStudentsFall: 'Kẻ gian dùng trạm phát sóng BTS giả (IMSI Catcher) ép điện thoại nhận SMS cùng tên thương hiệu (Brandname) với ngân hàng thật.',
      cognitiveShield: 'Tên người gửi SMS có thể bị giả mạo bằng sóng vô tuyến, nhưng ngân hàng thật KHÔNG BAO GIỜ gửi link yêu cầu nhập mật khẩu/OTP.',
    },
    sideBySideComparison: {
      trapSignal: 'SMS có kèm đường link lạ (vd: vietcombank-id.vn.top,dichvu-vcb.com) giục cập nhật sinh trắc học hoặc mở khóa thẻ.',
      authenticSignal: 'Ngân hàng chỉ thông báo biến động số dư hoặc hướng dẫn khách tự mở ứng dụng chính thức trên App Store / Google Play.',
    },
    feynmanChallenge: {
      question: 'Làm sao để chỉ cho bố mẹ cách phân biệt tên miền thật và tên miền giả chỉ trong 3 giây?',
      options: [
        {
          id: 'f2-a',
          text: 'Nhìn chữ cuối cùng ngay trước dấu gạch chéo "/" đầu tiên: Nếu là ".top", ".xyz", ".vip" hoặc thêm chữ gạch ngang như "vcb-online.com" thì 100% là giả.',
          isBestExplanation: true,
          feedback: 'Chuẩn xác! Kỹ thuật "Đọc ngược trước dấu gạch chéo đầu tiên" là vũ khí tối thượng chống Phishing.',
        },
        {
          id: 'f2-b',
          text: 'Chỉ cần thấy có biểu tượng ổ khóa HTTPS màu xanh là trang web an toàn tuyệt đối.',
          isBestExplanation: false,
          feedback: 'Nguy hiểm! 90% web lừa đảo hiện nay đều đăng ký chứng chỉ HTTPS miễn phí để có hình ổ khóa.',
        },
        {
          id: 'f2-c',
          text: 'Bấm vào đường link xem giao diện có logo ngân hàng đẹp hay không.',
          isBestExplanation: false,
          feedback: 'Sai! Kẻ gian sao chép giao diện giống 100% chỉ trong 5 phút.',
        },
      ],
    },
    keyTakeawayForever: 'SMS Brandname có thể bị giả bằng trạm BTS, và ổ khóa HTTPS không có nghĩa là web thật. Luôn đọc tên miền gốc trước dấu "/".',
  },
  3: {
    sectorNumber: 3,
    sectorId: 'sector-3',
    coreTheme: 'Gian Lận Thương Mại Điện Tử, Shipper Giả & Bẫy Đơn Hàng COD',
    studentContext: 'Đặt đồ Shopee/TikTok Shop, kẻ gian gọi tự xưng shipper bảo "để hàng ở cổng, chuyển khoản ngay rồi gửi link hoàn tiền do nhầm số tài khoản bảo hiểm".',
    mnemonicRhyme: 'Nhận tận tay, nhìn tận mắt — Shipper hối chuyển khoản khi chưa thấy hàng là cúp máy!',
    threeSecondReflex: {
      step1: 'KIỂM TRA trạng thái đơn hàng trực tiếp trong ứng dụng Shopee/TikTok Shop/Lazada.',
      step2: 'KHÔNG CHUYỂN KHOẢN cho shipper khi chưa cầm và kiểm tra gói hàng thực tế.',
      step3: 'TUYỆT ĐỐI KHÔNG bấm link "hoàn tiền / hủy đăng ký hội viên shipper" do người lạ gửi.',
    },
    brainMechanism: {
      hijackTarget: 'Sự mất cảnh giác với thói quen mua sắm hàng ngày & Khủng hoảng giả ("Đơnầm vào tài khoản bảo hiểm tự trừ 3.5 triệu/tháng")',
      whyStudentsFall: 'Kẻ gian đọc đúng tên, số điện thoại và món hàng (do lộ thông tin trên nhãn dán hoặc livestream), sau đó hù dọa nếu không bấm link hủy sẽ bị trừ tiền hàng tháng.',
      cognitiveShield: 'Không có bất kỳ "tài khoản hội viên shipper" nào tự động trừ tiền ngân hàng của bạn nếu bạn không tự nhập OTP.',
    },
    sideBySideComparison: {
      trapSignal: 'Gọi điện báo giao hàng khi bạn không có nhà, giục chuyển khoản gấp rồi báo "nhầm số tài khoản đăng ký hội viên tự trừ tiền".',
      authenticSignal: 'Shipper thật giao hàng thu tiền mặt/chuyển khoản khi gặp trực tiếp hoặc gửi người quen sau khi bạn xác nhận.',
    },
    feynmanChallenge: {
      question: 'Khi kẻ giả danh shipper dọa "Chị chuyển nhầm vào số tài khoản hội viên rồi, không bấm link hủy là tối nay tự trừ 4.5 triệu!", bạn giải thích sao để người nhà bình tĩnh?',
      options: [
        {
          id: 'f3-a',
          text: 'Không ai có quyền tự trừ tiền trong tài khoản ngân hàng của mình chỉ vì mình vừa chuyển khoản cho họ cả. Đó là kịch bản hù dọa để lừa mình tự bấm link nộp OTP!',
          isBestExplanation: true,
          feedback: 'Xuất sắc! Giải tỏa ngay nỗi sợ bị "tự động trừ tiền" — nguyên nhân chính khiến nạn nhân làm theo lời kẻ gian.',
        },
        {
          id: 'f3-b',
          text: 'Nhanh chóng bấm vào link của shipper gửi để làm thủ tục hủy hội viên cho kịp giờ.',
          isBestExplanation: false,
          feedback: 'Đó chính là cái bẫy chiếm quyền điều khiển điện thoại hoặc lấy cắp OTP!',
        },
        {
          id: 'f3-c',
          text: 'Chuyển thêm 1 lần nữa để hệ thống hoàn trả cả gốc lẫn lãi.',
          isBestExplanation: false,
          feedback: 'Càng chuyển thêm càng mất thêm tiền.',
        },
      ],
    },
    keyTakeawayForever: 'Thấy hàng mới trả tiền; và nhớ kỹ: Không có "tài khoản bảo hiểm shipper" nào tự trừ được tiền trong ngân hàng của bạn.',
  },
  4: {
    sectorNumber: 4,
    sectorId: 'sector-4',
    coreTheme: 'Thao Túng Tâm Lý Tình Cảm, Kết Bạn Ảo & Tống Tiền Hình Ảnh (Sextortion)',
    studentContext: 'Người lạ ngoại hình hoàn hảo kết bạn làm quen trên Instagram/Discord/Tinder, tâm sự suốt nhiều tuần rồi rủ đầu tư hoặc dụ gọi video nhạy cảm để tống tiền.',
    mnemonicRhyme: 'Tình qua mạng chưa gặp mặt mà bàn chuyện tiền nong hay ảnh nhạy cảm — Dừng ngay kẻo sập bẫy!',
    threeSecondReflex: {
      step1: 'GIỮ KHOẢNG CÁCH: Không bao giờ gửi ảnh/video riêng tư nhạy cảm cho bất kỳ ai trên mạng.',
      step2: 'TÁCH BIỆT TÌNH - TIỀN: Người quen qua mạng rủ nạp tiền đầu tư hay nhận quà hải quan = 100% kịch bản Mổ Heo.',
      step3: 'KHI BỊ ĐE DỌA: Tuyệt đối không chuyển tiền (vì chúng sẽ đòi mãi), lưu bằng chứng, khóa tài khoản và báo ngay người lớn/Công an.',
    },
    brainMechanism: {
      hijackTarget: 'Hormone Oxytocin (Gắn kết tin tưởng) & Nỗi sợ xấu hổ / Cô lập xã hội',
      whyStudentsFall: 'Kẻ gian đầu tư thời gian quan tâm mỗi ngày ("Love Bombing") để hạ gục hàng rào phòng vệ trước khi tung đòn tài chính hoặc tống tiền.',
      cognitiveShield: 'Tình cảm thật không bao giờ gắn với sàn đầu tư lạ, phí thông quan quà tặng hay yêu cầu quay video nhạy cảm.',
    },
    sideBySideComparison: {
      trapSignal: 'Tài khoản hoàn hảo nhưng luôn né gặp mặt trực tiếp, sau một thời gian bắt đầu khoe lãi đầu tư hoặc dụ trao đổi hình ảnh nhạy cảm.',
      authenticSignal: 'Mối quan hệ lành mạnh tôn trọng quyền riêng tư, ranh giới cá nhân và minh bạch ngoài đời thực.',
    },
    feynmanChallenge: {
      question: 'Nếu một người bạn học bị kẻ xấu trên mạng đe dọa tung hình nhạy cảm (hoặc ảnh cắt ghép AI) trừ khi nộp 5 triệu đồng, lời khuyên đúng đắn nhất là gì?',
      options: [
        {
          id: 'f4-a',
          text: 'Tuyệt đối KHÔNG chuyển tiền vì chuyển 1 lần chúng sẽ tống tiền mãi mãi; hãy chụp màn hình bằng chứng, chặn liên lạc và báo ngay cho bố mẹ/thầy cô/Công an hỗ trợ.',
          isBestExplanation: true,
          feedback: 'Chính xác 100%! Phá vỡ sự cô lập và cắt đứt chuỗi tống tiền ngay từ đầu là cách duy nhất bảo vệ nạn nhân.',
        },
        {
          id: 'f4-b',
          text: 'Vay tiền bạn bè chuyển nhanh 5 triệu cho kẻ gian để chúng xóa ảnh đi.',
          isBestExplanation: false,
          feedback: 'Sai lầm nghiêm trọng! Tội phạm tống tiền không bao giờ xóa ảnh khi nhận được tiền mà sẽ lập tức đòi gấp đôi.',
        },
        {
          id: 'f4-c',
          text: 'Im lặng chịu đựng một mình và làm theo mọi yêu cầu của kẻ gian.',
          isBestExplanation: false,
          feedback: 'Sự im lặng và sợ hãi chính là vũ khí mà kẻ tống tiền lợi dụng.',
        },
      ],
    },
    keyTakeawayForever: 'Không gửi ảnh nhạy cảm lên mạng; nếu bị đe dọa tống tiền, tuyệt đối không chuyển tiền và không giữ bí mật một mình.',
  },
  5: {
    sectorNumber: 5,
    sectorId: 'sector-5',
    coreTheme: 'Bẫy Việc Nhẹ Lương Cao, Cộng Tác Viên Telegram/TikTok & Sàn Ảo',
    studentContext: 'Tuyển CTV xem video TikTok, thả tim sản phẩm Shopee nhận 50k-100k thật ở 2 đơn đầu, sau đó bắt nạp 2 triệu - 20 triệu làm "nhiệm vụ liên hoàn" rồi báo sai cú pháp.',
    mnemonicRhyme: 'Đi làm là để NHẬN lương — Việc gì bắt NẠP tiền trước 100% là đường vào bẫy!',
    threeSecondReflex: {
      step1: 'NHẬN DIỆN MỒI NHỬ: 50k-100k nhận được lúc đầu chỉ là "miếng phô mai trên bẫy chuột".',
      step2: 'NGUYÊN TẮC BẤT BIẾN: Không bao giờ nạp tiền túi để làm nhiệm vụ hưởng hoa hồng.',
      step3: 'CẮT LỖ TỨC THÌ: Nếu lỡ nạp tiền và bị báo "sai cú pháp cần nạp thêm để rút", dừng ngay lập tức vì nạp thêm sẽ mất100%.',
    },
    brainMechanism: {
      hijackTarget: 'Quy tắc Có qua có lại (Reciprocity) & Nguỵ biện Chi phí chìm (Sunk Cost Fallacy)',
      whyStudentsFall: 'Khi đã nhận thật 100k ở 2 nhiệm vụ đầu, não bộ tin rằng hệ thống trả tiền thật. Khi đã lỡ kẹt 2 triệu, nạn nhân tiếc tiền nên cố vay thêm 10 triệu để "gỡ" nhưng thực chất số dư trên web chỉ là con số ảo do admin gõ.',
      cognitiveShield: 'Số dư trên app/web làm nhiệm vụ là con số giả lập. Tiền đã chuyển đi không bao giờ lấy lại được bằng cách chuyển thêm tiền.',
    },
    sideBySideComparison: {
      trapSignal: 'Yêu cầu ứng viên nạp tiền cá nhân để "kích hoạt đơn hàng", hứa hoàn gốc + hoa hồng 15%-30% sau 5 phút.',
      authenticSignal: 'Công việc hợp pháp trả thù lao dựa trên sức lao động, không bao giờ bắt nhân viên/CTV nạp tiền trước.',
    },
    feynmanChallenge: {
      question: 'Tại sao kẻ lừa đảo lại chịu chuyển thật cho bạn 100.000đ ở 2 nhiệm vụ thả tim đầu tiên?',
      options: [
        {
          id: 'f5-a',
          text: 'Đó là tiền mồi nhử để tạo lòng tin tuyệt đối, khiến bạn mất cảnh giác và tự nguyện chuyển hàng triệu đồng ở "nhiệm vụ ghép đơn" tiếp theo.',
          isBestExplanation: true,
          feedback: 'Hoàn hảo! Hiểu rõ bản chất "tiền mồi nhử" giúp học sinh không bao giờ bị đánh lừa bởi vài chục nghìn ban đầu.',
        },
        {
          id: 'f5-b',
          text: 'Vì công ty của họ rất giàu và trả lương sòng phẳng.',
          isBestExplanation: false,
          feedback: 'Không có công ty nào trả 100k chỉ cho 3 cú bấm like cả.',
        },
        {
          id: 'f5-c',
          text: 'Vì hệ thống của họ bị lỗi nên phát tiền nhầm.',
          isBestExplanation: false,
          feedback: 'Đó là kịch bản tâm lý được tính toán kỹ lưỡng của tội phạm.',
        },
      ],
    },
    keyTakeawayForever: 'Đi làm thêm mà bắt nộp tiền trước = 100% Lừa đảo. Lỡ mất tiền rồi thì tuyệt đối không nạp thêm để "cứu vốn".',
  },
  6: {
    sectorNumber: 6,
    sectorId: 'sector-6',
    coreTheme: 'Mạo Danh Công An, Viện Kiểm Sát, Cán Bộ Nhà Nước & App .APK Độc Hại',
    studentContext: 'Cuộc gọi dọa "Số CCCD của em dính vào đường dây rửa tiền / ma túy, yêu cầu vào phòng kín bật Zalo video call và cài app VNeID giải trình hoặc chuyển tiền xác minh".',
    mnemonicRhyme: 'Công an KHÔNG làm việc qua Zalo, KHÔNG đòi chuyển tiền xác minh, KHÔNG gửi file .APK!',
    threeSecondReflex: {
      step1: 'BÌNH TĨNH CÚP MÁY khi nghe dọa "Lệnh bắt giữ / Phong tỏa tài khoản" qua điện thoại hoặc video call.',
      step2: 'KHÔNG CÀI FILE .APK hoặc bấm link tải ứng dụng ngoài Google Play / App Store.',
      step3: 'BÁO NGƯỜI THÂN & RA TRỰC TIẾP Công an phường/xã nơi cư trú để kiểm chứng.',
    },
    brainMechanism: {
      hijackTarget: 'Phản xạ Phục tùng Uy quyền (Authority Compliance) & Chiến thuật Cô lập (Isolation)',
      whyStudentsFall: 'Kẻ gian mặc sắc phục giả, đọc đúng số CCCD, yêu cầu học sinh/sinh viên "tuyệt đối giữ bí mật với bố mẹ để tránh lộ chuyên án", khiến nạn nhân hoảng loạn tột độ („Bắt cóc trực tuyến“).',
      cognitiveShield: 'Cơ quan Công an chỉ làm việc trực tiếp tại trụ sở thông qua Giấy mời/Giấy triệu tập bằng văn bản gửi qua địa phương.',
    },
    sideBySideComparison: {
      trapSignal: 'Gọi điện/video call đe dọa bắt giữ, bắt giữ bí mật với gia đình, yêu cầu chuyển tiền vào "tài khoản tạm giữ" hoặc cài file .apk.',
      authenticSignal: 'Gửi giấy mời/giấy triệu tập chính thức qua Công an địa phương và làm việc trực tiếp tại trụ sở cơ quan.',
    },
    feynmanChallenge: {
      question: 'Nếu có người mặc sắc phục trên video call dọa bạn liên quan đến vụ án hình sự và cấm bạn kể với bố mẹ, bạn nhớ ngay khẩu quyết nào?',
      options: [
        {
          id: 'f6-a',
          text: 'Công an thật không bao giờ thẩm vấn qua Zalo/điện thoại, không bắt giữ bí mật với bố mẹ và không đòi chuyển tiền chứng minh trong sạch. Cúp máy và báo bố mẹ ngay!',
          isBestExplanation: true,
          feedback: 'Chính xác tuyệt đối! Đây là kiến thức sống còn giúp học sinh/sinh viên thoát khỏi bẫy "bắt cóc online" thao túng tâm lý.',
        },
        {
          id: 'f6-b',
          text: 'Thuê nhà nghỉ trốn một mình để quay video chứng minh theo lệnh của người trong điện thoại.',
          isBestExplanation: false,
          feedback: 'Đây là thủ đoạn "bắt cóc online" cực kỳ nguy hiểm mà tội phạm dùng để tống tiền gia đình!',
        },
        {
          id: 'f6-c',
          text: 'Tải file VNeID.apk người đó gửi qua Zalo để quét khuôn mặt.',
          isBestExplanation: false,
          feedback: 'Cài file .apk sẽ trao toàn quyền điều khiển điện thoại và đọc trộm OTP cho kẻ gian!',
        },
      ],
    },
    keyTakeawayForever: 'Ba chữ KHÔNG trước mạo danh Công an: Không làm việc qua mạng - Không giữ bí mật một mình - Không cài file .APK.',
  },
  7: {
    sectorNumber: 7,
    sectorId: 'sector-7',
    coreTheme: 'Mã Độc Quishing QR & Giám Định Biên Lai Chuyển Khoản Giả',
    studentContext: 'Quét mã QR dán đè ở quán nước/căng-tin/bãi xe dẫn tới web độc hại; hoặc khách mua hàng đưa ảnh chụp màn hình "Đã chuyển khoản thành công" được chỉnh sửa bằng tool.',
    mnemonicRhyme: 'Quét QR phải nhìn kỹ link đích — Nhận tiền chuyển khoản phải chờ thông báo app ngân hàng!',
    threeSecondReflex: {
      step1: 'SOI VẬT LÝ: Kiểm tra xem miếng dán QR có bị dán đè một lớp decal khác lên trên không.',
      step2: 'KIỂM TRA ĐÍCH ĐẾN: Nếu quét QR thanh toán mà lại mở ra trình duyệt web đòi đăng nhập/tải app -> Đóng ngay!',
      step3: 'ĐỐI CHIẾU SỐ DƯ: Không tin ảnh chụp màn hình biên lai; chỉ xác nhận khi tiền thực sự nhảy vào số dư trong app ngân hàng của mình.',
    },
    brainMechanism: {
      hijackTarget: 'Thiên kiến Tiện lợi (Convenience Bias) & Tin vào Bằng chứng thị giác giả (Visual Proof Illusion)',
      whyStudentsFall: 'Chúng ta quen quét QR mất 1 giây mà không nhìn URL hiển thị trên màn hình, hoặc nhìn thấy biên lai có logo ngân hàng và tên mình là giao hàng ngay vì đang vội.',
      cognitiveShield: 'Mã QR chỉ là cách viết tắt của một đường link; còn ảnh chụp biên lai có thể tạo giả trong 3 giây bằng web/bot Telegram.',
    },
    sideBySideComparison: {
      trapSignal: 'Mã QR mở ra trang web lạ yêu cầu cấp quyền/nhập mật khẩu; hoặc người mua chỉ giơ ảnh chụp màn hình biên lai rồi vội vã rời đi.',
      authenticSignal: 'Mã VietQR chuẩn tự động điền tên & số tài khoản trong app ngân hàng; tiền thật phải báo biến động số dư trên chính máy bạn.',
    },
    feynmanChallenge: {
      question: 'Bạn làm thêm thu ngân ở quán cà phê. Một vị khách đưa màn hình điện thoại có ảnh biên lai chuyển khoản thành công 500k và đòi lấy đồ đi gấp. Bạn làm gì?',
      options: [
        {
          id: 'f7-a',
          text: 'Lịch sự giữ hàng lại và kiểm tra trực tiếp biến động số dư trên app ngân hàng hoặc loa báo ting-ting của quán; ảnh chụp màn hình không có giá trị xác nhận tiền đã vào.',
          isBestExplanation: true,
          feedback: 'Rất chuyên nghiệp! Ảnh chụp màn hình có thể làm giả chỉ trong vài giây.',
        },
        {
          id: 'f7-b',
          text: 'Nhìn thấy chữ "Giao dịch thành công" màu xanh trên máy khách là giao hàng ngay cho nhanh.',
          isBestExplanation: false,
          feedback: 'Bẫy biên lai giả (Fake Bill) đánh đúng vào sự vội vàng này!',
        },
        {
          id: 'f7-c',
          text: 'Quét lại mã QR do khách đưa để nhận tiền.',
          isBestExplanation: false,
          feedback: 'Người nhận tiền không bao giờ phải quét mã QR của người trả tiền để xác nhận!',
        },
      ],
    },
    keyTakeawayForever: 'QR thanh toán chỉ dùng trong app ngân hàng (không mở web lạ); và ảnh biên lai không phải là tiền thật cho đến khi số dư báo tăng.',
  },
  8: {
    sectorNumber: 8,
    sectorId: 'sector-8',
    coreTheme: 'Khủng Hoảng Khẩn Cấp Giả ("Con Cấp Cứu") & Quy Trình Sơ Cứu Tài Chính Giờ Vàng',
    studentContext: 'Bố mẹ nhận cuộc gọi báo "Cháu bị tai nạn chấn thương sọ não đang ở phòng mổ, chuyển gấp 30 triệu viện phí trong 5 phút nếu không bác sĩ dừng ca mổ!".',
    mnemonicRhyme: 'Nghe tin dữ đừng vội chuyển tiền — Gọi ngay cho con, cho trường xác minh đầu tiên!',
    threeSecondReflex: {
      step1: 'KHOẢNG DỪNG 60 GIÂY: Hít sâu, nhận diện ngay đòn tấn công hoảng loạn ("Cấp cứu + Đòi tiền ngay").',
      step2: 'GỌI KÊNH ĐỘC LẬP: Dùng máy khác gọi thẳng cho con, giáo viên chủ nhiệm hoặc bạn cùng lớp của con.',
      step3: 'SƠ CỨU GIỜ VÀNG (Nếu lỡ chuyển tiền/lộ OTP): Khóa khẩn cấp thẻ/app ngân hàng trong 60 giây đầu tiên -> Gọi hotline ngân hàng -> Trình báo Công an.',
    },
    brainMechanism: {
      hijackTarget: 'Bản năng Bảo vệ Người thân & Cơn bão Adrenaline làm tê liệt tư duy phản biện',
      whyStudentsFall: 'Khi nghe người thân nguy kịch, não bộ chuyển sang chế độ sinh tồn khẩn cấp, bỏ qua mọi bước kiểm tra thông thường.',
      cognitiveShield: 'Không một bệnh viện nào tại Việt Nam từ chối cấp cứu tính mạng học sinh chỉ vì gia đình chưa chuyển khoản cho một số tài khoản cá nhân lạ.',
    },
    sideBySideComparison: {
      trapSignal: 'Số lạ gọi báo tai nạn nguy kịch, thúc ép chuyển tiền ngay vào tài khoản cá nhân của "bác sĩ/thầy giáo" và liên tục giữ máy không cho cúp.',
      authenticSignal: 'Nhà trường và bệnh viện luôn liên hệ qua kênh chính thức, ưu tiên cứu người trước và thu viện phí tại quầy/tài khoản kho bạc bệnh viện.',
    },
    feynmanChallenge: {
      question: 'Nếu chẳng may người thân vừa lỡ đọc mã OTP hoặc chuyển tiền cho kẻ lừa đảo cách đây 2 phút, thứ tự 3 bước "Sơ cứu tài chính" đúng nhất là gì?',
      options: [
        {
          id: 'f8-a',
          text: 'Bước 1: Khóa khẩn cấp tài khoản/thẻ ngay trên app hoặc gọi hotline ngân hàng yêu cầu tra soát phong tỏa -> Bước 2: Đổi mật khẩu & ngắt kết nối mạng nếu cài app lạ -> Bước 3: Lưu bằng chứng ra trình báo Công an.',
          isBestExplanation: true,
          feedback: 'Chính xác! Tốc độ khóa tài khoản trong vài phút đầu tiên quyết định khả năng bảo toàn số dư còn lại.',
        },
        {
          id: 'f8-b',
          text: 'Bước 1: Lên Facebook tìm "Dịch vụ lấy lại tiền lừa đảo" -> Bước 2: Nhắn tin năn nỉ kẻ lừa đảo trả lại tiền.',
          isBestExplanation: false,
          feedback: 'Sai! Tìm dịch vụ thu hồi tiền trên mạng sẽ khiến nạn nhân sập tiếp bẫy lừa đảo lần 2.',
        },
        {
          id: 'f8-c',
          text: 'Xóa hết tin nhắn và lịch sử giao dịch vì xấu hổ.',
          isBestExplanation: false,
          feedback: 'Tuyệt đối không xóa! Sao kê và tin nhắn là tang vật quan trọng nhất để cơ quan Công an truy vết.',
        },
      ],
    },
    keyTakeawayForever: 'Bệnh viện luôn cứu người trước, không bao giờ đòi chuyển khoản vào tài khoản cá nhân mới chịu mổ. Luôn gọi kiểm tra trực tiếp!',
  },
  9: {
    sectorNumber: 9,
    sectorId: 'sector-9',
    coreTheme: 'Deepfake AI Video Call, Giả Giọng Nói Người Thân & Mật Khẩu Gia Đình',
    studentContext: 'Tài khoản Facebook của bạn thân hoặc người nhà bị hack (hoặc tạo giả), gọi video call thấy đúng khuôn mặt và giọng nói nhưng hình hơi giật, vừa mở lên 5 giây đã tắt báo "mạng yếu" rồi nhắn tin vay tiền gấp.',
    mnemonicRhyme: 'Gọi 5 giây tắt máy đòi tiền là Deepfake — Hỏi "Mật khẩu gia đình" là AI lộ mặt ngay!',
    threeSecondReflex: {
      step1: 'SOI BẤT THƯỜNG: Yêu cầu người gọi nghiêng mặt 90 độ hoặc vẫy bàn tay qua trước mũi/miệng (Deepfake thời gian thực sẽ bị nhòe/méo hình).',
      step2: 'HỎI MẬT KHẨU AN TOÀN: Đặt câu hỏi kỷ niệm riêng hoặc "Mật khẩu gia đình" mà chỉ 2 người biết.',
      step3: 'GỌI LẠI BẰNG SIM DI ĐỘNG: Tắt chat Messenger/Zalo và bấm gọi thẳng vào số điện thoại di động thường ngày của người đó.',
    },
    brainMechanism: {
      hijackTarget: 'Niềm tin "Mắt thấy tai nghe là thật" (Sensory Realism Bias)',
      whyStudentsFall: 'Trước kỷ nguyên AI, thấy mặt trên video call và nghe đúng giọng là bằng chứng 100%. Nay AI chỉ cần 3 giây âm thanh và 1 tấm ảnh trên mạng xã hội để nhép môi và giả giọng.',
      cognitiveShield: 'Trong kỷ nguyên AI, hình ảnh và giọng nói qua cuộc gọi ngắn đều có thể làm giả. Chỉ có "Mật khẩu gia đình" và "Gọi lại số SIM chính chủ" là thật.',
    },
    sideBySideComparison: {
      trapSignal: 'Video call chỉ kéo dài 3-10 giây, âm thanh rè, cử động môi cứng, tự cúp máy đổ lỗi sóng yếu rồi nhắn số tài khoản tên người lạ bảo chuyển gấp.',
      authenticSignal: 'Người thân thật sẵn sàng nghe cuộc gọi di động trực tiếp, trả lời được câu hỏi kỷ niệm riêng và số tài khoản trùng khớp tên chính chủ.',
    },
    feynmanChallenge: {
      question: 'Tối nay về nhà, bạn sẽ hướng dẫn cả gia đình thiết lập biện pháp nào đơn giản nhất để chống lại mọi công nghệ Deepfake AI giả giọng và khuôn mặt?',
      options: [
        {
          id: 'f9-a',
          text: 'Thống nhất một "Mật khẩu an toàn gia đình" (ví dụ: tên thú cưng cũ hoặc món ăn kỷ niệm) và quy tắc: Hễ vay tiền hay báo khẩn cấp qua mạng thì phải đọc đúng mật khẩu hoặc gọi lại qua SIM di động.',
          isBestExplanation: true,
          feedback: 'Tuyệt vời! "Mật khẩu an toàn gia đình" tốn 0 đồng nhưng vô hiệu hóa 100% siêu máy tính Deepfake AI.',
        },
        {
          id: 'f9-b',
          text: 'Cấm cả nhà không được dùng điện thoại thông minh nữa.',
          isBestExplanation: false,
          feedback: 'Không thực tế. Chúng ta cần kỹ năng phòng vệ thông minh chứ không phải từ bỏ công nghệ.',
        },
        {
          id: 'f9-c',
          text: 'Chỉ cần nhìn kỹ xem người trong video có mặc áo quen thuộc không.',
          isBestExplanation: false,
          feedback: 'Deepfake lấy chính video cũ của người thân trên Facebook nên quần áo hoàn toàn giống thật!',
        },
      ],
    },
    keyTakeawayForever: 'Thiết lập ngay "Mật khẩu an toàn gia đình" hôm nay — Vũ khí 0 đồng đánh bại mọi cuộc gọi Deepfake AI.',
  },
  10: {
    sectorNumber: 10,
    sectorId: 'sector-10',
    coreTheme: 'Bảo Mật Tài Khoản Game, Mạng Xã Hội, Ví Số & Pháo Đài 2FA / Passkey',
    studentContext: 'Kẻ gian gửi link "Bình chọn cuộc thi ảnh học sinh", "Nhận vật phẩm Steam/Roblox/Valorant", hoặc "Cảnh báo vi phạm bản quyền Facebook" để đánh cắp mật khẩu, phiên đăng nhập (Session Token) hoặc cụm từ khôi phục.',
    mnemonicRhyme: 'Mật khẩu dài kèm Xác thực hai lớp (2FA) — Ai xin mã OTP hay Seed Phrase đều là kẻ cắp!',
    threeSecondReflex: {
      step1: 'BẬT 2FA / PASSKEY cho toàn bộ Gmail, Facebook, Zalo, TikTok và tài khoản Game.',
      step2: 'KHÔNG ĐĂNG NHẬP tài khoản mạng xã hội vào các trang web bình chọn/nhận giftcode lạ.',
      step3: 'BẢO MẬT TUYỆT ĐỐI mã OTP và 12/24 từ khóa khôi phục (Seed Phrase) — Không một nhân viên hỗ trợ nào có quyền hỏi mã này.',
    },
    brainMechanism: {
      hijackTarget: 'Sự chủ quan dùng 1 mật khẩu cho mọi tài khoản & Tâm lý nhiệt tình giúp bạn bè "bình chọn"',
      whyStudentsFall: 'Khi tài khoản của một người bạn bị chiếm đoạt, hacker dùng chính nick đó nhắn tin nhờ cả lớp bấm link "Bình chọn cho mình với", tạo hiệu ứng dây chuyền.',
      cognitiveShield: 'Bất kỳ trang bình chọn hay sự kiện nào bắt bạn gõ lại Mật khẩu + Mã OTP Facebook/Gmail/Steam đều là trang thu thập mật khẩu (Credential Harvesting).',
    },
    sideBySideComparison: {
      trapSignal: 'Trang web sự kiện/bình chọn yêu cầu đăng nhập lại tài khoản và nhập mã xác nhận 6 số gửi về máy.',
      authenticSignal: 'Các nền tảng chính thức sử dụng chuẩn đăng nhập OAuth trên tên miền gốc (accounts.google.com / facebook.com) và không bao giờ hỏi mật khẩu qua form lạ.',
    },
    feynmanChallenge: {
      question: 'Một người bạn cùng lớp nhắn Messenger: "Ê vào link này bình chọn cuộc thi vẽ cho tớ với, chỉ cần đăng nhập Facebook là xong!". Bạn nên phản ứng thế nào?',
      options: [
        {
          id: 'f10-a',
          text: 'Tuyệt đối không đăng nhập vào link đó vì nick của bạn ấy rất có thể vừa bị hack bởi chính đường link giả mạo này! Hãy gọi điện trực tiếp báo cho bạn ấy kiểm tra lại tài khoản.',
          isBestExplanation: true,
          feedback: 'Rất nhạy bén! Bạn không chỉ tự bảo vệ mình mà còn kịp thời cứu tài khoản của bạn cùng lớp.',
        },
        {
          id: 'f10-b',
          text: 'Đăng nhập ngay và nhập luôn mã 6 số để giúp bạn giành giải.',
          isBestExplanation: false,
          feedback: 'Ngay khi bạn nhập mã 6 số, tài khoản của bạn sẽ bị chiếm đoạt và tiếp tục đi gửi link lừa cả danh bạ!',
        },
        {
          id: 'f10-c',
          text: 'Dùng tài khoản Gmail chính của mình đăng nhập thay cho Facebook.',
          isBestExplanation: false,
          feedback: 'Mất Gmail chính còn nguy hiểm hơn vì Gmail gắn với mọi tài khoản ngân hàng và mạng xã hội khác!',
        },
      ],
    },
    keyTakeawayForever: 'Mỗi tài khoản trọng yếu một mật khẩu riêng + Bật 2FA/Passkey; và không bao giờ nhập mật khẩu vào link "bình chọn" gửi qua tin nhắn.',
  },
  11: {
    sectorNumber: 11,
    sectorId: 'sector-11',
    coreTheme: 'An Toàn WiFi Công Cộng (Evil Twin), Cổng Sạc USB Lạ & Dấu Vết Số (OSINT)',
    studentContext: 'Truy cập WiFi không mật khẩu ở quán trà sữa/sân bay mang tên gần giống quán thật rồi đăng nhập ngân hàng; hoặc đăng ảnh vé máy bay/thẻ học sinh/CCCD công khai lên TikTok/Facebook.',
    mnemonicRhyme: 'WiFi chùa đừng mở ngân hàng — Thẻ căn cước, mã vạch đừng khoe lên mạng!',
    threeSecondReflex: {
      step1: 'CHUYỂN SANG 4G/5G CÁ NHÂN mỗi khi cần đăng nhập ngân hàng, ví điện tử hoặc nhập mật khẩu quan trọng nơi công cộng.',
      step2: 'DÙNG CỦ SẠC RIÊNG hoặc pin dự phòng thay vì cắm thẳng dây cáp USB vào ổ USB lạ nơi công cộng (chống Juice Jacking).',
      step3: 'CHE MÃ QR / SỐ CCCD / ĐỊA CHỈ NHÀ trước khi đăng bất kỳ bức ảnh nào lên mạng xã hội.',
    },
    brainMechanism: {
      hijackTarget: 'Ảo giác Vô hình nơi công cộng & Nhu cầu Chia sẻ Mạng xã hội',
      whyStudentsFall: 'Học sinh thường nghĩ hacker phải dùng siêu máy tính, nhưng thực tế 80% dữ liệu dùng để lừa đảo (họ tên, trường lớp, số điện thoại bố mẹ, số CCCD) là do nạn nhân tự đăng công khai lên mạng (OSINT).',
      cognitiveShield: 'Mọi thông tin bạn đăng công khai trên mạng xã hội đều có thể trở thành "nguyên liệu kịch bản" để kẻ gian giả danh lừa chính gia đình bạn.',
    },
    sideBySideComparison: {
      trapSignal: 'WiFi công cộng không mật khẩu nhưng tự bật trang yêu cầu đăng nhập tài khoản mạng xã hội hoặc cài chứng chỉ cấu hình vào máy.',
      authenticSignal: 'Kết nối dữ liệu di động 4G/5G cá nhân khi giao dịch tài chính và kiểm soát quyền riêng tư bài đăng ở chế độ Bạn bè.',
    },
    feynmanChallenge: {
      question: 'Tại sao việc chụp ảnh thẻ học sinh, giấy báo trúng tuyển hoặc vé máy bay có kèm mã vạch đăng công khai lên Story lại cực kỳ nguy hiểm?',
      options: [
        {
          id: 'f11-a',
          text: 'Vì mã vạch/QR trên đó chứa họ tên đầy đủ, ngày sinh, mã định danh và lịch trình di chuyển — kẻ gian chỉ cần quét ảnh là có đủ dữ liệu để dựng kịch bản lừa bố mẹ bạn!',
          isBestExplanation: true,
          feedback: 'Chính xác! Bảo vệ dữ liệu cá nhân (OSINT Hygiene) là phòng tuyến gốc rễ ngăn chặn các kịch bản lừa đảo nhắm mục tiêu.',
        },
        {
          id: 'f11-b',
          text: 'Vì ảnh chụp thẻ thường không đẹp bằng ảnh selfie.',
          isBestExplanation: false,
          feedback: 'Vấn đề cốt lõi là rò rỉ dữ liệu định danh cá nhân (PII).',
        },
        {
          id: 'f11-c',
          text: 'Chỉ cần xóa bài sau 24 giờ là không ai lưu kịp.',
          isBestExplanation: false,
          feedback: 'Các công cụ thu thập dữ liệu tự động (Bots) có thể quét và lưu ảnh chỉ trong vài phút sau khi đăng.',
        },
      ],
    },
    keyTakeawayForever: 'Giao dịch tiền bạc chỉ dùng 4G/5G; và tuyệt đối không đăng ảnh có số CCCD, thẻ ngân hàng, mã vạch vé lên mạng xã hội.',
  },
  12: {
    sectorNumber: 12,
    sectorId: 'sector-12',
    coreTheme: 'Phòng Chống Bẫy Lừa Đảo Kép "Thu Hồi Tiền Đã Mất" (Recovery Scam)',
    studentContext: 'Sau khi nạn nhân bị lừa mất tiền, trên Facebook/TikTok xuất hiện hàng loạt trang có tích xanh giả mạo "Cục An Ninh Mạng / Văn phòng Luật sư / Hacker Mũ Trắng nhận lấy lại 100% tiền bị treo trên hệ thống".',
    mnemonicRhyme: 'Mất tiền chỉ báo Công an — Ai đòi "phí thu hồi vốn" trên mạng là lừa tập hai!',
    threeSecondReflex: {
      step1: 'NHẬN DIỆN BẪY KÉP: Không một cá nhân hay "văn phòng luật sư/hacker" nào trên Facebook có quyền can thiệp hệ thống ngân hàng để kéo tiền về.',
      step2: 'KHÔNG NỘP PHÍ THU HỒI: Mọi yêu cầu đóng "phí mở băng / phí chạy phần mềm thu hồi / thuế hoàn tiền" đều là lừa đảo lần 2.',
      step3: 'KÊNH DUY NHẤT HỢP PHÁP: Tập hợp sao kê ngân hàng, ảnh chụp tin nhắn và nộp đơn trình báo trực tiếp tại Cơ quan Công an nơi cư trú.',
    },
    brainMechanism: {
      hijackTarget: 'Tâm lý Tuyệt vọng muốn gỡ gạc & Sự hoảng loạn sau sang chấn mất tiền',
      whyStudentsFall: 'Nạn nhân vừa mất tiền đang hoang mang và sợ gia đình trách mắng, nên khi thấy quảng cáo "Cam kết lấy lại tiền trong 30 phút" liền bám lấy như chiếc phao cứu sinh.',
      cognitiveShield: 'Thậm chí chính băng nhóm vừa lừa bạn ở lần 1 sẽ đổi vai thành "Chuyên gia thu hồi tiền" để vắt kiệt số tiền cuối cùng của bạn ở lần 2!',
    },
    sideBySideComparison: {
      trapSignal: 'Fanpage chạy quảng cáo cam kết thu hồi tiền lừa đảo trong 15-30 phút, gửi ảnh ghép lệnh chuyển tiền và đòi đóng 10% phí kích hoạt trước.',
      authenticSignal: 'Cơ quan Công an tiếp nhận đơn trình báo trực tiếp tại trụ sở hoàn toàn KHÔNG thu "phí chạy phần mềm thu hồi tiền" qua mạng.',
    },
    feynmanChallenge: {
      question: 'Một người quen vừa bị lừa 10 triệu đồng và khoe: "May quá, mình tìm được trang Cục An Ninh Mạng trên Facebook nhận lấy lại giúp cả 10 triệu, chỉ cần đóng 1 triệu phí mở cổng hoàn tiền!". Bạn sẽ nói gì?',
      options: [
        {
          id: 'f12-a',
          text: 'Dừng lại ngay! Cơ quan Công an và Cục An toàn thông tin KHÔNG BAO GIỜ nhận hồ sơ thu hồi tiền qua Facebook và không bao giờ thu phí mở cổng. Đó là bọn lừa đảo đóng giả để cướp thêm 1 triệu nữa!',
          isBestExplanation: true,
          feedback: 'Hoàn toàn chính xác! Ngăn chặn kịp thời bẫy lừa đảo kép giúp nạn nhân không rơi vào cảnh mất tiền chồng chất.',
        },
        {
          id: 'f12-b',
          text: 'Chuyển thử 1 triệu vì biết đâu lấy lại được 10 triệu thật.',
          isBestExplanation: false,
          feedback: '100% sẽ mất luôn 1 triệu đó và bị đòi thêm 3 triệu, 5 triệu tiếp theo!',
        },
        {
          id: 'f12-c',
          text: 'Cung cấp luôn mật khẩu ngân hàng cho trang Facebook đó để họ chuyển tiền về nhanh hơn.',
          isBestExplanation: false,
          feedback: 'Cực kỳ nguy hiểm! Sẽ bị quét sạch toàn bộ số tiền còn lại trong tài khoản.',
        },
      ],
    },
    keyTakeawayForever: '100% quảng cáo "Nhận lấy lại tiền bị lừa trên mạng" là lừa đảo tập 2. Kênh duy nhất tiếp nhận điều tra là trụ sở Cơ quan Công an.',
  },
};

export const INTERACTIVE_SCAM_ANATOMY_CASES: InteractiveScamAnatomyCase[] = [
  {
    id: 'anat-1',
    title: 'Bẫy Tuyển CTV TikTok / Shopee "Nhiệm Vụ Ghép Đơn"',
    targetAudience: 'Học sinh THPT & Sinh viên tìm việc làm thêm',
    channel: 'Telegram / Zalo',
    difficulty: 'Trung bình',
    senderDisplay: 'Quản Lý Nhân Sự - Hoàng Mai (Telegram)',
    rawMessage:
      'Chúc mừng em đã hoàn thành 2 nhiệm vụ đầu và nhận 120.000đ về tài khoản! Hiện hệ thống đang mở ĐƠN KẾT HỢP VIP #889 trị giá 1.850.000đ (Hoa hồng 35% = nhận ngay 2.497.000đ sau 3 phút). Lưu ý: Chỉ còn 04 phút để hoàn tất chuyển khoản vào TK Kế toán, nếu quá hạn tài khoản làm việc sẽ bị đóng băng vĩnh viễn!',
    layers: [
      {
        id: 'l1',
        layerType: 'PSYCHOLOGY',
        label: '1. Mồi nhử Niềm tin (120.000đ thật ban đầu)',
        highlightedSnippet: 'đã hoàn thành 2 nhiệm vụ đầu và nhận 120.000đ về tài khoản!',
        analysis: 'Kẻ gian chủ động trả tiền thật ở 2 đơn nhỏ đầu tiên để phá vỡ sự nghi ngờ của học sinh, kích hoạt tâm lý "App này trả tiền thật!".',
        memoryRule: 'Tiền thưởng dễ dàng lúc đầu chỉ là mồi câu.',
      },
      {
        id: 'l2',
        layerType: 'FINANCE',
        label: '2. Đảo chiều Nạp tiền (Hoa hồng 35% phi thực tế)',
        highlightedSnippet: 'ĐƠN KẾT HỢP VIP #889 trị giá 1.850.000đ (Hoa hồng 35% = nhận ngay 2.497.000đ sau 3 phút)',
        analysis: 'Từ việc "nhận tiền", kẻ gian lập tức chuyển sang bắt nạn nhân "nạp tiền túi" với mức lãi suất không tưởng (35% trong 3 phút).',
        memoryRule: 'Đi làm là để nhận lương — Bắt nạp tiền trước 100% là lừa đảo.',
      },
      {
        id: 'l3',
        layerType: 'PSYCHOLOGY',
        label: '3. Ép thời gian & Đe dọa đóng băng (Urgency + Fear)',
        highlightedSnippet: 'Chỉ còn 04 phút để hoàn tất... tài khoản làm việc sẽ bị đóng băng vĩnh viễn!',
        analysis: 'Tạo áp lực thời gian cực ngắn (4 phút) để học sinh không kịp hỏi ý kiến bố mẹ hoặc bạn bè.',
        memoryRule: 'Ai giục chuyển tiền trong vài phút -> Dừng lại ngay!',
      },
      {
        id: 'l4',
        layerType: 'DEFENSE',
        label: '4. Phản xạ Khóa Chặn 3 Giây',
        highlightedSnippet: 'Chuyển khoản vào TK Kế toán',
        analysis: 'Khi đã nạp 1,85 triệu, chúng sẽ báo "Em ghi sai nội dung chuyển khoản, phải nạp thêm 5 triệu để mở khóa!".',
        memoryRule: 'Dừng hợp tác ngay lập tức, tuyệt đối không nạp bất kỳ đồng nào!',
      },
    ],
    goldenReflex: 'Tuyệt đối không nạp tiền cá nhân khi đi làm thêm online; và nếu lỡ mất tiền, không bao giờ nạp thêm để "mở khóa rút vốn".',
  },
  {
    id: 'anat-2',
    title: 'Bẫy Giả Danh Công An "Bắt Cóc Online" & App VNeID Giả (.APK)',
    targetAudience: 'Học sinh, Sinh viên & Phụ huynh',
    channel: 'Cuộc gọi điện thoại + Zalo Video',
    difficulty: 'Nâng cao',
    senderDisplay: '+84 918 xxx xxx (Tự xưng Đại úy Cơ quan Điều tra)',
    rawMessage:
      'Thông báo khẩn: Số CCCD của cháu đang đứng tên một tài khoản ngân hàng liên quan đến đường dây rửa tiền xuyên quốc gia. Yêu cầu cháu cầm điện thoại vào phòng riêng, TUYỆT ĐỐI KHÔNG ĐƯỢC NÓI VỚI BỐ MẸ vì đây là chuyên án mật, truy cập ngay vneid-bocongan.org để tải phần mềm giám sát và chuyển toàn bộ tiền sang Tài khoản Tạm giữ để xác minh trong sạch!',
    layers: [
      {
        id: 'l2-1',
        layerType: 'PSYCHOLOGY',
        label: '1. Đòn Uy quyền & Khủng bố tinh thần (Authority + Fear)',
        highlightedSnippet: 'liên quan đến đường dây rửa tiền xuyên quốc gia',
        analysis: 'Đánh vào nỗi sợ pháp luật của học sinh/sinh viên chưa có kinh nghiệm va chạm, dùng thuật ngữ hình sự để gây sốc tâm lý.',
        memoryRule: 'Công an không bao giờ đọc lệnh bắt hay thẩm vấn qua điện thoại/Zalo.',
      },
      {
        id: 'l2-2',
        layerType: 'PSYCHOLOGY',
        label: '2. Chiến thuật Cô lập Nạn nhân (Isolation)',
        highlightedSnippet: 'vào phòng riêng, TUYỆT ĐỐI KHÔNG ĐƯỢC NÓI VỚI BỐ MẸ vì đây là chuyên án mật',
        analysis: 'Mục đích nguy hiểm nhất: Tách học sinh khỏi bố mẹ và thầy cô — những người sẽ phát hiện ra ngay đây là trò lừa đảo.',
        memoryRule: 'Ai cấm bạn kể với bố mẹ -> Người đó đang muốn hại bạn!',
      },
      {
        id: 'l2-3',
        layerType: 'TECHNICAL',
        label: '3. Tên miền giả mạo & Mã độc chiếm quyền (.APK)',
        highlightedSnippet: 'truy cập ngay vneid-bocongan.org để tải phần mềm giám sát',
        analysis: 'Cơ quan nhà nước Việt Nam chỉ dùng đuôi ".gov.vn". Đuôi ".org" kèm file cài đặt ngoài chợ ứng dụng sẽ chiếm quyền đọc tin nhắn OTP và điều khiển màn hình.',
        memoryRule: 'Website chính phủ phải có đuôi .gov.vn; không bao giờ cài file .apk qua link!',
      },
      {
        id: 'l2-4',
        layerType: 'FINANCE',
        label: '4. Khái niệm giả "Tài khoản Tạm giữ xác minh"',
        highlightedSnippet: 'chuyển toàn bộ tiền sang Tài khoản Tạm giữ để xác minh trong sạch!',
        analysis: 'Trong pháp luật Việt Nam hoàn toàn không tồn tại việc yêu cầu công dân tự chuyển tiền qua mạng để "chứng minh tiền sạch".',
        memoryRule: 'Cúp máy ngay lập tức, bước ra khỏi phòng và báo cho bố mẹ/thầy cô.',
      },
    ],
    goldenReflex: 'Cúp máy ngay! Cơ quan Công an chỉ làm việc trực tiếp tại trụ sở qua Giấy mời văn bản, không bao giờ làm việc qua Zalo hay yêu cầu giữ bí mật với gia đình.',
  },
  {
    id: 'anat-3',
    title: 'Bẫy Deepfake AI Giả Mạo Bạn Học / Người Thân Vay Tiền Gấp',
    targetAudience: 'Học sinh, Sinh viên & Gia đình',
    channel: 'Messenger Video Call (5 giây)',
    difficulty: 'Trung bình',
    senderDisplay: 'Minh Anh (Bạn cùng lớp - Nick vừa bị chiếm đoạt)',
    rawMessage:
      '[Vừa gọi Video Call 4 giây thấy mặt Minh Anh nhưng không nghe rõ tiếng rồi tắt] "Mạng 4G chỗ tớ yếu quá không nghe được! Tớ đang ở hiệu thuốc mua đồ cấp cứu cho mẹ mà app ngân hàng bị lỗi bảo trì, cậu chuyển gấp hộ tớ 2.500.000đ vào số TK 1903xxx tên NGUYEN VAN TUNG (chủ tiệm thuốc) nhé, 15 phút nữa về nhà tớ trả luôn!"',
    layers: [
      {
        id: 'l3-1',
        layerType: 'TECHNICAL',
        label: '1. Video Call 4 giây bằng Deepfake AI',
        highlightedSnippet: '[Vừa gọi Video Call 4 giây thấy mặt Minh Anh nhưng không nghe rõ tiếng rồi tắt]',
        analysis: 'Kẻ gian dùng video ngắn cắt từ Story cũ hoặc Deepfake ghép mặt, chỉ bật 3-5 giây rồi chủ động tắt và đổ lỗi "mạng yếu" để bạn không kịp phát hiện cử động giả.',
        memoryRule: 'Gọi video vài giây rồi tắt đổ lỗi mạng yếu = Dấu hiệu số 1 của Deepfake!',
      },
      {
        id: 'l3-2',
        layerType: 'PSYCHOLOGY',
        label: '2. Lý do Cấp bách + Lòng tốt (Urgency + Sympathy)',
        highlightedSnippet: 'mua đồ cấp cứu cho mẹ mà app ngân hàng bị lỗi bảo trì',
        analysis: 'Kết hợp tình huống khẩn cấp về sức khỏe người thân với lý do quen thuộc "app ngân hàng bảo trì" để thúc giục chuyển tiền ngay.',
        memoryRule: 'Càng gấp càng phải gọi lại bằng số điện thoại SIM thường ngày.',
      },
      {
        id: 'l3-3',
        layerType: 'FINANCE',
        label: '3. Tài khoản nhận tiền mang tên người lạ (Mule Account)',
        highlightedSnippet: 'chuyển gấp hộ tớ 2.500.000đ vào số TK 1903xxx tên NGUYEN VAN TUNG',
        analysis: 'Bạn Minh Anh hỏi vay nhưng tài khoản nhận tiền lại mang tên một người hoàn toàn xa lạ (kẻ gian bịa là "chủ tiệm thuốc").',
        memoryRule: 'Nick một người nhưng tên tài khoản ngân hàng là người khác -> Ngừng chuyển khoản!',
      },
      {
        id: 'l3-4',
        layerType: 'DEFENSE',
        label: '4. Phản xạ Xác minh Đa kênh',
        highlightedSnippet: '15 phút nữa về nhà tớ trả luôn!',
        analysis: 'Chỉ cần thoát Messenger và bấm gọi điện thoại di động thông thường (GSM) cho Minh Anh hoặc hỏi 1 câu kỷ niệm trên lớp là toàn bộ kịch bản sụp đổ.',
        memoryRule: 'Luôn gọi điện qua số di động hoặc hỏi Mật khẩu an toàn trước khi chuyển tiền.',
      },
    ],
    goldenReflex: 'Tuyệt đối không chuyển tiền chỉ vì vừa thấy mặt qua cuộc gọi video vài giây. Hãy gọi lại bằng số điện thoại SIM hoặc hỏi câu hỏi riêng tư.',
  },
];

export const PERMANENT_MEMORY_FLASHCARDS: MemoryFlashcard[] = [
  {
    id: 'fc-1',
    category: 'Tên miền & Link',
    frontTrigger: 'Nhận được SMS mang tên ngân hàng báo "Khóa thẻ, bấm link xác thực ngay"',
    frontScenario: 'Link hiển thị: https://vietcombank.vn.xacthuc-id.top/login',
    backMnemonic: 'ĐỌC NGƯỢC TRƯỚC DẤU "/" ĐẦU TIÊN!',
    backActionSteps: [
      'Nhìn ngay cụm chữ trước dấu "/" đơn đầu tiên: ở đây là "xacthuc-id.top" chứ không phải "vietcombank.vn".',
      'Tuyệt đối không bấm link trong SMS vì trạm BTS giả có thể nhét tin nhắn vào luồng thật.',
      'Tự mở ứng dụng ngân hàng trên màn hình chính điện thoại để kiểm tra.',
    ],
    whyItWorks: 'Tên miền thật luôn nằm sát bên trái dấu "/" đầu tiên. Kẻ gian không bao giờ mua được đuôi chính thức của ngân hàng hay ".gov.vn".',
  },
  {
    id: 'fc-2',
    category: 'Tâm lý',
    frontTrigger: 'Người tự xưng Công an / Viện kiểm sát gọi video dọa bắt giữ & cấm kể với bố mẹ',
    frontScenario: '"Cháu dính líu đường dây rửa tiền, vào phòng đóng kín cửa làm việc qua Zalo ngay!"',
    backMnemonic: 'CÔNG AN 3 KHÔNG: Không gọi Zalo - Không giữ bí mật - Không đòi chuyển tiền!',
    backActionSteps: [
      'Cúp máy ngay lập tức, không tranh cãi để tránh bị cuốn vào thao túng tâm lý.',
      'Tuyệt đối không cài đặt ứng dụng .APK hay chuyển tiền vào "tài khoản tạm giữ".',
      'Kể ngay cho bố mẹ, thầy cô hoặc đến trực tiếp Công an phường để xác minh.',
    ],
    whyItWorks: 'Theo luật tố tụng Việt Nam, cơ quan điều tra chỉ làm việc trực tiếp tại trụ sở thông qua Giấy mời/Giấy triệu tập bằng văn bản.',
  },
  {
    id: 'fc-3',
    category: 'Tài chính & OTP',
    frontTrigger: 'Tuyển CTV làm nhiệm vụ online trả thưởng thật 100k ở 2 đơn đầu, sau đó bảo nạp 1,5 triệu',
    frontScenario: '"Nạp 1,5 triệu kích hoạt đơn VIP nhận về 2 triệu sau 5 phút"',
    backMnemonic: 'ĐI LÀM ĐỂ NHẬN LƯƠNG — BẮT NẠP TIỀN LÀ ĐƯỜNG VÀO BẪY!',
    backActionSteps: [
      'Dừng lại ngay sau khi nhận biết yêu cầu nạp tiền túi.',
      'Hiểu rõ 100k ban đầu chỉ là "mồi câu" để kích thích lòng tham và sự tin tưởng.',
      'Nếu lỡ nạp tiền và bị báo "sai cú pháp", tuyệt đối không nạp thêm tiền để cứu vốn.',
    ],
    whyItWorks: 'Số dư trên web làm nhiệm vụ chỉ là con số ảo do kẻ lừa đảo tự gõ; nạp thêm bao nhiêu sẽ mất trắng bấy nhiêu.',
  },
  {
    id: 'fc-4',
    category: 'Deepfake & AI',
    frontTrigger: 'Bạn thân hoặc người nhà gọi Video Call 5 giây rồi tắt báo "mạng yếu", nhắn tin mượn tiền gấp',
    frontScenario: 'Hình ảnh đúng là người thân nhưng hơi mờ/giật, số tài khoản nhận tiền lại mang tên người lạ.',
    backMnemonic: 'VIDEO 5 GIÂY ĐÒI TIỀN LÀ AI — HỎI MẬT KHẨU GIA ĐÌNH LÀ LỘ NGAY!',
    backActionSteps: [
      'Không chuyển khoản vào số tài khoản khác tên người vay.',
      'Thoát ứng dụng chat, bấm gọi thẳng vào số điện thoại SIM di động của người đó.',
      'Hỏi "Mật khẩu an toàn gia đình" hoặc một kỷ niệm riêng trên lớp mà AI không thể biết.',
    ],
    whyItWorks: 'Deepfake AI có thể nhái mặt và giọng trong vài giây nhưng không thể trả lời câu hỏi mật khẩu riêng hay nhận cuộc gọi vào số SIM chính chủ.',
  },
  {
    id: 'fc-5',
    category: 'Mạng xã hội & Game',
    frontTrigger: 'Bạn bè gửi link "Bình chọn cuộc thi ảnh / Nhận quà tặng Game" bắt đăng nhập lại Facebook/Gmail',
    frontScenario: 'Trang web hiện khung yêu cầu nhập Email, Mật khẩu và Mã xác nhận 6 số.',
    backMnemonic: 'LINK BÌNH CHỌN ĐÒI MẬT KHẨU = BẪY CƯỚP TÀI KHOẢN DÂY CHUYỀN!',
    backActionSteps: [
      'Đóng ngay trang web, không nhập mật khẩu hay mã OTP 2FA.',
      'Gọi điện báo cho người bạn vừa gửi link vì tài khoản của họ đã bị hack.',
      'Đảm bảo mọi tài khoản quan trọng đã bật Xác thực 2 lớp (2FA / Passkey).',
    ],
    whyItWorks: 'Hacker chiếm nick của 1 học sinh rồi dùng nick đó gửi link giả cho toàn bộ danh bạ bạn bè trong lớp.',
  },
  {
    id: 'fc-6',
    category: 'Tài chính & OTP',
    frontTrigger: 'Quảng cáo "Cục An Ninh Mạng / Luật Sư hỗ trợ thu hồi 100% tiền bị lừa đảo trong 30 phút"',
    frontScenario: 'Yêu cầu đóng 1-2 triệu "phí mở băng hệ thống / phí chạy phần mềm kéo tiền về".',
    backMnemonic: 'MẤT TIỀN CHỈ BÁO CÔNG AN — THU HỒI QUA MẠNG LÀ LỪA TẬP HAI!',
    backActionSteps: [
      'Tuyệt đối không liên hệ hay chuyển phí cho bất kỳ trang "thu hồi tiền" nào trên Facebook/TikTok.',
      'Khóa khẩn cấp thẻ/tài khoản ngân hàng và yêu cầu ngân hàng tra soát nếu vừa mới giao dịch.',
      'In sao kê và tin nhắn ra trình báo trực tiếp tại trụ sở Công an phường/xã nơi cư trú.',
    ],
    whyItWorks: 'Cơ quan chức năng không bao giờ làm dịch vụ thu hồi tiền qua mạng xã hội và không bao giờ thu phí kích hoạt hoàn tiền.',
  },
];

export const PEDAGOGY_METHOD_PILLARS: PedagogyMethodPillar[] = [
  {
    id: 'p1',
    stepNumber: 'BƯỚC 01 · KÍCH HOẠT',
    title: 'Tiêm Chủng Tâm Lý Bằng Cú Sốc An Toàn (Micro-Trap Inoculation)',
    scientificPrinciple: 'Lý thuyết Tiêm chủng Tâm lý (McGuire Inoculation Theory)',
    retentionRate: 85,
    studentActivity: 'Học sinh trải nghiệm 1 tình huống giả lập 15 giây (tin nhắn/cuộc gọi giống thật 100%) trước khi học lý thuyết để tự phát hiện điểm mù của não bộ.',
    classroomArrangement: 'Chiếu tình huống lên màn hình hoặc điện thoại cá nhân -> Cho học sinh bấm chọn hành động trong 10 giây -> Công bố tỷ lệ sập bẫy ngay tại lớp.',
    practicalExample: 'Cho cả lớp xem 2 đường link ngân hàng trong 5 giây: 70% học sinh chọn nhầm tạo ra "Khoảnh khắc Aha!" nhớ suốt đời.',
  },
  {
    id: 'p2',
    stepNumber: 'BƯỚC 02 · GIẢI PHẪU',
    title: 'Mã Hóa Kép: Hình Ảnh X-Ray + Khẩu Quyết Vần Điệu 3 Giây (Dual-Coding)',
    scientificPrinciple: 'Lý thuyết Mã hóa Kép (Paivio Dual-Coding) & Chunking',
    retentionRate: 90,
    studentActivity: 'Bóc tách tin nhắn lừa đảo thành 3 màu trực quan (Đỏ: Đòn tâm lý, Vàng: Lỗ hổng kỹ thuật, Xanh: Phản xạ khóa chặn) kèm 1 câu vần điệu.',
    classroomArrangement: 'Không đọc văn bản dài. Mỗi bài học chỉ gói gọn trong 1 Sơ đồ Giải phẫu + 1 Khẩu quyết 2 vế có vần điệu để cả lớp đọc đồng thanh.',
    practicalExample: '"Đọc link từ phải sang trái — Thấy đuôi lạ (.xyz, .top) là né ngay lập tức!"',
  },
  {
    id: 'p3',
    stepNumber: 'BƯỚC 03 · NHẬP VAI',
    title: 'Đối Kháng Nhập Vai "Kẻ Lừa Đảo vs Vệ Binh" (Peer Roleplay)',
    scientificPrinciple: 'Học tập Trải nghiệm Chủ động (Experiential Active Recall)',
    retentionRate: 94,
    studentActivity: 'Hai học sinh ghép cặp: 1 bạn đóng vai kẻ gian dùng kịch bản ép tâm lý, 1 bạn dùng "Bộ câu thoại phản kháng chuẩn" để bẻ gãy lập luận trong 30 giây.',
    classroomArrangement: 'Chia nhóm đôi hoặc sử dụng Phòng Đấu Trùm (Boss Battle) / Giả lập Cuộc gọi AI trên ScamGuard để rèn phản xạ giọng nói dưới áp lực.',
    practicalExample: 'Khi bạn đóng vai Công an giả quát "Không được nói với bố mẹ!", bạn kia phản xạ ngay: "Mời gửi giấy triệu tập về Công an phường!".',
  },
  {
    id: 'p4',
    stepNumber: 'BƯỚC 04 · KHẮC SÂU 100%',
    title: 'Kỹ Thuật Feynman: "Học Sinh Làm Đại Sứ Dạy Lại Cho Gia Đình"',
    scientificPrinciple: 'Hiệu ứng Protégé & Kỹ thuật Feynman (Learning by Teaching = 95%+ Retention)',
    retentionRate: 98,
    studentActivity: 'Học sinh tóm tắt bài học bằng ngôn ngữ bình dân nhất trong 1 phút để về nhà hướng dẫn lại cho ông bà, bố mẹ và lập "Mật khẩu gia đình".',
    classroomArrangement: 'Cuối mỗi phân khu, học sinh hoàn thành Thử thách Feynman trên ứng dụng và nhận nhiệm vụ "Kiểm tra an toàn cho 1 người thân trong gia đình".',
    practicalExample: 'Học sinh về nhà cùng bố mẹ đặt "Mật khẩu an toàn gia đình" chống Deepfake — biến kiến thức trên lớp thành lá chắn thực tế suốt đời.',
  },
];
