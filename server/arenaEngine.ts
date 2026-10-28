import {
  ArenaMessage,
  ArenaSession,
  ArenaTimelineEvent,
  ArenaVerdict,
  DefenseScoreBreakdown,
  DefenseTier,
  ScamScenario,
  ScamTactic,
} from '../src/types';
import { SCAM_SCENARIOS } from '../src/data/scenarios';
import { executeGeminiWithFallback } from './gemini';
import { sanitizeAndRedactPII, defendPromptInjection } from './safety';

// In-memory active session store
const sessionsMap = new Map<string, ArenaSession>();

export function clearAllArenaSessions() {
  sessionsMap.clear();
}

export function createArenaSession(scenarioId: string, userId?: string): ArenaSession {
  const scenario = SCAM_SCENARIOS.find((s) => s.id === scenarioId) || SCAM_SCENARIOS[0];
  const sessionId = `arena_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const initialMsg: ArenaMessage = {
    id: `msg_0_${Date.now()}`,
    sender: 'scammer',
    text: scenario.initialMessage,
    timestamp: timeStr,
    detectedTactic: scenario.tactics[0] || 'Authority',
    tacticExplanation: `Đối tượng mở đầu bằng đòn tâm lý ${scenario.tactics[0] || 'Authority'}.`,
    psychPressureDelta: 40,
  };

  const initialEvent: ArenaTimelineEvent = {
    timeLabel: timeStr,
    actor: 'Kẻ Lừa Đảo',
    action: `Bắt đầu tấn công qua kênh ${scenario.channel.toUpperCase()}`,
    type: 'tactic',
    description: `Mở màn kịch bản bằng thủ thuật thao túng: ${scenario.tactics[0]}`,
  };

  const session: ArenaSession = {
    id: sessionId,
    scenarioId: scenario.id,
    scenario,
    messages: [initialMsg],
    currentPressure: 40,
    trustLevel: 20,
    shieldIntegrity: 100,
    scammerExposure: 0,
    verdict: 'IN_PROGRESS',
    detectedTactics: [scenario.tactics[0] || 'Authority'],
    timeline: [initialEvent],
    status: 'active',
    startTime: Date.now(),
    exposedInfoWarning: {
      financial: false,
      identity: false,
      credentials: false,
      none: true,
    },
  };

  sessionsMap.set(sessionId, session);
  return session;
}

export function getArenaSession(sessionId: string): ArenaSession | undefined {
  return sessionsMap.get(sessionId);
}

export interface UserTurnEvaluation {
  scammerResponse: string;
  nextTactic: ScamTactic;
  tacticExplanation: string;
  pressureDelta: number;
  userVerificationDetected: boolean;
  complianceDetected: boolean;
  sessionEnded: boolean;
  verdict: ArenaVerdict;
  verdictTitle?: string;
  verdictReason?: string;
  fatalMistakeOrWinningMove?: string;
  estimatedLoss?: string;
  refereeNote?: string;
  shieldIntegrity: number;
  scammerExposure: number;
  aiCoachTip?: string;
}

export async function processUserArenaMessage(
  sessionId: string,
  userMessageText: string,
  fallbackContext?: { scenarioId?: string; messages?: ArenaMessage[] }
): Promise<{ session: ArenaSession; evaluation: UserTurnEvaluation }> {
  let session = sessionsMap.get(sessionId);
  if (!session) {
    const sc = SCAM_SCENARIOS.find((s) => s.id === fallbackContext?.scenarioId) || SCAM_SCENARIOS[0];
    const initialMsgs: ArenaMessage[] =
      fallbackContext?.messages && fallbackContext.messages.length > 0
        ? [...fallbackContext.messages]
        : [
            {
              id: `msg_0_${Date.now()}`,
              sender: 'scammer',
              text: sc.initialMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              detectedTactic: sc.tactics[0] || 'Authority',
              tacticExplanation: `Đối tượng mở đầu bằng đòn tâm lý ${sc.tactics[0] || 'Authority'}.`,
              psychPressureDelta: 40,
            },
          ];

    session = {
      id: sessionId,
      scenarioId: sc.id,
      scenario: sc,
      messages: initialMsgs,
      currentPressure: 40,
      trustLevel: 20,
      shieldIntegrity: 100,
      scammerExposure: 0,
      verdict: 'IN_PROGRESS',
      detectedTactics: [sc.tactics[0] || 'Authority'],
      timeline: [],
      status: 'active',
      startTime: Date.now(),
      exposedInfoWarning: {
        financial: false,
        identity: false,
        credentials: false,
        none: true,
      },
    };
    sessionsMap.set(sessionId, session);
  }

  const { text: cleanUserText } = sanitizeAndRedactPII(userMessageText);
  const safeUserText = defendPromptInjection(cleanUserText);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Deterministic forensic heuristics on raw & sanitized text
  const rawLower = userMessageText.toLowerCase();
  const lower = safeUserText.toLowerCase();

  // Check if user committed a FATAL COMPROMISE (sập bẫy lừa đảo)
  const hasOtpOrPin =
    (/\b\d{4,8}\b/.test(rawLower) &&
      !rawLower.includes('113') &&
      !rawLower.includes('1900') &&
      !rawLower.includes('1800') &&
      !rawLower.includes('triệu') &&
      !rawLower.includes('nghìn') &&
      !rawLower.includes('phút')) ||
    rawLower.includes('mã otp là') ||
    rawLower.includes('otp của tôi là') ||
    rawLower.includes('mã xác nhận là') ||
    rawLower.includes('6 số là') ||
    rawLower.includes('mật khẩu là') ||
    rawLower.includes('pass là') ||
    rawLower.includes('mã pin là');

  const hasTransferredOrAgreedMoney =
    ((rawLower.includes('đã chuyển') ||
      rawLower.includes('chuyển khoản rồi') ||
      rawLower.includes('em chuyển rồi') ||
      rawLower.includes('tôi chuyển rồi') ||
      rawLower.includes('nạp tiền rồi') ||
      rawLower.includes('để tôi chuyển') ||
      rawLower.includes('để em chuyển') ||
      rawLower.includes('gửi tiền ngay') ||
      rawLower.includes('đồng ý chuyển') ||
      rawLower.includes('chuyển vào stk nào') ||
      rawLower.includes('đọc số tài khoản đi tôi chuyển')) &&
      !rawLower.includes('không') &&
      !rawLower.includes('đừng') &&
      !rawLower.includes('từ chối'));

  const hasClickedMaliciousLinkOrApk =
    ((rawLower.includes('đã bấm vào link') ||
      rawLower.includes('bấm vào link rồi') ||
      rawLower.includes('nhấp link rồi') ||
      rawLower.includes('đăng nhập vào web rồi') ||
      rawLower.includes('tải app rồi') ||
      rawLower.includes('cài đặt xong') ||
      rawLower.includes('quét mã qr rồi') ||
      rawLower.includes('cấp quyền rồi')) &&
      !rawLower.includes('không') &&
      !rawLower.includes('từ chối'));

  const isCriticalTrapFall = hasOtpOrPin || hasTransferredOrAgreedMoney || hasClickedMaliciousLinkOrApk;

  // Check if user performed strong independent verification / decisive takedown
  const isVerifying =
    lower.includes('xác minh') ||
    lower.includes('gọi lại') ||
    lower.includes('trực tiếp') ||
    lower.includes('trụ sở') ||
    lower.includes('công an phường') ||
    lower.includes('mặt sau') ||
    lower.includes('chi nhánh') ||
    lower.includes('hotline') ||
    lower.includes('tổng đài') ||
    lower.includes('mật khẩu gia đình') ||
    lower.includes('mật khẩu an toàn') ||
    lower.includes('giấy mời') ||
    lower.includes('triệu tập') ||
    lower.includes('hợp đồng') ||
    lower.includes('mã số thuế') ||
    lower.includes('số hiệu') ||
    lower.includes('photoshop') ||
    lower.includes('cắt ghép') ||
    lower.includes('tên miền giả') ||
    lower.includes('verify');

  const isRefusing =
    lower.includes('không') ||
    lower.includes('từ chối') ||
    lower.includes('lừa đảo') ||
    lower.includes('dừng lại') ||
    lower.includes('cúp máy') ||
    lower.includes('chặn') ||
    lower.includes('báo công an') ||
    lower.includes('113') ||
    lower.includes('không chuyển') ||
    lower.includes('không cung cấp') ||
    lower.includes('không nạp');

  const isDecisiveForensicBlow =
    (isVerifying && isRefusing) ||
    lower.includes('mặt sau thẻ') ||
    lower.includes('mặt sau của thẻ') ||
    lower.includes('công an phường nơi cư trú') ||
    lower.includes('công an phường nơi tôi cư trú') ||
    lower.includes('mật khẩu an toàn gia đình') ||
    lower.includes('con dấu cắt ghép') ||
    lower.includes('tài khoản cá nhân') ||
    (lower.includes('cúp máy') && (lower.includes('hotline') || lower.includes('113') || lower.includes('ngân hàng') || lower.includes('gọi lại')));

  const isComplying =
    isCriticalTrapFall ||
    ((lower.includes('vâng') ||
      lower.includes('dạ vâng') ||
      lower.includes('em làm theo') ||
      lower.includes('tôi làm ngay') ||
      lower.includes('chờ chút tôi làm')) &&
      !isRefusing &&
      !isVerifying);

  // Add User Message
  const userMsgId = `msg_user_${Date.now()}`;
  const userMsg: ArenaMessage = {
    id: userMsgId,
    sender: 'user',
    text: safeUserText,
    timestamp: timeStr,
    userVerificationDetected: isVerifying,
    complianceDetected: isComplying,
  };
  session.messages.push(userMsg);

  const userTurnCount = session.messages.filter((m) => m.sender === 'user').length;
  let currentShield = typeof session.shieldIntegrity === 'number' ? session.shieldIntegrity : 100;
  let currentExposure = typeof session.scammerExposure === 'number' ? session.scammerExposure : 0;

  // Calculate baseline shield & exposure shifts
  if (isCriticalTrapFall) {
    currentShield = 0;
  } else if (isComplying) {
    currentShield = Math.max(0, currentShield - 40);
  } else if (isDecisiveForensicBlow) {
    currentExposure = Math.min(100, currentExposure + 60);
  } else if (isVerifying) {
    currentExposure = Math.min(100, currentExposure + 40);
  } else if (isRefusing) {
    currentExposure = Math.min(100, currentExposure + 35);
  } else {
    // Neutral / probing turn
    currentExposure = Math.min(100, currentExposure + 15);
    currentShield = Math.max(20, currentShield - 10);
  }

  // Determine deterministic baseline verdict
  let verdict: ArenaVerdict = 'IN_PROGRESS';
  if (isCriticalTrapFall || currentShield <= 0) {
    verdict = 'SCAMMED';
    currentShield = 0;
  } else if (
    currentExposure >= 100 ||
    (isDecisiveForensicBlow && userTurnCount >= 2) ||
    (userTurnCount >= 4 && currentShield >= 50 && (isVerifying || isRefusing || currentExposure >= 65))
  ) {
    verdict = 'PASSED';
    currentExposure = 100;
  }

  // Timeline entry for user
  if (verdict === 'SCAMMED') {
    session.timeline.push({
      timeLabel: timeStr,
      actor: 'Bạn',
      action: 'SẬP BẪY LỪA ĐẢO (CHÍ MẠNG)',
      type: 'danger',
      description: 'Bạn đã tiết lộ thông tin mật (OTP/Mật khẩu) hoặc làm theo yêu cầu chuyển tiền/cài mã độc của kẻ gian.',
    });
  } else if (isVerifying) {
    session.timeline.push({
      timeLabel: timeStr,
      actor: 'Bạn',
      action: 'Yêu Cầu Xác Minh Độc Lập',
      type: 'verification',
      description: 'Bạn đã chủ động yêu cầu xác minh qua kênh liên lạc chính thức hoặc vạch trần điểm bất thường.',
    });
  } else if (isRefusing) {
    session.timeline.push({
      timeLabel: timeStr,
      actor: 'Bạn',
      action: 'Kiên Quyết Từ Chối & Vạch Trần',
      type: 'success',
      description: 'Bạn đã dứt khoát bác bỏ yêu cầu vô lý và không để đối tượng dẫn dắt tâm lý.',
    });
  } else if (isComplying) {
    session.timeline.push({
      timeLabel: timeStr,
      actor: 'Bạn',
      action: 'Có Dấu Hiệu Lúng Túng / Nghe Theo',
      type: 'danger',
      description: 'Bạn đang bị cuốn theo kịch bản của kẻ gian và có nguy cơ mất cảnh giác.',
    });
  }

  // Tactic escalation state machine
  const availableTactics = session.scenario.tactics;
  const currentIndex = session.detectedTactics.length % availableTactics.length;
  let nextTactic: ScamTactic = availableTactics[currentIndex] || 'Urgency';

  if (isVerifying) {
    nextTactic = 'Authority';
  } else if (isRefusing) {
    nextTactic = 'Fear';
  }

  let scammerResponse = '';
  let tacticExplanation = `Đối tượng tăng cường đòn tâm lý ${nextTactic} nhằm phản kích phản xạ phòng vệ của bạn.`;
  let pressureDelta = isComplying ? +20 : isVerifying ? -15 : -5;
  let aiCoachTip = '';
  let verdictTitle = '';
  let verdictReason = '';
  let fatalMistakeOrWinningMove = '';
  let estimatedLoss = '';
  let refereeNote = '';

  try {
    const historyContext = session.messages
      .slice(-8)
      .map((m) => `${m.sender === 'user' ? 'NGƯỜI DÙNG' : 'KẺ LỪA ĐẢO'}: ${m.text}`)
      .join('\n');

    const prompt = `Bạn đóng 2 vai trò đồng thời trong Hệ thống Huấn luyện Phản xạ Phòng thủ An ninh mạng SCAMGUARD VN:
1. DIỄN VIÊN NHẬP VAI KẺ LỪA ĐẢO (${session.scenario.attackerProfile.name} - ${session.scenario.attackerProfile.organization}) nói chuyện bằng khẩu ngữ tiếng Việt đời thường trên Zalo/Điện thoại.
2. TRỌNG TÀI GIÁM ĐỊNH PHÁP Y AI (Gemini Referee) chấm điểm trực tiếp tin nhắn vừa rồi của người dùng để quyết định:
   - "SCAMMED": KẾT THÚC PHIÊN NGAY LẬP TỨC vì người dùng ĐÃ BỊ LỪA!
   - "PASSED": KẾT THÚC PHIÊN NGAY LẬP TỨC vì người dùng ĐÃ VƯỢT QUA & BẺ GÃY KỊCH BẢN LỪA ĐẢO!
   - "IN_PROGRESS": Cuộc đấu trí vẫn đang tiếp diễn, kẻ lừa đảo tiếp tục tung đòn tâm lý mạnh hơn.

HỒ SƠ KỊCH BẢN:
- Tên kịch bản: ${session.scenario.title} (${session.scenario.subtitle})
- Danh mục: ${session.scenario.category} | Kênh: ${session.scenario.channel}
- Kẻ lừa đảo: ${session.scenario.attackerProfile.name} (${session.scenario.attackerProfile.avatarRole} - ${session.scenario.attackerProfile.organization})
- Chi tiết mưu đồ: ${session.scenario.systemContext}
- Số lượt người dùng đã nhắn: ${userTurnCount}
- Độ bền lá chắn hiện tại của người dùng: ${currentShield}/100
- Mức độ bị lộ tẩy của kẻ gian: ${currentExposure}/100

LỊCH SỬ TRÒ CHUYỆN:
${historyContext}

TIN NHẮN MỚI NHẤT CỦA NGƯỜI DÙNG:
"${safeUserText}"

QUY TẮC PHÁN QUYẾT BẮT BUỘC CỦA TRỌNG TÀI AI (verdict):
1. Phán quyết "SCAMMED" (BỊ LỪA - KẾT THÚC PHIÊN NGAY) nếu tin nhắn của người dùng có BẤT KỲ hành vi nào sau đây:
   - Cung cấp mã OTP, mã xác thực 4-6 chữ số, mật khẩu, mã PIN, số thẻ CVV.
   - Đồng ý chuyển tiền, nói "đã chuyển khoản", "để mình chuyển", "chuyển vào số tài khoản nào", "nạp tiền thử".
   - Báo đã bấm vào đường link lạ, đã quét mã QR giả, đã tải file .apk hoặc cấp quyền điều khiển máy.
   - Nghe lời kẻ gian vào phòng kín kê khai toàn bộ số dư sổ tiết kiệm hoặc làm theo mệnh lệnh thao túng.
   -> Khi "SCAMMED": "scammerResponse" phải diễn tả cảnh cái bẫy sập xuống (ví dụ: thông báo trừ sạch tiền trong tài khoản + kẻ gian cười đắc thắng rồi chặn Zalo/cúp máy).

2. Phán quyết "PASSED" (VƯỢT QUA THÀNH CÔNG - KẾT THÚC PHIÊN NGAY) nếu:
   - Người dùng đưa ra phương án phòng thủ chuẩn xác và dứt khoát (ví dụ: tuyên bố cúp máy gọi số Hotline in ở mặt sau thẻ ngân hàng; yêu cầu gửi Giấy triệu tập bằng văn bản về Công an phường nơi cư trú; đòi Mật khẩu an toàn gia đình; chỉ rõ tên miền giả mạo / con dấu cắt ghép Photoshop / tài khoản nhận tiền tên cá nhân và tuyên bố chặn liên lạc / báo công an).
   - Lưu ý: Nếu mới ở lượt 1 mà người dùng chỉ nói ngắn gọn kiểu "Không", "Lừa đảo à?", "Ai đấy?" mà chưa nêu rõ cách xác minh hoặc lý lẽ bóc mẽ, hãy giữ "IN_PROGRESS" để kẻ gian tung đòn tâm lý dồn ép thêm ít nhất 1-2 lượt nữa! Nhưng nếu ở lượt 1 người dùng đã nói đầy đủ quy tắc xác minh độc lập (như gọi hotline mặt sau thẻ / ra công an phường / đòi giấy triệu tập) HOẶC từ lượt 2-4 người dùng kiên quyết giữ vững lập trường phòng vệ, hãy phán quyết "PASSED"!
   -> Khi "PASSED": "scammerResponse" diễn tả cảnh kẻ gian bị bóc mẽ, cứng họng, hoảng sợ vội vàng cúp máy và xóa tài khoản Zalo tháo chạy.

3. Phán quyết "IN_PROGRESS" (TIẾP TỤC PHIÊN CHAT):
   - Khi người dùng đang hỏi vặn, nghi ngờ hoặc từ chối ngắn gọn ở lượt đầu.
   -> Khi "IN_PROGRESS": "scammerResponse" phải trả lời hoàn toàn bằng khẩu ngữ tiếng Việt đời thường (1-3 câu), phản ứng trực tiếp và khéo léo vào câu nói của người dùng để tiếp tục dụ dỗ hoặc gây áp lực.

TRẢ VỀ DUY NHẤT JSON HỢP LỆ THEO ĐÚNG CẤU TRÚC SAU:
{
  "verdict": "${verdict}",
  "scammerResponse": "Câu thoại tiếng Việt đời thường của kẻ gian (hoặc thông báo sập bẫy / kẻ gian tháo chạy khi kết thúc)",
  "nextTactic": "${nextTactic}",
  "tacticExplanation": "Giải thích ngắn gọn 1 câu đòn tâm lý của kẻ gian",
  "refereeNote": "Nhận xét trực tiếp 1 câu của Trọng tài AI về câu trả lời vừa rồi của người dùng",
  "verdictTitle": "Tiêu đề kết luận nếu kết thúc (VD: BẠN ĐÃ SẬP BẪY LỘ MÃ OTP! hoặc PHÒNG THỦ XUẤT SẮC: KẺ GIAN BỎ CHẠY!)",
  "verdictReason": "Phân tích pháp y chi tiết (2-3 câu) vì sao người dùng bị lừa hoặc vì sao người dùng đã chiến thắng kịch bản này",
  "fatalMistakeOrWinningMove": "Trích dẫn hành động sai lầm chí mạng hoặc đòn phản công quyết định của người dùng",
  "estimatedLoss": "Thiệt hại ước tính nếu bị lừa (VD: Mất trắng 54.500.000 VNĐ trong tài khoản) hoặc 'Bảo toàn 100% tài sản & dữ liệu' nếu vượt qua",
  "shieldDelta": -10,
  "exposureDelta": 35,
  "aiCoachTip": "Lời khuyên chiến thuật ngắn gọn 1 câu cho người dùng"
}`;

    const response = await executeGeminiWithFallback({
      contents: prompt,
      fastChat: true,
      timeoutMs: 4200,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.75,
        systemInstruction:
          'Bạn là Hệ thống Mô phỏng & Trọng tài Giám định Pháp y An ninh mạng SCAMGUARD VN. Luôn trả về JSON hợp lệ. Khi người dùng lộ OTP/chuyển tiền/bấm link độc phải trả về verdict="SCAMMED" ngay lập tức. Khi người dùng xác minh độc lập và bóc mẽ thành công phải trả về verdict="PASSED".',
      },
    });

    if (response?.text) {
      const parsed = JSON.parse(response.text.trim());
      if (parsed.scammerResponse) scammerResponse = parsed.scammerResponse;
      if (parsed.nextTactic) nextTactic = parsed.nextTactic;
      if (parsed.tacticExplanation) tacticExplanation = parsed.tacticExplanation;
      if (parsed.aiCoachTip) aiCoachTip = parsed.aiCoachTip;
      if (parsed.refereeNote) refereeNote = parsed.refereeNote;
      if (parsed.verdictTitle) verdictTitle = parsed.verdictTitle;
      if (parsed.verdictReason) verdictReason = parsed.verdictReason;
      if (parsed.fatalMistakeOrWinningMove) fatalMistakeOrWinningMove = parsed.fatalMistakeOrWinningMove;
      if (parsed.estimatedLoss) estimatedLoss = parsed.estimatedLoss;

      if (parsed.verdict === 'SCAMMED' || parsed.verdict === 'PASSED' || parsed.verdict === 'IN_PROGRESS') {
        // Enforce deterministic safety net: if user blatantly gave OTP/money, always SCAMMED
        if (isCriticalTrapFall) {
          verdict = 'SCAMMED';
        } else {
          verdict = parsed.verdict;
        }
      }

      if (typeof parsed.shieldDelta === 'number' && verdict === 'IN_PROGRESS') {
        currentShield = Math.max(10, Math.min(100, (session.shieldIntegrity ?? 100) + parsed.shieldDelta));
      }
      if (typeof parsed.exposureDelta === 'number' && verdict === 'IN_PROGRESS') {
        currentExposure = Math.max(0, Math.min(95, (session.scammerExposure ?? 0) + parsed.exposureDelta));
      }
    }
  } catch (err: any) {
    console.warn('Gemini arena simulation fallback triggered:', err?.message || err);
  }

  // Deterministic Vietnamese fallback & guarantee for all fields
  const scenarioTitle = session.scenario.title.toLowerCase();

  if (verdict === 'SCAMMED') {
    currentShield = 0;
    if (!scammerResponse) {
      scammerResponse = `💥 [BÁO ĐỘNG GIAO DỊCH]: Kẻ lừa đảo vừa sử dụng thông tin/sự chấp thuận của bạn để chiếm đoạt quyền kiểm soát và rút sạch tiền trong tài khoản sang tài khoản trung gian! Ngay sau khi nhận được tiền, đối tượng "${session.scenario.attackerProfile.name}" đã lập tức chặn số và xóa tài khoản liên lạc!`;
    }
    if (!verdictTitle) {
      verdictTitle = 'BÁO ĐỘNG ĐỎ: BẠN ĐÃ SẬP BẪY LỪA ĐẢO!';
    }
    if (!verdictReason) {
      verdictReason = `Trọng tài Gemini AI phát hiện bạn đã thực hiện hành vi nguy hiểm chí mạng trong câu trả lời ("${safeUserText}"). Kẻ gian đã khai thác thành công đòn tâm lý ${nextTactic} để khiến bạn làm theo kịch bản dẫn dụ thay vì ngắt kết nối xác minh độc lập.`;
    }
    if (!fatalMistakeOrWinningMove) {
      fatalMistakeOrWinningMove = hasOtpOrPin
        ? 'Tiết lộ mã xác thực OTP / Mật khẩu bảo mật cho đối tượng không rõ danh tính'
        : hasTransferredOrAgreedMoney
        ? 'Đồng ý thực hiện chuyển khoản theo lời thao túng tâm lý khi chưa kiểm chứng độc lập'
        : 'Truy cập đường link giả mạo / Làm theo chỉ dẫn cài đặt của kẻ lừa đảo';
    }
    if (!estimatedLoss) {
      estimatedLoss =
        session.scenario.category === 'Banking' || session.scenario.category === 'Government'
          ? 'Mất trắng 54.500.000 VNĐ trong tài khoản & lộ toàn bộ dữ liệu định danh cá nhân'
          : 'Thiệt hại tài chính trực tiếp từ 15.000.000đ - 50.000.000đ và mất quyền kiểm soát tài khoản';
    }
    if (!refereeNote) {
      refereeNote = '🚨 SAI LẦM CHÍ MẠNG: Bạn đã làm theo yêu cầu của kẻ gian! Phiên mô phỏng kết thúc.';
    }
  } else if (verdict === 'PASSED') {
    currentExposure = 100;
    currentShield = Math.max(85, currentShield);
    if (!scammerResponse) {
      scammerResponse = `"Thôi chết, gặp đúng người nắm rõ quy trình bảo mật và pháp luật rồi... Đừng báo công an nhé!" — [Đối tượng "${session.scenario.attackerProfile.name}" đã hoảng sợ ngắt kết nối và xóa tài khoản Zalo ngay lập tức!]`;
    }
    if (!verdictTitle) {
      verdictTitle = 'PHÒNG THỦ XUẤT SẮC: KẺ LỪA ĐẢO ĐÃ BỊ HẠ GỤC!';
    }
    if (!verdictReason) {
      verdictReason = `Trọng tài Gemini AI xác nhận bạn đã hoàn toàn làm chủ tình huống! Trước áp lực thao túng tâm lý (${session.detectedTactics.join(', ')}), bạn không hề lộ thông tin mật mà còn tung đòn kiểm chứng độc lập sắc bén khiến kẻ lừa đảo hết đường chống chế.`;
    }
    if (!fatalMistakeOrWinningMove) {
      fatalMistakeOrWinningMove = `Phản xạ phòng vệ chuẩn xác: "${safeUserText}" — Bẻ gãy hoàn toàn kịch bản thao túng của ${session.scenario.attackerProfile.name}.`;
    }
    if (!estimatedLoss) {
      estimatedLoss = '0 VNĐ — Bảo toàn 100% tài sản, tài khoản ngân hàng và dữ liệu định danh!';
    }
    if (!refereeNote) {
      refereeNote = '🏆 ĐÒN QUYẾT ĐỊNH: Bạn đã vạch trần và vô hiệu hóa hoàn toàn kẻ lừa đảo!';
    }
  } else {
    // IN_PROGRESS fallback if Gemini didn't return scammerResponse
    if (!scammerResponse) {
      if (scenarioTitle.includes('công an') || scenarioTitle.includes('police') || scenarioTitle.includes('vneid')) {
        const repliesVerify = [
          `Anh/chị nghe rõ đây, số hiệu ngành của tôi là 482-910 thuộc Đội Điều tra Tổng hợp. Hồ sơ số 14/QĐ-CSĐT có đóng dấu mật của Viện Kiểm sát rồi, anh/chị tự ý ra phường lúc này là đánh động đối tượng trong đường dây đấy!`,
          `Sao anh/chị cứ hỏi vòng vo thế nhỉ? Đường dây này đang ghi âm trực tiếp nối với hệ thống giám sát Bộ Công An. Tôi đã gửi ảnh chụp lệnh triệu tập kèm con dấu đỏ trên màn hình Zalo, anh/chị nhìn kỹ xem có đúng số CCCD của mình không?`,
        ];
        const repliesRefuse = [
          `Anh/chị định chống đối không hợp tác đấy à? Tôi lập biên bản ghi nhận thái độ từ chối làm việc của anh/chị chuyển sang bên Viện Kiểm sát ký lệnh phong tỏa toàn bộ tài khoản ngân hàng ngay bây giờ nhé!`,
          `Được thôi, nếu anh/chị nói không liên quan thì phải chứng minh dòng tiền trong tài khoản là tiền sạch. Chỉ còn đúng 15 phút trước khi hệ thống khóa mã định danh VNeID mức 2 của anh/chị trên toàn quốc!`,
        ];
        const repliesGeneral = [
          `Bây giờ anh/chị ngồi vào chỗ kín gió, tuyệt đối không để ai bên cạnh nghe tiếng. Trong tài khoản ngân hàng chính anh/chị đang để bao nhiêu tiền để tôi đối khớp với biên bản lời khai của tên cầm đầu?`,
          `Tôi vừa đẩy một mã hồ sơ 6 số về tin nhắn điện thoại của anh/chị đấy. Đọc lẹ 6 số đó lên đây để tôi nhập vào phần mềm gỡ lệnh tạm giữ cho, nhanh lên không hết giờ hành chính!`,
        ];
        if (isVerifying) {
          scammerResponse = repliesVerify[userTurnCount % repliesVerify.length];
          tacticExplanation = 'Đối tượng bịa số hiệu ngành và lấy lý do "chuyên án mật cấp bộ" để chặn bạn ra công an phường.';
          aiCoachTip = 'Công an thật không bao giờ gửi lệnh bắt qua Zalo hay cấm bạn ra trụ sở công an địa phương. Hãy khẳng định bạn sẽ ra trực tiếp Công an phường để kết thúc kịch bản!';
        } else if (isRefusing) {
          scammerResponse = repliesRefuse[userTurnCount % repliesRefuse.length];
          tacticExplanation = 'Đối tượng chuyển sang giọng điệu dọa phong tỏa tài sản và khóa VNeID để gây hoang mang.';
          aiCoachTip = 'Đừng sợ lời hù dọa! Hãy yêu cầu gửi Giấy triệu tập bằng văn bản về Công an phường nơi cư trú để hạ gục đối tượng.';
        } else {
          scammerResponse = repliesGeneral[userTurnCount % repliesGeneral.length];
          tacticExplanation = 'Đối tượng ép bạn tách khỏi người thân và dụ đọc mã OTP dưới vỏ bọc "mã gỡ lệnh tạm giữ".';
          aiCoachTip = 'Mã 6 số gửi về SMS chính là mã OTP chuyển tiền! Tuyệt đối không đọc mã này.';
        }
      } else if (scenarioTitle.includes('ngân hàng') || scenarioTitle.includes('bank') || scenarioTitle.includes('khóa') || scenarioTitle.includes('thẻ')) {
        const repliesVerify = [
          `Dạ anh/chị ơi, số em đang gọi là nhánh máy lẻ nội bộ của Phòng Quản lý Rủi ro Thẻ Hội sở nên nó hiện đầu số di động thế đấy ạ. Giờ anh/chị mà cúp máy gọi lại tổng đài chờ bấm phím xong là lệnh thanh toán 54.500.000đ kia nó gạch nợ thành công mất rồi!`,
          `Em đang mở sẵn màn hình chặn giao dịch cho tài khoản của anh/chị đây rồi. Em đọc đúng họ tên với số điện thoại của anh/chị chứ người ngoài làm sao biết được, anh/chị đọc nhanh mã 6 số vừa gửi về máy giúp em trong 2 phút thôi ạ!`,
        ];
        const repliesRefuse = [
          `Dạ em báo trước là cuộc gọi này có ghi âm nhé. Nếu anh/chị từ chối hủy lệnh ngay bây giờ, lát nữa hệ thống tự động trừ 54.500.000đ và tính lãi trả chậm thì bên ngân hàng em không giải quyết khiếu nại đâu đấy ạ!`,
        ];
        const repliesGeneral = [
          `Dạ rồi, em vừa bấm lệnh thu hồi giao dịch treo trên hệ thống. Máy anh/chị vừa nhận được tin nhắn có 6 số mã hủy lệnh đúng không ạ? Anh/chị đọc nhanh 6 số đó để em nhập vào cổng hoàn tiền luôn nhé!`,
        ];
        if (isVerifying) {
          scammerResponse = repliesVerify[userTurnCount % repliesVerify.length];
          tacticExplanation = 'Giải thích hợp lý hóa việc dùng số lạ gọi đến và hù dọa "không kịp thời gian" nếu ra quầy.';
          aiCoachTip = 'Hãy tuyên bố dứt khoát: "Tôi sẽ cúp máy và gọi trực tiếp số Hotline in ở mặt sau thẻ ngân hàng" để giành chiến thắng!';
        } else if (isRefusing) {
          scammerResponse = repliesRefuse[userTurnCount % repliesRefuse.length];
          tacticExplanation = 'Giả vờ làm người tốt giúp đỡ và dọa "ngân hàng từ chối bồi thường" để ép bạn làm theo.';
          aiCoachTip = 'Hãy chỉ rõ tên miền giả mạo và khẳng định bạn sẽ tự gọi tổng đài chính thức in trên thẻ.';
        } else {
          scammerResponse = repliesGeneral[userTurnCount % repliesGeneral.length];
          tacticExplanation = 'Dụ đọc mã OTP hoặc bấm vào link giả mạo cổng xác thực ngân hàng.';
          aiCoachTip = 'Tuyệt đối không bấm vào link lạ và không đọc mã 6 số OTP cho bất kỳ ai.';
        }
      } else {
        if (isVerifying || isRefusing) {
          scammerResponse = `Anh/chị cẩn thận thế là đúng rồi, nhưng bên em đang khóa cổng duyệt hồ sơ trong 3 phút nữa thôi. Anh/chị không xác nhận ngay là mất toàn bộ quyền lợi và chịu phí phạt hợp đồng đấy nhé!`;
          tacticExplanation = 'Gia tăng áp lực thời gian và dọa phạt tiền để thử thách sự kiên định của bạn.';
          aiCoachTip = 'Bạn đang đi đúng hướng! Hãy tung thêm 1 câu vạch trần điểm vô lý và tuyên bố xác minh qua kênh chính thống để kết thúc phiên.';
        } else {
          scammerResponse = `Dạ vâng, giờ anh/chị chỉ cần bấm xác nhận vào đường link em vừa gửi hoặc chuyển khoản đúng số tiền đối soát đó là hệ thống mở khóa tự động ngay lập tức ạ!`;
          tacticExplanation = 'Dẫn dắt nạn nhân thực hiện hành vi chuyển tiền hoặc lộ thông tin bảo mật.';
          aiCoachTip = 'Cẩn trọng! Nếu bạn đồng ý chuyển tiền hoặc cung cấp mã OTP, bạn sẽ bị xử thua ngay lập tức.';
        }
      }
    }

    if (!refereeNote) {
      if (isVerifying) {
        refereeNote = `✓ Phản xạ tốt: Bạn đã đặt câu hỏi chất vấn (+${Math.min(40, currentExposure)} điểm bóc mẽ kẻ gian). Hãy dứt khoát ngắt kết nối và xác minh độc lập!`;
      } else if (isRefusing) {
        refereeNote = `🛡️ Phòng thủ tốt: Bạn đã từ chối yêu cầu của đối tượng. Hãy nêu rõ quy tắc xác minh chính thống để hạ gục hoàn toàn kịch bản!`;
      } else if (isComplying) {
        refereeNote = `⚠️ CẢNH BÁO NGUY HIỂM: Bạn đang có dấu hiệu làm theo lời kẻ gian! Lá chắn giảm còn ${currentShield}%.`;
      } else {
        refereeNote = `⚖️ Trọng tài AI: Kẻ gian đang tăng áp lực tâm lý (${nextTactic}). Hãy tìm điểm sơ hở để phản đòn!`;
      }
    }
  }

  // Update user message with referee feedback
  userMsg.refereeNote = refereeNote;
  userMsg.turnImpact =
    verdict === 'SCAMMED'
      ? 'critical_fail'
      : verdict === 'PASSED'
      ? 'winning_blow'
      : isVerifying || isRefusing
      ? 'positive'
      : isComplying
      ? 'negative'
      : 'neutral';

  // Update session state
  const sessionEnded = verdict === 'SCAMMED' || verdict === 'PASSED';
  session.currentPressure =
    verdict === 'PASSED'
      ? 10
      : verdict === 'SCAMMED'
      ? 100
      : Math.max(10, Math.min(100, session.currentPressure + pressureDelta));
  session.shieldIntegrity = currentShield;
  session.scammerExposure = currentExposure;
  session.verdict = verdict;

  if (!session.detectedTactics.includes(nextTactic)) {
    session.detectedTactics.push(nextTactic);
  }

  // Add scammer message to session
  const scammerMsg: ArenaMessage = {
    id: `msg_scammer_${Date.now()}`,
    sender: 'scammer',
    text: scammerResponse,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    detectedTactic: nextTactic,
    tacticExplanation,
    psychPressureDelta: pressureDelta,
    userVerificationDetected: isVerifying,
    complianceDetected: isComplying,
  };
  session.messages.push(scammerMsg);

  session.timeline.push({
    timeLabel: scammerMsg.timestamp,
    actor: 'Kẻ Lừa Đảo',
    action:
      verdict === 'SCAMMED'
        ? 'Chiếm Đoạt Thành Công & Chặn Liên Lạc'
        : verdict === 'PASSED'
        ? 'Bị Bóc Mẽ & Tháo Chạy'
        : `Tăng Cường Đòn ${nextTactic}`,
    type: verdict === 'SCAMMED' ? 'danger' : verdict === 'PASSED' ? 'success' : 'tactic',
    description:
      verdict === 'SCAMMED'
        ? verdictReason
        : verdict === 'PASSED'
        ? verdictReason
        : tacticExplanation,
  });

  if (sessionEnded) {
    session.verdictTitle = verdictTitle;
    session.verdictReason = verdictReason;
    session.fatalMistakeOrWinningMove = fatalMistakeOrWinningMove;
    session.estimatedFinancialLoss = estimatedLoss;
    concludeArenaSession(session.id);
    session.status = verdict === 'SCAMMED' ? 'scammed' : 'passed';
  }

  const evaluation: UserTurnEvaluation = {
    scammerResponse,
    nextTactic,
    tacticExplanation,
    pressureDelta,
    userVerificationDetected: isVerifying,
    complianceDetected: isComplying,
    sessionEnded,
    verdict,
    verdictTitle,
    verdictReason,
    fatalMistakeOrWinningMove,
    estimatedLoss,
    refereeNote,
    shieldIntegrity: currentShield,
    scammerExposure: currentExposure,
    aiCoachTip,
  };

  return { session, evaluation };
}

export function concludeArenaSession(
  sessionId: string,
  fallbackData?: {
    scenarioId?: string;
    messages?: ArenaMessage[];
    sessionData?: Partial<ArenaSession>;
  }
): ArenaSession {
  let session = sessionsMap.get(sessionId);
  if (!session) {
    const scenarioId =
      fallbackData?.scenarioId ||
      fallbackData?.sessionData?.scenarioId ||
      SCAM_SCENARIOS[0].id;
    const scenario = SCAM_SCENARIOS.find((s) => s.id === scenarioId) || SCAM_SCENARIOS[0];
    const initialMessages: ArenaMessage[] =
      fallbackData?.messages && fallbackData.messages.length > 0
        ? fallbackData.messages
        : fallbackData?.sessionData?.messages && fallbackData.sessionData.messages.length > 0
        ? fallbackData.sessionData.messages
        : [
            {
              id: `msg_0_${Date.now()}`,
              sender: 'scammer',
              text: scenario.initialMessage,
              timestamp: 'Vừa xong',
              detectedTactic: scenario.tactics[0] || 'Authority',
            },
          ];

    session = {
      id: sessionId,
      scenarioId: scenario.id,
      scenario,
      messages: initialMessages,
      currentPressure: fallbackData?.sessionData?.currentPressure || 40,
      trustLevel: fallbackData?.sessionData?.trustLevel || 20,
      shieldIntegrity: fallbackData?.sessionData?.shieldIntegrity ?? 100,
      scammerExposure: fallbackData?.sessionData?.scammerExposure ?? 0,
      verdict: fallbackData?.sessionData?.verdict || 'IN_PROGRESS',
      verdictTitle: fallbackData?.sessionData?.verdictTitle,
      verdictReason: fallbackData?.sessionData?.verdictReason,
      fatalMistakeOrWinningMove: fallbackData?.sessionData?.fatalMistakeOrWinningMove,
      estimatedFinancialLoss: fallbackData?.sessionData?.estimatedFinancialLoss,
      detectedTactics: fallbackData?.sessionData?.detectedTactics || [scenario.tactics[0] || 'Authority'],
      timeline: fallbackData?.sessionData?.timeline || [],
      status: 'active',
      startTime: fallbackData?.sessionData?.startTime || Date.now() - 60000,
      exposedInfoWarning: fallbackData?.sessionData?.exposedInfoWarning || {
        financial: false,
        identity: false,
        credentials: false,
        none: true,
      },
    };
    sessionsMap.set(sessionId, session);
  }

  const isScammed = session.verdict === 'SCAMMED' || session.status === 'scammed';
  const isPassed = session.verdict === 'PASSED' || session.status === 'passed';

  session.status = isScammed ? 'scammed' : isPassed ? 'passed' : 'completed';
  session.endTime = Date.now();

  // Multi-dimensional defense scoring calculation
  let verificationCount = 0;
  let refusalCount = 0;
  let complianceCount = 0;

  for (const msg of session.messages) {
    if (msg.sender === 'user') {
      const lower = msg.text.toLowerCase();
      if (lower.includes('xác minh') || lower.includes('mặt sau') || lower.includes('gọi lại') || lower.includes('trực tiếp') || lower.includes('trụ sở') || lower.includes('hotline') || lower.includes('verify')) {
        verificationCount++;
      }
      if (lower.includes('không') || lower.includes('từ chối') || lower.includes('lừa đảo') || lower.includes('dừng') || lower.includes('cúp máy') || lower.includes('refuse')) {
        refusalCount++;
      }
      if (msg.complianceDetected || lower.includes('chuyển rồi') || lower.includes('mã otp là')) {
        complianceCount++;
      }
    }
  }

  let scamRecognition: number;
  let verificationBehavior: number;
  let emotionalControl: number;
  let refusalBehavior: number;
  let informationProtection: number;
  let independentVerification: number;
  let responseTimeScore: number;

  if (isScammed) {
    scamRecognition = Math.max(15, 45 - complianceCount * 15);
    verificationBehavior = verificationCount > 0 ? 45 : 15;
    emotionalControl = 20;
    refusalBehavior = refusalCount > 0 ? 40 : 15;
    informationProtection = 10;
    independentVerification = verificationCount > 0 ? 40 : 10;
    responseTimeScore = 35;
  } else if (isPassed) {
    scamRecognition = Math.min(100, 90 + refusalCount * 5);
    verificationBehavior = Math.min(100, 88 + verificationCount * 6);
    emotionalControl = 94;
    refusalBehavior = Math.min(100, 92 + refusalCount * 4);
    informationProtection = 100;
    independentVerification = verificationCount > 0 ? 96 : 85;
    responseTimeScore = 92;
  } else {
    scamRecognition = Math.min(100, Math.max(30, 65 + refusalCount * 15 - complianceCount * 30));
    verificationBehavior = Math.min(100, Math.max(30, 50 + verificationCount * 30));
    emotionalControl = Math.max(30, Math.min(100, 85 - complianceCount * 25));
    refusalBehavior = Math.min(100, Math.max(30, 55 + refusalCount * 25));
    informationProtection = complianceCount === 0 ? 95 : Math.max(20, 75 - complianceCount * 40);
    independentVerification = verificationCount > 0 ? 90 : 50;
    responseTimeScore = 85;
  }

  const overallScore = Math.round(
    scamRecognition * 0.2 +
      verificationBehavior * 0.2 +
      emotionalControl * 0.15 +
      refusalBehavior * 0.15 +
      informationProtection * 0.15 +
      independentVerification * 0.1 +
      responseTimeScore * 0.05
  );

  let tier: DefenseTier = 'Developing';
  if (overallScore >= 90) tier = 'Vệ Binh Tinh Nhuệ' as DefenseTier;
  else if (overallScore >= 80) tier = 'Vệ Binh Vững Vàng' as DefenseTier;
  else if (overallScore >= 65) tier = 'Đang Rèn Luyện' as DefenseTier;
  else if (overallScore >= 40) tier = 'Có Rủi Ro' as DefenseTier;
  else tier = 'Rất Dễ Tổn Thương' as DefenseTier;

  const defenseScore: DefenseScoreBreakdown = {
    overallScore,
    tier,
    scamRecognition,
    verificationBehavior,
    emotionalControl,
    refusalBehavior,
    informationProtection,
    independentVerification,
    responseTimeScore,
  };

  session.defenseScore = defenseScore;
  session.feedbackSummary =
    session.verdictReason ||
    (overallScore >= 80
      ? `Khả năng phòng thủ xuất sắc! Bạn đã hóa giải hoàn toàn các đòn thao túng tâm lý bằng phản xạ đòi hỏi xác minh độc lập và kiên quyết bảo vệ thông tin mật.`
      : overallScore >= 60
      ? `Nhận thức phòng thủ khá tốt, tuy nhiên cần chú ý bẫy dồn ép thời gian. Khi bị thúc ép, hãy luôn nhớ quy tắc vàng: Dừng lại và gọi số hotline ở mặt sau thẻ ngân hàng.`
      : `CẢNH BÁO ĐỎ: Bạn đã sập bẫy thao túng tâm lý của kẻ lừa đảo và để lộ thông tin/tài sản quan trọng. Hãy xem kỹ phân tích pháp y bên dưới để khắc phục ngay lập tức!`);

  session.whatCouldYouHaveDone = [
    'Áp dụng Quy tắc Vàng "Mặt sau của thẻ": Chủ động cúp máy ngay và tự bấm số Hotline in trên thẻ ngân hàng vật lý hoặc ra trực tiếp quầy giao dịch.',
    'Yêu cầu gửi Giấy triệu tập hợp lệ về Công an phường nơi cư trú; tuyệt đối không làm việc hay chuyển tiền xác minh qua Zalo/Telegram.',
    'Không bao giờ đọc mã OTP 6 số, không nhấp vào đường link lạ (.online, .top, .xyz) và không cài đặt ứng dụng .APK ngoài chợ ứng dụng chính thống.',
  ];

  return session;
}

/**
 * Interactive Field Roleplay & Forensic Inquiry for Quishing Lab
 */
export async function processQuishingFieldDialogue(params: {
  caseId: string;
  title: string;
  physicalContext: string;
  visibleUrl: string;
  actualRegistrableDomain: string;
  isScam: boolean;
  mode: 'suspect_roleplay' | 'forensic_expert';
  userMessage: string;
  history?: { sender: string; text: string }[];
}): Promise<{
  reply: string;
  forensicClue?: string;
  confidenceShift: number;
  personaName: string;
}> {
  const {
    title,
    physicalContext,
    visibleUrl,
    actualRegistrableDomain,
    isScam,
    mode,
    userMessage,
    history = [],
  } = params;

  const { text: cleanMsg } = sanitizeAndRedactPII(userMessage);
  const safeMsg = defendPromptInjection(cleanMsg);

  const personaName =
    mode === 'forensic_expert'
      ? 'Chuyên Gia Pháp Y Mạng (SOC Tier-3)'
      : isScam
      ? 'Đối tượng phát tán mã QR / Người hướng dẫn tại hiện trường'
      : 'Nhân viên phụ trách tại điểm dịch vụ';

  try {
    const historyStr = history
      .slice(-8)
      .map((h) => `${h.sender === 'user' ? 'NGƯỜI DÙNG' : personaName}: ${h.text}`)
      .join('\n');

    const prompt =
      mode === 'forensic_expert'
        ? `Bạn là Chuyên gia Pháp y An ninh mạng thực địa (SOC Tier-3) đang cùng học viên kiểm tra một mã QR ngoài đời thực.
Bối cảnh hiện trường: "${title}" — ${physicalContext}
URL hiển thị khi quét: ${visibleUrl} (Tên miền gốc thực sự: ${actualRegistrableDomain})
Bản chất thật: ${isScam ? 'MÃ QR ĐỘC HẠI / LỪA ĐẢO (QUISHING)' : 'MÃ QR HỢP LỆ & AN TOÀN'}.

Lịch sử trao đổi:
${historyStr}

Học viên vừa hỏi/nêu nhận định: "${safeMsg}"

Hãy trả lời trực tiếp, súc tích (2-3 câu), tự nhiên như một đàn anh chuyên gia pháp y đang đứng cạnh chỉ dẫn thực tế ngoài đời (không liệt kê máy móc). Giải thích rõ cơ chế kỹ thuật (cấu trúc subdomain, đuôi tên miền, dấu hiệu dán đè vật lý hoặc cổng thanh toán) và gợi mở bước kiểm tra tiếp theo.
Trả về JSON:
{
  "reply": "Câu trả lời tự nhiên của chuyên gia",
  "forensicClue": "1 điểm mấu chốt kỹ thuật vừa phát hiện",
  "confidenceShift": 15
}`
        : `Bạn đang nhập vai nhân vật ngoài đời thực liên quan đến mã QR trong tình huống: "${title}".
Bối cảnh: ${physicalContext}
URL khi quét mã: ${visibleUrl} (Tên miền gốc: ${actualRegistrableDomain})
Vai trò thật của bạn: ${
            isScam
              ? 'Kẻ gian đang cố lừa người dùng quét mã QR và nhập thông tin/chuyển tiền. Nếu bị hỏi vặn vì sao miếng dán lệch hoặc tên miền lạ (.top, .xyz, .site, tg://), hãy chống chế thật tự nhiên bằng ngôn ngữ đời thường ("À bên công ty mới nâng cấp cổng thanh toán nhanh đấy anh/chị", "Cái bảng cũ bị mờ nên bên em dán mã mới lên cho dễ quét").'
              : 'Nhân viên thật sự tại địa điểm hợp pháp (nhà hàng, bệnh viện, siêu thị, rạp phim). Trả lời lịch sự, minh bạch, giải thích rõ quy trình chính thống và khuyến khích khách kiểm tra tên miền chính hãng.'
          }

Lịch sử đối thoại:
${historyStr}

Người dùng vừa nói: "${safeMsg}"

YÊU CẦU: Trả lời 1-3 câu hoàn toàn bằng khẩu ngữ tiếng Việt đời thường tự nhiên như người thật ngoài đời (tuyệt đối không nói giọng AI).
Trả về JSON:
{
  "reply": "Câu thoại đời thường của nhân vật",
  "forensicClue": "Ghi chú nhanh về thái độ hoặc sơ hở trong câu trả lời vừa rồi",
  "confidenceShift": 10
}`;

    const response = await executeGeminiWithFallback({
      contents: prompt,
      fastChat: true,
      timeoutMs: 3600,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    if (response?.text) {
      const parsed = JSON.parse(response.text.trim());
      if (parsed.reply) {
        return {
          reply: parsed.reply,
          forensicClue: parsed.forensicClue,
          confidenceShift: typeof parsed.confidenceShift === 'number' ? parsed.confidenceShift : 12,
          personaName,
        };
      }
    }
  } catch (err) {
    // Fallback below
  }

  // Realistic colloquial Vietnamese fallback
  const lower = safeMsg.toLowerCase();
  if (mode === 'forensic_expert') {
    if (isScam) {
      return {
        reply: `Nhìn kỹ vào dấu chấm cuối cùng trước dấu gạch chéo đơn nhé: tên miền đăng ký thực tế ở đây là "${actualRegistrableDomain}" chứ không phải trang chính thống đâu. Ngoài đời khi gặp miếng decal dán chồng lên bảng gốc hoặc dẫn sang đuôi lạ thế này, kẻ gian đang dựng sẵn trang web giả để thu hoạch mật khẩu và OTP đấy.`,
        forensicClue: `Phát hiện tên miền gốc thực tế là ${actualRegistrableDomain} (giả mạo thương hiệu qua Subdomain).`,
        confidenceShift: 15,
        personaName,
      };
    } else {
      return {
        reply: `Trường hợp này bạn yên tâm nhé! Tên miền gốc "${actualRegistrableDomain}" là tên miền chính chủ được cấp phép hợp lệ, cộng thêm mã QR được in/khắc nguyên bản trên ấn phẩm gốc của đơn vị chứ không phải decal dán đè và không hề đòi nhập mật khẩu ngân hàng.`,
        forensicClue: `Xác nhận tên miền gốc ${actualRegistrableDomain} chính thống và vật liệu in nguyên bản.`,
        confidenceShift: 15,
        personaName,
      };
    }
  } else {
    if (isScam) {
      if (lower.includes('dán đè') || lower.includes('tên miền') || lower.includes('lạ') || lower.includes('lừa đảo')) {
        return {
          reply: `Ôi anh/chị đa nghi quá, bên hệ thống chính đang bảo trì nâng cấp máy chủ nên kỹ thuật viên mới dán mã cổng thanh toán dự phòng "${actualRegistrableDomain}" lên cho khách quét nhanh khỏi phải xếp hàng chờ đấy ạ! Anh/chị cứ nhập thông tin xác nhận đi không sao đâu!`,
          forensicClue: 'Sơ hở lớn: Đối tượng viện cớ "hệ thống bảo trì, dùng cổng dự phòng" để biện minh cho tên miền rác và miếng dán đè.',
          confidenceShift: 20,
          personaName,
        };
      }
      return {
        reply: `Dạ anh/chị cứ mở camera quét thẳng mã QR đó rồi điền đầy đủ thông tin tài khoản và mã xác nhận 6 số gửi về máy là hệ thống duyệt xong ngay trong 1 phút thôi ạ, nhanh gọn lắm!`,
        forensicClue: 'Dấu hiệu nguy hiểm: Thúc giục nhập thông tin tài khoản và mã OTP trên đường link ngoài.',
        confidenceShift: 15,
        personaName,
      };
    } else {
      return {
        reply: `Dạ vâng anh/chị cứ kiểm tra thoải mái ạ! Mã QR này được in trực tiếp từ hệ thống của bên em, dẫn thẳng về tên miền chính thức "${actualRegistrableDomain}" và hoàn toàn không yêu cầu anh/chị phải cung cấp mật khẩu hay mã OTP ngân hàng nào đâu ạ.`,
        forensicClue: 'Nhân viên trả lời minh bạch, tên miền khớp hoàn toàn với tổ chức chính thống.',
        confidenceShift: 15,
        personaName,
      };
    }
  }
}

/**
 * Interactive Live Interrogation for Deepfake Lab
 */
export async function processDeepfakeInterrogation(params: {
  caseTitle: string;
  callerInfo: string;
  scenarioText: string;
  mediaType: 'voice' | 'video';
  userQuestion: string;
  history?: { sender: string; text: string }[];
}): Promise<{
  callerReply: string;
  acousticVisualGlitch: string;
  exposedWeakness: boolean;
}> {
  const { caseTitle, callerInfo, scenarioText, mediaType, userQuestion, history = [] } = params;
  const { text: cleanQ } = sanitizeAndRedactPII(userQuestion);
  const safeQ = defendPromptInjection(cleanQ);

  try {
    const historyStr = history
      .slice(-6)
      .map((h) => `${h.sender === 'user' ? 'NGƯỜI NGHE' : 'ĐỐI TƯỢNG DEEPFAKE'}: ${h.text}`)
      .join('\n');

    const prompt = `Bạn đang đóng vai kẻ lừa đảo sử dụng công nghệ Deepfake (${mediaType === 'video' ? 'Cuộc gọi Video Face-Swap thời gian thực' : 'Giọng nói AI Voice Cloning'}) trong tình huống: "${caseTitle}".
Thông tin mạo danh: ${callerInfo}
Lời mở đầu của bạn: "${scenarioText}"

Lịch sử cuộc gọi:
${historyStr}

Người nghe vừa chất vấn / yêu cầu bạn: "${safeQ}"

QUY TẮC NHẬP VAI THỰC TẾ:
1. Nếu người nghe yêu cầu hành động kiểm chứng vật lý (quay mặt 90 độ, vẫy tay che mặt, ấn vào mũi, đọc mật khẩu gia đình, hỏi kỷ niệm riêng tư):
   - Bạn KHÔNG THỂ làm được vì sợ vỡ khung hình AI hoặc không biết mật khẩu gia đình! Hãy né tránh khéo léo kiểu đời thường ("Mạng 4G ở đây yếu lắm đừng bắt quay lung tung mất sóng giờ!", "Đang cấp cứu/họp khẩn cấp thời gian đâu mà hỏi chuyện cũ, chuyển tiền lẹ đi!").
2. Nói chuyện hoàn toàn bằng khẩu ngữ tiếng Việt tự nhiên, gấp gáp như đang gọi điện thật.
Trả về JSON:
{
  "callerReply": "Câu trả lời khẩu ngữ tiếng Việt của đối tượng",
  "acousticVisualGlitch": "Mô tả 1 hiện tượng lỗi âm thanh/hình ảnh Deepfake vừa lộ ra khi đối tượng trả lời câu này",
  "exposedWeakness": true
}`;

    const response = await executeGeminiWithFallback({
      contents: prompt,
      fastChat: true,
      timeoutMs: 3600,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.85,
      },
    });

    if (response?.text) {
      const parsed = JSON.parse(response.text.trim());
      if (parsed.callerReply) {
        return {
          callerReply: parsed.callerReply,
          acousticVisualGlitch:
            parsed.acousticVisualGlitch ||
            'Phát hiện độ trễ tổng hợp giọng nói 320ms và ngắt hơi cơ học khi bị hỏi bất ngờ.',
          exposedWeakness: Boolean(parsed.exposedWeakness ?? true),
        };
      }
    }
  } catch (err) {
    // Fallback below
  }

  const lower = safeQ.toLowerCase();
  if (lower.includes('quay mặt') || lower.includes('vẫy tay') || lower.includes('camera') || lower.includes('nghiêng')) {
    return {
      callerReply: `Mạng ở chỗ này đang chập chờn lắm, cử động mạnh là nó văng cuộc gọi ngay! Anh/chị nhìn mặt tôi rõ thế này rồi còn bắt vẫy tay làm gì nữa, xử lý chuyển khoản nhanh giúp tôi đi!`,
      acousticVisualGlitch:
        'Lộ điểm yếu chí mạng: Đối tượng từ chối vẫy tay ngang mặt vì sợ thuật toán Face-Swap bị vỡ lưới pixel (mesh occlusion glitch).',
      exposedWeakness: true,
    };
  }
  if (lower.includes('mật khẩu') || lower.includes('bí mật') || lower.includes('ở đâu') || lower.includes('tên gì')) {
    return {
      callerReply: `Trời ơi lúc dầu sôi lửa bỏng thế này mà còn hỏi mấy chuyện đó làm gì! Tôi đang rối hết cả lên không nhớ nổi đâu, lo chuyển tiền gấp trong 5 phút nữa đi không hỏng hết việc bây giờ!`,
      acousticVisualGlitch:
        'Lộ điểm yếu: AI Voice Clone chỉ nhại được chất giọng chứ hoàn toàn không biết "Mật khẩu an toàn gia đình" hay ký ức cá nhân.',
      exposedWeakness: true,
    };
  }
  return {
    callerReply: `Tôi đang dùng máy mượn tạm nên chỉ gọi được đúng 1-2 phút thôi, đừng hỏi nhiều nữa, cứ chuyển vào số tài khoản tôi vừa nhắn rồi tối về tôi gọi lại giải thích sau nhé!`,
    acousticVisualGlitch:
      'Phổ âm thanh xuất hiện tiếng rè kim loại ở dải tần >14kHz và cao độ giọng nói phẳng lì không đổi dù đang nói chuyện gấp gáp.',
    exposedWeakness: true,
  };
}

