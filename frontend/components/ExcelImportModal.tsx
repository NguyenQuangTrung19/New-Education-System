
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import api from '../src/api/client';
import { useLanguage } from '../contexts/LanguageContext';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'students' | 'teachers' | 'classes';
  onSuccess: () => void;
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose, type, onSuccess }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
      setSuccessCount(null);
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
        alert(t('import.downloadFailed') || 'Download failed');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setErrors([]);
    setSuccessCount(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/imports/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessCount(response.data.count);
      setTimeout(() => {
          onSuccess();
          onClose();
      }, 2000);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors([{ error: 'Unknown error occurred or server unavailable.' }]);
      }
    } finally {
      setUploading(false);
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
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
            <button onClick={onClose} className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full">
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
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />
                    
                    {file ? (
                        <div className="text-center">
                            <FileSpreadsheet className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
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

            {/* Success Message */}
            {successCount !== null && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                    <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                    <div>
                        <h4 className="font-bold text-green-800 text-sm">Import Successful!</h4>
                        <p className="text-sm text-green-700">{successCount} records have been imported.</p>
                    </div>
                </div>
            )}

            {/* Error List */}
            {errors.length > 0 && (
                <div className="mt-6">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-t-xl flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h4 className="font-bold text-red-800 text-sm">Validation Errors ({errors.length})</h4>
                    </div>
                    <div className="border-x border-b border-red-200 rounded-b-xl max-h-48 overflow-y-auto bg-white">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-red-50/50 text-red-900 font-semibold sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Row</th>
                                    <th className="px-4 py-2">Column</th>
                                    <th className="px-4 py-2">Issue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100">
                                {errors.map((err, idx) => (
                                    <tr key={idx} className="hover:bg-red-50/30">
                                        <td className="px-4 py-2 font-mono text-red-700">{err.row}</td>
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
            <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition shadow-sm">
                {t('common.cancel')}
            </button>
            <button 
                onClick={handleUpload} 
                disabled={!file || uploading || successCount !== null}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 shadow-sm transition"
            >
                {uploading ? t('common.saving') : t('import.upload')}
            </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ExcelImportModal;
