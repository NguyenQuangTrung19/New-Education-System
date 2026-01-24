
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, User as UserIcon, ArrowRight, UserCog, Eye, EyeOff, ShieldCheck, GraduationCap, Info, MapPin, Phone, Globe, X, Code, Heart, History, Award, Facebook, Linkedin, Github, Mail } from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { SCHOOL_INFO } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../src/api/client';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

type InfoTab = 'about' | 'contact' | 'credit';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [username, setUsername] = useState('sarah.connor');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Info Modal States
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>('about');

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Pre-fill for demo purposes based on seed data
    if (newRole === UserRole.TEACHER) {
      setUsername('sarah.connor');
      setPassword('password123');
    } else if (newRole === UserRole.STUDENT) {
      setUsername('alice.j');
      setPassword('password123');
    } else {
        // Admin user not seeded yet, fallback
      setUsername('admin');
      setPassword('password');
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { username, password, role });
      const { access_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      
      // Transform backend user to frontend user type if needed
      // Backend user: { id, username, role, teacher: { id, ... }, student: { id, ... } }
      // Frontend User: { id, name, email, role, ... }
      
      const frontendUser: UserType = {
        id: user.teacher?.id || user.student?.id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        classId: user.student?.classId
      };

      localStorage.setItem('user_data', JSON.stringify(frontendUser));
      onLogin(frontendUser);
    } catch (err: any) {
      console.error('Login failed', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (tab: InfoTab) => {
      setActiveInfoTab(tab);
      setShowInfoModal(true);
  };

  // --- INFO MODAL FOR GUESTS ---
  const InfoModal = () => createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in relative flex flex-col max-h-[90vh]">
            
            {/* Header Image */}
            <div className="h-32 bg-gradient-to-r from-glacier-lake to-glacier-dark relative shrink-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <button 
                    onClick={() => setShowInfoModal(false)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm z-50"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="absolute -bottom-10 left-8 flex items-end">
                    <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-lg">
                        <img 
                            src={SCHOOL_INFO.logo} 
                            onError={(e) => {e.currentTarget.src = SCHOOL_INFO.logoFallback}}
                            alt="Logo" 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                    <div className="ml-4 mb-2 text-white drop-shadow-md">
                        <h2 className="text-2xl font-black tracking-tight">{SCHOOL_INFO.name}</h2>
                        <p className="text-xs font-medium text-white/90 uppercase tracking-wider">{t('guest.title')}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-12 px-8 border-b border-gray-100 flex gap-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveInfoTab('about')}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeInfoTab === 'about' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
                >
                    {t('guest.tab.about')}
                </button>
                <button 
                    onClick={() => setActiveInfoTab('contact')}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeInfoTab === 'contact' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
                >
                    {t('guest.tab.contact')}
                </button>
                <button 
                    onClick={() => setActiveInfoTab('credit')}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeInfoTab === 'credit' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
                >
                    {t('guest.tab.credit')}
                </button>
            </div>

            {/* Content Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
                
                {/* TAB: ABOUT */}
                {activeInfoTab === 'about' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="prose prose-sm max-w-none text-gray-600">
                            <h3 className="flex items-center text-lg font-bold text-gray-900 mb-3">
                                <History className="h-5 w-5 mr-2 text-indigo-500" /> {t('guest.about.history')}
                            </h3>
                            <p className="leading-relaxed text-justify mb-4">
                                {t('guest.about.historyDesc')}
                            </p>
                            
                            <h3 className="flex items-center text-lg font-bold text-gray-900 mb-3">
                                <Award className="h-5 w-5 mr-2 text-yellow-500" /> {t('guest.about.achievements')}
                            </h3>
                            <ul className="space-y-2 list-none pl-0">
                                <li className="flex items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="h-5 w-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 shrink-0 text-xs font-bold">1</div>
                                    <span>{t('guest.about.ach1')}</span>
                                </li>
                                <li className="flex items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="h-5 w-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 shrink-0 text-xs font-bold">2</div>
                                    <span>{t('guest.about.ach2')}</span>
                                </li>
                                <li className="flex items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="h-5 w-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 shrink-0 text-xs font-bold">3</div>
                                    <span>{t('guest.about.ach3')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* TAB: CONTACT */}
                {activeInfoTab === 'contact' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                                    <MapPin className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">{t('guest.contact.address')}</h4>
                                <p className="text-sm text-gray-600">123 Đường Giáo Dục, Phường Phước Tân, TP. Biên Hòa, Đồng Nai</p>
                            </div>
                            
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                    <Phone className="h-5 w-5 text-emerald-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">{t('guest.contact.hotline')}</h4>
                                <p className="text-sm text-gray-600 font-medium">(0251) 3999 888</p>
                                <p className="text-xs text-gray-400 mt-1">{t('guest.contact.support')}</p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">{t('guest.contact.email')}</h4>
                                <p className="text-sm text-gray-600">contact@thcsphuoctan.edu.vn</p>
                                <p className="text-sm text-gray-600">admissions@thcsphuoctan.edu.vn</p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                                    <Globe className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">{t('guest.contact.social')}</h4>
                                <p className="text-sm text-indigo-600 hover:underline cursor-pointer">www.thcsphuoctan.edu.vn</p>
                                <div className="flex gap-3 mt-2">
                                    <Facebook className="h-5 w-5 text-blue-700 cursor-pointer hover:scale-110 transition-transform" />
                                    <div className="h-5 w-5 bg-red-600 rounded text-white flex items-center justify-center font-bold text-[10px] cursor-pointer hover:scale-110 transition-transform">YT</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Map Placeholder */}
                        <div className="bg-gray-200 h-48 rounded-2xl w-full flex items-center justify-center relative overflow-hidden group cursor-pointer border border-gray-300">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700"></div>
                            <button className="bg-white/90 text-gray-800 px-4 py-2 rounded-xl font-bold shadow-lg z-10 hover:bg-white flex items-center gap-2 text-sm backdrop-blur-sm">
                                <MapPin className="h-4 w-4 text-red-500" /> {t('guest.contact.mapBtn')}
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB: CREDIT */}
                {activeInfoTab === 'credit' && (
                    <div className="space-y-6 animate-fade-in flex flex-col items-center justify-center py-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative h-32 w-32 rounded-full border-4 border-white shadow-xl overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                                    <UserIcon className="h-16 w-16" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-md">
                                <Code className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-gray-900">Nguyễn Quang Trung</h3>
                            <p className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-xs inline-block uppercase tracking-wider">{t('guest.credit.role')}</p>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                                {t('guest.credit.quote')}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('guest.credit.version')}</p>
                                <p className="text-gray-900 font-bold">EduSphere v2.5</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('guest.credit.tech')}</p>
                                <p className="text-gray-900 font-bold">React + Tailwind</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <a href="#" className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-3 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-3 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                        
                        <div className="mt-8 text-xs text-gray-400 flex items-center">
                            Made with <Heart className="h-3 w-3 text-red-500 mx-1 fill-current animate-pulse" /> for Education
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                <button 
                    onClick={() => setShowInfoModal(false)}
                    className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg text-sm"
                >
                    {t('guest.close')}
                </button>
            </div>
        </div>
    </div>,
    document.body
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans p-4">
      {/* Background Image - Students and Teachers */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop" 
            alt="School Campus" 
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-glacier-lake/90 via-[#5D8BAE]/80 to-slate-900/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/40 animate-fade-in-up relative overflow-hidden">
          
          {/* Glass Reflection Highlight */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

          {/* Logo Area */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-ice-white shadow-xl mb-6 transform hover:scale-105 transition-transform duration-500 ring-4 ring-white/30">
               <img 
                 src={SCHOOL_INFO.logo} 
                 onError={(e) => {e.currentTarget.src = SCHOOL_INFO.logoFallback}}
                 alt={SCHOOL_INFO.name} 
                 className="h-16 w-16 object-contain" 
               />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase drop-shadow-md">{SCHOOL_INFO.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
                <GraduationCap className="h-5 w-5 text-white" />
                <p className="text-white/90 text-sm font-bold tracking-wide">{t('login.title')}</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="bg-black/20 p-1.5 rounded-2xl mb-8 flex relative backdrop-blur-sm border border-white/10">
              {[
                  { r: UserRole.ADMIN, icon: ShieldCheck, label: t('login.role.admin') },
                  { r: UserRole.TEACHER, icon: UserIcon, label: t('login.role.teacher') },
                  { r: UserRole.STUDENT, icon: GraduationCap, label: t('login.role.student') }
              ].map((item) => (
                  <button 
                      key={item.r}
                      type="button"
                      onClick={() => handleRoleChange(item.r)}
                      className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-xl transition-all duration-300 relative z-10 ${role === item.r ? 'bg-ice-white text-glacier-dark shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                  >
                      <item.icon className={`h-4 w-4 mr-1.5 ${role === item.r ? 'text-glacier-lake' : ''}`} /> 
                      {item.label}
                  </button>
              ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl text-white text-sm text-center font-medium backdrop-blur-sm">
                    {error}
                </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg transition-all font-medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider ml-1">{t('login.label.password')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-12 pr-12 py-3.5 bg-white border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none z-10"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-xl shadow-glacier-lake/20 text-sm font-bold text-white bg-gradient-to-r from-glacier-lake to-glacier-dark hover:from-glacier-dark hover:to-glacier-lake focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-glacier-lake focus:ring-white transition-all transform active:scale-[0.98] mt-4 ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {loading ? (
                <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    {t('login.loading')}
                </div>
              ) : (
                <>
                  {t('login.btn.signin')} <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest / Info Links */}
          <div className="mt-6 pt-6 border-t border-white/10">
             <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-white/60">
                <button onClick={() => openModal('about')} className="hover:text-white transition-colors flex items-center gap-1">
                    <Info className="h-3 w-3" /> {t('guest.tab.about')}
                </button>
                <div className="w-px bg-white/20 h-4 hidden sm:block"></div>
                <button onClick={() => openModal('contact')} className="hover:text-white transition-colors flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {t('guest.tab.contact')}
                </button>
                <div className="w-px bg-white/20 h-4 hidden sm:block"></div>
                <button onClick={() => openModal('credit')} className="hover:text-white transition-colors flex items-center gap-1">
                    <Code className="h-3 w-3" /> {t('guest.tab.credit')}
                </button>
             </div>
          </div>
        </div>
        
        {/* Simple Copyright Footer */}
        <div className="text-center mt-8">
            <p className="text-white/50 text-xs font-medium">
              © 2024 {SCHOOL_INFO.name}. {t('login.developer')} <span className="text-white/80">Nguyễn Quang Trung</span>
            </p>
        </div>
      </div>

      {showInfoModal && <InfoModal />}
    </div>
  );
};
