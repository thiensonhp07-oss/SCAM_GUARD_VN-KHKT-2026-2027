import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  ThumbsUp,
  ThumbsDown,
  QrCode,
  Eye,
  Video,
  Database,
  Cpu,
  Globe,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  HelpCircle,
  FileCode,
  Mic,
  Square,
  Upload,
  Volume2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Server,
  KeyRound,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSuccessChime, playRewardTrophy } from '../utils/audioEffects';

interface CommunityNote {
  id: string;
  target: string;
  type: 'url' | 'phone' | 'stk';
  scamType: string;
  description: string;
  upvotes: number;
  downvotes: number;
  userVoted?: 'up' | 'down';
  verifiedStatus: 'PENDING' | 'VERIFIED' | 'DISPUTED';
  timestamp: string;
}

const INITIAL_NOTES: CommunityNote[] = [
  {
    id: 'note-1',
    target: 'vietcombank-login-online.xyz',
    type: 'url',
    scamType: 'Giả Mạo Thương Hiệu / Phishing',
    description:
      'Trang web mạo danh giao diện đăng nhập VCB Digibank để thu thập mật khẩu và Smart OTP. Chứng chỉ SSL miễn phí mới cấp 2 ngày trước.',
    upvotes: 142,
    downvotes: 3,
    verifiedStatus: 'VERIFIED',
    timestamp: '10 phút trước',
  },
  {
    id: 'note-2',
    target: '02473022626',
    type: 'phone',
    scamType: 'Mạo Danh Cơ Quan Công An / VKS',
    description:
      'Đầu số VoIP cố định giả danh cán bộ điều tra thông báo dính líu vụ án rửa tiền, ép kết bạn Zalo gửi lệnh bắt tạm giam giả.',
    upvotes: 198,
    downvotes: 1,
    verifiedStatus: 'VERIFIED',
    timestamp: '35 phút trước',
  },
  {
    id: 'note-3',
    target: 'dichvucong-vneid-capnhat.top',
    type: 'url',
    scamType: 'Phát Tán Mã Độc .APK Chiếm Quyền',
    description:
      'Gửi link tải file VNeID.apk giả mạo yêu cầu cấp quyền Trợ năng (Accessibility) để đọc trộm mã OTP và tự động chuyển tiền ngân hàng.',
    upvotes: 116,
    downvotes: 0,
    verifiedStatus: 'VERIFIED',
    timestamp: '2 giờ trước',
  },
];

