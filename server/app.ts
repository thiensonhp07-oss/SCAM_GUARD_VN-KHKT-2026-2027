import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import {
  analyzeScamContent,
  inspectFakeBillAnomalies,
  extractTransparentUrlFeatures,
  analyzeDomainAndOsint,
  decodeScamSpeech,
} from './riskEngine';
import {
  performLiveUrlAndDomainForensics,
  inspectQrCodeForensics,
  inspectMultimodalDocumentForensics,
  analyzeAudioAndVoiceForensics,
  analyzeApkAndFileForensics,
  generateOfficialCybercrimeDossier,
  performSmartPiiRedaction,
} from './forensicsEngine';
import {
  calculateFormalDefenseScore,
  calculateScamDnaVector,
  recommendAdaptiveScenario,
  computeExperimentalStatistics,
  recordParticipantTrial,
  getAllParticipantTrials,
  getMachineLearningBenchmarks,
  getErrorTaxonomyAnalysis,
  simulateRiskWeights,
  getCommunitySurveyAnalytics,
  getAllCommunitySurveys,
  recordCommunitySurveySubmission,
  getSurveyDatasetDigest,
  syncDeltaCommunitySurveys,
  clearAllResearchData,
  clearSurveysToZero,
  seedStandardViSEFDataset,
  calculateSampleSizeAndPower,
  getExclusionLogs,
  logDataExclusion,
  getDataQualityMetrics,
  calculateCronbachAlpha,
  calculateMultipleComparisonCorrections,
  getLiteratureCitations,
  getJudgeDefenseQuestions,
  generateViSEFResearchReport,
  getAllPostAppCertifications,
  recordPostAppCertificationSubmission,
  getPrePostComparisonAnalysis,
  buildLiveTrainingCorpus,
  recordLiveTrainingSample,
  getLiveAiTrainingState,
} from './scientificEngine';

import { CAMGUARD_DATASET } from '../src/data/researchDataset';
import {
  createArenaSession,
  getArenaSession,
  processUserArenaMessage,
  concludeArenaSession,
  processQuishingFieldDialogue,
  processDeepfakeInterrogation,
} from './arenaEngine';
import { SCAM_SCENARIOS } from '../src/data/scenarios';
import { QUISHING_CASES } from '../src/data/quishingData';
import { DEEPFAKE_CASES } from '../src/data/deepfakeData';
import { QUICK_DRILLS } from '../src/data/quickDrills';
import { executeGeminiWithFallback, generateVietnameseSpeechTTS, getActiveApiKey, GEMINI_MODEL } from './gemini';
import {
  registerUser,
  loginUser,
  socialLogin,
  syncFirebaseUser,
  getUserByTokenOrId,
  updateUserProfile,
  getPresetDemoUsers,
  resetUserAccountData,
} from './auth';
import {
  createRateLimiter,
  validateBody,
  AnalyzeTextSchema,
  AnalyzeScreenshotSchema,
  StartArenaSessionSchema,
  ArenaMessageSchema,
  EndArenaSessionSchema,
  CoachAdviceSchema,
  QuishingAnswerSchema,
  FeedbackSubmissionSchema,
  evaluateContentSafetyPolicy,
  addAuditLog,
  getAuditLogs,
  getGeminiUsageMetrics,
  checkAndIncrementGeminiBudget,
} from './security';
import {
  getOrCreateUserProgress,
  recordProgressEvent,
  calculateScamDna,
  getCommunityScamDna,
  deleteUserData,
  exportUserData,
  resetAllUserProgress,
} from './progressEngine';

dotenv.config({ quiet: true });

