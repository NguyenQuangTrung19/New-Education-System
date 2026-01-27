import React, { useState } from 'react';
import { X, Lock, AlertTriangle } from 'lucide-react';
import api from '../src/api/client';

interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

import { createPortal } from 'react-dom';

const ReAuthModal: React.FC<ReAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-password', { password });
      onSuccess();
      setPassword('');
      onClose();
    } catch (err) {
      setError('Mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200 z-[120]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Xác thực bảo mật</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Vui lòng nhập mật khẩu của bạn để tiếp tục thao tác này.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium"
              placeholder="Nhập mật khẩu của bạn..."
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!password || loading}
              className={`px-4 py-2 text-white rounded-lg transition-all font-medium flex items-center gap-2 ${
                !password || loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transform active:scale-95'
              }`}
            >
              {loading ? 'Đang xác thực...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReAuthModal;
