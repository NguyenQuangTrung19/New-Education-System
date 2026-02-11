
import React, { useMemo, useState, useEffect } from 'react';
import { 
  SCHOOL_INFO
} from '../constants';
import { 
  Users, 
  GraduationCap, 
  School, 
  Calendar, 
  ArrowRight, 
  Award, 
  BookOpen, 
  Trophy,
  PlusCircle,
  BookUser,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { Notification, User, UserRole, ScheduleItem, Subject, ClassGroup } from '../types';
import api from '../src/api/client';

interface DashboardProps {
  onNavigate: (page: string) => void;
  notifications: Notification[];
  currentUser?: User | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  theme: 'glacier' | 'mint' | 'coral' | 'lavender';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtext, trend, trendValue, theme }) => {
    // Harmonized themes based on Glacier Lake
    const themeStyles = {
        glacier: { 
            bg: 'from-glacier-lake to-glacier-dark', // #80B1D3 -> Darker
            iconBg: 'bg-primary-50 text-glacier-lake',
            trendColor: 'text-glacier-dark bg-primary-50'
        },
        mint: { 
            bg: 'from-soft-mint to-emerald-400', // #88D8B0
            iconBg: 'bg-emerald-50 text-emerald-500',
            trendColor: 'text-emerald-600 bg-emerald-50'
        },
        coral: { 
            bg: 'from-muted-coral to-orange-400', // #FF8E85
            iconBg: 'bg-orange-50 text-orange-500',
            trendColor: 'text-orange-600 bg-orange-50'
        },
        lavender: { 
            bg: 'from-lavender-mist to-indigo-400', // #B5B9D9
            iconBg: 'bg-indigo-50 text-indigo-500',
            trendColor: 'text-indigo-600 bg-indigo-50'
        },
    };

    const style = themeStyles[theme];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            {/* Soft decorative background blob */}
            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${style.bg} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3.5 rounded-2xl ${style.iconBg} shadow-sm`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${style.trendColor}`}>
                            <ArrowUpRight className="h-3 w-3" /> {trendValue}
                        </div>
                    )}
                </div>
                
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">{title}</p>
                {subtext && <p className="text-xs text-slate-400 mt-2 font-medium">{subtext}</p>}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, notifications, currentUser }) => {
  const { t } = useLanguage();
  const isStudent = currentUser?.role === UserRole.STUDENT;

  // Real Data State
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [teachersData, setTeachersData] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, tRes, cRes, subRes, schRes] = await Promise.all([
          api.get('/students'),
          api.get('/teachers'),
          api.get('/classes'),
          api.get('/subjects'),
          api.get('/schedule')
        ]);

        // Transform data to match frontend interfaces (flatten user relation)
        const mappedStudents = sRes.data.map((s: any) => ({
          ...s,
          name: s.user?.name || 'Unknown',
          email: s.user?.email || '',
          avatarUrl: s.user?.avatarUrl
        }));

        setStudentsData(mappedStudents);
        setTeachersData(tRes.data);
        setClassesData(cRes.data);
        setSubjectsData(subRes.data);
        setScheduleData(schRes.data);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // --- Student Dashboard Logic ---
  const [carouselIndex, setCarouselIndex] = useState(0);
  const bannerNotifications = useMemo(() => notifications.filter(n => n.bannerImage), [notifications]);
  
  useEffect(() => {
    if (bannerNotifications.length > 1) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % bannerNotifications.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [bannerNotifications]);

  // Assignment Stats (Placeholder until Assignments API is fully ready)
  const assignmentStats = useMemo(() => {
    return {
      pending: 0,
      submitted: 0,
      late: 0
    };
  }, []);

  // Leaderboard Logic (Using fetched studentsData)
  const [leaderboardScope, setLeaderboardScope] = useState<'class' | 'grade' | 'school'>('class');
  const studentRankings = useMemo(() => {
    if (loading) return [];
    
    let list = [...studentsData];
    // In a real app, strict filtering by scope would happen here
    // For now we just return top 5 by GPA
    return list.sort((a, b) => (b.gpa || 0) - (a.gpa || 0)).slice(0, 5).map((s, idx) => ({ ...s, rank: idx + 1 }));
  }, [leaderboardScope, currentUser, studentsData, loading]);


  // --- Admin/Teacher Calculations (Using fetched data) ---
  const totalStudents = studentsData.length;
  const totalTeachers = teachersData.length;
  const totalClasses = classesData.length;
  // Calculate Avg GPA safely
  const avgGpa = useMemo(() => {
      if (totalStudents === 0) return "0.00";
      return (studentsData.reduce((acc, s) => acc + (s.gpa || 0), 0) / totalStudents).toFixed(2);
  }, [studentsData, totalStudents]);
  
  const weeklyPerformanceData = useMemo(() => {
     // Placeholder data
    return [1, 2, 3, 4].map(week => ({
      week: `Week ${week}`,
      score: 85 + Math.random() * 10 
    }));
  }, []);

  // Compute gender distribution from real data
  const genderData = useMemo(() => {
      if(studentsData.length === 0) return [{ name: 'Male', value: 0 }, { name: 'Female', value: 0 }];
      const male = studentsData.filter(s => s.gender === 'Male').length;
      const female = studentsData.filter(s => s.gender === 'Female').length;
      return [
        { name: 'Male', value: male },
        { name: 'Female', value: female }
      ];
  }, [studentsData]);
  
  // Harmonized Chart Colors: Glacier Lake, Soft Mint, Muted Coral, Lavender
  const COLORS = ['#80B1D3', '#88D8B0', '#FF8E85', '#B5B9D9'];

  // --- Student Dashboard Render ---
  if (isStudent) {
    const nextLesson = scheduleData.find(s => s.classId === currentUser?.classId && s.day === 'Monday' && s.period === 1); 
    
    return (
      <div className="space-y-8 animate-fade-in-up pb-10">
        {/* Banner Carousel */}
        {bannerNotifications.length > 0 && (
          <div className="relative w-full h-72 rounded-[2rem] overflow-hidden shadow-2xl group ring-4 ring-white">
             {bannerNotifications.map((note, index) => (
                <div 
                  key={note.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === carouselIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                   <img src={note.bannerImage} alt={note.title} className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[20s]" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-10">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="bg-glacier-lake/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 block border border-white/20">{note.type.toUpperCase()}</span>
                        <h2 className="text-4xl font-black text-white mb-2 leading-tight drop-shadow-md">{note.title}</h2>
                        <p className="text-slate-200 text-lg line-clamp-2 max-w-3xl font-medium">{note.message}</p>
                      </div>
                   </div>
                </div>
             ))}
             <div className="absolute bottom-6 right-8 flex gap-2">
                {bannerNotifications.map((_, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => setCarouselIndex(idx)}
                     className={`h-1.5 rounded-full transition-all duration-300 ${idx === carouselIndex ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/80'}`}
                   />
                ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Assignment Stats - Using Soft Mint/Coral for status */}
           <div className="md:col-span-2 bg-white rounded-3xl shadow-soft border border-slate-100 p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-xl flex items-center"><BookOpen className="h-6 w-6 mr-3 text-glacier-lake"/> {t('dashboard.assignments.status')}</h3>
                  <button onClick={() => onNavigate('student-class')} className="text-sm font-bold text-glacier-lake hover:bg-primary-50 px-4 py-2 rounded-xl transition-colors">{t('dashboard.assignments.viewAll')}</button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                 <div className="bg-orange-50 rounded-2xl p-5 text-center border border-orange-100 hover:shadow-md transition-shadow">
                    <p className="text-4xl font-black text-orange-400 mb-1">{assignmentStats.pending}</p>
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">{t('dashboard.assignments.pending')}</p>
                 </div>
                 <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-100 hover:shadow-md transition-shadow">
                    <p className="text-4xl font-black text-soft-mint mb-1">{assignmentStats.submitted}</p>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{t('dashboard.assignments.done')}</p>
                 </div>
                 <div className="bg-rose-50 rounded-2xl p-5 text-center border border-rose-100 hover:shadow-md transition-shadow">
                    <p className="text-4xl font-black text-muted-coral mb-1">{assignmentStats.late}</p>
                    <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">{t('dashboard.assignments.late')}</p>
                 </div>
              </div>
           </div>

           {/* Timetable - Glacier Lake Gradient */}
           <div className="relative group overflow-hidden rounded-3xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-glacier-lake to-glacier-dark transition-all duration-500 group-hover:scale-105"></div>
              {/* Circles decoration */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                  <div>
                     <div className="flex items-center gap-2 mb-1 opacity-80">
                        <Calendar className="h-5 w-5"/>
                        <span className="text-sm font-bold uppercase tracking-wide">{t('dashboard.timetable.nextUp')}</span>
                     </div>
                     <p className="text-white/80 text-sm font-medium">Monday, Period 1</p>
                  </div>
                  
                  <div className="py-6">
                     <h2 className="text-3xl font-black leading-tight mb-2">
                        {nextLesson ? subjectsData.find(s=>s.id === nextLesson.subjectId)?.name : t('dashboard.timetable.freePeriod')}
                     </h2>
                     <div className="flex items-center gap-2 text-white bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-sm border border-white/20">
                        <School className="h-4 w-4"/> 
                        <span className="font-mono text-sm">{t('dashboard.timetable.room')} {nextLesson?.room || 'N/A'}</span>
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => onNavigate('timetable')} 
                    className="bg-white text-glacier-dark w-full py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition shadow-lg flex items-center justify-center gap-2"
                  >
                     {t('dashboard.timetable.viewTimetable')} <ArrowRight className="h-4 w-4"/>
                  </button>
              </div>
           </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-8">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-yellow-50 rounded-xl text-yellow-500 border border-yellow-100">
                    <Trophy className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900">{t('dashboard.leaderboard.title')}</h3>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-xl flex text-sm font-bold border border-slate-100">
                 {['class', 'grade', 'school'].map((scope) => (
                    <button 
                       key={scope}
                       onClick={() => setLeaderboardScope(scope as any)}
                       className={`px-5 py-2 rounded-lg transition-all capitalize ${leaderboardScope === scope ? 'bg-white text-glacier-dark shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       {t(`dashboard.leaderboard.${scope}` as any)}
                    </button>
                 ))}
              </div>
           </div>

           <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                    <tr>
                       <th className="px-6 py-4 text-center w-20">{t('dashboard.leaderboard.rank')}</th>
                       <th className="px-6 py-4">{t('dashboard.leaderboard.student')}</th>
                       <th className="px-6 py-4 text-center">{t('dashboard.leaderboard.class')}</th>
                       <th className="px-6 py-4 text-right">{t('dashboard.leaderboard.gpa')}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                    {studentRankings.map((student) => {
                       const isMe = student.id === currentUser?.id;
                       return (
                          <tr key={student.id} className={`transition-colors ${isMe ? 'bg-primary-50/60' : 'hover:bg-slate-50'}`}>
                             <td className="px-6 py-4 text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mx-auto shadow-sm ${
                                   student.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white' :
                                   student.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                                   student.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                                   'bg-white border border-slate-200 text-slate-500'
                                }`}>
                                   {student.rank}
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="font-bold text-slate-800 text-sm">{student.name} {isMe && <span className="ml-2 text-xs font-medium text-glacier-lake bg-primary-100 px-2 py-0.5 rounded-full">{t('dashboard.leaderboard.you')}</span>}</div>
                             </td>
                             <td className="px-6 py-4 text-center text-sm font-medium text-slate-500">
                                {classesData.find((c: any) => c.id === student.classId)?.name}
                             </td>
                             <td className="px-6 py-4 text-right font-black text-slate-800">
                                {student.gpa.toFixed(1)}
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  }

  // --- Admin/Teacher Dashboard Render ---
  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Welcome Banner - Glacier Lake Gradient */}
      <div className="bg-gradient-to-r from-glacier-lake to-glacier-dark rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-glacier-lake/20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-900 rounded-full blur-[100px] opacity-30 -ml-20 -mb-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
                      <Sparkles className="h-3 w-3" /> {t('dashboard.welcome.overview')}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight">{t('dashboard.welcome.message')} {currentUser?.name}</h2>
                  <p className="text-sky-100 text-lg font-medium max-w-xl">{t('dashboard.welcome.subtitle').replace('{school}', SCHOOL_INFO.name)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-white" />
                  <span className="font-bold text-sm tracking-wide">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.totalStudents')} value={totalStudents.toLocaleString()} icon={Users} theme="glacier" trend="up" trendValue="12%" />
        <StatCard title={t('dashboard.totalTeachers')} value={totalTeachers} icon={GraduationCap} theme="mint" subtext={`${subjectsData.length} Departments`} />
        <StatCard title={t('dashboard.activeClasses')} value={totalClasses} icon={School} theme="coral" subtext={`~${totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0} per class`} />
        <StatCard title={t('dashboard.stats.avgGpa')} value={avgGpa} icon={Award} theme="lavender" trend="up" trendValue="0.2 pts" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
             { label: t('dashboard.actions.addTeacher'), sub: t('dashboard.actions.manageFaculty'), icon: PlusCircle, color: 'text-glacier-lake', bg: 'bg-primary-50', link: 'teachers' },
             { label: t('dashboard.actions.enrolStudent'), sub: t('dashboard.actions.admissions'), icon: BookUser, color: 'text-soft-mint', bg: 'bg-emerald-50', link: 'students' },
         ].map((action, idx) => (
             <button 
                key={idx}
                onClick={() => onNavigate(action.link)} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all text-left flex items-center group"
             >
                <div className={`h-12 w-12 rounded-xl ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-glacier-dark transition-colors">{action.label}</h4>
                    <p className="text-xs text-slate-500 font-medium">{action.sub}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-slate-300 group-hover:text-glacier-lake group-hover:translate-x-1 transition-all" />
             </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-soft border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900">{t('dashboard.charts.weeklyPerformance')}</h3>
              <select className="bg-slate-50 border-none text-sm font-bold text-slate-600 rounded-lg p-2 cursor-pointer focus:ring-0">
                  <option>{t('dashboard.charts.last4Weeks')}</option>
                  <option>{t('dashboard.charts.lastSemester')}</option>
              </select>
          </div>
          <div className="h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyPerformanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#80B1D3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#80B1D3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} domain={[80, 100]} />
                <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                    itemStyle={{color: '#80B1D3', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="score" stroke="#80B1D3" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Distribution Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t('dashboard.charts.genderDistribution')}</h3>
          <p className="text-xs text-slate-400 font-medium mb-6">{t('dashboard.charts.genderSubtitle')}</p>
          
          <div className="h-[250px] w-full relative min-w-0">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={genderData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={80} 
                    outerRadius={105} 
                    paddingAngle={5} 
                    dataKey="value" 
                    stroke="none"
                    cornerRadius={8}
                >
                  {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontWeight: 600, color: '#475569'}}/>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
               <span className="text-4xl font-black text-slate-800 tracking-tighter">{totalStudents}</span>
               <span className="text--[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">{t('dashboard.chart.students')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

