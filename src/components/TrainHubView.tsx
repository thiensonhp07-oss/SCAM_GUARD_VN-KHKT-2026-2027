import React from 'react';
import { Swords, QrCode, Eye, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScamArenaView } from './ScamArenaView';
import { QuishingLabView } from './QuishingLabView';
import { DeepfakeLabView } from './DeepfakeLabView';
import { QuickDrillView } from './QuickDrillView';
import { ScamScenario } from '../types';

interface TrainHubViewProps {
  subView: 'arena' | 'quishing' | 'deepfake' | 'drills';
  onSubViewChange: (view: 'arena' | 'quishing' | 'deepfake' | 'drills') => void;
  selectedScenario?: ScamScenario | null;
  onScenarioSelect: (scenario: ScamScenario) => void;
  selectedQuishId?: string | null;
  selectedDeepfakeId?: string | null;
  onCompleteScenario: (score: number) => void;
  onAddXp: (amount: number) => void;
}

export const TrainHubView: React.FC<TrainHubViewProps> = ({
  subView,
  onSubViewChange,
  selectedScenario,
  onScenarioSelect,
  selectedQuishId,
  selectedDeepfakeId,
  onCompleteScenario,
  onAddXp,
}) => {
  const subTabs = [
    {
      id: 'arena',
      label: 'Mô Phỏng Kịch Bản',
      desc: '12 khu vực tác chiến thực tế',
      icon: Swords,
    },
    {
      id: 'quishing',
      label: 'Phòng Thí Nghiệm QR',
      desc: 'Phân tích mã QR độc hại',
      icon: QrCode,
    },
    {
      id: 'deepfake',
      label: 'Nhận Diện Deepfake AI',
      desc: 'Kiểm định âm thanh & hình ảnh',
      icon: Eye,
    },
    {
      id: 'drills',
      label: 'Phản Xạ Nhanh 25 Giây',
      desc: 'Đánh giá tốc độ xử lý tình huống',
      icon: Zap,
    },
  ] as const;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative">
      {/* Clean Enterprise Simulation Header */}
      <div className="border-b border-[#1E293B] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-blue-400 font-semibold">Thao Trường Huấn Luyện An Ninh Mạng</span>
            <span aria-hidden="true">·</span>
            <span>4 Chế độ mô phỏng chuyên sâu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Thực Hành Phản Xạ Phòng Thủ Trước Mối Đe Dọa Số
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Rèn luyện kỹ năng phân tích kịch bản thao túng tâm lý, kiểm tra an toàn mã QR (Quishing), phát hiện dấu hiệu giả mạo Deepfake AI và phản ứng nhanh trong giới hạn thời gian.
          </p>
        </div>
      </div>

      {/* Clean Interactive Simulation Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subView === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSubViewChange(tab.id)}
              className={`p-4 rounded-xl border text-left transition-colors flex items-start gap-3 cursor-pointer ${
                isActive
                  ? 'bg-blue-600/12 border-blue-500 text-white'
                  : 'bg-[#111827] border-[#1E293B] text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
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

      {/* Render Selected Interactive Lab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subView}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {subView === 'arena' && (
            <ScamArenaView
              selectedScenario={selectedScenario}
              onSelectScenario={onScenarioSelect}
              onComplete={onCompleteScenario}
              onAddXp={onAddXp}
            />
          )}

          {subView === 'quishing' && <QuishingLabView onAddXp={onAddXp} initialCaseId={selectedQuishId} />}

          {subView === 'deepfake' && <DeepfakeLabView onAddXp={onAddXp} initialCaseId={selectedDeepfakeId} />}

          {subView === 'drills' && <QuickDrillView onAddXp={onAddXp} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
