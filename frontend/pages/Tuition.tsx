
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, SemesterTuition } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  CreditCard, Calendar, Filter, ChevronDown, CheckCircle, 
  AlertCircle, Receipt, Building, Copy, Check, X, ArrowRight 
} from 'lucide-react';

interface TuitionProps {
  currentUser: User;
}

export const Tuition: React.FC<TuitionProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'online' | 'offline'>('online');
  const [copied, setCopied] = useState(false);

  // -- STATE PERSISTENCE --
  // Initialize from LocalStorage or Fallback to MOCK_TUITION
  const [tuitionRecords, setTuitionRecords] = useState<SemesterTuition[]>(() => {
      try {
          const saved = localStorage.getItem('tuition_records');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.error("Error loading tuition records", e);
          return [];
      }
  });

  // Ensure consistency by saving back to localStorage if we fell back to MOCK
  useEffect(() => {
      localStorage.setItem('tuition_records', JSON.stringify(tuitionRecords));
  }, [tuitionRecords]);

  // Filter tuition records for the current student
  const myTuitionRecords = useMemo(() => {
      return tuitionRecords.filter(r => r.studentId === currentUser.id);
  }, [currentUser.id, tuitionRecords]);

  // Generate unique period options from data
  const periodOptions = useMemo(() => {
      const options = myTuitionRecords.map(r => ({
          value: `${r.semester}|${r.academicYear}`,
          label: `${r.semester === 'HK1' ? 'Học kỳ 1' : r.semester === 'HK2' ? 'Học kỳ 2' : 'Hè'} ${r.academicYear}`
      }));
      // Filter unique based on value
      const uniqueOptions = options.filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
      
      if (uniqueOptions.length === 0) return [{ value: 'HK1|2025-2026', label: 'Học kỳ 1 2025-2026' }];
      return uniqueOptions;
  }, [myTuitionRecords]);

  // Auto-select
  useEffect(() => {
      if (periodOptions.length > 0) {
          const isValid = periodOptions.some(opt => opt.value === selectedPeriod);
          if (!isValid || !selectedPeriod) {
              setSelectedPeriod(periodOptions[0].value);
          }
      }
  }, [periodOptions, selectedPeriod]);

  // Get current selected record
  const currentRecord = useMemo(() => {
      if (!selectedPeriod) return null;
      const parts = selectedPeriod.split('|');
      if (parts.length < 2) return null;
      
      const sem = parts[0];
      const year = parts[1];
      
      return myTuitionRecords.find(r => r.semester === sem && r.academicYear === year);
  }, [selectedPeriod, myTuitionRecords]);

  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const PaymentModal = () => createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 text-lg">{t('tuition.paymentGuide')}</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                    <X className="h-5 w-5" />
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setPaymentTab('online')}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${paymentTab === 'online' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    {t('tuition.bankTransfer')}
                </button>
                <button 
                    onClick={() => setPaymentTab('offline')}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${paymentTab === 'offline' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    {t('tuition.cash')}
                </button>
            </div>

            <div className="p-6">
                {paymentTab === 'online' ? (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-indigo-200 flex flex-col items-center text-center">
                            {/* Mock QR */}
                            <div className="w-40 h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                                <img 
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=00020101021138570010A000000727012700069704220113190363290987650208QRIBFTTA53037045802VN63046D61" 
                                    alt="VietQR" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-indigo-900/10 pointer-events-none"></div>
                            </div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Quét mã VietQR</p>
                            <p className="text-[10px] text-gray-400 mt-1">Hỗ trợ tất cả ứng dụng ngân hàng</p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('tuition.bankName')}</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-indigo-500" /> Vietcombank
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 relative group cursor-pointer" onClick={() => handleCopy('19036329098765')}>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('tuition.accountNumber')}</p>
                                <p className="font-mono font-bold text-gray-900 text-lg tracking-wide">1903 6329 0987 65</p>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('tuition.accountName')}</p>
                                <p className="font-medium text-gray-900 uppercase">TRUONG THCS PHUOC TAN</p>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <p className="text-xs text-indigo-400 font-bold uppercase mb-1">{t('tuition.transferContent')}</p>
                                <p className="font-medium text-indigo-900 break-all">{currentUser.id} {currentUser.name} HK1 2526</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 text-center py-4">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
                            <CreditCard className="h-10 w-10" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">{t('tuition.cash')}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                {t('tuition.cashInstruction')}
                            </p>
                            <div className="bg-gray-50 rounded-xl p-4 inline-block border border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Giờ làm việc</p>
                                <p className="font-medium text-gray-900 text-sm">{t('tuition.officeHours')}</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 italic">
                            * Vui lòng giữ lại biên lai sau khi thanh toán.
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>,
    document.body
  );

  return (
    <div className="animate-fade-in pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('tuition.title')}</h2>
        <p className="text-gray-500 mt-1">{t('tuition.subtitle')}</p>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex items-center gap-4 max-w-md">
          <div className="flex items-center gap-2 text-indigo-600 font-bold px-2 whitespace-nowrap">
              <Filter className="h-5 w-5" />
              <span>{t('myClasses.time')}:</span>
          </div>
          <div className="relative w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select 
                  className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer font-medium text-gray-700 hover:bg-white transition-colors"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                  {periodOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
      </div>

      {currentRecord ? (
        <div className="space-y-8">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t('tuition.total')}</p>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Receipt className="h-5 w-5" /></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentRecord.totalAmount)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t('tuition.paid')}</p>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="h-5 w-5" /></div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(currentRecord.totalPaid)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t('tuition.remaining')}</p>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle className="h-5 w-5" /></div>
                    </div>
                    <p className="text-2xl font-bold text-rose-600">{formatCurrency(currentRecord.totalAmount - currentRecord.totalPaid)}</p>
                </div>
                
                {/* Pay Now Button Card */}
                {(() => {
                    const remainingAmount = currentRecord.totalAmount - currentRecord.totalPaid;
                    const isFullyPaid = remainingAmount <= 0;
                    
                    return (
                        <div 
                            onClick={() => !isFullyPaid && setIsPaymentModalOpen(true)}
                            className={`p-5 rounded-2xl shadow-lg flex flex-col justify-center items-center h-32 text-white transition-all ${
                                isFullyPaid 
                                ? 'bg-gray-400 cursor-not-allowed opacity-80' 
                                : 'bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-indigo-500/30 cursor-pointer hover:scale-[1.02] group'
                            }`}
                        >
                            <div className={`bg-white/20 p-2 rounded-full mb-2 ${!isFullyPaid && 'group-hover:bg-white/30'} transition-colors`}>
                                {isFullyPaid ? <CheckCircle className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                            </div>
                            <span className="font-bold text-lg">
                                {isFullyPaid ? t('tuition.paid') : t('tuition.payNow')}
                            </span>
                            {!isFullyPaid && (
                                <span className="text-xs opacity-80 flex items-center mt-1">
                                    Xem hướng dẫn <ArrowRight className="h-3 w-3 ml-1" />
                                </span>
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* Details Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Chi tiết khoản thu</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                        currentRecord.status === 'complete' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                        {currentRecord.status === 'complete' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase font-bold text-gray-500 bg-white border-b border-gray-100">
                                <th className="px-6 py-4">{t('tuition.item')}</th>
                                <th className="px-6 py-4 text-right">{t('tuition.cost')}</th>
                                <th className="px-6 py-4 text-right">{t('tuition.paid')}</th>
                                <th className="px-6 py-4 text-right">{t('tuition.remainingColumn')}</th>
                                <th className="px-6 py-4 text-center">{t('tuition.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentRecord.items.map(item => {
                                const remaining = item.amount - item.paidAmount;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                            {item.dueDate && <p className="text-xs text-gray-400 mt-0.5">{t('tuition.deadline')}: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {formatCurrency(item.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                            {formatCurrency(item.paidAmount)}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${remaining > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                                            {formatCurrency(remaining)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.status === 'paid' && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">Đã đóng</span>}
                                            {item.status === 'partial' && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">Đóng 1 phần</span>}
                                            {item.status === 'unpaid' && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">Chưa đóng</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      ) : (
        <div className="p-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Không có dữ liệu</h3>
            <p className="text-gray-500">Chưa có thông tin học phí cho khoảng thời gian này.</p>
        </div>
      )}
      
      {isPaymentModalOpen && <PaymentModal />}
    </div>
  );
};
