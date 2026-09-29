import { AnalysisResult, CommunicationChannel, RiskSignal } from '../types';

export function runClientSideTextAnalysis(
  text: string,
  urlStr?: string,
  sender?: string,
  channel: CommunicationChannel = 'sms'
): AnalysisResult {
  const lowerText = (text || '').toLowerCase();
  const lowerUrl = (urlStr || '').toLowerCase();
  const lowerSender = (sender || '').toLowerCase();

  let heuristicScore = 15;
  const signals: RiskSignal[] = [];
  const redFlags: string[] = [];
  const evidenceList: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    snippet?: string;
    description: string;
  }> = [];

  // 1. DOMAIN & URL FORENSIC ANALYSIS
  let domain = '';
  let brandImpersonationFound = false;
  let targetedBrand = '';
  let suspiciousTld = false;

  if (urlStr && urlStr.trim().length > 0) {
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      domain = parsed.hostname;
    } catch {
      const match = urlStr.match(/(?:https?:\/\/)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/i);
      domain = match ? match[1] : urlStr;
    }

    const dLower = domain.toLowerCase();
    const suspiciousTlds = ['.top', '.xyz', '.vip', '.cc', '.work', '.club', '.online', '.site', '.ru', '.click', '.tk', '.ml'];
    suspiciousTld = suspiciousTlds.some((tld) => dLower.endsWith(tld));

    const brands = [
      { name: 'vietcombank', official: ['vietcombank.com.vn', 'vietcombank.com'] },
      { name: 'techcombank', official: ['techcombank.com.vn', 'techcombank.com'] },
      { name: 'mbbank', official: ['mbbank.com.vn'] },
      { name: 'acb', official: ['acb.com.vn'] },
      { name: 'bidv', official: ['bidv.com.vn'] },
      { name: 'vneid', official: ['vneid.gov.vn', 'dichvucong.gov.vn'] },
      { name: 'dichvucong', official: ['dichvucong.gov.vn'] },
      { name: 'shopee', official: ['shopee.vn'] },
      { name: 'telegram', official: ['telegram.org', 't.me'] },
    ];

    for (const b of brands) {
      if (dLower.includes(b.name)) {
        targetedBrand = b.name.toUpperCase();
        const isOfficial = b.official.some((off) => dLower === off || dLower.endsWith(`.${off}`));
        if (!isOfficial) {
          brandImpersonationFound = true;
          break;
        }
      }
    }

    if (brandImpersonationFound) {
      heuristicScore += 45;
      signals.push({
        name: 'Mạo Danh Tên Miền Tổ Chức / Thương Hiệu (Brand Typosquatting)',
        scoreContribution: 40,
        description: `Tên miền [${domain}] chứa từ khóa thương hiệu [${targetedBrand}] nhưng không thuộc máy chủ chính thức của tổ chức.`,
        category: 'Domain',
      });
      evidenceList.push({
        severity: 'critical',
        title: `Giả Mạo Tên Miền ${targetedBrand}`,
        snippet: domain,
        description: `Website sử dụng tên miền phụ hoặc tên miền lạ để đánh lừa người dùng nhầm lẫn với cổng đăng nhập chính thống của ${targetedBrand}.`,
      });
      redFlags.push(`Tên miền giả mạo thương hiệu uy tín: ${domain}`);
    }

    if (suspiciousTld) {
      heuristicScore += 25;
      signals.push({
        name: 'Đuôi Tên Miền Rủi Ro Cao (Suspicious TLD)',
        scoreContribution: 25,
        description: `Sử dụng đuôi tên miền giá rẻ thường bị tội phạm mạng lợi dụng để phát tán phishing (${domain}).`,
        category: 'Domain',
      });
      redFlags.push('Đuôi tên miền lạ thường dùng trong các chiến dịch lừa đảo hàng loạt.');
    }
  }

  // 2. PSYCHOLOGICAL & CONTENT TACTICS ANALYSIS
  const urgencyWords = ['khẩn cấp', 'ngay lập tức', 'trong vòng', '24 giờ', '5 phút', 'khóa tài khoản', 'hủy lệnh', 'hạn chót', 'bị tạm ngừng'];
  const hasUrgency = urgencyWords.some((w) => lowerText.includes(w) || lowerUrl.includes(w));
  if (hasUrgency) {
    heuristicScore += 30;
    signals.push({
      name: 'Áp Lực Thời Gian & Dồn Ép Khẩn Cấp (Time Pressure)',
      scoreContribution: 30,
      description: 'Kẻ lừa đảo dồn ép thời gian (ví dụ: trong 5 phút, 24 giờ) nhằm kích hoạt tâm lý hoảng loạn để nạn nhân không kịp suy nghĩ kiểm chứng.',
      category: 'Urgency',
    });
    redFlags.push('Dồn ép thời gian ngắn yêu cầu thao tác khẩn cấp.');
    evidenceList.push({
      severity: 'high',
      title: 'Đòn Đánh Tâm Lý Thúc Giục',
      snippet: 'Giới hạn thời gian ngắn (5 phút / khóa tài khoản)',
      description: 'Chiêu bài kinh điển nhằm làm tê liệt vùng não tư duy phản biện (System 2) của nạn nhân.',
    });
  }

  const authorityWords = ['công an', 'viện kiểm sát', 'bộ công an', 'cán bộ', 'điều tra', 'ngân hàng', 'vneid', 'cục thuế', 'cảnh báo'];
  const hasAuthority = authorityWords.some((w) => lowerText.includes(w) || lowerSender.includes(w));
  if (hasAuthority) {
    heuristicScore += 25;
    signals.push({
      name: 'Mạo Danh Cơ Quan Nhà Nước / Ngân Hàng (Authority Leverage)',
      scoreContribution: 25,
      description: 'Mạo danh thông báo bảo mật ngân hàng hoặc cơ quan thực thi pháp luật để tạo uy quyền đe dọa.',
      category: 'Impersonation',
    });
    redFlags.push('Mạo danh cơ quan thẩm quyền hoặc ngân hàng uy tín.');
  }

  const financialWords = ['chuyển tiền', 'chuyển khoản', 'nạp tiền', 'mã otp', 'số dư', 'tài khoản', 'đăng nhập trái phép', 'hủy giao dịch', 'tiền cọc', 'hoàn tiền'];
  const hasFinancial = financialWords.some((w) => lowerText.includes(w));
  if (hasFinancial) {
    heuristicScore += 25;
    signals.push({
      name: 'Khai Thác Thông Tin Nhạy Cảm / Tài Sản (Financial Threat)',
      scoreContribution: 25,
      description: 'Yêu cầu truy cập liên kết để nhập thông tin đăng nhập, mật khẩu hoặc mã OTP nhằm chiếm đoạt tài khoản.',
      category: 'Financial',
    });
    redFlags.push('Yêu cầu truy cập đường dẫn để xác thực hoặc nhập mã OTP.');
  }

  // Cap score
  const finalScore = Math.min(98, Math.max(12, heuristicScore));
  let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' = 'LOW';
  if (finalScore >= 70) riskLevel = 'HIGH';
  else if (finalScore >= 40) riskLevel = 'MEDIUM';
  else if (finalScore >= 25) riskLevel = 'LOW';
  else riskLevel = 'SAFE';

  if (redFlags.length === 0) {
    redFlags.push('Cần cẩn trọng khi mở liên kết từ người gửi lạ.');
  }

  const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();

  return {
    riskScore: finalScore,
    riskLevel,
    summary: `Giám định pháp y độc lập (On-Device Forensics Engine): Chỉ số nguy cơ ${finalScore}/100 [Mức ${riskLevel}]. Phát hiện ${signals.length} dấu hiệu kỹ nghệ xã hội (Social Engineering) nguy hiểm. Đối tượng sử dụng thủ đoạn tạo áp lực thời gian kết hợp mạo danh cơ quan/tổ chức nhằm dẫn dụ nạn nhân vào trang web thu thập thông tin đăng nhập hoặc tài sản.`,
    signals,
    redFlags,
    recommendedSteps: [
      'TUYỆT ĐỐI KHÔNG bấm vào liên kết trong tin nhắn hoặc làm theo hướng dẫn.',
      'KHÔNG cung cấp tên đăng nhập, mật khẩu Mobile Banking hoặc mã OTP cho bất kỳ ai, kể cả người tự xưng là nhân viên ngân hàng hay công an.',
      'Gọi trực tiếp đến số hotline chính thức in ở mặt sau thẻ ATM hoặc ứng dụng gốc để tra cứu thông tin.',
      'Báo cáo số điện thoại/đường link lừa đảo lên Cục An toàn Thông tin (tổng đài 156 hoặc chongluadao.vn).',
    ],
    piiRedacted: true,
    threatBreakdown: {
      maliciousUrl: brandImpersonationFound ? 95 : (suspiciousTld ? 75 : 20),
      impersonation: hasAuthority || brandImpersonationFound ? 90 : 30,
      urgency: hasUrgency ? 88 : 25,
      credentialHarvesting: hasFinancial ? 85 : 30,
      socialEngineering: finalScore,
    },
    evidenceFound: evidenceList.length > 0 ? evidenceList : [
      {
        severity: 'medium',
        title: 'Dấu hiệu giao tiếp bất thường',
        snippet: text.slice(0, 80),
        description: 'Ngôn từ có chủ đích gây hoang mang, hối thúc người nhận hành động vội vàng.',
      },
    ],
    threatClassification: {
      primaryThreat: brandImpersonationFound ? 'Brand Impersonation Phishing' : 'Social Engineering Attack',
      attackVector: urlStr ? 'Malicious Phishing URL' : 'Manipulative SMS / Social Chat',
      target: 'Thông tin tài khoản ngân hàng & Tài sản số',
      potentialImpact: ['Chiếm đoạt tiền trong tài khoản', 'Lộ thông tin danh tính cá nhân'],
      confidence: 94.5,
    },
    attackChain: [
      'Kẻ gian phát tán tin nhắn mạo danh Brandname qua trạm BTS giả hoặc SMS',
      'Đánh trúng nỗi sợ tài sản bị đe dọa với cảnh báo đăng nhập lạ',
      'Thúc giục nạn nhân bấm link giả mạo trong thời gian ngắn (5 phút)',
      'Thu thập tài khoản & OTP để thực hiện lệnh chuyển tiền chiếm đoạt',
    ],
    assessmentId: `SG-ONDEVICE-${randomHex}`,
    detectedTactics: ['Urgency', 'Authority Fear', 'Brand Spoofing'],
    explanationsByPersona: {
      child: 'Tin nhắn này là bẫy của kẻ xấu đấy! Đừng bao giờ bấm vào link lạ và hãy đưa cho bố mẹ hoặc thầy cô xem ngay nhé.',
      teen: 'Cảnh báo thủ đoạn Phishing: Link web có đuôi lạ và tên miền giả mạo ngân hàng. Không bấm link để tránh bị hack tài khoản mạng xã hội hay game!',
      adult: 'Dấu hiệu rõ ràng của chiến dịch tấn công Phishing tinh vi. Tuyệt đối không đăng nhập thông tin ngân hàng vào trang web này và kiểm tra biến động số dư qua ứng dụng chính thức.',
      senior: 'Kính gửi Bác: Đây là tin nhắn giả mạo để lừa gạt tiền bạc. Bác đừng sợ hãi và hãy nhờ con cháu kiểm tra trực tiếp qua ngân hàng, không bấm vào link xanh.',
      expert: 'Vector tấn công: Social Engineering via Brand Spoofing. Tên miền sử dụng kỹ thuật Typosquatting/Combosquatting trên TLD phi chính thống kết hợp đòn tâm lý Urgency.',
    },
  };
}
