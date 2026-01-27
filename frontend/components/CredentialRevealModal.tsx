import React from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, ShieldCheck, User, Key } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CredentialRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    name: string;
    username: string; // or id context
    password?: string;
  } | null;
}

const CredentialRevealModal: React.FC<CredentialRevealModalProps> = ({ isOpen, onClose, credentials }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !credentials) return null;

  const handleCopy = () => {
    if (credentials.password) {
      navigator.clipboard.writeText(credentials.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-gray-100">
          <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="font-bold text-lg">Credentials Verified</h3>
              </div>
              <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
              </button>
          </div>
          
          <div className="p-6 space-y-6">
              <div className="text-center">
                  <div className="h-16 w-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                      <User className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{credentials.name}</h4>
                  <p className="text-sm text-gray-500">Account Credentials</p>
              </div>

              <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Username</p>
                      <p className="font-mono text-gray-900 font-medium">{credentials.username}</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 relative group">
                      <p className="text-xs text-emerald-600 font-bold uppercase mb-2 flex items-center gap-1">
                          <Key className="h-3 w-3" /> User Password
                      </p>
                      <div className="flex items-center justify-between">
                          <p className="font-mono text-2xl font-bold text-emerald-800 tracking-wider">
                              {credentials.password || '********'}
                          </p>
                          <button 
                              onClick={handleCopy}
                              className="p-2 bg-white rounded-lg shadow-sm border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Copy Password"
                          >
                              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                      </div>
                  </div>
              </div>

              <div className="text-center">
                  <p className="text-xs text-gray-400">
                      This information is sensitive. Please verify responsibly.
                  </p>
              </div>
              
              <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Close Secure View
              </button>
          </div>
       </div>
    </div>,
    document.body
  );
};

export default CredentialRevealModal;
