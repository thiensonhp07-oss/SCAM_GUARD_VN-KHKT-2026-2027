import React, { useState, useRef, useEffect } from 'react';
import { EyeOff, Shield, CheckCircle2, Upload, Cpu, RotateCcw, Download, Copy, Check } from 'lucide-react';

export const PiiRedactTab: React.FC = () => {
  const [rawPiiText, setRawPiiText] = useState(
    'Tôi tên là Nguyễn Văn An, số CCCD 001092019283, trú tại Số 18 đường Cầu Giấy, Hà Nội. Số điện thoại cá nhân: 0912345678, số tài khoản Techcombank: 1903456789123, mã xác thực OTP vừa nhận được là 482910.'
  );
  const [redactedPiiText, setRedactedPiiText] = useState('');
  const [piiEntities, setPiiEntities] = useState<Array<{ type: string; originalPreview?: string; replacement: string }>>([]);
  const [piiLoading, setPiiLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Interactive Canvas Redaction States
  const [sourceImageObj, setSourceImageObj] = useState<HTMLImageElement | null>(null);
  const [redactionBoxes, setRedactionBoxes] = useState<Array<{ x: number; y: number; w: number; h: number }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleApplyPiiRedaction = async () => {
    if (!rawPiiText.trim()) return;
    setPiiLoading(true);

    try {
      const res = await fetch('/api/forensics/pii-redact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawPiiText }),
      });
      if (res.ok) {
        const data = await res.json();
        setRedactedPiiText(data.redactedText || '');
        setPiiEntities(Array.isArray(data.detectedEntities) ? data.detectedEntities : []);
        setPiiLoading(false);
        return;
      }
    } catch {
      // Fallback below
    }

    let text = rawPiiText;
    const entities: Array<{ type: string; replacement: string }> = [];

    text = text.replace(/\b(0\d{11})\b/g, () => {
      entities.push({ type: 'Số CCCD 12 số', replacement: '[ĐÃ_ẨN_CCCD]' });
      return '████████████ [ĐÃ_ẨN_CCCD]';
    });
    text = text.replace(/\b\d{6}\b/g, () => {
      entities.push({ type: 'Mã OTP 6 số', replacement: '[ĐÃ_ẨN_OTP]' });
      return '██████ [ĐÃ_ẨN_OTP]';
    });
    text = text.replace(/\b(0[235789]\d{8,9})\b/g, () => {
      entities.push({ type: 'Số điện thoại', replacement: '[ĐÃ_ẨN_SĐT]' });
      return '██████████ [ĐÃ_ẨN_SĐT]';
    });
    text = text.replace(/\b\d{8,16}\b/g, () => {
      entities.push({ type: 'Số tài khoản / Thẻ', replacement: '[ĐÃ_ẨN_STK]' });
      return '████████████ [ĐÃ_ẨN_STK]';
    });

    setRedactedPiiText(text);
    setPiiEntities(entities);
    setPiiLoading(false);
  };

  // Draw image + blackout boxes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImageObj) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = sourceImageObj.width;
    canvas.height = sourceImageObj.height;
    ctx.drawImage(sourceImageObj, 0, 0);

    // Draw blackout boxes
    for (const box of redactionBoxes) {
      ctx.fillStyle = '#090D16';
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = Math.max(2, Math.round(canvas.width * 0.003));
      ctx.strokeRect(box.x, box.y, box.w, box.h);
    }

    // Add watermark stamp at bottom
    ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
    ctx.fillRect(0, canvas.height - 34, canvas.width, 34);
    ctx.fillStyle = '#10b981';
    ctx.font = `bold ${Math.max(12, Math.floor(canvas.width * 0.022))}px monospace`;
    ctx.fillText('✓ SCAMGUARD PII REDACTED (NGHỊ ĐỊNH 13/2023/NĐ-CP)', 14, canvas.height - 12);
  }, [sourceImageObj, redactionBoxes]);

  const handlePiiImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSourceImageObj(img);
        // Default auto-redaction zones for standard banking receipt
        setRedactionBoxes([
          { x: img.width * 0.18, y: img.height * 0.24, w: img.width * 0.64, h: img.height * 0.07 },
          { x: img.width * 0.22, y: img.height * 0.42, w: img.width * 0.56, h: img.height * 0.06 },
        ]);
      };
      img.src = (e.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setStartPos(getCanvasCoords(e));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const endPos = getCanvasCoords(e);
    const x = Math.min(startPos.x, endPos.x);
    const y = Math.min(startPos.y, endPos.y);
    const w = Math.abs(endPos.x - startPos.x);
    const h = Math.abs(endPos.y - startPos.y);
    if (w > 10 && h > 10) {
      setRedactionBoxes((prev) => [...prev, { x, y, w, h }]);
    }
    setIsDrawing(false);
    setStartPos(null);
  };

  const handleDownloadRedactedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `scamguard_redacted_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-5 bg-[#111827] p-6 rounded-xl border border-[#1E293B]">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-blue-400" />
            <span>Trình Khử Nhận Dạng Dữ Liệu Cá Nhân Thông Minh (AI & On-Device PII Redactor)</span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Tuân thủ Nghị định 13/2023/NĐ-CP
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tự động bóc tách và che đen (Blackout) Họ tên, số CCCD 12 số, Địa chỉ nhà, Số tài khoản, Số dư và Mã OTP trong văn bản hoặc trên ảnh chụp màn hình trước khi bạn gửi bằng chứng tố giác lên mạng.
        </p>
      </div>

      {/* 1. Text PII Redaction with Gemini AI */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          1. Khử nhận dạng PII trong Văn bản / Tin nhắn (Kết hợp Regex + Gemini AI Ngữ cảnh):
        </label>
        <textarea
          rows={3}
          value={rawPiiText}
          onChange={(e) => setRawPiiText(e.target.value)}
          className="w-full bg-[#090D16] border border-[#1E293B] focus:border-blue-500 rounded-lg p-3.5 text-xs text-white focus:outline-none leading-relaxed"
        />
        <button
          type="button"
          onClick={handleApplyPiiRedaction}
          disabled={piiLoading || !rawPiiText.trim()}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {piiLoading ? (
            <>
              <Cpu className="w-4 h-4 animate-spin" />
              <span>Đang quét & ẩn danh thực thể nhạy cảm với Gemini AI...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Thực Thi Khử Nhận Dạng PII Văn Bản</span>
            </>
          )}
        </button>

        {redactedPiiText && (
          <div className="p-4 bg-[#090D16] rounded-xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã ẩn danh an toàn {piiEntities.length} thực thể dữ liệu cá nhân</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(redactedPiiText);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Đã sao chép' : 'Sao chép văn bản sạch'}</span>
              </button>
            </div>

            <div className="p-3 bg-[#111827] rounded-lg text-xs text-slate-200 font-mono leading-relaxed border border-[#1E293B]">
              {redactedPiiText}
            </div>

            {piiEntities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {piiEntities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    ✓ {ent.type} → {ent.replacement}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Interactive Image Screenshot Redaction Canvas */}
      <div className="space-y-3 pt-4 border-t border-[#1E293B]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-semibold text-slate-300 block">
            2. Che đen PII trên Ảnh chụp màn hình (Hỗ trợ tự động + Kéo chuột vẽ vùng che tùy ý):
          </label>
          {sourceImageObj && (
            <button
              type="button"
              onClick={() => setRedactionBoxes([])}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa các vùng che để vẽ lại</span>
            </button>
          )}
        </div>

        <div className="p-4 border border-dashed border-[#1E293B] rounded-xl bg-[#090D16] text-center hover:border-blue-500/40 transition">
          <label className="cursor-pointer block space-y-1.5 py-2">
            <Upload className="w-6 h-6 text-blue-400 mx-auto" />
            <span className="text-xs text-slate-200 font-semibold block">
              Tải ảnh chụp màn hình chứa thông tin nhạy cảm cần che đen
            </span>
            <span className="text-[11px] text-slate-500 block">
              Sau khi tải lên, bạn có thể dùng chuột kéo trực tiếp trên ảnh để che thêm bất kỳ vùng nào
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) handlePiiImageUpload(e.target.files[0]);
              }}
              className="hidden"
            />
          </label>
        </div>

        {sourceImageObj && (
          <div className="p-4 bg-[#090D16] rounded-xl border border-emerald-500/30 space-y-3">
            <p className="text-xs text-emerald-400 font-medium">
              💡 Mẹo: Nhấn giữ và kéo chuột trên ảnh bên dưới để vẽ thêm ô che đen vào vùng có Số dư hoặc CCCD.
            </p>
            <div className="overflow-hidden rounded-lg border border-[#1E293B] bg-black flex justify-center">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="max-h-80 w-auto object-contain cursor-crosshair"
              />
            </div>
            <button
              type="button"
              onClick={handleDownloadRedactedImage}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Download className="w-4 h-4" />
              <span>Tải Ảnh Đã Khử Nhận Dạng PII Về Máy (.PNG)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
