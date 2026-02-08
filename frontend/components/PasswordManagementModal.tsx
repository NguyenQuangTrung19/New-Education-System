import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../src/api/client';

interface PasswordManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: { id: string; name: string; userId?: string } | null;
}

const PasswordManagementModal: React.FC<PasswordManagementModalProps> = ({ isOpen, onClose, targetUser }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !targetUser) return null;

  // We need the User ID (UUID) to update the password.
  // Teachers/Students have a `userId` field linking to the User record.
  // If targetUser passed here doesn't have it, we might be in trouble, but let's assume usage passes it.
  const targetUserId = targetUser.userId; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) {
        setError("Không tìm thấy ID người dùng hệ thống.");
        return;
    }
    setError('');
    if (newPassword.length < 8) {
        setError('M?t kh?u ph?i c? ?t nh?t 8 k? t?.');
        return;
    }
    setLoading(true);

    try {
      await api.patch(`/users/${targetUserId}/password`, { password: newPassword });
      setSuccess(true);
      setTimeout(() => {
          setSuccess(false);
          setNewPassword('');
          onClose();
      }, 1500);
    } catch (err) {
      setError('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <Key size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Đổi mật khẩu</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Đặt mật khẩu mới cho <strong>{targetUser.name}</strong>
          </p>
        </div>

        {success ? (
             <div className="flex flex-col items-center justify-center py-6 text-green-600 animate-in fade-in zoom-in">
                 <CheckCircle size={48} className="mb-2" />
                 <p className="font-medium">Đổi mật khẩu thành công!</p>
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {!targetUserId && (
                 <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm flex gap-2">
                     <AlertCircle size={16} className="mt-0.5" />
                     User ID hệ thống bị thiếu. Không thể cập nhật.
                 </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập mật khẩu mới..."
                autoFocus
                />
                {error && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
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
                disabled={!newPassword || loading || !targetUserId}
                className={`px-4 py-2 text-white rounded-lg transition-all font-medium flex items-center gap-2 ${
                    !newPassword || loading || !targetUserId
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform active:scale-95'
                }`}
                >
                {loading ? 'Đang lưu...' : 'Lưu mật khẩu'}
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default PasswordManagementModal;