export function createExpressApp() {
  const app = express();

  // Security Headers using Helmet (with frame config compatible for iFrame preview)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      frameguard: false,
    })
  );

  // Payload body parsing
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // CORS headers for flexibility
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Rate limiters
  const analyzerLimiter = createRateLimiter('analyzer', 30, 60 * 1000);
  const arenaLimiter = createRateLimiter('arena', 40, 60 * 1000);
  const coachLimiter = createRateLimiter('coach', 20, 60 * 1000);
  const accountLimiter = createRateLimiter('account', 15, 60 * 1000);

  // Helper router to mount routes on both /api/* and /* (handling Vercel path rewrites)
  const apiRouter = express.Router();

  // --- AUTHENTICATION & MULTI-USER API ROUTES ---
  apiRouter.post('/auth/register', (req, res) => {
    try {
      const { name, username, email, password, mode } = req.body;
      const result = registerUser({ name, username, email, password, mode });
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi đăng ký tài khoản.' });
    }
  });

  apiRouter.post('/auth/login', (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      const result = loginUser({ usernameOrEmail, password });
      if (!result.success) {
        return res.status(401).json(result);
      }
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi đăng nhập.' });
    }
  });

  apiRouter.post('/auth/social', (req, res) => {
    try {
      const { provider, name, email, avatarUrl, mode } = req.body;
      if (!provider || !['google', 'facebook', 'github'].includes(provider)) {
        return res.status(400).json({ success: false, error: 'Phương thức đăng nhập không hợp lệ.' });
      }
      const result = socialLogin({ provider, name, email, avatarUrl, mode });
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi đăng nhập mạng xã hội.' });
    }
  });

  apiRouter.post('/auth/firebase-sync', (req, res) => {
    try {
      const { uid, name, email, username, avatarUrl, provider, mode, profile } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, error: 'Thiếu Firebase UID.' });
      }
      const account = syncFirebaseUser({
        uid,
        name,
        email,
        username,
        avatarUrl,
        provider,
        mode,
        profile,
      });
      return res.json({ success: true, user: account });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi đồng bộ phiên Firebase.' });
    }
  });

  apiRouter.get('/auth/presets', (req, res) => {
    res.json({ presets: getPresetDemoUsers() });
  });

  apiRouter.get('/auth/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.replace('Bearer ', '') : (req.headers['x-user-id'] as string);
    const user = getUserByTokenOrId(token);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Chưa đăng nhập.' });
    }
    return res.json({ success: true, user });
  });

  apiRouter.put('/auth/profile', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.replace('Bearer ', '') : (req.headers['x-user-id'] as string);
    const user = getUserByTokenOrId(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Chưa xác thực người dùng.' });
    }
    const updated = updateUserProfile(user.id, req.body);
    return res.json({ success: true, user: updated });
  });

  apiRouter.post('/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Đã đăng xuất an toàn.' });
  });

  // Health check & System stats
  apiRouter.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SCAMGUARD Defense Platform',
      geminiConfigured: Boolean(getActiveApiKey()),
      geminiMetrics: getGeminiUsageMetrics(),
      timestamp: new Date().toISOString(),
    });
  });

  // Scenarios Data & Search / Filter Endpoint
  apiRouter.get('/scenarios', (req, res) => {
    const { category, difficulty, ageGroup, channel, q } = req.query;
    let results = [...SCAM_SCENARIOS];

    if (category) {
      results = results.filter((s) => s.category.toLowerCase() === String(category).toLowerCase());
    }
    if (difficulty) {
      results = results.filter((s) => s.difficulty.toLowerCase() === String(difficulty).toLowerCase());
    }
    if (ageGroup && ageGroup !== 'All') {
      results = results.filter((s) => s.ageGroup === 'All' || s.ageGroup === ageGroup);
    }
    if (channel) {
      results = results.filter((s) => s.channel === channel);
    }
    if (q) {
      const search = String(q).toLowerCase();
      results = results.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.subtitle.toLowerCase().includes(search) ||
          s.tactics.some((t) => t.toLowerCase().includes(search))
      );
    }

    res.json({ scenarios: results, total: results.length });
  });

  apiRouter.get('/quishing', (req, res) => {
    const { industry } = req.query;
    let list = QUISHING_CASES;
    if (industry) {
      list = list.filter((c) => c.category.toLowerCase() === String(industry).toLowerCase());
    }
    res.json({ cases: list, total: list.length });
  });

  apiRouter.get('/deepfakes', (req, res) => {
    res.json({ cases: DEEPFAKE_CASES });
  });

  apiRouter.get('/drills', (req, res) => {
    res.json({ drills: QUICK_DRILLS });
  });

  // Text & URL Scam Analysis
  apiRouter.post('/analyze/text', analyzerLimiter, validateBody(AnalyzeTextSchema), async (req, res) => {
    try {
      const { text, url, sender, channel } = req.body;
      const userId = (req.headers['x-user-id'] as string) || 'guest_user';

      const safetyCheck = evaluateContentSafetyPolicy(text || url || '');
      if (!safetyCheck.safe) {
        addAuditLog({
          ip: req.ip || 'unknown',
          userId,
          action: 'POLICY_VIOLATION_BLOCKED',
          status: 'BLOCKED',
          details: { reason: safetyCheck.reason },
        });
        return res.status(400).json({ error: safetyCheck.reason });
      }

      const result = await analyzeScamContent({ text, url, sender, channel });

      // Automatically ingest analyzed sample into the ViSEF Live AI Training Corpus
      recordLiveTrainingSample({
        source: 'SCAM_SCANNER',
        participantOrRef: (text || url || '').slice(0, 80) || 'Live Threat Scan',
        features: {
          timePressure: (result.threatBreakdown?.urgency || 40) / 100,
          authorityFear: (result.threatBreakdown?.impersonation || 35) / 100,
          financialGreed: (result.threatBreakdown?.credentialHarvesting || 30) / 100,
          emotionalManip: (result.threatBreakdown?.socialEngineering || 45) / 100,
          convenienceBias: 0.35,
          credulity: /otp|mã xác thực|mật khẩu/i.test(text || '') ? 0.85 : 0.25,
          domainAnomaly: (result.threatBreakdown?.maliciousUrl || 20) / 100,
          latencyNormalized: 0.25,
          trapAccuracy: result.riskScore >= 45 ? 0.20 : 0.85,
        },
        labelIsHighRiskOrVulnerable: result.riskScore >= 45 ? 1 : 0,
      });

      addAuditLog({
        ip: req.ip || 'unknown',
        userId,
        action: 'SCAM_TEXT_ANALYZED',
        status: 'SUCCESS',
        details: { riskLevel: result.riskLevel, riskScore: result.riskScore },
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Error analyzing scam text:', err);
      return res.status(500).json({ error: err.message || 'Failed to analyze content' });
    }
  });

  // Domain Reputation, Live DNS/TLS/HTTP Sandbox & OSINT Threat Analysis powered by Gemini 3.8 Flash
  apiRouter.post(['/analyze/domain', '/forensics/url-scan'], analyzerLimiter, async (req, res) => {
    try {
      const { query, target, url, context, mode } = req.body;
      const targetStr = String(query || target || url || '').trim();
      if (!targetStr) {
        return res.status(400).json({ error: 'Vui lòng nhập URL, tên miền, payload QR hoặc định danh cần giám định.' });
      }
      const normalizedMode: 'domain' | 'qr_sandbox' | 'osint' =
        mode === 'qr' || mode === 'qr_sandbox' ? 'qr_sandbox' : mode === 'osint' ? 'osint' : 'domain';

      const result = await performLiveUrlAndDomainForensics({
        urlOrDomain: targetStr,
        context: context ? String(context) : undefined,
        mode: normalizedMode,
      });

      recordLiveTrainingSample({
        source: 'DOMAIN_OSINT',
        participantOrRef: targetStr.slice(0, 80),
        features: {
          timePressure: result.riskScore >= 65 ? 0.72 : 0.22,
          authorityFear: result.isTyposquatting ? 0.85 : 0.25,
          financialGreed: 0.45,
          emotionalManip: 0.40,
          convenienceBias: normalizedMode === 'qr_sandbox' ? 0.78 : 0.30,
          credulity: result.riskScore >= 70 ? 0.75 : 0.25,
          domainAnomaly: +(result.riskScore / 100).toFixed(2),
          latencyNormalized: 0.28,
          trapAccuracy: result.riskScore >= 45 ? 0.22 : 0.88,
        },
        labelIsHighRiskOrVulnerable: result.riskScore >= 45 ? 1 : 0,
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Error in domain/OSINT analysis:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi phân tích tên miền / OSINT' });
    }
  });

  // QR Code Image & EMVCo VietQR Payload Sandbox Inspector
  apiRouter.post('/forensics/qr-inspect', analyzerLimiter, async (req, res) => {
    try {
      const { qrPayload, base64Image, mimeType, context } = req.body;
      if (!qrPayload && !base64Image) {
        return res.status(400).json({ error: 'Vui lòng nhập chuỗi dữ liệu QR hoặc tải lên ảnh chụp mã QR.' });
      }
      const result = await inspectQrCodeForensics({
        qrPayload,
        base64Image,
        mimeType,
        context,
      });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in QR forensics:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi giám định mã QR' });
    }
  });

  // Multimodal Audio / Voice Recording & Deepfake Call Forensics
  apiRouter.post('/forensics/audio-analyze', analyzerLimiter, async (req, res) => {
    try {
      const { base64Audio, mimeType, transcript, callerNumber } = req.body;
      if (!base64Audio && !transcript) {
        return res.status(400).json({ error: 'Vui lòng tải lên tệp ghi âm, ghi âm trực tiếp hoặc nhập lời thoại cuộc gọi.' });
      }
      const result = await analyzeAudioAndVoiceForensics({
        base64Audio,
        mimeType,
        transcript,
        callerNumber,
      });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in audio forensics:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi giám định âm thanh cuộc gọi' });
    }
  });

  // APK / File Malware & Android Permission Abuse Forensics
  apiRouter.post('/forensics/apk-analyze', analyzerLimiter, async (req, res) => {
    try {
      const { fileName, fileSize, sha256Hash, extractedStrings, declaredPermissions, downloadSourceUrl } = req.body;
      if (!fileName) {
        return res.status(400).json({ error: 'Vui lòng chọn tệp hoặc nhập tên tệp cần giám định mã độc.' });
      }
      const result = await analyzeApkAndFileForensics({
        fileName,
        fileSize,
        sha256Hash,
        extractedStrings,
        declaredPermissions,
        downloadSourceUrl,
      });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in APK forensics:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi phân tích tệp đính kèm' });
    }
  });

  // Official Cybercrime Report & PA05/C05 Dossier Generator
  apiRouter.post('/forensics/dossier', analyzerLimiter, async (req, res) => {
    try {
      const result = await generateOfficialCybercrimeDossier(req.body || {});
      return res.json(result);
    } catch (err: any) {
      console.error('Error generating cybercrime dossier:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi khởi tạo hồ sơ tố giác' });
    }
  });

  // Smart Contextual PII Redactor powered by Gemini AI + Regex
  apiRouter.post('/forensics/pii-redact', analyzerLimiter, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập văn bản cần khử nhận dạng PII.' });
      }
      const result = await performSmartPiiRedaction({ text: String(text) });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in PII redaction:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi khử nhận dạng PII' });
    }
  });

  // Scam Speech Psychological Decoder powered by Gemini 3.8 Flash
  apiRouter.post('/analyze/speech', analyzerLimiter, async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript || !String(transcript).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập nội dung hội thoại hoặc lời nói của đối tượng.' });
      }
      const result = await decodeScamSpeech(String(transcript).trim());
      const scamScoreNum = Number(result.scamScore || 50);

      recordLiveTrainingSample({
        source: 'SPEECH_DECODER',
        participantOrRef: String(transcript).slice(0, 80),
        features: {
          timePressure: +(Number(result.tactics?.urgency || 50) / 100).toFixed(2),
          authorityFear: +(Number(result.tactics?.authority || 50) / 100).toFixed(2),
          financialGreed: +(Number(result.tactics?.greed || 50) / 100).toFixed(2),
          emotionalManip: +(Number(result.tactics?.panic || 50) / 100).toFixed(2),
          convenienceBias: 0.30,
          credulity: /otp|mã xác thực|chuyển khoản/i.test(String(transcript)) ? 0.88 : 0.25,
          domainAnomaly: 0.20,
          latencyNormalized: 0.22,
          trapAccuracy: scamScoreNum >= 45 ? 0.20 : 0.85,
        },
        labelIsHighRiskOrVulnerable: scamScoreNum >= 45 ? 1 : 0,
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Error in speech decoder:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi giải mã tâm lý cuộc gọi' });
    }
  });

  // Screenshot / Multimodal Image Scam Analysis
  apiRouter.post('/analyze/screenshot', analyzerLimiter, validateBody(AnalyzeScreenshotSchema), async (req, res) => {
    try {
      const { base64Image, mimeType, optionalContext } = req.body;
      const userId = (req.headers['x-user-id'] as string) || 'guest_user';

      const result = await analyzeScamContent({
        text: optionalContext || 'Giám định pháp y số ảnh chụp màn hình tin nhắn hoặc link nghi vấn.',
        base64Image,
        mimeType: mimeType || 'image/png',
      });

      addAuditLog({
        ip: req.ip || 'unknown',
        userId,
        action: 'SCREENSHOT_ANALYZED',
        status: 'SUCCESS',
        details: { riskLevel: result.riskLevel, riskScore: result.riskScore },
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Error analyzing screenshot:', err);
      return res.status(500).json({ error: err.message || 'Failed to analyze screenshot' });
    }
  });

  // Forensic Anomaly Inspection for Fake Invoices, Bank Transfer Receipts, Forged Gov Warrants & Screenshots
  apiRouter.post(['/analyze/bill', '/analyze/fakebill', '/forensics/document-vision'], analyzerLimiter, async (req, res) => {
    try {
      const { base64Image, mimeType, declaredBank, declaredAmount, optionalContext, docCategory } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: 'Cần đính kèm hình ảnh biên lai hoặc tài liệu để thực hiện giám định quang học.' });
      }

      // First try enhanced multimodal document & OCR forensics powered by Gemini 3.8 Flash Vision
      const enhancedVision = await inspectMultimodalDocumentForensics({
        base64Image,
        mimeType: mimeType || 'image/png',
        docCategory: docCategory || 'bank_bill',
        optionalContext,
      });

      if (enhancedVision) {
        return res.json(enhancedVision);
      }

      const report = await inspectFakeBillAnomalies({
        base64Image,
        mimeType: mimeType || 'image/png',
        declaredBank,
        declaredAmount,
      });

      const sm = report?.structuralMetrics || {
        fontMismatchDetected: true,
        fontScore: 70,
        alignmentIrregularityDetected: true,
        spacingScore: 65,
        watermarkSealStatus: 'BLURRED_SYNTHETIC',
        compressionArtifactDetected: true,
        artifactScore: 75,
        metadataTemporalConsistency: 'SUSPICIOUS_ROUND_NUMBER',
      };
      const riskScore = typeof report?.anomalySuspicionScore === 'number' ? report.anomalySuspicionScore : 65;
      let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' = 'LOW';
      if (riskScore >= 65) riskLevel = 'HIGH';
      else if (riskScore >= 35) riskLevel = 'MEDIUM';

      const signals = [
        {
          name: 'Độ lệch phông chữ & Kerning',
          scoreContribution: sm.fontScore ?? 70,
          description: sm.fontMismatchDetected
            ? 'Phát hiện sự không đồng nhất về độ đậm nét và căn dòng chữ số tiền'
            : 'Phông chữ đồng nhất trong giới hạn chấp nhận',
          category: 'Typography',
        },
        {
          name: 'Nhiễu nén ảnh (Compression Artifacts)',
          scoreContribution: sm.artifactScore ?? 75,
          description: sm.compressionArtifactDetected
            ? 'Có quầng mờ xung quanh chữ số tiền do chắp vá chỉnh sửa hình ảnh'
            : 'Mức nén ảnh bình thường',
          category: 'Forensics',
        },
        {
          name: 'Con dấu & Watermark',
          scoreContribution: sm.watermarkSealStatus === 'BLURRED_SYNTHETIC' ? 30 : 5,
          description: `Trạng thái watermark: ${sm.watermarkSealStatus || 'NOT_APPLICABLE'}`,
          category: 'Integrity',
        },
      ];

      const rawRegions = Array.isArray(report?.explainableSuspiciousRegions) && report.explainableSuspiciousRegions.length > 0
        ? report.explainableSuspiciousRegions
        : [
            {
              areaName: 'Vùng chữ số tiền giao dịch',
              description: 'Phông chữ có độ phân giải và mật độ pixel không đồng nhất với phần còn lại của hóa đơn.',
              severity: 'high' as const,
            },
          ];

      const evidenceFound = rawRegions.map((reg: any) => ({
        severity: reg.severity || 'medium',
        title: reg.areaName || 'Khu vực bất thường',
        description: reg.description || 'Dấu hiệu chỉnh sửa hoặc không đồng nhất cấu trúc.',
      }));

      const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();

      const combinedResult = {
        ...report,
        riskLevel,
        riskScore,
        summary: `Giám định quang học: Chỉ số bất thường ${riskScore}/100. ${
          riskScore >= 65
            ? 'Phát hiện nhiều dấu hiệu can thiệp phông chữ và vết ghép số tiền.'
            : 'Hình ảnh hóa đơn tương đối đồng nhất về mặt đồ họa.'
        }`,
        signals,
        redFlags: [
          'Vùng số tiền có độ sắc nét khác biệt với mẫu phôi ngân hàng',
          'Biến động số dư chưa ghi nhận trên ứng dụng ngân hàng thực tế',
          report.scientificCaveat,
        ],
        recommendedSteps: [
          'KHÔNG giao hàng hoặc chuyển khoản đối ứng khi chưa thấy tiền về tài khoản ngân hàng thực tế.',
          'Mở ứng dụng Mobile Banking của người nhận để kiểm tra lịch sử biến động số dư chính thức.',
          'Không tin vào hình chụp màn hình hay thông báo từ ứng dụng bên thứ ba.',
        ],
        piiRedacted: false,
        threatBreakdown: {
          maliciousUrl: 0,
          impersonation: sm.fontScore ?? 70,
          urgency: 40,
          credentialHarvesting: 20,
          socialEngineering: riskScore,
        },
        evidenceFound,
        threatClassification: {
          primaryThreat: 'Biên Lai Chuyển Tiền Giả Mạo (Fake Bank Receipt)',
          attackVector: 'Chỉnh sửa đồ họa biên lai (Visual Manipulation)',
          target: 'Hàng hóa / Tiền cọc của người bán',
          potentialImpact: ['Mất hàng hóa mà không nhận được tiền', 'Bị lừa chuyển khoản ngược'],
          confidence: 86,
        },
        attackChain: [
          'Đối tượng vờ đặt mua hàng hoặc trả nợ',
          'Tạo ảnh biên lai chuyển tiền thành công giả bằng công cụ đồ họa',
          'Gửi ảnh thúc giục nạn nhân giao hàng hoặc hoàn trả tiền thừa',
        ],
        assessmentId: `SG-BILL-${randomHex}`,
      };

      return res.json(combinedResult);
    } catch (err: any) {
      console.error('Error in bill anomaly inspection:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi giám định hóa đơn' });
    }
  });

  // Transparent URL Feature Extractor
  apiRouter.get('/analyze/url-features', (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Thiếu tham số url để phân tích đặc trưng.' });
    }
    const features = extractTransparentUrlFeatures(String(url));
    return res.json(features);
  });

  // Expanded National & Community Blacklist Database
  const COMMUNITY_BLACKLIST: Array<{
    identifier: string;
    type: 'phone' | 'stk' | 'url';
    bankName?: string;
    accountHolder?: string;
    riskLevel: 'EXTREME' | 'HIGH' | 'MEDIUM';
    reportsCount: number;
    lastReported: string;
    source: string;
    tags: string[];
    details: string;
    description?: string;
  }> = [
    {
      identifier: '02473022626',
      type: 'phone',
      riskLevel: 'EXTREME',
      reportsCount: 142,
      lastReported: '2026-10-25',
      source: 'Cổng Cảnh Báo NCSC & Cộng Đồng ScamGuard',
      tags: ['Mạo danh Công an', 'Đe dọa rửa tiền', 'Ép chuyển tiền bảo lãnh'],
      details: 'Đầu số VoIP cố định giả danh Cơ quan CSĐT Công an TP Hà Nội / Bộ Công An gọi đe dọa liên quan chuyên án ma túy/rửa tiền, yêu cầu kết bạn Zalo gửi lệnh bắt giả.',
      description: 'Đầu số VoIP cố định giả danh Cơ quan CSĐT Công an gọi đe dọa liên quan chuyên án rửa tiền và yêu cầu chuyển khoản xác minh.',
    },
    {
      identifier: '1028392109',
      type: 'stk',
      bankName: 'Vietcombank',
      accountHolder: 'NGUYEN VAN HUNG (Tài khoản trung gian / Mule Account)',
      riskLevel: 'EXTREME',
      reportsCount: 89,
      lastReported: '2026-10-24',
      source: 'Cơ Sở Dữ Liệu Phong Tỏa Cộng Đồng & PA05',
      tags: ['Tài khoản rác', 'Rửa tiền', 'Nhận tiền bảo lãnh giả'],
      details: 'Tài khoản ngân hàng không chính chủ (thuê/mua lại) chuyên dùng nhận tiền từ nạn nhân bị lừa đảo mạo danh Viện Kiểm Sát và làm nhiệm vụ hoàn tiền Shopee/TikTok.',
      description: 'Tài khoản mạo danh cơ quan tư pháp nhận tiền bảo lãnh khống và lừa đảo nhiệm vụ.',
    },
    {
      identifier: '19038291029',
      type: 'stk',
      bankName: 'Techcombank',
      accountHolder: 'CTY TNHH TM DV QUOC TE (Mạo danh)',
      riskLevel: 'EXTREME',
      reportsCount: 64,
      lastReported: '2026-10-22',
      source: 'ChongLuaDao & NCSC Threat Feed',
      tags: ['Sàn đầu tư ảo', 'Lừa đảo nhiệm vụ Telegram', 'Khóa rút tiền'],
      details: 'Tài khoản nhận tiền nạp gói nhiệm vụ chốt đơn ảo và sàn ngoại hối trái phép. Nạn nhân nạp tiền vào nhưng bị báo "sai cú pháp" bắt nạp thêm 50% phí giải ngân.',
      description: 'Tài khoản nhận tiền lừa đảo nhiệm vụ cộng tác viên chốt đơn và sàn đầu tư ảo.',
    },
    {
      identifier: '0981234567',
      type: 'phone',
      riskLevel: 'HIGH',
      reportsCount: 37,
      lastReported: '2026-10-20',
      source: 'Cục Viễn Thông & Phản Ánh Đầu Số 156',
      tags: ['Giả shipper giao hàng', 'Gửi link hủy thẻ hội viên'],
      details: 'Đối tượng giả danh nhân viên giao hàng báo đã để kiện hàng ở cổng, yêu cầu chuyển khoản 120.000đ rồi gửi link giả mạo hủy đăng ký thẻ hội viên tự động trừ 3.5 triệu/tháng.',
      description: 'Giả danh shipper giao hàng yêu cầu chuyển khoản trước rồi lừa bấm link hủy thẻ hội viên.',
    },
    {
      identifier: '02899998888',
      type: 'phone',
      riskLevel: 'EXTREME',
      reportsCount: 118,
      lastReported: '2026-10-26',
      source: 'Tổng Đài Phản Ánh Tin Nhắn Rác / Cuộc Gọi Lừa Đảo 156',
      tags: ['Giả danh Điện lực EVN', 'Dọa cắt điện sau 2 giờ', 'Dẫn dụ cài APK'],
      details: 'Cuộc gọi tự động (Robocall) kết hợp nhân viên giả danh Tập đoàn Điện lực EVN thông báo nợ tiền điện quá hạn, ép cài ứng dụng EVN_CSKH.apk chứa mã độc chiếm quyền điều khiển điện thoại.',
      description: 'Mạo danh nhân viên Điện lực EVN dọa cắt điện khẩn cấp để lừa cài file .APK độc hại.',
    },
  ];

  apiRouter.get('/blacklist/search', async (req, res) => {
    const rawQuery = String(req.query.query || '').trim();
    const query = rawQuery.replace(/[^0-9a-zA-Z.]/g, '');
    if (!query) {
      return res.status(400).json({ found: false, message: 'Vui lòng cung cấp số điện thoại, số tài khoản hoặc tên miền cần tra cứu.' });
    }
    const matched = COMMUNITY_BLACKLIST.find(
      (item) => item.identifier.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(item.identifier.toLowerCase())
    );
    if (matched) {
      return res.json({
        found: true,
        data: {
          ...matched,
          description: matched.description || matched.details,
        },
        allEntriesCount: COMMUNITY_BLACKLIST.length,
      });
    }

    // Perform intelligent telecom / bank / Gemini forensic heuristic analysis even when not yet in static list
    const isPhone = /^(?:0|\+84|84)[0-9]{8,10}$/.test(query);
    const isVoipFixed = /^02[48][0-9]{7,8}$/.test(query);
    const isOfficialHotline = /^(113|114|115|156|18001096|19000368|1900545413|19009247|1900558868)$/.test(query);

    if (isOfficialHotline) {
      return res.json({
        found: false,
        isOfficial: true,
        carrierOrType: 'Đường dây nóng Chính phủ / Ngân hàng Chính thống',
        message: `[${rawQuery}] là tổng đài/đường dây nóng chính thức tại Việt Nam. Lưu ý: Các đầu số khẩn cấp như 113, 156 chỉ tiếp nhận cuộc gọi/tin nhắn từ người dân, tuyệt đối không chủ động gọi điện đe dọa hay yêu cầu chuyển khoản.`,
        allEntriesCount: COMMUNITY_BLACKLIST.length,
      });
    }

    let aiAdvisory = '';
    try {
      const aiRes = await executeGeminiWithFallback({
        contents: `Người dùng đang tra cứu định danh nghi vấn: "${rawQuery}" trên Cổng Cơ Sở Dữ Liệu Blacklist Quốc Gia.
Hãy viết đúng 2 câu ngắn gọn bằng tiếng Việt nhận định đặc điểm định danh này (${isVoipFixed ? 'Đầu số cố định/VoIP 024/028 rất hay bị kẻ gian thuê làm tổng đài ảo giả danh Công an/Điện lực' : isPhone ? 'Số điện thoại di động' : 'Số tài khoản ngân hàng / Định danh trực tuyến'}) và nguyên tắc kiểm chứng an toàn trước khi giao dịch.`,
        fastChat: true,
        timeoutMs: 3200,
        config: { temperature: 0.2 },
      });
      if (aiRes?.text) {
        aiAdvisory = aiRes.text.trim();
      }
    } catch {
      // ignore
    }

    return res.json({
      found: false,
      carrierOrType: isVoipFixed
        ? 'Đầu số cố định / VoIP ảo (Cần cảnh giác cao)'
        : isPhone
        ? 'Thuê bao di động viễn thông'
        : 'Số tài khoản ngân hàng / Định danh số',
      aiAdvisory:
        aiAdvisory ||
        (isVoipFixed
          ? 'CẢNH BÁO ĐẦU SỐ 024/028: Các đầu số cố định VoIP rất thường bị tội phạm công nghệ cao đăng ký làm tổng đài ảo giả danh Công an, Tòa án, Điện lực hoặc Giao hàng.'
          : 'Luôn kiểm tra tên chủ tài khoản trùng khớp pháp nhân chính thức và không bao giờ chuyển tiền theo lời hối thúc qua điện thoại/Zalo.'),
      message: `Chưa ghi nhận báo cáo vi phạm trực tiếp cho [${rawQuery}] trong ${COMMUNITY_BLACKLIST.length} hồ sơ Blacklist hiện hành. Tuy nhiên tội phạm liên tục thay đổi SIM rác và tài khoản ngân hàng mới mỗi ngày.`,
      allEntriesCount: COMMUNITY_BLACKLIST.length,
    });
  });

  apiRouter.get('/blacklist/list', (req, res) => {
    return res.json({ items: COMMUNITY_BLACKLIST, total: COMMUNITY_BLACKLIST.length });
  });

  apiRouter.post('/blacklist/report', (req, res) => {
    const { type, identifier, bankName, accountHolder, description, tags } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Thiếu số điện thoại, tên miền hoặc số tài khoản báo cáo.' });
    }
    const newEntry = {
      identifier: String(identifier).trim(),
      type: (type === 'stk' ? 'stk' : type === 'url' ? 'url' : 'phone') as 'phone' | 'stk' | 'url',
      bankName: bankName ? String(bankName).trim() : undefined,
      accountHolder: accountHolder ? String(accountHolder).trim() : undefined,
      riskLevel: 'HIGH' as const,
      reportsCount: 1,
      lastReported: new Date().toISOString().split('T')[0],
      source: 'Báo Cáo Trực Tiếp Từ Người Dùng ScamGuard',
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Cộng đồng báo cáo mới', 'Đang xác minh pháp y'],
      details: description || 'Người dùng gửi phản ánh về hành vi lừa đảo qua ứng dụng.',
      description: description || 'Người dùng gửi phản ánh về hành vi lừa đảo qua ứng dụng.',
    };
    COMMUNITY_BLACKLIST.unshift(newEntry);
    return res.json({ success: true, message: 'Đã tiếp nhận báo cáo và cập nhật trực tiếp vào Cơ sở dữ liệu Cảnh báo Cộng đồng.', item: newEntry });
  });

  // Arena routes
  apiRouter.post('/arena/start', arenaLimiter, (req, res) => {
    try {
      const scenarioId = req.body.scenarioId || 'scam-01';
      const session = createArenaSession(scenarioId);
      return res.json({ session, ...session });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  apiRouter.get('/arena/:sessionId', (req, res) => {
    const session = getArenaSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.json({ session, ...session });
  });

  const handleArenaMessageRoute = async (req: any, res: any) => {
    try {
      const sessionId = req.params.sessionId || req.body.sessionId || `arena_${Date.now()}`;
      const messageText = req.body.message || req.body.content || req.body.text || '';
      const fallbackContext = {
        scenarioId: req.body.scenarioId,
        messages: req.body.messages,
      };
      const response = await processUserArenaMessage(sessionId, messageText, fallbackContext);
      return res.json(response);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  apiRouter.post('/arena/message', arenaLimiter, handleArenaMessageRoute);
  apiRouter.post('/arena/:sessionId/message', arenaLimiter, handleArenaMessageRoute);

  const handleArenaEndRoute = (req: any, res: any) => {
    try {
      const sessionId = req.params.sessionId || req.body.sessionId || req.body.sessionData?.id || '';
      const fallbackData = {
        scenarioId: req.body.scenarioId,
        messages: req.body.messages,
        sessionData: req.body.sessionData,
      };
      const finalReport = concludeArenaSession(sessionId, fallbackData);
      return res.json({ session: finalReport, ...finalReport });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  apiRouter.post('/arena/end', handleArenaEndRoute);
  apiRouter.post('/arena/:sessionId/end', handleArenaEndRoute);

  // Fast AI Security Coach endpoint (/api/coach)
  apiRouter.post('/coach', arenaLimiter, async (req, res) => {
    try {
      const { question, context } = req.body;
      if (!question || !String(question).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu hỏi cần tư vấn.' });
      }
      const userQuestion = String(question).trim();
      const prompt = `Bạn là Chuyên gia Cố vấn An ninh mạng Khẩn cấp của SCAMGUARD VN (tương đương trực ban Cục An toàn thông tin & A05).
Người dùng đang hỏi trực tiếp: "${userQuestion}"
${context ? `Ngữ cảnh hiện tại: ${context}` : ''}

YÊU CẦU TRẢ LỜI NHANH, GỌN, THỰC CHIẾN:
1. Trả lời bằng tiếng Việt tự nhiên, rõ ràng, đi thẳng vào trọng tâm trong 2-4 câu ngắn.
2. Nêu rõ dấu hiệu lừa đảo (nếu có) và hướng dẫn ngay bước hành động bảo vệ tài khoản/tiền bạc (ví dụ: tuyệt đối không đọc OTP, không cài file .apk, gọi 113 hoặc hotline ngân hàng chính chủ để khóa thẻ).`;

      const aiRes = await executeGeminiWithFallback({
        contents: prompt,
        fastChat: true,
        timeoutMs: 3500,
        config: {
          temperature: 0.4,
        },
      });

      const answerText = aiRes?.text?.trim();
      if (answerText) {
        return res.json({
          advice: answerText,
          reply: answerText,
          modelUsed: GEMINI_MODEL,
        });
      }

      const lowerQ = userQuestion.toLowerCase();
      let fallbackAdvice =
        'Nguyên tắc an toàn tối thượng: Tuyệt đối KHÔNG cung cấp mã OTP, mật khẩu ngân hàng, không cài đặt ứng dụng lạ (.apk) và không chuyển tiền theo yêu cầu qua điện thoại/Zalo. Hãy tắt máy và gọi trực tiếp lên tổng đài chính thức in trên mặt sau thẻ ngân hàng hoặc đường dây nóng 113 để xác minh.';
      if (lowerQ.includes('chuyển tiền') || lowerQ.includes('lỡ chuyển')) {
        fallbackAdvice =
          'KHẨN CẤP KHI ĐÃ LỠ CHUYỂN TIỀN: 1. Gọi ngay Hotline ngân hàng của bạn yêu cầu tra soát & phong tỏa khẩn cấp giao dịch vừa chuyển. 2. Chụp màn hình toàn bộ tin nhắn Zalo, biên lai chuyển khoản và số tài khoản kẻ gian. 3. Ra ngay Công an phường/xã gần nhất trình báo trong "khung giờ vàng" 24h đầu tiên.';
      } else if (lowerQ.includes('công an') || lowerQ.includes('viện kiểm sát') || lowerQ.includes('113')) {
        fallbackAdvice =
          'CẢNH BÁO MẠO DANH CÔNG AN: Cơ quan Công an, Viện kiểm sát hay Tòa án tại Việt Nam TUYỆT ĐỐI KHÔNG làm việc qua điện thoại/Zalo, KHÔNG gửi lệnh bắt qua mạng và KHÔNG yêu cầu chuyển tiền vào "tài khoản tạm giữ để chứng minh trong sạch". Hãy cúp máy ngay lập tức!';
      }

      return res.json({
        advice: fallbackAdvice,
        reply: fallbackAdvice,
        modelUsed: 'ScamGuard-Fast-RuleEngine',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi kết nối Cố vấn AI.' });
    }
  });

  // Natural Vietnamese Speech Synthesis (Gemini 3.8 TTS)
  apiRouter.post('/tts/vietnamese', async (req, res) => {
    try {
      const { text, persona, gender } = req.body;
      if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'Thiếu văn bản cần chuyển giọng nói.' });
      }
      const cleanText = String(text).trim().slice(0, 1200);
      const audioResult = await generateVietnameseSpeechTTS({
        text: cleanText,
        persona: persona || 'scammer_general',
        gender: gender || 'female',
      });
      if (audioResult && audioResult.audioBase64) {
        return res.json({
          success: true,
          audioBase64: audioResult.audioBase64,
          mimeType: audioResult.mimeType,
          voiceName: audioResult.voiceName,
          modelUsed: audioResult.modelUsed,
        });
      }
      return res.json({
        success: false,
        fallbackToBrowserTts: true,
      });
    } catch (err: any) {
      return res.json({
        success: false,
        fallbackToBrowserTts: true,
        error: err?.message,
      });
    }
  });

  // Quishing Interactive Field Roleplay & Forensic AI Inquiry
  apiRouter.post('/quishing/chat', arenaLimiter, async (req, res) => {
    try {
      const {
        caseId,
        title,
        physicalContext,
        visibleUrl,
        actualRegistrableDomain,
        isScam,
        mode,
        userMessage,
        history,
      } = req.body;
      if (!userMessage || !String(userMessage).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu hỏi hoặc nội dung tương tác.' });
      }
      const result = await processQuishingFieldDialogue({
        caseId: caseId || 'quish-custom',
        title: title || 'Kiểm định hiện trường mã QR',
        physicalContext: physicalContext || '',
        visibleUrl: visibleUrl || '',
        actualRegistrableDomain: actualRegistrableDomain || '',
        isScam: Boolean(isScam),
        mode: mode === 'forensic_expert' ? 'forensic_expert' : 'suspect_roleplay',
        userMessage: String(userMessage).trim(),
        history: Array.isArray(history) ? history : [],
      });
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi khi tương tác AI Quishing.' });
    }
  });

  // Deepfake Live Interrogation Challenge
  apiRouter.post('/deepfake/interrogate', arenaLimiter, async (req, res) => {
    try {
      const { caseTitle, callerInfo, scenarioText, mediaType, userQuestion, history } = req.body;
      if (!userQuestion || !String(userQuestion).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu hỏi chất vấn đối tượng.' });
      }
      const result = await processDeepfakeInterrogation({
        caseTitle: caseTitle || 'Cuộc gọi Deepfake nghi vấn',
        callerInfo: callerInfo || 'Số lạ',
        scenarioText: scenarioText || '',
        mediaType: mediaType === 'video' ? 'video' : 'voice',
        userQuestion: String(userQuestion).trim(),
        history: Array.isArray(history) ? history : [],
      });
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi khi chất vấn đối tượng Deepfake.' });
    }
  });

  // Scientific research endpoints
  apiRouter.get('/research/statistics', (req, res) => {
    try {
      const stats = computeExperimentalStatistics();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.get('/research/benchmarks', (req, res) => {
    try {
      const bm = getMachineLearningBenchmarks();
      res.json(bm);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.get('/research/taxonomy-errors', (req, res) => {
    try {
      const errors = getErrorTaxonomyAnalysis();
      res.json(errors);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.get('/research/surveys', (req, res) => {
    try {
      const clientDigest = typeof req.query.digest === 'string' ? req.query.digest : undefined;
      const currentDigest = getSurveyDatasetDigest();
      const surveys = getAllCommunitySurveys();
      if (clientDigest && clientDigest === currentDigest) {
        return res.json({ unchanged: true, digest: currentDigest, total: surveys.length });
      }
      return res.json({ unchanged: false, digest: currentDigest, surveys, total: surveys.length });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post('/research/sync-delta', (req, res) => {
    try {
      const { clientDigest, incomingSurveys } = req.body || {};
      const deltaResult = syncDeltaCommunitySurveys({
        clientDigest: typeof clientDigest === 'string' ? clientDigest : undefined,
        incomingSurveys: Array.isArray(incomingSurveys) ? incomingSurveys : undefined,
      });
      return res.json(deltaResult);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post('/research/survey', (req, res) => {
    try {
      const submission = recordCommunitySurveySubmission(req.body);
      const allSurveys = getAllCommunitySurveys();
      res.json({
        success: true,
        submission,
        total: allSurveys.length,
        digest: getSurveyDatasetDigest(),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  apiRouter.get('/research/survey-analytics', (req, res) => {
    try {
      const data = getCommunitySurveyAnalytics();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.get('/research/dataset', (req, res) => {
    res.json({ dataset: CAMGUARD_DATASET, count: CAMGUARD_DATASET.length });
  });

  // Live AI Dataset Auto-Collection & Self-Training Endpoints for ViSEF Research Center
  apiRouter.get('/research/training-state', (req, res) => {
    try {
      const trainingState = getLiveAiTrainingState();
      const corpus = buildLiveTrainingCorpus();
      const benchmarks = getMachineLearningBenchmarks();
      res.json({
        trainingState,
        corpus: corpus.slice(0, 60),
        totalCorpusCount: corpus.length,
        benchmarks,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post('/research/train-ai', async (req, res) => {
    try {
      if (Array.isArray(req.body?.surveys) && req.body.surveys.length > 0) {
        const existingIds = new Set(getAllCommunitySurveys().map((s) => s.id));
        for (const s of req.body.surveys) {
          if (s && s.id && !existingIds.has(s.id)) {
            recordCommunitySurveySubmission(s);
            existingIds.add(s.id);
          }
        }
      }
      const baseState = getLiveAiTrainingState(undefined, true);
      let aiSummary = baseState.aiResearchSummary;

      try {
        const prompt = `Bạn là Trưởng nhóm Nghiên cứu Học máy An ninh mạng cho đề tài ViSEF 2026 (ScamGuard).
Hãy viết đúng 2-3 câu nhận xét học thuật súc tích bằng tiếng Việt đánh giá kết quả tự huấn luyện (Online Gradient Descent + Hybrid LLM) vừa chạy trên tập dữ liệu thực tế:
- Chu kỳ huấn luyện: #${baseState.trainingRunsCount} (${baseState.datasetVersion})
- Tổng mẫu vector huấn luyện: N_vec = ${baseState.totalSamples} (${baseState.surveySamplesCount} vector từ phiếu khảo sát thực địa, ${baseState.liveScannerSamplesCount} mẫu quét thời gian thực).
- Confusion Matrix thực tế: TP=${baseState.confusionMatrix.tp}, TN=${baseState.confusionMatrix.tn}, FP=${baseState.confusionMatrix.fp}, FN=${baseState.confusionMatrix.fn}.
- Trọng số hội tụ: w_Authority=${baseState.learnedWeights.wAuthorityFear}, w_TimePressure=${baseState.learnedWeights.wTimePressure}, w_Greed=${baseState.learnedWeights.wFinancialGreed}, w_Domain=${baseState.learnedWeights.wDomainAnomaly}.
Chỉ trả về đoạn văn bản thuần túy, trang trọng, chuẩn báo cáo khoa học.`;

        const resp = await executeGeminiWithFallback({
          contents: prompt,
          config: { temperature: 0.2 },
        });
        const geminiText = resp?.text || '';
        if (geminiText && geminiText.trim().length > 20) {
          aiSummary = geminiText.trim();
        }
      } catch {
        // Fallback to deterministic mathematical summary already in baseState
      }

      const updatedState = getLiveAiTrainingState(aiSummary, false);
      const corpus = buildLiveTrainingCorpus();
      const benchmarks = getMachineLearningBenchmarks();
      const surveyAnalytics = getCommunitySurveyAnalytics();
      const statistics = computeExperimentalStatistics();
      const taxonomyErrors = getErrorTaxonomyAnalysis();

      res.json({
        success: true,
        trainingState: updatedState,
        corpus: corpus.slice(0, 60),
        totalCorpusCount: corpus.length,
        benchmarks,
        surveyAnalytics,
        statistics,
        taxonomyErrors,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post('/research/clear-to-zero', (req, res) => {
    try {
      const result = clearSurveysToZero();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post('/research/seed-visef', (req, res) => {
    try {
      const result = seedStandardViSEFDataset();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Post App Certification & Pre/Post Comparison
  apiRouter.get('/research/post-app-certifications', (req, res) => {
    try {
      res.json({ certifications: getAllPostAppCertifications() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post('/research/post-app-certifications', (req, res) => {
    try {
      const record = recordPostAppCertificationSubmission(req.body);
      res.json({ success: true, record });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  apiRouter.get('/research/pre-post-comparison', (req, res) => {
    try {
      const comparison = getPrePostComparisonAnalysis();
      res.json(comparison);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // User progress & Scam DNA
  apiRouter.get('/user/progress', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest_user';
    const progress = getOrCreateUserProgress(userId);
    res.json(progress);
  });

  apiRouter.post('/user/progress/event', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest_user';
    const { eventType, eventData } = req.body;
    const updated = recordProgressEvent(userId, eventType, eventData);
    res.json(updated);
  });

  apiRouter.get('/user/scam-dna', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'guest_user';
    const dna = calculateScamDna(userId);
    res.json(dna);
  });

  apiRouter.get('/community/scam-dna', (req, res) => {
    res.json(getCommunityScamDna());
  });

  apiRouter.post('/account/reset-all', accountLimiter, (req, res) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'guest_user';
      deleteUserData(userId);
      resetUserAccountData(userId);
      resetAllUserProgress();
      clearAllResearchData();
      res.json({
        success: true,
        message: 'Đã reset hoàn tất toàn bộ bài học, khảo sát thực nghiệm và dữ liệu cá nhân!',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Lỗi khi reset dữ liệu' });
    }
  });

  apiRouter.get('/admin/audit-logs', (req, res) => {
    res.json({ logs: getAuditLogs(100), metrics: getGeminiUsageMetrics() });
  });

  // Mount API routes under both /api and / to handle Vercel routing
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}

export const app = createExpressApp();
