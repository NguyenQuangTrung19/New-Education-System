import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          let bgColor, icon;
          switch (toast.type) {
            case 'success':
              bgColor = 'bg-emerald-600 text-white shadow-emerald-500/30';
              icon = <CheckCircle className="h-5 w-5" />;
              break;
            case 'error':
              bgColor = 'bg-rose-600 text-white shadow-rose-500/30';
              icon = <AlertCircle className="h-5 w-5" />;
              break;
            case 'warning':
              bgColor = 'bg-amber-500 text-white shadow-amber-500/30';
              icon = <AlertTriangle className="h-5 w-5" />;
              break;
            case 'info':
            default:
              bgColor = 'bg-sky-500 text-white shadow-sky-500/30';
              icon = <Info className="h-5 w-5" />;
              break;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold min-w-[280px] max-w-[400px] pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300 ${bgColor}`}
            >
              <div className="shrink-0">{icon}</div>
              <div className="flex-1 whitespace-pre-line leading-relaxed">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
