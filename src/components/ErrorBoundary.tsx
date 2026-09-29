import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 max-w-xl mx-auto rounded-3xl bg-slate-900 border border-rose-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {this.props.fallbackTitle || 'Đã xảy ra sự cố hiển thị dữ liệu'}
          </h3>
          <p className="text-sm text-slate-300">
            Hệ thống tự động kích hoạt chế độ phục hồi an toàn. Bạn có thể bấm nút dưới đây để tải lại.
          </p>
          {this.state.error?.message && (
            <p className="text-xs text-rose-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 break-words">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto cursor-pointer transition shadow-lg shadow-indigo-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tải Lại Trang</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