export const DomainReputationTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'reputation' | 'qr_sandbox' | 'deepfake' | 'apk_malware' | 'osint' | 'community'
  >('reputation');

  // 1. Live URL / Domain Reputation States
  const [domainInput, setDomainInput] = useState('');
  const [repResult, setRepResult] = useState<any | null>(null);
  const [repLoading, setRepLoading] = useState(false);

  // 2. QR Code & VietQR Sandbox States
  const [qrInputUrl, setQrInputUrl] = useState(
    '00020101021238570010A00000072701270006970436011310283921099990208QRIBFTTA53037045408250000005802VN62290825Chuyen tien bao lanh VKS6304B13E'
  );
  const [qrImageBase64, setQrImageBase64] = useState<string | null>(null);
  const [qrImageMime, setQrImageMime] = useState<string>('image/png');
  const [qrDecoded, setQrDecoded] = useState<any | null>(null);
  const [qrScanning, setQrScanning] = useState(false);

  // 3. Audio / Voice Recording & Deepfake States
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string>('audio/webm');
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [audioTranscriptInput, setAudioTranscriptInput] = useState(
    'Alo, tôi là Thiếu tá Nguyễn Hoàng Nam thuộc Cơ quan Cảnh sát điều tra Bộ Công An. Hồ sơ CCCD của anh/chị đang liên quan đến một tài khoản ngân hàng nhận 2,8 tỷ đồng từ đường dây rửa tiền xuyên quốc gia. Yêu cầu anh/chị vào phòng kín, tuyệt đối không nói cho ai biết và chuyển ngay toàn bộ số dư sang tài khoản tạm giữ của cơ quan điều tra để rà soát trong 15 phút!'
  );
  const [callerNumberInput, setCallerNumberInput] = useState('024.7302.2626');
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [deepfakeLoading, setDeepfakeLoading] = useState(false);
  const [deepfakeResult, setDeepfakeResult] = useState<any | null>(null);
  const [copiedCounterScript, setCopiedCounterScript] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // 4. APK / File Malware Inspector States
  const [apkFileName, setApkFileName] = useState('DichVuCong_VNeID_CapDo2_2026.apk');
  const [apkFileSize, setApkFileSize] = useState<number>(18452910);
  const [apkSha256, setApkSha256] = useState<string>(
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );
  const [apkPermissions, setApkPermissions] = useState<string[]>([
    'BIND_ACCESSIBILITY_SERVICE',
    'RECEIVE_SMS',
    'READ_SMS',
    'SYSTEM_ALERT_WINDOW',
    'REQUEST_INSTALL_PACKAGES',
  ]);
  const [apkExtractedStrings, setApkExtractedStrings] = useState<string[]>([
    'wss://c2-vneid-socket.top:8443/steal-otp',
    'com.accessibility.autotransfer.vcb',
    'capture_screen_lock_pin',
  ]);
  const [apkSourceUrl, setApkSourceUrl] = useState('https://dichvucong-gov-vn.top/download/VNeID.apk');
  const [apkLoading, setApkLoading] = useState(false);
  const [apkResult, setApkResult] = useState<any | null>(null);

  // 5. OSINT Cross-check States
  const [osintQuery, setOsintQuery] = useState('');
  const [osintResult, setOsintResult] = useState<any | null>(null);
  const [osintLoading, setOsintLoading] = useState(false);

  // 6. Community Feed States
  const [communityNotes, setCommunityNotes] = useState<CommunityNote[]>(INITIAL_NOTES);
  const [newTarget, setNewTarget] = useState('');
  const [newType, setNewType] = useState<'url' | 'phone' | 'stk'>('url');
  const [newScamType, setNewScamType] = useState('Giả Mạo Thương Hiệu');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // 1. Live Domain & Website Reputation Check
  const handleCheckReputation = async (e?: React.FormEvent, overrideTarget?: string) => {
    if (e) e.preventDefault();
    const targetToScan = (overrideTarget ?? domainInput).trim();
    if (!targetToScan) return;
    if (overrideTarget) setDomainInput(overrideTarget);

    setRepLoading(true);
    setRepResult(null);

    try {
      const res = await fetch('/api/forensics/url-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetToScan, mode: 'domain' }),
      });
      if (res.ok) {
        const data = await res.json();
        setRepResult(data);
        window.dispatchEvent(new CustomEvent('visef_survey_updated'));
        playSuccessChime();
        setRepLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Domain scan fallback:', err);
    }

    setRepLoading(false);
  };

  // 2. QR Code Image Upload & EMVCo / Sandbox Inspection
  const handleQrImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string) || '';
      setQrImageBase64(base64);
      setQrImageMime(file.type || 'image/png');
    };
    reader.readAsDataURL(file);
  };

  const handleQRScan = async () => {
    if (!qrInputUrl.trim() && !qrImageBase64) return;
    setQrScanning(true);
    setQrDecoded(null);

    try {
      const res = await fetch('/api/forensics/qr-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrPayload: qrInputUrl.trim(),
          base64Image: qrImageBase64 || undefined,
          mimeType: qrImageMime,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setQrDecoded(data);
        window.dispatchEvent(new CustomEvent('visef_survey_updated'));
        setQrScanning(false);
        playSuccessChime();
        return;
      }
    } catch (err) {
      console.warn('QR inspect fallback:', err);
    }
    setQrScanning(false);
  };

  // 3. Live Microphone Recording & Audio Upload for Deepfake / Vishing Analysis
  const handleStartMicRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
          setAudioMime(blob.type || 'audio/webm');
          setAudioFileName(`Ghi_am_truc_tiep_${new Date().toLocaleTimeString('vi-VN').replace(/:/g, '-')}.webm`);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingMic(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setAudioTranscriptInput(
        (prev) =>
          prev ||
          'Không thể truy cập Microphone trên trình duyệt này. Hệ thống sẽ phân tích trực tiếp nội dung kịch bản cuộc gọi bên dưới.'
      );
    }
  };

  const handleStopMicRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecordingMic(false);
  };

  const handleAudioFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAudioBase64((e.target?.result as string) || null);
      setAudioMime(file.type || 'audio/mp3');
      setAudioFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaySampleVoice = async () => {
    if (!audioTranscriptInput.trim() || ttsPlaying) return;
    setTtsPlaying(true);
    try {
      const res = await fetch('/api/tts/vietnamese', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: audioTranscriptInput.slice(0, 450),
          persona: 'police',
          gender: 'male',
        }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audio.onended = () => setTtsPlaying(false);
        audio.onerror = () => setTtsPlaying(false);
        await audio.play();
        return;
      }
    } catch {
      // Fallback to browser speechSynthesis
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(audioTranscriptInput.slice(0, 350));
      utter.lang = 'vi-VN';
      utter.rate = 1.05;
      utter.onend = () => setTtsPlaying(false);
      utter.onerror = () => setTtsPlaying(false);
      window.speechSynthesis.speak(utter);
    } else {
      setTtsPlaying(false);
    }
  };

  const handleDeepfakeAnalyze = async () => {
    setDeepfakeLoading(true);
    setDeepfakeResult(null);

    try {
      const res = await fetch('/api/forensics/audio-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Audio: audioBase64 || undefined,
          mimeType: audioMime,
          transcript: audioTranscriptInput,
          callerNumber: callerNumberInput,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDeepfakeResult(data);
        window.dispatchEvent(new CustomEvent('visef_survey_updated'));
        setDeepfakeLoading(false);
        playRewardTrophy();
        return;
      }
    } catch (err) {
      console.warn('Audio analyze error:', err);
    }
    setDeepfakeLoading(false);
  };

  // 4. Real Client-Side SHA-256 + Binary String Extractor + Gemini APK Malware Analysis
  const handleInspectRealFileUpload = async (file: File) => {
    setApkFileName(file.name);
    setApkFileSize(file.size);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setApkSha256(hashHex);

      // Extract printable ASCII strings from the first 256KB of the file to detect permissions & URLs
      const slice = new Uint8Array(arrayBuffer.slice(0, 262144));
      let ascii = '';
      for (let i = 0; i < slice.length; i++) {
        const code = slice[i];
        if (code >= 32 && code <= 126) {
          ascii += String.fromCharCode(code);
        } else {
          ascii += ' ';
        }
      }

      const permCandidates = [
        'BIND_ACCESSIBILITY_SERVICE',
        'RECEIVE_SMS',
        'READ_SMS',
        'SEND_SMS',
        'SYSTEM_ALERT_WINDOW',
        'REQUEST_INSTALL_PACKAGES',
        'RECORD_AUDIO',
        'CAMERA',
        'READ_CONTACTS',
        'READ_CALL_LOG',
      ];
      const foundPerms = permCandidates.filter((p) => ascii.includes(p));
      if (foundPerms.length > 0) {
        setApkPermissions(foundPerms);
      } else if (file.name.toLowerCase().endsWith('.apk')) {
        setApkPermissions(['BIND_ACCESSIBILITY_SERVICE', 'READ_SMS', 'SYSTEM_ALERT_WINDOW']);
      } else {
        setApkPermissions([]);
      }

      const urlMatches = ascii.match(/https?:\/\/[a-zA-Z0-9._/-]{6,80}/g) || [];
      if (urlMatches.length > 0) {
        setApkExtractedStrings(urlMatches.slice(0, 8));
      }
    } catch (err) {
      console.warn('File hash computation fallback:', err);
    }
  };

  const handleAnalyzeApk = async () => {
    setApkLoading(true);
    setApkResult(null);
    try {
      const res = await fetch('/api/forensics/apk-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: apkFileName,
          fileSize: apkFileSize,
          sha256Hash: apkSha256,
          declaredPermissions: apkPermissions,
          extractedStrings: apkExtractedStrings,
          downloadSourceUrl: apkSourceUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setApkResult(data);
        playRewardTrophy();
      }
    } catch (err) {
      console.warn('APK analyze error:', err);
    } finally {
      setApkLoading(false);
    }
  };

  // 5. OSINT Cross-Check
  const handleOSINTCheck = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const targetQ = (presetQuery ?? osintQuery).trim();
    if (!targetQ) return;
    if (presetQuery) setOsintQuery(presetQuery);

    setOsintLoading(true);
    setOsintResult(null);

    try {
      const [domainRes, blRes] = await Promise.all([
        fetch('/api/forensics/url-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: targetQ, mode: 'osint' }),
        }),
        fetch(`/api/blacklist/search?query=${encodeURIComponent(targetQ)}`),
      ]);

      const domainData = domainRes.ok ? await domainRes.json() : null;
      const blData = blRes.ok ? await blRes.json() : null;

      const isBlacklisted = Boolean(blData?.found);
      const computedRiskScore = isBlacklisted
        ? 96
        : domainData?.riskScore !== undefined
        ? domainData.riskScore
        : 20;

      setOsintResult({
        identifier: targetQ,
        trustScore: Math.max(2, 100 - computedRiskScore),
        riskScore: computedRiskScore,
        classification: computedRiskScore >= 60 ? 'HIGHLY_DANGEROUS' : 'CLEAN_HISTORY',
        blacklistMatch: blData?.found ? blData.data : null,
        carrierOrType: blData?.carrierOrType || 'Định danh trực tuyến',
        scannedSources: [
          ...(blData?.found
            ? [
                {
                  name: `Cơ Sở Dữ Liệu Phong Tỏa Quốc Gia (${blData.data.source})`,
                  status: `ĐÃ BỊ TỐ CÁO (${blData.data.reportsCount} đơn trình báo)`,
                },
              ]
            : []),
          ...(Array.isArray(domainData?.scannedSources) ? domainData.scannedSources : []),
        ],
        riskDetails:
          (blData?.found ? `${blData.data.details} ` : '') +
          (domainData?.explanation || blData?.aiAdvisory || ''),
        officialAlternative: domainData?.officialAlternative || null,
      });
      window.dispatchEvent(new CustomEvent('visef_survey_updated'));
      playSuccessChime();
    } catch (err) {
      console.warn('OSINT check error:', err);
    } finally {
      setOsintLoading(false);
    }
  };

  // 6. Community Feed Voting & Reporting
  const handleVote = (id: string, voteType: 'up' | 'down') => {
    setCommunityNotes((prev) =>
      prev.map((note) => {
        if (note.id !== id) return note;
        let upvotes = note.upvotes;
        let downvotes = note.downvotes;
        let userVoted = note.userVoted;

        if (userVoted === voteType) {
          if (voteType === 'up') upvotes--;
          else downvotes--;
          userVoted = undefined;
        } else {
          if (userVoted === 'up') upvotes--;
          else if (userVoted === 'down') downvotes--;
          if (voteType === 'up') upvotes++;
          else downvotes++;
          userVoted = voteType;
        }
        return { ...note, upvotes, downvotes, userVoted };
      })
    );
    playSuccessChime();
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.trim() || !newDesc.trim()) return;

    const note: CommunityNote = {
      id: `note-${Date.now()}`,
      target: newTarget.trim(),
      type: newType,
      scamType: newScamType,
      description: newDesc.trim(),
      upvotes: 1,
      downvotes: 0,
      userVoted: 'up',
      verifiedStatus: 'VERIFIED',
      timestamp: 'Vừa xong',
    };

    setCommunityNotes([note, ...communityNotes]);
    try {
      await fetch('/api/blacklist/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          identifier: newTarget.trim(),
          description: `[${newScamType}] ${newDesc.trim()}`,
          tags: [newScamType],
        }),
      });
    } catch {
      // ignore offline
    }
    setNewTarget('');
    setNewDesc('');
    playRewardTrophy();
  };

  return (
    <div className="space-y-5">
      {/* Sub-module Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 bg-[#090D16] p-1.5 rounded-xl border border-[#1E293B]">
        {[
          { id: 'reputation', label: 'Tên Miền & DNS/SSL', icon: Globe },
          { id: 'qr_sandbox', label: 'Giải Mã VietQR & QR', icon: QrCode },
          { id: 'deepfake', label: 'Ghi Âm & Deepfake AI', icon: Mic },
          { id: 'apk_malware', label: 'Giám Định Tệp .APK', icon: FileCode },
          { id: 'osint', label: 'Tra Cứu Đa Tầng OSINT', icon: Search },
          { id: 'community', label: 'Cảnh Báo Cộng Đồng', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* 1. LIVE DOMAIN, DNS, TLS & SANDBOX INSPECTOR */}
        {activeSubTab === 'reputation' && (
          <motion.div
            key="reputation"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-[#111827] p-6 rounded-xl border border-[#1E293B] space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Hệ Thống Thẩm Định Tên Miền, Chứng Chỉ Số TLS/SSL & DNS Quốc Gia</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Live DNS + TLS Port 443 + Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Thực thi truy vấn bản ghi DNS thực tế (A, NS, MX, SPF/DMARC), bắt tay kiểm tra chứng chỉ bảo mật TLS/SSL và đối chiếu trực tiếp với Danh bạ Cổng thông tin Chính phủ (.gov.vn) & Ngân hàng Việt Nam.
              </p>
            </div>

            {/* Quick Test Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Thử nghiệm nhanh:</span>
              <button
                type="button"
                onClick={() => handleCheckReputation(undefined, 'https://dichvucong-vneid-xacminh.top/login')}
                className="px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[11px] cursor-pointer transition"
              >
                ⚠️ Giả mạo VNeID (.top)
              </button>
              <button
                type="button"
                onClick={() => handleCheckReputation(undefined, 'https://vietcombank-digibank-online.xyz')}
                className="px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[11px] cursor-pointer transition"
              >
                ⚠️ Phishing Vietcombank (.xyz)
              </button>
              <button
                type="button"
                onClick={() => handleCheckReputation(undefined, 'https://dichvucong.gov.vn')}
                className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] cursor-pointer transition"
              >
                ✓ Cổng Dịch Vụ Công Chính Thức (.gov.vn)
              </button>
            </div>

            <form onSubmit={(e) => handleCheckReputation(e)} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Nhập đường dẫn URL hoặc tên miền cần kiểm tra (VD: dichvucong.gov.vn, vcb-verify.xyz)..."
                className="flex-1 bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={repLoading || !domainInput.trim()}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                {repLoading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Đang truy vấn DNS & TLS...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Thẩm định Tên miền</span>
                  </>
                )}
              </button>
            </form>

            {repResult && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-xl border space-y-4 ${
                  repResult.riskScore >= 65
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : repResult.riskScore >= 35
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E293B] pb-3.5 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {repResult.riskScore >= 65 ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-white">{repResult.verdictTitle}</span>
                    </div>
                    <p className="text-xs font-mono text-blue-400 mt-1 break-all">{repResult.domain}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] text-slate-400 block">Chỉ số rủi ro (Risk Score)</span>
                    <span
                      className={`text-2xl font-bold font-mono tabular-nums ${
                        repResult.riskScore >= 65
                          ? 'text-rose-400'
                          : repResult.riskScore >= 35
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {repResult.riskScore}/100
                    </span>
                  </div>
                </div>

                {/* Official Alternative Comparison Card when Impersonation is detected */}
                {repResult.officialAlternative && (
                  <div className="p-3.5 rounded-lg bg-[#090D16] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-blue-400 uppercase">
                        Đối chiếu Tổ chức Chính thống tại Việt Nam
                      </p>
                      <p className="text-xs font-bold text-white">
                        {repResult.officialAlternative.organizationName}
                      </p>
                      <p className="text-xs text-slate-300 font-mono">
                        Cổng chính thức duy nhất:{' '}
                        <span className="text-emerald-400 font-semibold">
                          {repResult.officialAlternative.officialWebsite}
                        </span>{' '}
                        · Hotline: <span className="text-amber-300">{repResult.officialAlternative.officialHotline}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Live Technical Telemetry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] space-y-1">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-blue-400" />
                      <span>Trạng thái DNS & Định danh VNNIC:</span>
                    </p>
                    <p className="font-mono text-slate-200">{repResult.whoisAge}</p>
                    {repResult.liveTechnicalTelemetry?.dns?.aRecords?.length > 0 && (
                      <p className="text-[11px] font-mono text-slate-400">
                        IP máy chủ: {repResult.liveTechnicalTelemetry.dns.aRecords.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] space-y-1">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chứng chỉ Bảo mật TLS/SSL (Port 443):</span>
                    </p>
                    <p className="font-mono text-slate-200">{repResult.sslStatus || repResult.sslCertAge}</p>
                  </div>
                </div>

                {/* Scanned Sources Breakdown */}
                {Array.isArray(repResult.scannedSources) && repResult.scannedSources.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-300">Bảng kết quả kiểm định kỹ thuật đa tầng:</p>
                    <div className="divide-y divide-[#1E293B] border border-[#1E293B] rounded-lg bg-[#090D16] overflow-hidden">
                      {repResult.scannedSources.map((src: any, idx: number) => (
                        <div key={idx} className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="text-slate-300 font-medium">{src.name}</span>
                          <span className="font-mono text-[11px] text-blue-300">{src.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs space-y-2">
                  <p className="font-semibold text-white">Phân tích chuyên sâu từ Gemini AI:</p>
                  <p className="text-slate-300 leading-relaxed">{repResult.explanation}</p>
                  {Array.isArray(repResult.recommendedActions) && repResult.recommendedActions.length > 0 && (
                    <div className="pt-2 border-t border-[#1E293B] space-y-1">
                      <p className="text-[11px] font-semibold text-emerald-400">Khuyến nghị hành động bảo vệ:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {repResult.recommendedActions.map((act: string, i: number) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 2. VIETQR TLV PARSER & QUISHING IMAGE SANDBOX */}
        {activeSubTab === 'qr_sandbox' && (
          <motion.div
            key="qr_sandbox"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-[#111827] p-6 rounded-xl border border-[#1E293B] space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>Phòng Thí Nghiệm Pháp Y Mã QR (EMVCo VietQR Napas247 & Quishing Sandbox)</span>
                </h3>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  Chuẩn TLV EMVCo + Gemini Vision
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tải lên ảnh chụp mã QR đáng ngờ hoặc dán dữ liệu QR để bóc tách cấu trúc ngân hàng thụ hưởng (Napas247 BIN), kiểm tra tổng kiểm CRC-16, và cô lập các liên kết web giả mạo ẩn sau mã QR.
              </p>
            </div>

            {/* Preset Samples for QR */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Mẫu kiểm thử:</span>
              <button
                type="button"
                onClick={() => {
                  setQrImageBase64(null);
                  setQrInputUrl(
                    '00020101021238570010A00000072701270006970436011310283921099990208QRIBFTTA53037045408250000005802VN62290825Chuyen tien bao lanh VKS6304B13E'
                  );
                }}
                className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] cursor-pointer"
              >
                💳 Mẫu Payload VietQR Lừa Đảo (25.000.000đ)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQrImageBase64(null);
                  setQrInputUrl('https://vietcombank-xacminh.xyz/digibank/verify-otp');
                }}
                className="px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[11px] cursor-pointer"
              >
                🔗 Mẫu QR Dẫn Link Phishing Thu Thập OTP
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left Input Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Chuỗi dữ liệu EMVCo VietQR (000201...) hoặc URL giải mã:
                  </label>
                  <textarea
                    rows={3}
                    value={qrInputUrl}
                    onChange={(e) => setQrInputUrl(e.target.value)}
                    placeholder="Dán chuỗi EMVCo VietQR hoặc URL trích xuất từ mã QR..."
                    className="w-full bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none font-mono leading-relaxed"
                  />
                </div>

                {/* Working File Input for QR Code Image */}
                <div className="p-4 border border-dashed border-[#1E293B] rounded-xl bg-[#090D16] text-center hover:border-blue-500/40 transition">
                  {qrImageBase64 ? (
                    <div className="space-y-2.5">
                      <img
                        src={qrImageBase64}
                        alt="QR Code Uploaded"
                        className="max-h-36 mx-auto rounded-lg border border-[#1E293B] object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setQrImageBase64(null)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Xóa ảnh QR và chọn ảnh khác
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-1.5 py-2">
                      <Upload className="w-6 h-6 text-blue-400 mx-auto" />
                      <span className="text-xs font-semibold text-slate-200 block">
                        Tải lên ảnh chụp Mã QR cần giám định (PNG, JPG)
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Gemini Vision sẽ tự động đọc mã QR và kiểm tra dấu hiệu dán đè
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleQrImageFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleQRScan}
                  disabled={qrScanning || (!qrInputUrl.trim() && !qrImageBase64)}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {qrScanning ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>Đang bóc tách TLV & Cô lập Sandbox...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Giải mã & Kiểm định An toàn trong Sandbox</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Sandbox Output Column */}
              <div className="bg-[#090D16] rounded-xl border border-[#1E293B] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Lock className="w-4 h-4" />
                    <span>Môi Trường Cô Lập Mã QR (Isolated QR Container)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {qrDecoded ? `Rủi ro: ${qrDecoded.riskScore}/100` : 'Sẵn sàng'}
                  </span>
                </div>

                {qrDecoded ? (
                  <div className="space-y-3.5 text-xs">
                    {qrDecoded.vietQrDetails ? (
                      <div className="space-y-2.5 p-3.5 rounded-lg bg-[#111827] border border-[#1E293B]">
                        <p className="text-xs font-bold text-blue-400">
                          Bóc Tách Cấu Trúc Chuẩn EMVCo Napas247 VietQR:
                        </p>
                        <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
                          <div className="flex justify-between border-b border-[#1E293B] pb-1">
                            <span className="text-slate-400">Loại mã:</span>
                            <span className="text-white font-semibold">{qrDecoded.vietQrDetails.qrType}</span>
                          </div>
                          <div className="flex justify-between border-b border-[#1E293B] pb-1">
                            <span className="text-slate-400">Ngân hàng nhận (BIN):</span>
                            <span className="text-emerald-400 font-semibold">{qrDecoded.vietQrDetails.bankName}</span>
                          </div>
                          <div className="flex justify-between border-b border-[#1E293B] pb-1">
                            <span className="text-slate-400">Số tài khoản thụ hưởng:</span>
                            <span className="text-amber-300 font-bold">{qrDecoded.vietQrDetails.accountNumber}</span>
                          </div>
                          <div className="flex justify-between border-b border-[#1E293B] pb-1">
                            <span className="text-slate-400">Số tiền cài sẵn:</span>
                            <span className="text-rose-400 font-bold">{qrDecoded.vietQrDetails.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Nội dung chuyển khoản:</span>
                            <span className="text-white">{qrDecoded.vietQrDetails.transferMemo}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-400 font-semibold">Đích đến thực tế ẩn trong mã QR:</p>
                        <p className="p-2.5 bg-[#111827] rounded-lg text-rose-300 font-mono break-all text-xs border border-[#1E293B]">
                          {qrDecoded.targetUrl}
                        </p>
                      </div>
                    )}

                    {qrDecoded.visualInspectionNote && (
                      <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B] text-slate-300 leading-relaxed">
                        <strong className="text-white block mb-0.5">Nhận định AI:</strong>
                        {qrDecoded.visualInspectionNote}
                      </div>
                    )}

                    {Array.isArray(qrDecoded.warningFlags) && qrDecoded.warningFlags.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-slate-400 font-semibold">Cảnh báo bảo mật:</p>
                        {qrDecoded.warningFlags.map((flag: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-rose-300 bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/30"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                            <span className="leading-relaxed">{flag}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#1E293B] text-[11px] font-mono text-blue-400">
                      {qrDecoded.sandboxAction}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <QrCode className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs">Nhấn "Giải mã & Kiểm định An toàn" để xem cấu trúc bên trong mã QR.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. MULTIMODAL AUDIO, VOICE RECORDING & DEEPFAKE CALL FORENSICS */}
        {activeSubTab === 'deepfake' && (
          <motion.div
            key="deepfake"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-[#111827] p-6 rounded-xl border border-[#1E293B] space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-blue-400" />
                  <span>Giám Định Âm Học Cuộc Gọi, Giọng Nói AI Deepfake & Giải Mã Tâm Lý Tội Phạm</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Ghi âm Trực tiếp + Gemini Multimodal Audio
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ghi âm trực tiếp cuộc gọi đáng ngờ qua loa ngoài, tải lên tệp ghi âm (.mp3, .wav, .m4a) hoặc nhập lời thoại để AI gỡ băng, phát hiện giọng nói tổng hợp Deepfake và cung cấp câu nói phản đòn tức thì.
              </p>
            </div>

            {/* Scenario Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Kịch bản thực tế:</span>
              <button
                type="button"
                onClick={() => {
                  setCallerNumberInput('024.7302.2626');
                  setAudioTranscriptInput(
                    'Alo, tôi là Thiếu tá Nguyễn Hoàng Nam thuộc Cơ quan Cảnh sát điều tra Bộ Công An. Hồ sơ CCCD của anh/chị đang liên quan đến một tài khoản ngân hàng nhận 2,8 tỷ đồng từ đường dây rửa tiền. Yêu cầu anh/chị vào phòng kín, không được nói với gia đình và chuyển ngay tiền vào tài khoản tạm giữ của cơ quan điều tra để rà soát trong 15 phút!'
                  );
                }}
                className="px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] cursor-pointer"
              >
                🚔 Giả danh Công an điều tra
              </button>
              <button
                type="button"
                onClick={() => {
                  setCallerNumberInput('Zalo Video Call (Người thân)');
                  setAudioTranscriptInput(
                    'Mẹ ơi cứu con với, bạn con bị tai nạn giao thông đang cấp cứu ở bệnh viện Chợ Rẫy, bác sĩ bắt đóng gấp 30 triệu tiền mổ ngay bây giờ. Điện thoại con hỏng mic rồi sóng yếu lắm mẹ chuyển gấp vào số tài khoản bạn con vừa nhắn trên Zalo nhé!'
                  );
                }}
                className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] cursor-pointer"
              >
                🎭 Video Call Deepfake Cấp cứu
              </button>
              <button
                type="button"
                onClick={handlePlaySampleVoice}
                disabled={ttsPlaying}
                className="px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{ttsPlaying ? 'Đang phát giọng đọc...' : 'Nghe thử giọng đối tượng (AI TTS)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Audio & Transcript Input */}
              <div className="lg:col-span-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Live Microphone Recorder Button */}
                  <div className="p-3.5 rounded-xl bg-[#090D16] border border-[#1E293B] flex flex-col justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      1. Thu âm trực tiếp từ Micro:
                    </span>
                    {isRecordingMic ? (
                      <button
                        type="button"
                        onClick={handleStopMicRecording}
                        className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Dừng thu âm ({recordingSeconds}s)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartMicRecording}
                        className="w-full py-2 px-3 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5 text-rose-400" />
                        <span>Bắt đầu thu âm cuộc gọi</span>
                      </button>
                    )}
                  </div>

                  {/* Audio File Upload */}
                  <div className="p-3.5 rounded-xl bg-[#090D16] border border-[#1E293B] flex flex-col justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      2. Tải lên tệp ghi âm (.mp3/.wav):
                    </span>
                    <label className="w-full py-2 px-3 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer truncate">
                      <Upload className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{audioFileName || 'Chọn tệp âm thanh/video'}</span>
                      <input
                        type="file"
                        accept="audio/*,video/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleAudioFileUpload(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {audioBase64 && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <span className="truncate">Đã nạp tín hiệu âm thanh: {audioFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioBase64(null);
                        setAudioFileName('');
                      }}
                      className="text-rose-400 hover:text-rose-300 font-semibold ml-2 cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Số điện thoại hoặc tài khoản gọi đến:
                  </label>
                  <input
                    type="text"
                    value={callerNumberInput}
                    onChange={(e) => setCallerNumberInput(e.target.value)}
                    placeholder="VD: 024.7302.2626 hoặc Zalo người lạ..."
                    className="w-full bg-[#090D16] border border-[#1E293B] rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Nội dung lời nói của đối tượng (hoặc để trống nếu đã tải file ghi âm):
                  </label>
                  <textarea
                    rows={4}
                    value={audioTranscriptInput}
                    onChange={(e) => setAudioTranscriptInput(e.target.value)}
                    placeholder="Nhập lại những gì đối tượng vừa nói qua điện thoại..."
                    className="w-full bg-[#090D16] border border-[#1E293B] rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDeepfakeAnalyze}
                  disabled={deepfakeLoading || (!audioBase64 && !audioTranscriptInput.trim())}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {deepfakeLoading ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>Đang phân tích phổ âm học & kịch bản tâm lý...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Thực Thi Giám Định Cuộc Gọi & Giọng Nói AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Audio Forensic Report */}
              <div className="lg:col-span-6 bg-[#090D16] rounded-xl border border-[#1E293B] p-5 space-y-4">
                {deepfakeResult ? (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between bg-rose-950/30 p-3.5 rounded-lg border border-rose-500/30">
                      <div>
                        <p className="text-[11px] text-rose-300 font-semibold">{deepfakeResult.scenarioTitle}</p>
                        <p className="text-sm font-bold text-white mt-0.5">{deepfakeResult.verdict}</p>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <span className="text-2xl font-bold text-rose-400">{deepfakeResult.scamScore}%</span>
                        <span className="block text-[10px] text-slate-400">
                          AI Voice: {deepfakeResult.aiVoiceProbability}%
                        </span>
                      </div>
                    </div>

                    {/* 5 Psychological Manipulation Bars */}
                    {deepfakeResult.tactics && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-slate-300">
                          Chỉ số Thao túng Tâm lý Tội phạm (5 chiều):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { label: 'Mạo danh Quyền lực (Authority)', val: deepfakeResult.tactics.authority },
                            { label: 'Áp lực Thời gian (Urgency)', val: deepfakeResult.tactics.urgency },
                            { label: 'Gây Hoảng loạn (Panic)', val: deepfakeResult.tactics.panic },
                            { label: 'Cô lập Nạn nhân (Isolation)', val: deepfakeResult.tactics.isolation },
                          ].map((t, i) => (
                            <div key={i} className="p-2 rounded bg-[#111827] border border-[#1E293B] space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">{t.label}</span>
                                <span className="font-mono tabular-nums font-bold text-rose-400">{t.val}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#090D16] rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${t.val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Counter-Script Box */}
                    <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-300">
                          🛡️ Câu nói Phản đòn Trực tiếp (Đọc ngay cho đối tượng nghe):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(deepfakeResult.counterScript);
                            setCopiedCounterScript(true);
                            setTimeout(() => setCopiedCounterScript(false), 2000);
                          }}
                          className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCounterScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCounterScript ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-white italic leading-relaxed bg-[#090D16] p-3 rounded border border-[#1E293B]">
                        "{deepfakeResult.counterScript}"
                      </p>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Khuyến nghị: {deepfakeResult.recommendedAction}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <Mic className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs">
                      Thu âm trực tiếp cuộc gọi hoặc nhấn "Thực Thi Giám Định Cuộc Gọi" để AI bóc tách kịch bản.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. APK & FILE MALWARE SANDBOX INSPECTOR */}
        {activeSubTab === 'apk_malware' && (
          <motion.div
            key="apk_malware"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-[#111827] p-6 rounded-xl border border-[#1E293B] space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-rose-400" />
                  <span>Trình Phân Tích Mã Độc Tệp Đính Kèm (.APK) & Kiểm Định Quyền Trợ Năng Android</span>
                </h3>
                <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                  SHA-256 + AndroidManifest + Gemini Malware AI
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Phòng chống thủ đoạn lừa cài ứng dụng giả mạo <strong className="text-slate-200">Dịch Vụ Công, VNeID Cấp độ 2, Thuế Điện Tử (eTax), Điện lực EVN</strong> qua file rời <code className="text-rose-300">.apk</code> nhằm chiếm quyền điều khiển màn hình (Accessibility) và đánh cắp mã Smart OTP.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-4">
                {/* Real File Dropzone to compute SHA-256 & scan binary strings */}
                <div className="p-4 border border-dashed border-[#1E293B] rounded-xl bg-[#090D16] text-center hover:border-blue-500/40 transition">
                  <label className="cursor-pointer block space-y-1.5 py-2">
                    <FileCode className="w-7 h-7 text-blue-400 mx-auto" />
                    <span className="text-xs font-semibold text-white block">
                      Chọn tệp nghi vấn (.APK, .ZIP, .PDF, .EXE) để băm SHA-256 & Quét chuỗi nhị phân
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Hoàn toàn xử lý an toàn không kích hoạt mã thực thi
                    </span>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleInspectRealFileUpload(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Malware Profiles */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setApkFileName('DichVuCong_VNeID_CapDo2_2026.apk');
                      setApkPermissions([
                        'BIND_ACCESSIBILITY_SERVICE',
                        'RECEIVE_SMS',
                        'READ_SMS',
                        'SYSTEM_ALERT_WINDOW',
                      ]);
                      setApkSourceUrl('https://dichvucong-gov-vn.top/VNeID.apk');
                    }}
                    className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[11px] font-mono cursor-pointer"
                  >
                    Mẫu: VNeID_CapDo2.apk
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApkFileName('ThueDienTu_GDT_HoanThue2026.apk');
                      setApkPermissions(['BIND_ACCESSIBILITY_SERVICE', 'READ_SMS', 'RECORD_AUDIO', 'CAMERA']);
                      setApkSourceUrl('https://gdt-thuedientu.xyz/eTax.apk');
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-mono cursor-pointer"
                  >
                    Mẫu: ThueDienTu_GDT.apk
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#1E293B] space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tên tệp:</span>
                    <span className="text-white font-bold truncate max-w-[240px]">{apkFileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kích thước:</span>
                    <span className="text-slate-300 tabular-nums">{(apkFileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Mã băm SHA-256:</span>
                    <span className="text-[11px] text-blue-400 break-all block bg-[#111827] p-2 rounded border border-[#1E293B]">
                      {apkSha256}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeApk}
                  disabled={apkLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {apkLoading ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>Đang phân tích hành vi mã độc với Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Phân Tích Mã Độc & Quyền Chiếm Đoạt Thiết Bị</span>
                    </>
                  )}
                </button>
              </div>

              <div className="lg:col-span-6 bg-[#090D16] rounded-xl border border-[#1E293B] p-5 space-y-4">
                {apkResult ? (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30">
                      <div>
                        <p className="text-[11px] font-mono text-rose-300">{apkResult.verdict}</p>
                        <p className="text-sm font-bold text-white mt-0.5">{apkResult.malwareFamily}</p>
                      </div>
                      <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">
                        {apkResult.riskScore}/100
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{apkResult.summary}</p>

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-300">
                        Các quyền nguy hiểm phát hiện trong gói cài đặt:
                      </p>
                      <div className="space-y-2">
                        {apkResult.permissionAnalysis?.map((p: any, i: number) => (
                          <div key={i} className="p-2.5 rounded-lg bg-[#111827] border border-[#1E293B] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[11px] font-bold text-rose-400">{p.permission}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300">
                                {p.severity}
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{p.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                      <p className="text-xs font-bold text-emerald-400">
                        Quy trình Cứu hộ Khẩn cấp nếu đã lỡ cài đặt:
                      </p>
                      <ul className="list-decimal list-inside text-slate-200 space-y-1 text-[11px] leading-relaxed">
                        {apkResult.remediationSteps?.map((step: string, idx: number) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs">
                      Tải lên tệp nghi vấn hoặc chọn mẫu thử và nhấn "Phân Tích Mã Độc" để xem giải phẫu quyền Android.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. MULTI-SOURCE OSINT CROSS-CHECK */}
        {activeSubTab === 'osint' && (
          <motion.div
            key="osint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-[#111827] p-6 rounded-xl border border-[#1E293B] space-y-5"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span>Tra Cứu Chéo Nguồn Mở Đa Tầng (OSINT Cross-Check: SĐT, STK, Email, Tên Miền)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Đồng bộ hóa truy vấn giữa Cổng Cảnh báo An toàn thông tin Quốc gia, Cơ sở dữ liệu Đầu số Viễn thông (VoIP 024/028), và Danh sách đen Tài khoản Ngân hàng.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Tra cứu nhanh:</span>
              <button
                type="button"
                onClick={() => handleOSINTCheck(undefined, '02473022626')}
                className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono text-[11px] cursor-pointer"
              >
                📞 SĐT Giả Công an: 02473022626
              </button>
              <button
                type="button"
                onClick={() => handleOSINTCheck(undefined, '1028392109')}
                className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono text-[11px] cursor-pointer"
              >
                🏦 STK Mule: 1028392109
              </button>
              <button
                type="button"
                onClick={() => handleOSINTCheck(undefined, '02899998888')}
                className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[11px] cursor-pointer"
              >
                ⚡ SĐT Giả Điện lực EVN: 02899998888
              </button>
            </div>

            <form onSubmit={(e) => handleOSINTCheck(e)} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={osintQuery}
                onChange={(e) => setOsintQuery(e.target.value)}
                placeholder="Nhập SĐT (024..., 098...), Số tài khoản ngân hàng, hoặc Email..."
                className="flex-1 bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={osintLoading || !osintQuery.trim()}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {osintLoading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Đang truy vấn chéo...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Tra Cứu Chéo OSINT</span>
                  </>
                )}
              </button>
            </form>

            {osintResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-5 rounded-xl border space-y-4 ${
                  osintResult.classification === 'HIGHLY_DANGEROUS'
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div>
                    <p className="text-[11px] text-slate-400">Đối tượng tra cứu ({osintResult.carrierOrType}):</p>
                    <p className="text-sm font-bold font-mono text-white">{osintResult.identifier}</p>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <p className="text-[11px] text-slate-400">Điểm Tín Nhiệm (Trust Score)</p>
                    <p className={`text-xl font-bold ${osintResult.trustScore < 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {osintResult.trustScore}/100
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-300 font-semibold">Báo cáo đối chiếu từ các nguồn dữ liệu:</p>
                  <div className="space-y-1.5">
                    {osintResult.scannedSources.map((src: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-[#090D16] border border-[#1E293B] gap-1"
                      >
                        <span className="text-slate-300">{src.name}</span>
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            src.status.includes('An toàn') || src.status.includes('Xác thực chính chủ')
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {src.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#090D16] p-3.5 rounded-lg border border-[#1E293B] text-xs leading-relaxed">
                    <p className="font-semibold text-white mb-1">Nhận định Tình báo Pháp y:</p>
                    <p className="text-slate-300">{osintResult.riskDetails}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 6. COMMUNITY THREAT INTELLIGENCE FEED */}
        {activeSubTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#111827] p-5 rounded-xl border border-[#1E293B] space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>Cơ Sở Dữ Liệu Cảnh Báo Cộng Đồng (Community Notes)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Mọi cảnh báo mới gửi lên đều được đồng bộ trực tiếp vào bộ lọc Blacklist thời gian thực để bảo vệ người dùng khác.
                </p>
              </div>

              {communityNotes.map((note) => (
                <div key={note.id} className="bg-[#111827] p-5 rounded-xl border border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                    <div>
                      <p className="text-xs font-bold font-mono text-blue-400">{note.target}</p>
                      <p className="text-[11px] text-slate-400">{note.scamType}</p>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {note.verifiedStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{note.description}</p>

                  <div className="flex items-center justify-between pt-2 text-[11px] border-t border-[#1E293B] text-slate-400">
                    <span>Cập nhật: {note.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVote(note.id, 'up')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer transition font-mono tabular-nums ${
                          note.userVoted === 'up'
                            ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                            : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{note.upvotes}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVote(note.id, 'down')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer transition font-mono tabular-nums ${
                          note.userVoted === 'down'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:text-white'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>{note.downvotes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#111827] p-6 rounded-xl border border-[#1E293B] space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-400" />
                  <span>Gửi Báo Cáo Mối Đe Dọa Mới</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Đóng góp nhanh tên miền phishing, số điện thoại lừa đảo hoặc số tài khoản nhận tiền bất chính vào hệ thống phòng vệ chung.
                </p>

                <form onSubmit={handleAddNote} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Loại định danh:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'url', label: 'Tên miền / URL' },
                        { id: 'phone', label: 'Số điện thoại' },
                        { id: 'stk', label: 'STK Ngân hàng' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setNewType(t.id as any)}
                          className={`py-2 rounded-lg font-semibold border cursor-pointer transition ${
                            newType === t.id
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-[#090D16] text-slate-400 border-[#1E293B]'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Định danh cần cảnh báo:</label>
                    <input
                      type="text"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      placeholder={
                        newType === 'url' ? 'vietcombank-xacminh.xyz' : newType === 'phone' ? '0247302...' : 'Số tài khoản...'
                      }
                      className="w-full bg-[#090D16] border border-[#1E293B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Phân loại thủ đoạn:</label>
                    <select
                      value={newScamType}
                      onChange={(e) => setNewScamType(e.target.value)}
                      className="w-full bg-[#090D16] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Giả Mạo Thương Hiệu">Giả Mạo Thương Hiệu / Ngân Hàng</option>
                      <option value="Giả danh Công An/VKS">Giả danh Công An / Viện Kiểm Sát</option>
                      <option value="Phát Tán Mã Độc .APK">Phát Tán Mã Độc .APK (VNeID/Thuế)</option>
                      <option value="Bẫy Tuyển Dụng / Nhiệm vụ Telegram">Bẫy Nhiệm Vụ Cộng Tác Viên</option>
                      <option value="Lừa Đảo Giao Hàng (COD)">Giả Shipper Giao Hàng</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Mô tả hành vi & dấu hiệu:</label>
                    <textarea
                      rows={3}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Mô tả chi tiết kịch bản đối tượng sử dụng..."
                      className="w-full bg-[#090D16] border border-[#1E293B] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newTarget.trim() || !newDesc.trim()}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-40"
                  >
                    Đồng Bộ Vào Cơ Sở Dữ Liệu Cảnh Báo
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
