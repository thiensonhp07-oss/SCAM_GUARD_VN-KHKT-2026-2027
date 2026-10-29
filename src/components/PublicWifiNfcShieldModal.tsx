import React, { useState } from 'react';
import {
  X,
  Wifi,
  Radio,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Scan,
} from 'lucide-react';
import { QrLaserScannerOverlay } from './QrLaserScannerOverlay';

interface PublicWifiNfcShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicWifiNfcShieldModal: React.FC<PublicWifiNfcShieldModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'wifi' | 'nfc' | 'qr'>('wifi');
  const [isWifiScanActive, setIsWifiScanActive] = useState(false);
  const [wifiScanResult, setWifiScanResult] = useState<string | null>(null);
  const [isNfcProtectionEnabled, setIsNfcProtectionEnabled] = useState(true);
  const [isQrLaserScanning, setIsQrLaserScanning] = useState(false);
  const [qrLaserResult, setQrLaserResult] = useState<'neutral' | 'danger'>('neutral');

  if (!isOpen) return null;

  const handleSimulateWifiScan = () => {
    setIsWifiScanActive(true);
    setWifiScanResult(null);
    setTimeout(() => {
      setIsWifiScanActive(false);
      setWifiScanResult(
        '🚨 CẢNH BÁO EVIL TWIN: Phát hiện Router Wi-Fi giả mạo "Coffee_HighSpeed_Free" không cài mật khẩu đang thực hiện kỹ thuật Man-in-the-Middle (MITM) để bắt trộm gói tin ngân hàng!'
      );
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl w-full max-w-2xl p-5 sm:p-7 space-y-6 shadow-2xl relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg flex-shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider">
                PRO SHIELD RADAR 2026
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Phòng Thủ Wi-Fi Công Cộng, NFC & QR Code
            </h2>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('wifi')}
            className={`py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'wifi'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>1. Wi-Fi Bẫy</span>
          </button>
          <button
            onClick={() => setActiveTab('nfc')}
            className={`py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'nfc'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. Bẫy NFC</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>3. Mã QR Đã Dán Đè</span>
          </button>
        </div>

        {/* Tab 1: Wi-Fi Evil Twin Simulator */}
        {activeTab === 'wifi' && (
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span>Mô Phỏng Quét Wi-Fi Độc Hại Tại Quán Cà Phê / Sân Bay:</span>
              </h3>
              <p className="text-xs text-slate-400">
                Kẻ gian đặt điểm phát Wi-Fi miễn phí giả tên thương hiệu để bắt trộm dữ liệu đăng nhập ngân hàng hoặc dụ tải app độc hại.
              </p>
            </div>

            <button
              onClick={handleSimulateWifiScan}
              disabled={isWifiScanActive}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
            >
              {isWifiScanActive ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ĐANG QUÉT TẦN SỐ SÓNG WI-FI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>QUÉT BẰNG CƠ CHẾ CYBERGUARD PRO RADAR</span>
                </>
              )}
            </button>

            {wifiScanResult && (
              <div className="p-4 bg-rose-950/80 border border-rose-500 rounded-2xl space-y-2 text-xs animate-fadeIn">
                <p className="font-bold text-rose-200">{wifiScanResult}</p>
                <div className="p-3 bg-slate-950 rounded-xl text-slate-300 font-mono text-[11px] space-y-1">
                  <p>🛡️ <strong>Giải pháp từ CyberGuard:</strong></p>
                  <p>1. Luôn sử dụng mạng di động 4G/5G khi thực hiện chuyển tiền ngân hàng.</p>
                  <p>2. Không đăng nhập vào các trang web không có chữ HTTPS khi dùng Wi-Fi công cộng.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: NFC Protection */}
        {activeTab === 'nfc' && (
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Cảnh Báo Quẹt Thẻ / Chip NFC Không Tiếp Xúc:</span>
              </h3>
              <p className="text-xs text-slate-400">
                Thẻ ngân hàng contactless hoặc chip NFC trên điện thoại có thể bị thiết bị đọc ngầm của kẻ lừa đảo quẹt trộm khi đứng gần ở nơi đông người.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-white">Chế độ Khóa chip NFC khi chưa mở khóa màn hình:</p>
                <p className="text-[11px] text-slate-400">Tự động chặn thiết bị NFC lạ áp sát túi quần/ví tiền.</p>
              </div>
              <button
                onClick={() => setIsNfcProtectionEnabled(!isNfcProtectionEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isNfcProtectionEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isNfcProtectionEnabled ? 'ĐÃ BẬT PRO' : 'ĐÃ TẮT'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Tampered QR Code */}
        {activeTab === 'qr' && (
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>Nhận Diện Mã QR Thanh Toán Bị Dán Đè Tại Nhà Hàng:</span>
              </h3>
              <p className="text-xs text-slate-400">
                Thủ đoạn dán đè mã QR của kẻ gian lên biển thanh toán VietQR tại quán ăn khiến tiền chuyển thẳng vào tài khoản lừa đảo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="relative w-36 h-36 rounded-xl bg-white p-3 border-2 border-cyan-500/40 flex items-center justify-center shrink-0 overflow-hidden">
                <QrCode className="w-24 h-24 text-slate-900" />
                <QrLaserScannerOverlay
                  isScanning={isQrLaserScanning}
                  laserActive={true}
                  verdictStatus={qrLaserResult}
                  compact
                />
              </div>

              <div className="flex-1 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400">Quét Quang Học Phát Hiện Tem Đè</span>
                  <span className="text-[10px] font-mono text-slate-400">EMVCo CRC-16</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {qrLaserResult === 'danger'
                    ? '🚨 PHÁT HIỆN GIẢ MẠO: Tên thụ hưởng ẩn trong mã QR là tài khoản cá nhân "NGUYEN VAN X", không khớp với biển hiệu nhà hàng!'
                    : 'Sử dụng tia quét Laser Pháp Y để giải mã trước tên chủ tài khoản ngân hàng thụ hưởng ẩn bên trong mã QR.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsQrLaserScanning(true);
                    setQrLaserResult('neutral');
                    window.setTimeout(() => {
                      setIsQrLaserScanning(false);
                      setQrLaserResult('danger');
                    }, 1100);
                  }}
                  disabled={isQrLaserScanning}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>{isQrLaserScanning ? 'Đang quét tia Laser...' : 'Kích Hoạt Quét Laser Kiểm Tra QR'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-amber-300">💡 3 Bước Kiểm Tra Mã QR An Toàn:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Dùng tay sờ nhẹ xem miếng dán QR có bị dán đè, gồ ghề hay lệch mép không.</li>
                <li>Trước khi bấm nút XÁC NHẬN CHUYỂN TIỀN, bắt buộc đối chiếu TÊN CHỦ TÀI KHOẢN với chủ quán.</li>
                <li>Không quét các mã QR dán trên tờ rơi, cột điện quảng cáo tặng quà miễn phí.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg"
        >
          XÁC NHẬN BẢO VỆ THIẾT BỊ & ĐÓNG
        </button>
      </div>
    </div>
  );
};
