import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver(true);
    close();
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    close();
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      setOptions(null);
      setResolver(null);
    }, 200); // Wait for fade out
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
             onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div className="relative bg-white w-[90%] max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
             <div className="absolute top-4 right-4">
                <button onClick={handleCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                   <X className="h-5 w-5" />
                </button>
             </div>
             
             <div className="p-6 md:p-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 
                    ${options.isDanger !== false ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`
                }>
                   {options.isDanger !== false ? <AlertCircle className="h-8 w-8" /> : <Info className="h-8 w-8" />}
                </div>
                
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">{options.title}</h3>
                <p className="text-slate-500 whitespace-pre-line">{options.message}</p>
             </div>
             
             <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                <button
                   onClick={handleCancel}
                   className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors"
                >
                   {options.cancelLabel || 'Hủy'}
                </button>
                <button
                   onClick={handleConfirm}
                   className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2
                     ${options.isDanger !== false 
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`
                   }
                >
                   {options.isDanger !== false && <Trash2 className="h-4 w-4" />}
                   {options.confirmLabel || 'Đồng ý'}
                </button>
             </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

// Assuming Info icon for non-danger dialogs
import { Info } from 'lucide-react';
