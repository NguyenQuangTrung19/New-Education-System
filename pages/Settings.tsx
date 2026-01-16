
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme, ThemeName } from '../contexts/ThemeContext';
import { Palette, Globe, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeName; name: string; color: string; colorDark: string }[] = [
    { id: 'glacier', name: t('settings.theme.glacier'), color: '#80B1D3', colorDark: '#5D8BAE' },
    { id: 'rose', name: t('settings.theme.rose'), color: '#C2458E', colorDark: '#9D3270' },
    { id: 'sky', name: t('settings.theme.sky'), color: '#87CEEB', colorDark: '#5DADEC' },
    { id: 'midnight', name: t('settings.theme.midnight'), color: '#21244D', colorDark: '#E350A8' }
  ];

  return (
    <div className="animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('settings.title')}</h2>
        <p className="text-gray-500 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t('settings.theme')}</h3>
              <p className="text-xs text-gray-500">{t('settings.themeDesc')}</p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {themes.map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setTheme(tItem.id)}
                className={`relative group rounded-xl border-2 transition-all duration-300 overflow-hidden text-left hover:shadow-md ${
                  theme === tItem.id 
                  ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Preview Banner */}
                <div 
                  className="h-24 w-full flex items-center justify-center relative"
                  style={{ background: `linear-gradient(135deg, ${tItem.color} 0%, ${tItem.colorDark} 100%)` }}
                >
                  {theme === tItem.id && (
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-sm">
                      <Check className="h-6 w-6 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <span className={`font-bold block ${theme === tItem.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {tItem.name}
                  </span>
                  <div className="flex gap-2 mt-2">
                     <div className="w-6 h-6 rounded-full border border-gray-100" style={{ backgroundColor: tItem.color }}></div>
                     <div className="w-6 h-6 rounded-full border border-gray-100" style={{ backgroundColor: tItem.colorDark }}></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t('settings.language')}</h3>
              <p className="text-xs text-gray-500">{t('settings.languageDesc')}</p>
            </div>
          </div>
          
          <div className="p-6 flex flex-col sm:flex-row gap-4">
             <button 
                onClick={() => setLanguage('vi')}
                className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                   language === 'vi' 
                   ? 'border-indigo-500 bg-indigo-50 text-indigo-800' 
                   : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
             >
                <div className="flex items-center gap-3">
                   <span className="text-2xl">🇻🇳</span>
                   <span className="font-bold">Tiếng Việt</span>
                </div>
                {language === 'vi' && <Check className="h-5 w-5 text-indigo-600" />}
             </button>

             <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                   language === 'en' 
                   ? 'border-indigo-500 bg-indigo-50 text-indigo-800' 
                   : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
             >
                <div className="flex items-center gap-3">
                   <span className="text-2xl">🇺🇸</span>
                   <span className="font-bold">English</span>
                </div>
                {language === 'en' && <Check className="h-5 w-5 text-indigo-600" />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
