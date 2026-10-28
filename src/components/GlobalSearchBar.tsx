import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Swords,
  QrCode,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  ChevronRight,
  Activity,
  Radio,
  Wifi,
  Lock,
  Dna,
  LayoutDashboard,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { searchGlobalRegistry, SearchResultItem } from '../utils/searchIndex';
import { useTranslation } from '../i18n/LanguageContext';

interface GlobalSearchBarProps {
  onNavigate: (tab: string, subView?: string) => void;
  className?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ onNavigate, className = '' }) => {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    return searchGlobalRegistry(query, 10);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = results[selectedIndex];
      if (chosen) {
        handleSelectItem(chosen);
      }
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    onNavigate(item.tab, item.subView);
    setIsOpen(false);
    setQuery('');
  };

  const getResultIcon = (iconType: string) => {
    switch (iconType) {
      case 'swords':
        return <Swords className="w-4 h-4 text-sky-600" />;
      case 'qr':
        return <QrCode className="w-4 h-4 text-emerald-600" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-sky-600" />;
      case 'shield-alert':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'activity':
        return <Activity className="w-4 h-4 text-sky-600" />;
      case 'radio':
        return <Radio className="w-4 h-4 text-amber-600" />;
      case 'wifi':
        return <Wifi className="w-4 h-4 text-sky-600" />;
      case 'lock':
        return <Lock className="w-4 h-4 text-emerald-600" />;
      case 'dna':
        return <Dna className="w-4 h-4 text-indigo-600" />;
      case 'dashboard':
        return <LayoutDashboard className="w-4 h-4 text-sky-600" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'help':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Search className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div ref={searchContainerRef} className={`relative flex-1 ${className}`}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t('nav_search_placeholder')}
          className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 hover:border-sky-300 focus:border-sky-500 focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/15 transition shadow-2xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() !== '' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-[420px] flex flex-col"
          >
            <div className="px-3.5 py-2 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>
                {results.length > 0 ? (
                  <>
                    {language === 'en' ? 'Found ' : 'Tìm thấy '}
                    <strong className="text-slate-900 font-mono tabular-nums">{results.length}</strong>
                    {language === 'en' ? ' matches' : ' kết quả'}
                  </>
                ) : (
                  <span>{language === 'en' ? 'No matching results' : 'Không có kết quả trùng khớp'}</span>
                )}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                {language === 'en' ? '↑↓ navigate · Enter to open' : '↑↓ chọn · Enter mở'}
              </span>
            </div>

            <div className="overflow-y-auto max-h-[340px] p-1.5 space-y-0.5">
              {results.length === 0 ? (
                <div className="p-6 text-center space-y-1.5">
                  <AlertTriangle className="w-5 h-5 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    {language === 'en' ? `No results found for "${query}"` : `Không tìm thấy kết quả cho "${query}"`}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'en' ? 'Try: VNeID, Banking, Quishing, Deepfake, OSINT' : 'Từ khóa gợi ý: VNeID, Ngân hàng, Quishing, Deepfake, Blacklist'}
                  </p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-sky-50 border border-sky-300'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                          {getResultIcon(item.iconType)}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {item.badge}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-3.5 py-2 bg-slate-50 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400">{language === 'en' ? 'Quick keywords:' : 'Tra cứu nhanh:'}</span>
              {['VNeID', 'Ngân Hàng', 'Quishing QR', 'Deepfake', 'OSINT'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setQuery(sug);
                    setIsOpen(true);
                    inputRef.current?.focus();
                  }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-sky-50 text-slate-700 text-[11px] border border-slate-200 hover:border-sky-300 transition cursor-pointer whitespace-nowrap"
                >
                  {sug}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
