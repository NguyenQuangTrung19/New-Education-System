
import React from 'react';
import { ArrowRight, BookOpen, Users, LayoutDashboard, Calendar, Bell } from 'lucide-react';
import { SCHOOL_INFO } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { SchoolLogo } from '../components/SchoolLogo';

interface WelcomeProps {
  onComplete: (target?: string) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans" style={{background: 'linear-gradient(135deg, var(--theme-600) 0%, var(--theme-900) 100%)'}}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-30 rounded-full blur-[120px] -ml-20 -mb-20 pointer-events-none" style={{backgroundColor: 'var(--theme-800)'}}></div>
      
      {/* Navbar Stub */}
      <div className="relative z-10 px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-20 w-20 flex items-center justify-center overflow-visible drop-shadow-xl relative hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full opacity-60"></div>
                <SchoolLogo className="h-full w-full object-contain relative z-10" />
            </div>
            <span className="text-white font-extrabold text-2xl tracking-tight drop-shadow-md ml-2">{SCHOOL_INFO.name}</span>
         </div>
         <button className="text-white/90 hover:text-white text-sm font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md transition-colors border border-white/20">
            {t('guest.contact.support')}
         </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text & CTA */}
            <div className="text-left space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {t('welcome.portalAccess')}
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight drop-shadow-sm">
                    {t('welcome.hello')} <br/>
                    <span className="text-white/80">{t('welcome.ready')}</span>
                </h1>
                
                <p className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
                    {t('welcome.subtitle')}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => onComplete('dashboard')}
                      className="group bg-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
                      style={{color: 'var(--theme-700)'}}
                    >
                      {t('welcome.dashboardBtn')}
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => onComplete('notifications')}
                      className="px-8 py-4 rounded-2xl font-bold text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Bell className="h-5 w-5" />
                        {t('welcome.notifBtn')}
                    </button>
                </div>
            </div>

            {/* Right: Feature Cards (Visual) */}
            <div className="hidden md:grid grid-cols-2 gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="space-y-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-lg text-white hover:-translate-y-1 transition-transform cursor-default">
                        <LayoutDashboard className="h-8 w-8 mb-4 text-emerald-300" />
                        <h3 className="font-bold text-lg">{t('welcome.features.overview')}</h3>
                        <p className="text-xs text-white/70 mt-1">{t('welcome.features.overviewDesc')}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-lg text-white hover:-translate-y-1 transition-transform cursor-default">
                        <BookOpen className="h-8 w-8 mb-4 text-yellow-200" />
                        <h3 className="font-bold text-lg">{t('welcome.features.learning')}</h3>
                        <p className="text-xs text-white/70 mt-1">{t('welcome.features.learningDesc')}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-lg text-white hover:-translate-y-1 transition-transform cursor-default">
                        <Calendar className="h-8 w-8 mb-4 text-orange-300" />
                        <h3 className="font-bold text-lg">{t('welcome.features.schedule')}</h3>
                        <p className="text-xs text-white/70 mt-1">{t('welcome.features.scheduleDesc')}</p>
                    </div>
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-lg hover:-translate-y-1 transition-transform cursor-default" style={{color: 'var(--theme-700)'}}>
                        <Users className="h-8 w-8 mb-4" />
                        <h3 className="font-bold text-lg">{t('welcome.features.community')}</h3>
                        <p className="text-xs mt-1" style={{color: 'var(--theme-600)'}}>{t('welcome.features.communityDesc')}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="relative z-10 py-6 text-center text-white/50 text-xs font-medium">
        {t('welcome.copyright')}
      </div>
    </div>
  );
};
