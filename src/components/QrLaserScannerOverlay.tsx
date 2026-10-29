import React, { useState, useEffect } from 'react';
import { Scan, ShieldAlert, ShieldCheck, Cpu } from 'lucide-react';

export interface QrLaserScannerOverlayProps {
  /** Whether a deep forensic scan is actively running */
  isScanning?: boolean;
  /** Whether the ambient/interactive laser sweep is active even when not loading */
  laserActive?: boolean;
  /** Risk status once decoded: 'danger' | 'safe' | 'neutral' */
  verdictStatus?: 'danger' | 'safe' | 'neutral';
  /** Compact mode for smaller QR frames (e.g. physical standee in QuishingLab) */
  compact?: boolean;
  /** Optional custom telemetry label */
  telemetryLabel?: string;
}

const SCAN_STAGES = [
  'STAGE 01/03 · Định vị 3 điểm neo quang học Finder Pattern [3/3]...',
  'STAGE 02/03 · Giải mã cấu trúc TLV EMVCo & kiểm định tổng kiểm CRC-16...',
  'STAGE 03/03 · Cô lập URL đích trong Sandbox & đối soát BIN Napas247...',
];

export const QrLaserScannerOverlay: React.FC<QrLaserScannerOverlayProps> = ({
  isScanning = false,
  laserActive = true,
  verdictStatus = 'neutral',
  compact = false,
  telemetryLabel,
}) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setStageIndex(0);
      setProgress(100);
      return;
    }

    setProgress(8);
    setStageIndex(0);

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(99, prev + 7);
        if (next >= 68) {
          setStageIndex(2);
        } else if (next >= 36) {
          setStageIndex(1);
        }
        return next;
      });
    }, 65);

    return () => window.clearInterval(progressTimer);
  }, [isScanning]);

  if (!laserActive && !isScanning) return null;

  // Determine laser color scheme based on state
  const isDanger = !isScanning && verdictStatus === 'danger';
  const isSafe = !isScanning && verdictStatus === 'safe';

  const laserColorHex = isScanning
    ? '#0284c7'
    : isDanger
    ? '#e11d48'
    : isSafe
    ? '#059669'
    : '#0284c7';

  const laserGlowRgba = isScanning
    ? 'rgba(2, 132, 199, 0.35)'
    : isDanger
    ? 'rgba(225, 29, 72, 0.32)'
    : isSafe
    ? 'rgba(5, 150, 105, 0.28)'
    : 'rgba(2, 132, 199, 0.26)';

  const cornerBorderClass = isScanning
    ? 'border-sky-500'
    : isDanger
    ? 'border-rose-500'
    : isSafe
    ? 'border-emerald-500'
    : 'border-sky-500/80';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-20 select-none">
      {/* 1. Subtle Forensic Micro-Grid Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isScanning ? 0.32 : 0.14,
          backgroundImage: `linear-gradient(to right, ${laserColorHex}22 1px, transparent 1px), linear-gradient(to bottom, ${laserColorHex}22 1px, transparent 1px)`,
          backgroundSize: compact ? '12px 12px' : '16px 16px',
        }}
      />

      {/* 2. Four Precision Optical Corner Reticle Brackets */}
      <div
        className={`absolute top-2 left-2 ${compact ? 'w-4 h-4' : 'w-5 h-5'} border-t-2 border-l-2 ${cornerBorderClass} rounded-tl-sm transition-colors duration-300`}
      />
      <div
        className={`absolute top-2 right-2 ${compact ? 'w-4 h-4' : 'w-5 h-5'} border-t-2 border-r-2 ${cornerBorderClass} rounded-tr-sm transition-colors duration-300`}
      />
      <div
        className={`absolute bottom-2 left-2 ${compact ? 'w-4 h-4' : 'w-5 h-5'} border-b-2 border-l-2 ${cornerBorderClass} rounded-bl-sm transition-colors duration-300`}
      />
      <div
        className={`absolute bottom-2 right-2 ${compact ? 'w-4 h-4' : 'w-5 h-5'} border-b-2 border-r-2 ${cornerBorderClass} rounded-br-sm transition-colors duration-300`}
      />

      {/* 3. Three QR Finder Pattern Lock Squares (Top-Left, Top-Right, Bottom-Left) */}
      <div
        className={`qr-finder-box absolute ${
          compact ? 'top-4 left-4 w-7 h-7' : 'top-5 left-5 w-9 h-9'
        } border-2 rounded-sm flex items-center justify-center`}
        style={{
          borderColor: laserColorHex,
          backgroundColor: `${laserColorHex}14`,
          boxShadow: `0 0 10px ${laserGlowRgba}`,
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: laserColorHex }} />
      </div>

      <div
        className={`qr-finder-box absolute ${
          compact ? 'top-4 right-4 w-7 h-7' : 'top-5 right-5 w-9 h-9'
        } border-2 rounded-sm flex items-center justify-center`}
        style={{
          borderColor: laserColorHex,
          backgroundColor: `${laserColorHex}14`,
          boxShadow: `0 0 10px ${laserGlowRgba}`,
          animationDelay: '0.2s',
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: laserColorHex }} />
      </div>

      <div
        className={`qr-finder-box absolute ${
          compact ? 'bottom-8 left-4 w-7 h-7' : 'bottom-9 left-5 w-9 h-9'
        } border-2 rounded-sm flex items-center justify-center`}
        style={{
          borderColor: laserColorHex,
          backgroundColor: `${laserColorHex}14`,
          boxShadow: `0 0 10px ${laserGlowRgba}`,
          animationDelay: '0.4s',
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: laserColorHex }} />
      </div>

      {/* 4. Real-Time Sweeping Laser Line + Phosphor Curtain Trail */}
      <div className={isScanning ? 'qr-laser-sweep-fast' : 'qr-laser-sweep-ambient'}>
        {/* Trailing phosphor glow above the beam */}
        <div
          className="w-full -mt-7"
          style={{
            height: compact ? '22px' : '28px',
            background: `linear-gradient(180deg, transparent 0%, ${laserGlowRgba} 100%)`,
          }}
        />
        {/* Core high-intensity laser beam */}
        <div
          className="w-full relative"
          style={{
            height: isScanning ? '3px' : '2px',
            background: `linear-gradient(90deg, transparent 0%, ${laserColorHex} 15%, #ffffff 50%, ${laserColorHex} 85%, transparent 100%)`,
            boxShadow: `0 0 12px 2px ${laserColorHex}, 0 0 24px 4px ${laserGlowRgba}`,
          }}
        >
          {/* Center optical node */}
          <div
            className="absolute left-1/2 -top-1 -translate-x-1/2 w-8 h-2.5 rounded-full"
            style={{
              backgroundColor: laserColorHex,
              boxShadow: `0 0 10px ${laserColorHex}`,
            }}
          />
        </div>
        {/* Trailing phosphor glow below the beam */}
        <div
          className="w-full"
          style={{
            height: compact ? '14px' : '18px',
            background: `linear-gradient(180deg, ${laserGlowRgba} 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* 5. Top Optical Telemetry Pill */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/92 backdrop-blur-xs border border-sky-300/90 shadow-xs">
        {isScanning ? (
          <Cpu className="w-3 h-3 text-sky-600 animate-spin shrink-0" />
        ) : isDanger ? (
          <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
        ) : isSafe ? (
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
        ) : (
          <Scan className="w-3 h-3 text-sky-600 shrink-0" />
        )}
        <span className="font-mono text-[9px] font-bold tracking-wider uppercase text-slate-800 whitespace-nowrap">
          {isScanning
            ? `LASER SCANNING · ${progress}%`
            : telemetryLabel ||
              (isDanger
                ? 'THREAT VECTOR LOCKED'
                : isSafe
                ? 'VERIFIED SAFE MATRIX'
                : 'OPTICAL LASER ACTIVE')}
        </span>
      </div>

      {/* 6. Bottom Stage Readout Bar */}
      <div className="absolute bottom-1.5 left-2 right-2 px-2 py-1 rounded-md bg-white/94 backdrop-blur-xs border border-sky-200/90 shadow-xs flex items-center justify-between gap-1.5">
        <span className="font-mono text-[9px] font-semibold text-slate-700 truncate">
          {isScanning
            ? SCAN_STAGES[stageIndex]
            : isDanger
            ? '⚠️ Phát hiện cấu trúc QR bất thường / Rủi ro cao'
            : isSafe
            ? '✓ Ma trận QR hợp lệ · Đã xác thực tên miền gốc'
            : '⚡ Tia Laser 650nm đang giám sát ma trận điểm ảnh'}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 animate-ping"
          style={{ backgroundColor: laserColorHex }}
        />
      </div>
    </div>
  );
};
