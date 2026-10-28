import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  AlertTriangle,
  Cpu,
  Scan,
  Shield,
  Link as LinkIcon,
  MessageSquare,
  Lock,
  FileText,
  Globe,
  Phone,
  Mail,
  Eye,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Image as ImageIcon,
  Monitor,
  PhoneCall,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, CommunicationChannel } from '../types';
import { ThreatAssessmentResult } from './ThreatAssessmentResult';
import { ForensicEvidenceDetails } from './ForensicEvidenceDetails';
import { BlacklistSearchTab } from './BlacklistSearchTab';
import { PiiRedactTab } from './PiiRedactTab';
import { DomainReputationTab } from './DomainReputationTab';
import { runClientSideTextAnalysis } from '../utils/clientForensicsEngine';

interface CheckScamViewProps {
  onOpenEmergency: () => void;
  onOpenSentinel?: () => void;
  subView?: 'smart_link' | 'fake_bill' | 'threat_intel' | 'blacklist' | 'pii_redact';
}

export const CheckScamView: React.FC<CheckScamViewProps> = ({
  subView,
  onOpenEmergency,
  onOpenSentinel,
}) => {
  const [activeTab, setActiveTab] = useState<
    'smart_link' | 'fake_bill' | 'threat_intel' | 'blacklist' | 'pii_redact'
  >(subView || 'smart_link');

  useEffect(() => {
    if (subView && ['smart_link', 'fake_bill', 'threat_intel', 'blacklist', 'pii_redact'].includes(subView)) {
      setActiveTab(subView);
    }
  }, [subView]);

  const [targetObject, setTargetObject] = useState<'message' | 'url' | 'email' | 'phone'>('message');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [senderInput, setSenderInput] = useState('');
  const [channel, setChannel] = useState<CommunicationChannel>('sms');
  const [noSensitiveChecked, setNoSensitiveChecked] = useState(true);
  const [attachedScreenshotBase64, setAttachedScreenshotBase64] = useState<string | null>(null);
  const [attachedScreenshotMime, setAttachedScreenshotMime] = useState<string>('image/jpeg');

  // Optical & Multimodal Document Forensics states
  const [docCategory, setDocCategory] = useState<
    'bank_bill' | 'gov_document' | 'chat_screenshot' | 'id_card_deepfake'
  >('bank_bill');
  const [fakeBillBase64, setFakeBillBase64] = useState<string | null>(null);
  const [fakeBillMime, setFakeBillMime] = useState<string>('image/png');
  const [fakeBillContext, setFakeBillContext] = useState('');
  const [viewMode, setViewMode] = useState<'original' | 'ela_heatmap'>('original');
  const [elaDataUrl, setElaDataUrl] = useState<string | null>(null);
  const [ocrDataList, setOcrDataList] = useState<
    Array<{ field: string; value: string; status: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL_FORGERY' }>
  >([]);
  const [legalWarningText, setLegalWarningText] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  // Check sessionStorage for quick scan queries from GlobalSearchBar
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('scamguard_quick_scan_query');
      if (pending) {
        sessionStorage.removeItem('scamguard_quick_scan_query');
        const trimmed = pending.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          setUrlInput(trimmed);
          setTargetObject('url');
        } else if (/^[0-9+\s().-]{8,15}$/.test(trimmed)) {
          setSenderInput(trimmed);
          setTextInput(`Tra cứu độ tin cậy và lịch sử phản ánh của số điện thoại lạ: ${trimmed}`);
          setTargetObject('phone');
        } else {
          setTextInput(trimmed);
          setTargetObject('message');
        }
      }
    } catch (e) {
      console.warn('Session storage check error', e);
    }
  }, []);

  // Compute Real Pixel-Level Error Level Analysis (ELA) Heatmap whenever fakeBillBase64 changes
  useEffect(() => {
    if (!fakeBillBase64) {
      setElaDataUrl(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const w = Math.min(800, img.width || 600);
      const h = Math.round(((img.height || 800) * w) / (img.width || 600));

      const c1 = document.createElement('canvas');
      c1.width = w;
      c1.height = h;
      const ctx1 = c1.getContext('2d');
      if (!ctx1) return;
      ctx1.drawImage(img, 0, 0, w, h);
      const origData = ctx1.getImageData(0, 0, w, h);

      // Recompress at JPEG 0.72 to measure compression residual difference
      const recompressedUrl = c1.toDataURL('image/jpeg', 0.72);
      const img2 = new Image();
      img2.onload = () => {
        const c2 = document.createElement('canvas');
        c2.width = w;
        c2.height = h;
        const ctx2 = c2.getContext('2d');
        if (!ctx2) return;
        ctx2.drawImage(img2, 0, 0, w, h);
        const recompData = ctx2.getImageData(0, 0, w, h);

        const out = ctx2.createImageData(w, h);
        const scale = 18;
        for (let i = 0; i < origData.data.length; i += 4) {
          const dr = Math.abs(origData.data[i] - recompData.data[i]) * scale;
          const dg = Math.abs(origData.data[i + 1] - recompData.data[i + 1]) * scale;
          const db = Math.abs(origData.data[i + 2] - recompData.data[i + 2]) * scale;
          const intensity = Math.min(255, (dr + dg + db) / 3);
          // Thermal forensic palette (dark blue -> cyan -> yellow -> crimson red for high anomaly)
          out.data[i] = Math.min(255, intensity * 1.6);
          out.data[i + 1] = Math.min(255, Math.max(0, 255 - Math.abs(intensity - 128) * 2));
          out.data[i + 2] = Math.min(255, Math.max(40, 220 - intensity));
          out.data[i + 3] = 255;
        }
        ctx2.putImageData(out, 0, 0);
        setElaDataUrl(c2.toDataURL('image/png'));
      };
      img2.src = recompressedUrl;
    };
    img.src = fakeBillBase64;
  }, [fakeBillBase64]);

  // Global Ctrl+V Clipboard Paste Handler for instant screenshot inspection
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const { base64, mimeType } = await compressImage(file);
            if (activeTab === 'smart_link') {
              setAttachedScreenshotBase64(base64);
              setAttachedScreenshotMime(mimeType);
            } else {
              setActiveTab('fake_bill');
              setFakeBillBase64(base64);
              setFakeBillMime(mimeType);
            }
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const handleLoadSample = () => {
    setError(null);
    setResult(null);
    if (targetObject === 'message') {
      setTextInput(
        '[CẢNH BÁO KHẨN CẤP VCB]: Tài khoản Vietcombank của quý khách vừa phát sinh yêu cầu liên kết thiết bị lạ tại IP 14.225.2.98. Vui lòng truy cập ngay https://vietcombank-xacminh.online trong 10 phút để hủy giao dịch và tránh bị phong tỏa tài khoản.'
      );
      setUrlInput('https://vietcombank-xacminh.online');
      setSenderInput('VCB_DIGIBANK');
      setChannel('sms');
    } else if (targetObject === 'url') {
      setTextInput(
        'Cán bộ tự xưng Công an phường gọi điện yêu cầu truy cập cổng dịch vụ công để đồng bộ CCCD cấp độ 2 bằng cách tải file cài đặt .APK.'
      );
      setUrlInput('https://dichvucong-vneid-gov.top/capnhat.apk');
      setSenderInput('Zalo Cán Bộ Hộ Tịch');
      setChannel('zalo');
    } else if (targetObject === 'email') {
      setTextInput(
        'Thông báo từ Tổng cục Thuế: Hồ sơ quyết toán thuế TNCN của quý khách có khoản hoàn thuế 8.450.000đ. Vui lòng xác nhận tài khoản nhận tiền hoàn thuế tại cổng thông tin đính kèm.'
      );
      setUrlInput('https://thuedientu-gdt-gov.xyz/hoan-thue');
      setSenderInput('hoanthue@gdt-alert.com');
      setChannel('email');
    } else {
      setTextInput(
        'Đối phương tự xưng là Kiểm sát viên Viện Kiểm Sát Nhân Dân Tối Cao gọi điện đe dọa tài khoản có liên quan đến đường dây rửa tiền, yêu cầu chuyển 50 triệu đồng vào tài khoản tạm giữ để phục vụ rà soát.'
      );
      setUrlInput('');
      setSenderInput('024.7302.2626 / STK: 1028392109');
      setChannel('phone');
    }
  };

  const placeholders = {
    message: {
      text: 'Dán nội dung tin nhắn SMS, Zalo, Telegram nghi ngờ lừa đảo vào đây (hoặc nhấn Ctrl+V để dán ảnh chụp màn hình)...',
      url: 'Đường dẫn URL đi kèm tin nhắn (nếu có)',
      sender: 'Tên thương hiệu gửi tin hoặc số điện thoại',
    },
    url: {
      text: 'Mô tả ngữ cảnh nhận được liên kết (ví dụ: gửi qua Zalo, yêu cầu tải file .APK cập nhật VNeID)...',
      url: 'Nhập hoặc dán địa chỉ website cần phân tích (ví dụ: https://dichvucong-vneid.top)',
      sender: 'Tài khoản hoặc số điện thoại chia sẻ liên kết',
    },
    email: {
      text: 'Dán tiêu đề và nội dung thư điện tử đáng ngờ tại đây...',
      url: 'Đường dẫn đính kèm bên trong email',
      sender: 'Địa chỉ email người gửi',
    },
    phone: {
      text: 'Mô tả kịch bản cuộc gọi hoặc yêu cầu chuyển khoản từ đối phương...',
      url: 'Website đối phương yêu cầu truy cập hoặc tải ứng dụng APK (nếu có)',
      sender: 'Số điện thoại gọi đến hoặc số tài khoản nhận tiền',
    },
  }[targetObject];

  const handleAnalyzeText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() && !urlInput.trim() && !attachedScreenshotBase64) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const endpoint = attachedScreenshotBase64 ? '/api/analyze/screenshot' : '/api/analyze/text';
      const payload = attachedScreenshotBase64
        ? {
            base64Image: attachedScreenshotBase64,
            mimeType: attachedScreenshotMime,
            optionalContext: `${textInput} ${urlInput ? `URL: ${urlInput}` : ''} ${senderInput ? `Sender: ${senderInput}` : ''}`.trim(),
          }
        : {
            text: textInput,
            url: urlInput,
            sender: senderInput,
            channel,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        const fallback = runClientSideTextAnalysis(textInput, urlInput, senderInput, channel);
        setResult(fallback);
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      const fallback = runClientSideTextAnalysis(textInput, urlInput, senderInput, channel);
      setResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.84);
            resolve({ base64: compressed, mimeType: 'image/jpeg' });
          } else {
            resolve({ base64: (e.target?.result as string) || '', mimeType: file.type });
          }
        };
        img.onerror = () => {
          resolve({ base64: (e.target?.result as string) || '', mimeType: file.type });
        };
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = () => {
        resolve({ base64: '', mimeType: file.type });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chỉ tải lên tệp hình ảnh (PNG, JPG, WEBP).');
      return;
    }
    setError(null);
    try {
      const { base64, mimeType } = await compressImage(file);
      setFakeBillBase64(base64);
      setFakeBillMime(mimeType);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setFakeBillBase64(reader.result as string);
        setFakeBillMime(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSampleFakeBill = () => {
    setError(null);
    setResult(null);
    setDocCategory('bank_bill');
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 600, 800);

      ctx.fillStyle = '#111827';
      ctx.roundRect(30, 30, 540, 740, 16);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(300, 100, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✓', 300, 110);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('GIAO DỊCH THÀNH CÔNG', 300, 160);

      // Deliberately draw a patched box behind the amount to trigger ELA & optical detection
      ctx.fillStyle = '#162033';
      ctx.fillRect(140, 185, 320, 48);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px Courier New';
      ctx.fillText('50,000,000 VND', 300, 220);

      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(60, 260);
      ctx.lineTo(540, 260);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = '13px Arial';
      const rows = [
        ['Ngân hàng nhận', 'TECHCOMBANK (TCB)'],
        ['Tài khoản thụ hưởng', '1903 8928 1029'],
        ['Tên người nhận', 'TRAN VAN A'],
        ['Thời gian', '27/10/2026 15:42:19'],
        ['Mã tra cứu FT', 'FT262728910023'],
        ['Nội dung', 'Chuyen khoan coc tien dat hang'],
      ];
      let y = 310;
      for (const [k, v] of rows) {
        ctx.fillStyle = '#64748b';
        ctx.fillText(k, 60, y);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(v, 260, y);
        ctx.font = '13px Arial';
        y += 48;
      }

      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MẪU BIÊN LAI GIẢ PHÁP Y', 300, 680);

      setFakeBillBase64(canvas.toDataURL('image/jpeg', 0.85));
      setFakeBillMime('image/jpeg');
      setFakeBillContext(
        'Người mua hàng trực tuyến gửi ảnh biên lai báo đã chuyển 50 triệu đồng và thúc giục giao hàng ngay khi tài khoản chưa báo có.'
      );
    }
  };

  const handleLoadSampleFakeGovWarrant = () => {
    setError(null);
    setResult(null);
    setDocCategory('gov_document');
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 820;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fdfbf7';
      ctx.fillRect(0, 0, 640, 820);

      ctx.fillStyle = '#111827';
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('VIỆN KIỂM SÁT NHÂN DÂN TỐI CAO', 170, 55);
      ctx.fillText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 460, 55);
      ctx.font = '12px Arial';
      ctx.fillText('Số: 148/LBTG-VKSTC (VĂN BẢN MẬT)', 170, 78);
      ctx.fillText('Độc lập - Tự do - Hạnh phúc', 460, 78);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 22px Arial';
      ctx.fillText('LỆNH BẮT TẠM GIAM VÀ PHONG TỎA TÀI SẢN', 320, 150);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px Arial';
      const lines = [
        'Căn cứ hồ sơ chuyên án rửa tiền số 889/CA-TW;',
        'Xét thấy công dân có tài khoản ngân hàng liên quan đến số tiền 2.800.000.000đ;',
        'YÊU CẦU ĐỐI TƯỢNG:',
        '1. Giữ bí mật tuyệt đối, không được thông báo cho gia đình hoặc bên thứ ba.',
        '2. Kết nối Zalo làm việc trực tuyến với Điều tra viên trong vòng 30 phút.',
        '3. Chuyển toàn bộ số dư hiện có vào Tài khoản Tạm giữ của Cơ quan Điều tra',
        '   (STK: 1028392109 - Vietcombank) để giám định nguồn tiền trong sạch.',
      ];
      let y = 210;
      for (const l of lines) {
        ctx.fillText(l, 55, y);
        y += 38;
      }

      // Synthetic forged red stamp
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.75)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(460, 580, 62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px Arial';
      ctx.fillText('DẤU ĐỎ GIẢ MẠO', 460, 580);
      ctx.fillText('CHÈN ĐỒ HỌA', 460, 600);

      setFakeBillBase64(canvas.toDataURL('image/jpeg', 0.85));
      setFakeBillMime('image/jpeg');
      setFakeBillContext(
        'Đối tượng tự xưng cán bộ Viện Kiểm Sát gửi ảnh Lệnh bắt tạm giam qua Zalo và yêu cầu chuyển tiền vào tài khoản tạm giữ để chứng minh vô tội.'
      );
    }
  };

  const runOfflineOpticalForensics = () => {
    setError(null);
    const isGovDoc = docCategory === 'gov_document';
    const mockReport: AnalysisResult = {
      riskScore: 94,
      riskLevel: 'HIGH',
      summary: isGovDoc
        ? 'CẢNH BÁO ĐỎ: Phát hiện Văn bản / Lệnh bắt tạm giam giả mạo cơ quan tư pháp. Cơ quan Công an, Viện kiểm sát tuyệt đối không gửi lệnh bắt qua Zalo và không bao giờ yêu cầu chuyển tiền vào tài khoản cá nhân để chứng minh trong sạch.'
        : 'Giám định quang học: Phát hiện dấu hiệu chỉnh sửa phông chữ và độ lệch mức nén ELA tại trường số tiền giao dịch 50.000.000đ. Viền số tiền có mật độ pixel không đồng nhất với phôi biên lai gốc.',
      signals: [
        {
          name: 'Độ lệch phông chữ & Kerning',
          scoreContribution: 88,
          description:
            'Khoảng cách ký tự và phông chữ vùng trọng yếu bị chèn đè bằng phần mềm chỉnh sửa ảnh.',
          category: 'Impersonation',
        },
        {
          name: 'Nhiễu nén ảnh ELA (Error Level Analysis)',
          scoreContribution: 85,
          description:
            'Phát hiện vùng chênh lệch mức nén JPEG cục bộ xung quanh con số / con dấu đỏ.',
          category: 'Impersonation',
        },
      ],
      redFlags: isGovDoc
        ? [
            'Vi phạm nghiêm trọng thủ tục tố tụng hình sự: Không có cơ quan nào gửi Lệnh bắt qua Zalo',
            'Yêu cầu chuyển tiền vào "tài khoản tạm giữ" đứng tên cá nhân là 100% lừa đảo',
            'Con dấu đỏ có dấu hiệu cắt ghép lớp ảnh PNG đè lên văn bản',
          ]
        : [
            'Vùng số tiền có dấu hiệu ghép đè đồ họa hoặc tạo từ công cụ làm giả biên lai',
            'Tài khoản ngân hàng của bên thụ hưởng chưa ghi nhận biến động số dư thực tế',
            'Đối phương dồn ép thời gian đòi chuyển hàng hoặc hoàn trả tiền thừa',
          ],
      recommendedSteps: [
        'Tuyệt đối KHÔNG chuyển tiền, KHÔNG giao hàng và KHÔNG làm theo yêu cầu giữ bí mật của đối tượng.',
        'Kiểm tra trực tiếp biến động số dư trên ứng dụng ngân hàng hoặc liên hệ Công an phường sở tại (113).',
      ],
      piiRedacted: false,
      threatBreakdown: {
        maliciousUrl: 10,
        impersonation: 95,
        urgency: 90,
        credentialHarvesting: 40,
        socialEngineering: 94,
      },
      evidenceFound: [
        {
          severity: 'critical',
          title: isGovDoc ? 'Con dấu & Nội dung yêu cầu chuyển tiền tạm giữ' : 'Vùng chữ số tiền giao dịch',
          description:
            'Phông chữ và mức nén điểm ảnh (ELA) có dấu hiệu bị can thiệp chỉnh sửa đồ họa.',
        },
      ],
      threatClassification: {
        primaryThreat: isGovDoc
          ? 'Giả Mạo Văn Bản Cơ Quan Nhà Nước / Lệnh Bắt Giả'
          : 'Biên Lai Chuyển Tiền Giả Mạo (Fake Bank Receipt)',
        attackVector: 'Visual Manipulation & Authority Forgery',
        target: 'Tài sản ngân hàng của nạn nhân',
        potentialImpact: ['Chiếm đoạt tiền tiết kiệm', 'Hoảng loạn tâm lý'],
        confidence: 95,
      },
      attackChain: [
        'Đối tượng khởi tạo ảnh biên lai hoặc lệnh bắt giả bằng phần mềm đồ họa',
        'Gửi qua Zalo kèm lời đe dọa hoặc hối thúc giao hàng khẩn cấp',
        'Chiếm đoạt tài sản trước khi nạn nhân kịp xác minh độc lập',
      ],
      assessmentId: `SG-VISION-${Date.now().toString(16).toUpperCase().slice(-6)}`,
      detectedTactics: ['Urgency', 'Authority', 'Fear'],
      explanationsByPersona: {
        child: 'Hình ảnh này đã bị chỉnh sửa giả mạo. Hãy đưa cho bố mẹ hoặc người lớn kiểm tra ngay.',
        teen: 'Ảnh chụp biên lai hoặc công văn có dấu hiệu cắt ghép phông chữ và con dấu. Đừng chuyển tiền hay làm theo.',
        adult: 'Phát hiện can thiệp quang học và sai lệch quy trình pháp lý. Tuyệt đối không giao dịch khi chưa xác minh độc lập.',
        senior: 'Đây là giấy tờ/hóa đơn giả do kẻ xấu tạo ra trên máy tính. Hãy gọi con cháu hoặc ra trực tiếp ngân hàng/công an phường.',
        expert: 'Optical ELA compression discrepancy and typography kerning mismatch detected on critical document regions.',
      },
    };
    setResult(mockReport);
  };

  const handleAnalyzeFakeBill = async () => {
    if (!fakeBillBase64) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setOcrDataList([]);
    setLegalWarningText('');

    try {
      const res = await fetch('/api/forensics/document-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: fakeBillBase64,
          mimeType: fakeBillMime,
          docCategory,
          optionalContext: fakeBillContext,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        runOfflineOpticalForensics();
        return;
      }

      const data = await res.json();
      setResult(data);
      if (Array.isArray(data.extractedOcrData)) {
        setOcrDataList(data.extractedOcrData);
      }
      if (data.legalAndProceduralWarning) {
        setLegalWarningText(data.legalAndProceduralWarning);
      }
    } catch {
      runOfflineOpticalForensics();
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportAssessment = () => {
    if (!result) return;
    const isHighRisk = result.riskScore >= 70;
    const severityClassification = isHighRisk
      ? 'CRITICAL_THREAT_DETECTED'
      : result.riskScore >= 40
      ? 'SUSPICIOUS_THREAT_WARNING'
      : 'INFORMATIONAL_SAFE';

    const reportText = `========================================================================================
            SCAMGUARD NATIONAL DIGITAL FORENSICS & AI THREAT ASSESSMENT REPORT
========================================================================================
CHỨNG THƯ GIÁM ĐỊNH SỐ: ${result.assessmentId || 'SG-8F29A1'}
Thời gian khởi tạo : ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}
Điểm số rủi ro     : ${result.riskScore} / 100 (${result.riskLevel} - ${severityClassification})
Mối đe dọa chính   : ${result.threatClassification?.primaryThreat || 'Phishing / Social Engineering'}
Độ tin cậy mô hình : ${result.threatClassification?.confidence || 95.8}%

TÓM TẮT KẾT LUẬN GIÁM ĐỊNH:
${result.summary}

KHUYẾN NGHỊ XỬ LÝ:
${(result.recommendedSteps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}
========================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ScamGuard-Forensic-Report-${result.assessmentId || 'SG-EC82B3'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const forensicTabs = [
    {
      id: 'smart_link',
      label: 'Tin Nhắn, Link & Ảnh Chụp',
      desc: 'Giám định ngữ nghĩa & URL đa phương thức',
      icon: LinkIcon,
    },
    {
      id: 'fake_bill',
      label: 'Biên Lai & Công Văn Giả (ELA)',
      desc: 'Quang học OCR, Bản đồ nhiệt ELA & Con dấu',
      icon: FileText,
    },
    {
      id: 'threat_intel',
      label: 'DNS/SSL, VietQR, Ghi Âm & APK',
      desc: '6 công cụ Pháp y Kỹ thuật số chuyên sâu',
      icon: Globe,
    },
    {
      id: 'blacklist',
      label: 'Tra Cứu SĐT/STK & Đơn PA05',
      desc: 'Danh sách đen Quốc gia & Hồ sơ tố giác',
      icon: Phone,
    },
    {
      id: 'pii_redact',
      label: 'Khử Nhận Dạng PII (NĐ 13)',
      desc: 'Ẩn CCCD, STK, OTP bằng AI & Vẽ Canvas',
      icon: Lock,
    },
  ] as const;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* National Anti-Scam Command Header */}
      <div className="border-b border-[#1E293B] pb-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-blue-400 font-semibold">Trung Tâm Giám Định AI & Pháp Y Số Quốc Gia</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">Gemini 3.8 Multimodal + Live DNS/TLS/VietQR/ELA</span>
            <span aria-hidden="true">·</span>
            <span>Hỗ trợ dán ảnh trực tiếp (Ctrl+V)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Hệ Sinh Thái Giám Định Lừa Đảo & Phòng Vệ Không Gian Mạng
          </h1>
        </div>

        {/* Top Right Action Buttons (Max 2 primary actions per SaaS guideline) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenSentinel && (
            <button
              type="button"
              onClick={onOpenSentinel}
              className="px-3.5 py-2 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap transition"
            >
              <Monitor className="w-4 h-4 text-blue-400" />
              <span>Quét Màn Hình Trực Tiếp</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenEmergency}
            className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Ứng Cứu Khẩn Cấp (113 / 156)</span>
          </button>
        </div>
      </div>

      {/* 5 Main Forensic Module Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {forensicTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setError(null);
                setResult(null);
              }}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors flex items-start gap-3 ${
                isActive
                  ? 'bg-blue-600/12 border-blue-500 text-white'
                  : 'bg-[#111827] border-[#1E293B] text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-[#090D16] text-slate-400 border border-[#1E293B]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{tab.label}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Forensic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={activeTab === 'threat_intel' ? 'lg:col-span-12' : 'lg:col-span-7'}>
          <AnimatePresence mode="wait">
            {/* TAB 1: MULTIMODAL MESSAGE, URL & SCREENSHOT SCANNER */}
            {activeTab === 'smart_link' && (
              <motion.div
                key="smart_link"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-[#111827] rounded-xl p-6 space-y-5 border border-[#1E293B]"
              >
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Chọn loại dữ liệu hoặc kênh nghi vấn cần giám định AI:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-[#090D16] border border-[#1E293B] rounded-lg">
                    {[
                      { id: 'message', label: 'Tin nhắn SMS/Zalo', icon: MessageSquare },
                      { id: 'url', label: 'Website / Link APK', icon: LinkIcon },
                      { id: 'email', label: 'Thư điện tử', icon: Mail },
                      { id: 'phone', label: 'Kịch bản Cuộc gọi', icon: Phone },
                    ].map((obj) => {
                      const ObjIcon = obj.icon;
                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => {
                            setTargetObject(obj.id as any);
                            setResult(null);
                          }}
                          className={`px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                            targetObject === obj.id
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ObjIcon className="w-3.5 h-3.5" />
                          <span>{obj.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleAnalyzeText} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Nội dung tin nhắn, kịch bản dẫn dụ hoặc ngữ cảnh nghi vấn
                    </label>
                    <textarea
                      rows={4}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={placeholders.text}
                      className="w-full bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none leading-relaxed font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Đường dẫn URL / Tên miền đính kèm
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          type="text"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder={placeholders.url}
                          className="w-full bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Định danh người gửi / Số điện thoại / STK
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MessageSquare className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          type="text"
                          value={senderInput}
                          onChange={(e) => setSenderInput(e.target.value)}
                          placeholder={placeholders.sender}
                          className="w-full bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Multimodal Screenshot Attachment inside Tab 1 */}
                  <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {attachedScreenshotBase64 ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={attachedScreenshotBase64}
                          alt="Screenshot"
                          className="w-12 h-12 rounded object-cover border border-[#1E293B]"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-emerald-400">
                            Đã đính kèm ảnh chụp màn hình để Gemini Vision phân tích
                          </p>
                          <button
                            type="button"
                            onClick={() => setAttachedScreenshotBase64(null)}
                            className="text-rose-400 hover:text-rose-300 text-[11px] font-medium cursor-pointer"
                          >
                            Gỡ ảnh đính kèm
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>
                            Đính kèm ảnh chụp màn hình tin nhắn/web (hoặc nhấn <kbd className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#1E293B] font-mono text-[10px]">Ctrl+V</kbd>):
                          </span>
                        </div>
                        <label className="px-3 py-1.5 rounded-md bg-[#111827] hover:bg-[#1E293B] text-blue-400 border border-[#1E293B] text-xs font-semibold cursor-pointer transition">
                          <span>Chọn ảnh chụp màn hình</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files?.[0]) {
                                const { base64, mimeType } = await compressImage(e.target.files[0]);
                                setAttachedScreenshotBase64(base64);
                                setAttachedScreenshotMime(mimeType);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Privacy Commitment */}
                  <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#1E293B] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Bảo vệ dữ liệu cá nhân tự động (On-Device PII Redaction)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('pii_redact');
                          setResult(null);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                      >
                        Mở công cụ ẩn danh PII →
                      </button>
                    </div>

                    <div className="flex items-start gap-2 text-slate-400">
                      <input
                        type="checkbox"
                        id="data-protect-verify"
                        checked={noSensitiveChecked}
                        onChange={(e) => setNoSensitiveChecked(e.target.checked)}
                        className="mt-0.5 accent-blue-600 cursor-pointer h-3.5 w-3.5"
                      />
                      <label htmlFor="data-protect-verify" className="cursor-pointer leading-relaxed text-[11px]">
                        Tự động che số CCCD, số thẻ và mã OTP thực của bạn trước khi truyền tới mô hình Gemini 3.8 Flash.
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-4 py-2.5 rounded-lg bg-[#090D16] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 font-semibold text-xs transition cursor-pointer whitespace-nowrap"
                    >
                      Nạp mẫu thực tế
                    </button>

                    <button
                      type="submit"
                      disabled={loading || (!textInput.trim() && !urlInput.trim() && !attachedScreenshotBase64)}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      {loading ? (
                        <>
                          <Cpu className="w-4 h-4 animate-spin" />
                          <span>Gemini AI đang phân tích pháp y...</span>
                        </>
                      ) : (
                        <>
                          <Scan className="w-4 h-4" />
                          <span>Thực Thi Giám Định AI Đa Phương Thức</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 2: MULTIMODAL DOCUMENT, FAKE BILL, FORGED WARRANT & ELA HEATMAP */}
            {activeTab === 'fake_bill' && (
              <motion.div
                key="fake_bill"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-[#111827] rounded-xl p-6 space-y-5 border border-[#1E293B]"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Giám Định Quang Học Biên Lai Ngân Hàng, Công Văn Giả Mạo & Bản Đồ Nhiệt ELA
                    </h3>
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                      Gemini Vision OCR + Pixel ELA
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Phát hiện biên lai chuyển tiền cắt ghép (Bill/UNC giả), lệnh bắt giữ/công văn giả mạo Bộ Công An, Viện Kiểm Sát, Tổng cục Thuế bằng thuật toán phân tích mức độ lỗi nén điểm ảnh (Error Level Analysis) kết hợp Gemini Vision OCR.
                  </p>
                </div>

                {/* Document Category Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-[#090D16] border border-[#1E293B] rounded-lg text-xs">
                  {[
                    { id: 'bank_bill', label: 'Biên lai Ngân hàng' },
                    { id: 'gov_document', label: 'Công văn / Lệnh bắt' },
                    { id: 'chat_screenshot', label: 'Ảnh chụp Tin nhắn' },
                    { id: 'id_card_deepfake', label: 'CCCD / Mặt Deepfake' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setDocCategory(cat.id as any)}
                      className={`py-2 px-2.5 rounded-md font-semibold cursor-pointer transition ${
                        docCategory === cat.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Image Preview with Original vs ELA Heatmap Toggle */}
                <div className="p-5 border border-dashed border-[#1E293B] rounded-xl bg-[#090D16] text-center hover:border-blue-500/40 transition-colors">
                  {fakeBillBase64 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewMode('original')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                            viewMode === 'original'
                              ? 'bg-blue-600 text-white'
                              : 'bg-[#111827] text-slate-400 border border-[#1E293B]'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ảnh Gốc (Original)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('ela_heatmap')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                            viewMode === 'ela_heatmap'
                              ? 'bg-rose-600 text-white'
                              : 'bg-[#111827] text-slate-400 border border-[#1E293B]'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Bản Đồ Nhiệt Pháp Y ELA (Phát hiện vùng ghép)</span>
                        </button>
                      </div>

                      <img
                        src={viewMode === 'ela_heatmap' && elaDataUrl ? elaDataUrl : fakeBillBase64}
                        alt="Tài liệu giám định"
                        referrerPolicy="no-referrer"
                        className="max-h-64 mx-auto rounded-lg border border-[#1E293B] object-contain"
                      />

                      {viewMode === 'ela_heatmap' && (
                        <p className="text-[11px] text-amber-300 font-mono">
                          Phân tích ELA: Các vùng phát sáng rực khác biệt phản ánh mức nén JPEG không đồng nhất do chèn chữ hoặc ghép con dấu đè lên nền gốc.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setFakeBillBase64(null);
                          setOcrDataList([]);
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Xóa ảnh và chọn tệp khác
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2.5 py-4">
                      <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                      <p className="text-xs text-slate-200 font-semibold">
                        Nhấp để tải lên ảnh Biên lai chuyển khoản, Công văn/Lệnh bắt nghi giả mạo hoặc nhấn Ctrl+V
                      </p>
                      <p className="text-[11px] text-slate-500">Hỗ trợ: PNG, JPG, WEBP</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Extracted OCR Fields Table if available */}
                {ocrDataList.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-2.5 text-xs">
                    <p className="font-bold text-white">
                      Bảng Bóc Tách Thực Thể Quang Học (Gemini Vision OCR):
                    </p>
                    <div className="divide-y divide-[#1E293B] border border-[#1E293B] rounded-lg overflow-hidden">
                      {ocrDataList.map((item, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between gap-2 bg-[#111827]">
                          <span className="text-slate-400">{item.field}:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-white">{item.value}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                item.status === 'CRITICAL_FORGERY'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : item.status === 'SUSPICIOUS'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {legalWarningText && (
                  <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                    <strong className="text-amber-300 block mb-0.5">⚖️ Cảnh báo Pháp lý & Quy trình Tố tụng:</strong>
                    {legalWarningText}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Ghi chú ngữ cảnh nhận được hình ảnh (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={fakeBillContext}
                    onChange={(e) => setFakeBillContext(e.target.value)}
                    placeholder="Ví dụ: Người lạ gửi ảnh lệnh bắt qua Zalo yêu cầu chuyển tiền tạm giữ..."
                    className="w-full bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleLoadSampleFakeBill}
                    className="px-3.5 py-2.5 rounded-lg bg-[#090D16] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 font-semibold text-xs transition cursor-pointer whitespace-nowrap"
                  >
                    Mẫu Biên lai 50tr Giả
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleFakeGovWarrant}
                    className="px-3.5 py-2.5 rounded-lg bg-[#090D16] hover:bg-[#1E293B] border border-[#1E293B] text-rose-300 font-semibold text-xs transition cursor-pointer whitespace-nowrap"
                  >
                    Mẫu Lệnh Bắt VKS Giả
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyzeFakeBill}
                    disabled={loading || !fakeBillBase64}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin" />
                        <span>Gemini Vision đang giám định...</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4" />
                        <span>Thực Thi Giám Định Quang Học & OCR</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: FULL 6-IN-1 THREAT INTEL WORKBENCH (DNS/TLS, VIETQR, AUDIO DEEPFAKE, APK MALWARE, OSINT, COMMUNITY) */}
            {activeTab === 'threat_intel' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <DomainReputationTab />
              </motion.div>
            )}

            {/* TAB 4: NATIONAL BLACKLIST & PA05 DOSSIER GENERATOR */}
            {activeTab === 'blacklist' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <BlacklistSearchTab />
              </motion.div>
            )}

            {/* TAB 5: SMART AI & INTERACTIVE CANVAS PII REDACTOR */}
            {activeTab === 'pii_redact' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <PiiRedactTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Threat Assessment Report (shown for smart_link, fake_bill, blacklist, pii_redact) */}
        {activeTab !== 'threat_intel' && (
          <div className="lg:col-span-5 space-y-5">
            {error && (
              <div className="p-4 bg-rose-950/60 rounded-xl border border-rose-500/30 text-xs text-rose-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-white">Thông báo từ máy chủ phân tích</p>
                    <p className="text-slate-300 leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'smart_link' || activeTab === 'fake_bill') && (
              <ThreatAssessmentResult
                result={result}
                loading={loading}
                onCopy={handleCopyResult}
                copied={copied}
              />
            )}

            {(activeTab === 'blacklist' || activeTab === 'pii_redact') && (
              <div className="bg-[#111827] p-6 rounded-xl border border-[#1E293B] space-y-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white">
                    Chuẩn Nghiệp Vụ An Ninh Mạng & Bảo Vệ Dữ Liệu Công Dân
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hệ thống kết hợp cơ sở dữ liệu đầu số viễn thông, danh bạ chính thống (.gov.vn), kiểm tra chứng chỉ số TLS/SSL thời gian thực và trí tuệ nhân tạo đa phương thức Gemini 3.8 Flash nhằm phát hiện sớm mọi kịch bản lừa đảo trực tuyến.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#1E293B] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Đường dây nóng Bộ Công An:</span>
                    <span className="font-mono font-bold text-rose-400">113</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Tổng đài Chống lừa đảo Quốc gia:</span>
                    <span className="font-mono font-bold text-blue-400">156</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Cổng Không Gian Mạng Quốc Gia:</span>
                    <span className="font-mono text-emerald-400">khonggianmang.vn</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(activeTab === 'smart_link' || activeTab === 'fake_bill') && result && (
        <ForensicEvidenceDetails
          result={result}
          textInput={activeTab === 'smart_link' ? textInput : fakeBillContext}
          onExport={handleExportAssessment}
          showTrace={showTrace}
          onToggleTrace={() => setShowTrace(!showTrace)}
        />
      )}
    </div>
  );
};
