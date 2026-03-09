
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Download, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../src/api/client';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'students' | 'teachers' | 'classes';
  onSuccess: () => void;
}

const BATCH_SIZE = 30;

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose, type, onSuccess }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; count: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
      setSuccessCount(null);
      setProgress(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        setErrors([]);
        setSuccessCount(null);
        setProgress(null);
      } else {
        showToast('error', t('import.invalidFile') || 'Vui lòng chọn file Excel tĩnh hợp lệ (.xlsx, .xls)');
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
        const response = await api.get(`/imports/template/${type}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_import_template.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Download failed', error);
        showToast('error', t('import.downloadFailed') || 'Download failed');
    }
  };

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setErrors([]);
    setSuccessCount(null);
    setProgress(null);
    abortRef.current = false;

    try {
      // Step 1: Parse Excel on the client side
      const allData = await parseExcelFile(file);
      
      if (allData.length === 0) {
        setErrors([{ error: 'File không có dữ liệu.' }]);
        setUploading(false);
        return;
      }

      // Step 2: Split into batches
      const batches: any[][] = [];
      for (let i = 0; i < allData.length; i += BATCH_SIZE) {
        batches.push(allData.slice(i, i + BATCH_SIZE));
      }

      const totalBatches = batches.length;
      let totalImported = 0;
      const allErrors: any[] = [];

      setProgress({ current: 0, total: totalBatches, count: 0 });

      // Step 3: Send batches sequentially
      for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
        if (abortRef.current) break;

        try {
          const response = await api.post(`/imports/upload-batch/${type}`, {
            data: batches[batchIdx],
            batchIndex: batchIdx,
            totalBatches,
          });
          
          totalImported += response.data.count || 0;
          if (response.data.errors && response.data.errors.length > 0) {
            allErrors.push(...response.data.errors);
          }
        } catch (error: any) {
          if (error.response?.data?.errors) {
            allErrors.push(...error.response.data.errors);
          } else if (error.response?.data?.message) {
            // Validation failed for this batch - add as a batch-level error
            const batchStart = batchIdx * BATCH_SIZE + 2;
            const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, allData.length + 1);
            allErrors.push({ 
              error: `Batch ${batchIdx + 1} (dòng ${batchStart}-${batchEnd}): ${error.response.data.message}`,
              ...(error.response.data.errors ? {} : {})
            });
            // If it's a validation error, the batch data was rejected but we can continue
            if (error.response?.data?.errors) {
              allErrors.push(...error.response.data.errors);
            }
          } else {
            allErrors.push({ error: `Batch ${batchIdx + 1}: Lỗi không xác định hoặc server không phản hồi.` });
          }
        }

        setProgress({ current: batchIdx + 1, total: totalBatches, count: totalImported });
      }

      // Step 4: Show results
      if (allErrors.length > 0) {
        setErrors(allErrors);
      }
      
      if (totalImported > 0) {
        setSuccessCount(totalImported);
        setTimeout(() => {
          onSuccess();
          if (allErrors.length === 0) {
            onClose();
          }
        }, 2500);
      } else if (allErrors.length === 0) {
        setErrors([{ error: 'Không có dữ liệu nào được import.' }]);
      }

    } catch (error: any) {
      console.error('Import error:', error);
      setErrors([{ error: 'Lỗi khi đọc file Excel. Vui lòng kiểm tra file và thử lại.' }]);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (uploading) {
      abortRef.current = true;
    } else {
      onClose();
    }
  };

  const getTitle = () => {
      switch(type) {
          case 'students': return t('menu.students');
          case 'teachers': return t('menu.teachers');
          case 'classes': return t('menu.classes');
          default: return '';
      }
  };

  // Detect row count from parsed file for showing warning
  const [parsedRowCount, setParsedRowCount] = useState<number | null>(null);
  
  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrors([]);
    setSuccessCount(null);
    setProgress(null);
    
    // Quick parse to get row count for warning
    try {
      const data = await parseExcelFile(selectedFile);
      setParsedRowCount(data.length);
    } catch {
      setParsedRowCount(null);
    }
  };

  const handleFileChangeWithCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleDropWithCount = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        handleFileSelected(droppedFile);
      } else {
        showToast('error', t('import.invalidFile') || 'Vui lòng chọn file Excel tĩnh hợp lệ (.xlsx, .xls)');
      }
    }
  };

  const progressPercent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={uploading ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileSpreadsheet className="h-6 w-6" />
                    {t('import.title') || 'Import from Excel'} - {getTitle()}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">{t('import.subtitle') || 'Upload your Excel file to import data in bulk.'}</p>
            </div>
            <button onClick={uploading ? undefined : onClose} className={`text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={uploading}>
                <X className="h-6 w-6" />
            </button>
        </div>

        {/* content */}
        <div className="p-8 overflow-y-auto">
            
            {/* Template Download Step */}
            <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm">{t('import.step1') || 'Step 1: Get the Template'}</h3>
                    <p className="text-xs text-indigo-700 mt-1">{t('import.step1desc') || 'Download the standard template to ensure correct data formatting.'}</p>
                </div>
                <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition shadow-sm text-sm font-medium">
                    <Download className="h-4 w-4" />
                    {t('import.downloadTemplate') || 'Download Template'}
                </button>
            </div>

            {/* Upload Step */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-sm">{t('import.step2') || 'Step 2: Upload File'}</h3>
                
                <div 
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropWithCount}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${file ? 'border-indigo-400 bg-indigo-50/50' : isDragging ? 'border-indigo-500 bg-indigo-100' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChangeWithCount} accept=".xlsx, .xls" className="hidden" />
                    
                    {file ? (
                        <div className="text-center">
                            <FileSpreadsheet className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(file.size / 1024).toFixed(1)} KB
                              {parsedRowCount !== null && ` • ${parsedRowCount} dòng dữ liệu`}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                            <p className="font-medium text-gray-600">{t('import.dragDrop') || 'Click to select or drag file here'}</p>
                            <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Large file warning */}
            {parsedRowCount !== null && parsedRowCount > 50 && !uploading && successCount === null && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-amber-800 text-sm">Lưu ý khi import dữ liệu lớn</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Để đảm bảo hệ thống hoạt động ổn định, dữ liệu ({parsedRowCount} dòng) sẽ được tự động chia nhỏ thành {Math.ceil(parsedRowCount / BATCH_SIZE)} nhóm 
                          và import lần lượt. Quá trình có thể mất vài phút, vui lòng không đóng cửa sổ này.
                        </p>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {progress && uploading && (
                <div className="mt-6 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">
                          Đang import... ({progress.current}/{progress.total} nhóm)
                        </span>
                        <span className="text-indigo-600 font-bold">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                      Đã import thành công {progress.count} bản ghi
                    </p>
                </div>
            )}

            {/* Success Message */}
            {successCount !== null && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                    <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                    <div>
                        <h4 className="font-bold text-green-800 text-sm">Import thành công!</h4>
                        <p className="text-sm text-green-700">{successCount} bản ghi đã được import vào hệ thống.</p>
                    </div>
                </div>
            )}

            {/* Error List */}
            {errors.length > 0 && (
                <div className="mt-6">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-t-xl flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h4 className="font-bold text-red-800 text-sm">Lỗi ({errors.length})</h4>
                    </div>
                    <div className="border-x border-b border-red-200 rounded-b-xl max-h-48 overflow-y-auto bg-white">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-red-50/50 text-red-900 font-semibold sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Dòng</th>
                                    <th className="px-4 py-2">Cột</th>
                                    <th className="px-4 py-2">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100">
                                {errors.map((err, idx) => (
                                    <tr key={idx} className="hover:bg-red-50/30">
                                        <td className="px-4 py-2 font-mono text-red-700">{err.row || '-'}</td>
                                        <td className="px-4 py-2 text-gray-700">{err.column || '-'}</td>
                                        <td className="px-4 py-2 text-red-600">{err.error}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button 
              onClick={handleCancel} 
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition shadow-sm"
            >
                {uploading ? 'Hủy import' : t('common.cancel')}
            </button>
            <button 
                onClick={handleUpload} 
                disabled={!file || uploading || successCount !== null}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 shadow-sm transition"
            >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (t('import.upload') || 'Upload & Import')}
            </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ExcelImportModal;
