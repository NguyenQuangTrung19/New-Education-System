
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_STUDENTS, MOCK_CLASSES } from '../constants';
import { Student, User, UserRole } from '../types';
import { 
  Trophy, Crown, Calendar, ChevronDown, 
  Search, Star, Sparkles, History,
  Users, GraduationCap, X, Medal, ArrowUp, Zap, Flame, Target, Check, RefreshCw, ChevronLeft, ChevronRight, Quote
} from 'lucide-react';

type TimeFrame = 'week' | 'month' | 'semester' | 'year';
type RankingType = 'individual' | 'class';

interface LeaderboardProps {
    currentUser: User;
}

// --- MODERN UI COMPONENTS ---

// 1. Hook for click outside
function useOnClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// 2. Custom Modern Dropdown
interface DropdownOption {
    value: string;
    label: string;
}

const ModernDropdown = ({ 
    options, 
    value, 
    onChange, 
    icon: Icon,
    className = "" 
}: { 
    options: DropdownOption[], 
    value: string, 
    onChange: (val: string) => void, 
    icon: any,
    className?: string
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useOnClickOutside(ref, () => setIsOpen(false));

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full gap-2 px-4 py-2.5 bg-white/50 hover:bg-white border border-white/40 hover:border-white/80 backdrop-blur-md rounded-xl shadow-sm transition-all duration-300 group ${isOpen ? 'ring-2 ring-indigo-200 bg-white' : ''}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`p-1.5 rounded-lg ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'} group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 truncate">{selectedLabel}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                value === opt.value 
                                ? 'bg-indigo-50 text-indigo-700 font-bold' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <span className="truncate">{opt.label}</span>
                            {value === opt.value && <Check className="h-3 w-3 text-indigo-600" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 3. Modern Segmented Control
const ModernSegmentedControl = ({ 
    options, 
    selected, 
    onChange 
}: { 
    options: { value: string, label: string, icon: any }[], 
    selected: string, 
    onChange: (val: any) => void 
}) => {
    return (
        <div className="bg-gray-100/50 p-1 rounded-2xl flex relative border border-white/50 shadow-inner backdrop-blur-sm">
            {/* Animated Slider Background */}
            <div 
                className="absolute top-1 bottom-1 bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-500 ease-spring"
                style={{ 
                    width: `calc(${100 / options.length}% - 4px)`, 
                    left: `calc(${options.findIndex(o => o.value === selected) * (100 / options.length)}% + 2px)` 
                }}
            />
            
            {options.map((opt) => {
                const isActive = selected === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 flex items-center justify-center py-2 px-4 text-sm font-bold rounded-xl transition-all duration-300 relative z-10 ${
                            isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <opt.icon className={`h-4 w-4 mr-2 transition-all duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

// --- Helper Components ---

const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-white font-black shadow-lg shadow-yellow-500/50 ring-2 ring-yellow-200">1</div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-black shadow-lg shadow-slate-400/50 ring-2 ring-slate-200">2</div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/50 ring-2 ring-orange-200">3</div>;
    return <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-100 text-indigo-400 font-bold flex items-center justify-center">{rank}</div>;
};

// --- Improved Scratch Card Component ---
const ScratchCard = ({ rank, score, label }: { rank: number | string, score: number, label: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); 
    const lastPos = useRef<{x: number, y: number} | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const drawCover = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Use getBoundingClientRect to get precise display size
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            const width = canvas.width;
            const height = canvas.height;

            // Clear before redrawing (handling resize)
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, width, height);

            // Draw the scratch cover
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#94a3b8');
            gradient.addColorStop(0.2, '#cbd5e1');
            gradient.addColorStop(0.5, '#e2e8f0'); // Shine
            gradient.addColorStop(0.8, '#cbd5e1');
            gradient.addColorStop(1, '#94a3b8');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Add Noise/Pattern
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            for(let i=0; i<100; i++) {
                ctx.beginPath();
                ctx.arc(Math.random()*width, Math.random()*height, Math.random()*2 + 1, 0, Math.PI*2);
                ctx.fill();
            }

            // Add Text
            ctx.font = 'bold 18px "Inter", sans-serif';
            ctx.fillStyle = '#475569';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            ctx.fillText('CÀO ĐỂ XEM', width/2, height/2);
            
            ctx.font = '12px "Inter", sans-serif';
            ctx.fillText('✨ Di chuột để cào ✨', width/2, height/2 + 25);

            // Reset settings for scratching interaction
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = 40; 

            setIsLoaded(true);
            setIsRevealed(false);
        };

        // ResizeObserver ensures canvas matches container exactly, even if layout shifts
        const resizeObserver = new ResizeObserver(() => {
            drawCover();
        });

        resizeObserver.observe(container);

        // Initial draw
        drawCover();

        return () => resizeObserver.disconnect();
    }, [rank, score]);

    const checkReveal = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const totalPixels = imageData.data.length / 4;
        let clearPixels = 0;
        
        for (let i = 0; i < totalPixels; i += 10) {
            if (imageData.data[i * 4 + 3] === 0) {
                clearPixels++;
            }
        }

        if (clearPixels / (totalPixels / 10) > 0.4) {
            setIsRevealed(true);
        }
    };

    const scratch = (x: number, y: number) => {
        if (isRevealed) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = x - rect.left;
        const mouseY = y - rect.top;

        if (lastPos.current) {
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        lastPos.current = { x: mouseX, y: mouseY };
        if (Math.random() > 0.8) checkReveal();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.buttons !== 1) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            scratch(e.clientX, e.clientY);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (e.buttons !== 1) {
            lastPos.current = null;
            return;
        }
        scratch(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            lastPos.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
            scratch(touch.clientX, touch.clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        scratch(touch.clientX, touch.clientY);
    };

    return (
        <div className="relative group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white rounded-2xl p-1 shadow-2xl">
                <div 
                    ref={containerRef}
                    className="bg-indigo-950 rounded-xl p-6 relative overflow-hidden h-[180px] w-full flex items-center justify-center select-none"
                >
                    {/* The Secret Content (Hidden until canvas loads to prevent flashing) */}
                    <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} w-full`}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                        <div className="relative z-10 text-center w-full">
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <div className="text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]">#{rank}</div>
                            </div>
                            <div className="inline-block bg-white/10 backdrop-blur-md rounded-full px-4 py-1 border border-white/20">
                                <span className="text-yellow-400 font-bold">{score}</span> <span className="text-indigo-200 text-xs">Điểm</span>
                            </div>
                        </div>
                    </div>

                    {/* The Scratch Layer */}
                    <canvas 
                        ref={canvasRef}
                        className={`absolute inset-0 w-full h-full rounded-xl cursor-crosshair touch-none transition-all duration-700 z-20 ${isRevealed ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={() => { lastPos.current = null; }}
                        onMouseLeave={() => { lastPos.current = null; }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={() => { lastPos.current = null; }}
                    />
                    
                    {/* Manual Reveal Button (Fallback) */}
                    {!isRevealed && (
                        <button 
                            onClick={() => setIsRevealed(true)}
                            className="absolute top-2 right-2 z-30 p-1 text-slate-500/50 hover:text-slate-600 hover:bg-white/20 rounded-full transition-colors"
                            title="Mở ngay"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const currentYear = '2025-2026';
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('year');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [rankingType, setRankingType] = useState<RankingType>('individual');
  const [selectedGrade, setSelectedGrade] = useState<string>('all'); 

  // Hall of Fame States
  const [hofIndex, setHofIndex] = useState(0); // For widget auto-scroll
  const [showHofModal, setShowHofModal] = useState(false);
  const [activeHofIndex, setActiveHofIndex] = useState(0); // For modal manual navigation

  // Generate available years
  const availableYears = useMemo(() => {
      const years = new Set<string>();
      years.add(currentYear);
      MOCK_STUDENTS.forEach(s => {
          s.academicHistory.forEach(h => years.add(h.year));
      });
      return Array.from(years).sort().reverse().map(y => ({ value: y, label: y }));
  }, []);

  // Generate available grades
  const availableGrades = useMemo(() => {
      const grades = new Set(MOCK_CLASSES.map(c => c.gradeLevel));
      const list = Array.from(grades).sort((a,b) => a - b).map(g => ({ value: g.toString(), label: `Khối ${g}` }));
      return [{ value: 'all', label: 'Tất cả Khối' }, ...list];
  }, []);

  const handleYearChange = (year: string) => {
      setSelectedYear(year);
      if (year !== currentYear) {
          setTimeFrame('year');
      }
  };

  const getStudentScore = (student: Student, frame: TimeFrame): number => {
      if (selectedYear !== currentYear) {
          const history = student.academicHistory.find(h => h.year === selectedYear);
          return history ? history.gpa : 0;
      }
      if (frame === 'year') return student.gpa;
      
      const idNum = parseInt(student.id.replace(/\D/g, '')) || 0;
      let score = student.gpa;
      if (frame === 'semester') score = Math.min(4.0, Math.max(0, student.gpa + (idNum % 5 - 2) * 0.1));
      else if (frame === 'month') score = Math.min(100, 80 + (idNum % 20)); 
      else if (frame === 'week') score = Math.min(100, 70 + (idNum % 30));
      return parseFloat(score.toFixed(2));
  };

  const leaderboardData = useMemo(() => {
      if (rankingType === 'individual') {
          let data = MOCK_STUDENTS.map(s => {
              const classInfo = MOCK_CLASSES.find(c => c.id === s.classId);
              return {
                  id: s.id,
                  name: s.name,
                  subText: classInfo?.name || s.classId,
                  avatarChar: s.name.charAt(0),
                  score: getStudentScore(s, timeFrame),
                  gradeLevel: classInfo?.gradeLevel || 0,
                  type: 'student',
                  trend: Math.random() > 0.5 ? 'up' : 'down' // Mock trend
              };
          });

          if (selectedGrade !== 'all') {
              data = data.filter(d => d.gradeLevel === parseInt(selectedGrade));
          }

          data = data.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
          return data;

      } else {
          let data = MOCK_CLASSES.map(c => ({
              id: c.id,
              name: c.name,
              subText: `Sĩ số: ${c.studentCount}`,
              avatarChar: c.gradeLevel.toString(),
              score: c.averageGpa,
              gradeLevel: c.gradeLevel,
              type: 'class',
              trend: Math.random() > 0.5 ? 'up' : 'same'
          }));

          if (selectedGrade !== 'all') {
              data = data.filter(d => d.gradeLevel === parseInt(selectedGrade));
          }

          data = data.sort((a, b) => b.score - a.score);
          return data;
      }
  }, [rankingType, selectedGrade, selectedYear, timeFrame]);

  // Top 10 for Display
  const displayedItems = useMemo(() => {
      let list = leaderboardData.slice(0, 10);
      if (searchTerm) {
          return list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return list;
  }, [leaderboardData, searchTerm]);

  const myRankInfo = useMemo(() => {
      if (rankingType === 'individual') {
          const index = leaderboardData.findIndex(s => s.id === currentUser.id);
          if (index === -1) return null;
          return { rank: index + 1, score: leaderboardData[index].score, label: 'Thứ hạng của bạn' };
      } else {
          const userClassId = currentUser.classId;
          if (!userClassId) return null;
          const index = leaderboardData.findIndex(c => c.id === userClassId);
          if (index === -1) return null;
          return { rank: index + 1, score: leaderboardData[index].score, label: 'Thứ hạng lớp bạn' };
      }
  }, [leaderboardData, currentUser, rankingType]);

  const hallOfFame = useMemo(() => {
      const historyMap: Record<string, { name: string, gpa: number, year: string }> = {};
      MOCK_STUDENTS.forEach(s => {
          s.academicHistory.forEach(rec => {
              if (!historyMap[rec.year] || rec.gpa > historyMap[rec.year].gpa) {
                  historyMap[rec.year] = { name: s.name, gpa: rec.gpa, year: rec.year };
              }
          });
      });
      return Object.values(historyMap).sort((a, b) => b.year.localeCompare(a.year));
  }, []);

  useEffect(() => {
      if (hallOfFame.length <= 1) return;
      const interval = setInterval(() => {
          setHofIndex(prev => (prev + 1) % hallOfFame.length);
      }, 5000);
      return () => clearInterval(interval);
  }, [hallOfFame.length]);

  const isCurrentYear = selectedYear === currentYear;
  const isStudent = currentUser.role === UserRole.STUDENT;

  // Function to open modal and set active index
  const openHofModal = () => {
      setActiveHofIndex(0); // Start from most recent or first
      setShowHofModal(true);
  };

  const nextHof = () => setActiveHofIndex(prev => (prev + 1) % hallOfFame.length);
  const prevHof = () => setActiveHofIndex(prev => (prev - 1 + hallOfFame.length) % hallOfFame.length);

  const activeWinner = hallOfFame[activeHofIndex];

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* --- HERO HEADER --- */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-indigo-900 text-white shadow-2xl">
          {/* Animated Background */}
          <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-900 opacity-90"></div>
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-50 animate-pulse"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-500 rounded-full blur-[100px] opacity-50 animate-pulse delay-1000"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>

          <div className="relative z-10 px-8 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-yellow-300 border border-white/20">
                      <Sparkles className="h-3 w-3 animate-spin-slow" /> EduSphere Ranking System
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-white drop-shadow-sm">
                      Bảng Xếp Hạng <br/><span className="text-yellow-400">Vinh Danh</span>
                  </h1>
                  <p className="text-lg text-indigo-200 font-medium max-w-lg">
                      Nơi ghi nhận nỗ lực và thành tích xuất sắc của các cá nhân và tập thể tiêu biểu trong toàn trường.
                  </p>
              </div>
              
              {/* Giant Trophy Icon 3D-ish */}
              <div className="relative hidden md:block animate-float">
                  <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-20 rounded-full"></div>
                  <Trophy className="h-48 w-48 text-yellow-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] filter" style={{filter: 'drop-shadow(0 0 15px rgba(250, 204, 21, 0.4))'}} />
              </div>
          </div>
      </div>

      {/* --- CONTROL CENTER (Normal Scroll Flow) --- */}
      <div className="relative z-30 mb-12 transition-all">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-3 flex flex-col xl:flex-row items-center gap-4 max-w-6xl mx-auto ring-1 ring-white/50">
              
              {/* 1. Modern Segmented Control */}
              <div className="w-full xl:w-auto shrink-0">
                  <ModernSegmentedControl 
                      options={[
                          { value: 'individual', label: 'Cá Nhân', icon: UserIcon },
                          { value: 'class', label: 'Tập Thể', icon: Users }
                      ]}
                      selected={rankingType}
                      onChange={setRankingType}
                  />
              </div>

              <div className="h-8 w-px bg-gray-200 hidden xl:block"></div>

              {/* 2. Custom Filters (Grade & Year) */}
              <div className="flex gap-3 w-full xl:w-auto justify-center">
                  <ModernDropdown 
                      options={availableGrades}
                      value={selectedGrade}
                      onChange={setSelectedGrade}
                      icon={GraduationCap}
                      className="w-48"
                  />
                  {/* FIX: Increased width for Year dropdown */}
                  <ModernDropdown 
                      options={availableYears}
                      value={selectedYear}
                      onChange={handleYearChange}
                      icon={Calendar}
                      className="w-52" 
                  />
              </div>

              <div className="h-8 w-px bg-gray-200 hidden xl:block ml-auto"></div>

              {/* 3. Search & Time Filters */}
              <div className="flex flex-1 gap-3 w-full xl:w-auto items-center">
                  {/* Timeframe */}
                  {rankingType === 'individual' && (
                      <div className="flex bg-gray-100/80 p-1 rounded-xl shrink-0 border border-white/50">
                          {['week', 'month', 'semester', 'year'].map((t) => (
                              <button 
                                  key={t}
                                  onClick={() => setTimeFrame(t as TimeFrame)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 ${
                                      timeFrame === t 
                                      ? 'bg-white text-indigo-600 shadow-sm scale-105' 
                                      : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                  }`}
                              >
                                  {t === 'semester' ? 'Kỳ' : t === 'month' ? 'Tháng' : t === 'week' ? 'Tuần' : 'Năm'}
                              </button>
                          ))}
                      </div>
                  )}

                  {/* Search Bar */}
                  <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                          type="text" 
                          placeholder="Tìm kiếm học sinh/lớp..." 
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-white focus:border-indigo-200 outline-none transition-all text-sm font-medium shadow-inner"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* --- MAIN CONTENT (PODIUM + LIST) --- */}
          <div className="xl:col-span-8 space-y-10">
              
              {/* PODIUM SECTION */}
              {!searchTerm && displayedItems.length >= 3 && (
                  <div className="relative pt-12 pb-4">
                      {/* Background Light Beam */}
                      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-b from-indigo-500/10 to-transparent blur-[80px] -z-10 pointer-events-none"></div>

                      <div className="flex items-end justify-center gap-4 md:gap-8 perspective-1000">
                          
                          {/* RANK 2 */}
                          <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-2 transition-transform duration-500 relative z-10">
                              <div className="relative mb-4">
                                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-slate-300 bg-white shadow-xl flex items-center justify-center text-slate-600 font-black text-2xl overflow-hidden ring-4 ring-white/50">
                                      {displayedItems[1].avatarChar}
                                  </div>
                                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">#2</div>
                              </div>
                              <div className="w-28 md:w-40 h-32 md:h-40 bg-gradient-to-b from-slate-200 to-slate-50 rounded-t-2xl border-x border-t border-white/50 shadow-2xl flex flex-col items-center justify-start pt-6 relative overflow-hidden backdrop-blur-sm">
                                  <div className="absolute inset-0 bg-white/30 skew-y-12 transform origin-top-left"></div>
                                  <p className="font-bold text-slate-800 text-sm md:text-base text-center px-2 line-clamp-1 w-full z-10">{displayedItems[1].name}</p>
                                  <p className="text-xs text-slate-500 font-bold z-10 mt-1">{displayedItems[1].subText}</p>
                                  <p className="font-black text-slate-600 mt-3 text-2xl z-10">{displayedItems[1].score}</p>
                              </div>
                          </div>

                          {/* RANK 1 */}
                          <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-4 transition-transform duration-500 relative z-20 -mx-2">
                              <div className="relative mb-4">
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)] animate-bounce-slight">
                                      <Crown className="h-10 w-10 md:h-12 md:w-12 fill-yellow-400" />
                                  </div>
                                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 bg-white shadow-[0_0_40px_rgba(250,204,21,0.4)] flex items-center justify-center text-yellow-600 font-black text-4xl overflow-hidden ring-4 ring-yellow-100 relative">
                                      {displayedItems[0].avatarChar}
                                      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent"></div>
                                  </div>
                                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-current"/> #1
                                  </div>
                              </div>
                              <div className="w-32 md:w-48 h-40 md:h-52 bg-gradient-to-b from-yellow-200 to-yellow-50 rounded-t-3xl border-x border-t border-white/60 shadow-[0_20px_50px_-12px_rgba(250,204,21,0.3)] flex flex-col items-center justify-start pt-8 relative overflow-hidden backdrop-blur-md">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                  
                                  <p className="font-bold text-yellow-900 text-base md:text-xl text-center px-2 line-clamp-1 w-full relative z-10">{displayedItems[0].name}</p>
                                  <p className="text-sm text-yellow-800 font-bold relative z-10 mt-1 opacity-80">{displayedItems[0].subText}</p>
                                  <div className="mt-4 bg-white/40 px-4 py-1 rounded-full backdrop-blur-sm z-10">
                                      <p className="font-black text-yellow-700 text-3xl md:text-4xl tracking-tight">{displayedItems[0].score}</p>
                                  </div>
                              </div>
                          </div>

                          {/* RANK 3 */}
                          <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-2 transition-transform duration-500 relative z-10">
                              <div className="relative mb-4">
                                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-orange-300 bg-white shadow-xl flex items-center justify-center text-orange-600 font-black text-2xl overflow-hidden ring-4 ring-white/50">
                                      {displayedItems[2].avatarChar}
                                  </div>
                                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">#3</div>
                              </div>
                              <div className="w-28 md:w-40 h-28 md:h-36 bg-gradient-to-b from-orange-200 to-orange-50 rounded-t-2xl border-x border-t border-white/50 shadow-2xl flex flex-col items-center justify-start pt-6 relative overflow-hidden backdrop-blur-sm">
                                  <div className="absolute inset-0 bg-white/30 -skew-y-12 transform origin-top-right"></div>
                                  <p className="font-bold text-orange-900 text-sm md:text-base text-center px-2 line-clamp-1 w-full z-10">{displayedItems[2].name}</p>
                                  <p className="text-xs text-orange-800 font-bold z-10 mt-1 opacity-80">{displayedItems[2].subText}</p>
                                  <p className="font-black text-orange-800 mt-3 text-2xl z-10">{displayedItems[2].score}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* LIST VIEW */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                      <h3 className="font-bold text-gray-700 flex items-center uppercase tracking-wider text-sm"><Target className="h-4 w-4 mr-2 text-indigo-500"/> Xếp hạng chi tiết</h3>
                      <span className="text-xs font-medium text-gray-400 italic">Cập nhật tự động</span>
                  </div>
                  
                  {displayedItems.map((item, idx) => {
                      if (!searchTerm && idx < 3) return null;
                      
                      const rank = idx + 1;
                      return (
                          <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-200 hover:scale-[1.01] transition-all duration-300 group cursor-pointer relative overflow-hidden">
                              
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                              <div className="w-12 text-center shrink-0">
                                  <RankBadge rank={rank} />
                              </div>
                              
                              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 text-gray-600 font-bold text-lg shrink-0 border border-gray-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                                  {item.avatarChar}
                              </div>
                              
                              <div className="flex-1 min-w-0 px-2">
                                  <h4 className="font-bold text-gray-800 text-base truncate group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                      <p className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-0.5 rounded-md">
                                          {rankingType === 'individual' ? <GraduationCap className="h-3 w-3 mr-1"/> : <Users className="h-3 w-3 mr-1"/>}
                                          {rankingType === 'individual' ? item.subText : item.subText.replace('Sĩ số: ', '')}
                                      </p>
                                      {/* Trend Indicator (Mock) */}
                                      <span className={`text-[10px] font-bold flex items-center ${
                                          (item as any).trend === 'up' ? 'text-emerald-500' : 
                                          (item as any).trend === 'down' ? 'text-rose-500' : 'text-gray-400'
                                      }`}>
                                          {(item as any).trend === 'up' ? '▲' : (item as any).trend === 'down' ? '▼' : '−'}
                                      </span>
                                  </div>
                              </div>
                              
                              <div className="text-right pr-2">
                                  <span className="block font-black text-xl text-gray-900 tracking-tight">{item.score}</span>
                                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Điểm</span>
                              </div>
                          </div>
                      );
                  })}
                  
                  {displayedItems.length === 0 && (
                      <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Search className="h-8 w-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium">Không tìm thấy kết quả nào.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* --- RIGHT COLUMN: WIDGETS --- */}
          <div className="xl:col-span-4 space-y-8">
              
              {/* LEGENDARY HALL OF FAME CARD (Mini Widget) */}
              <div className="relative overflow-hidden rounded-[2rem] bg-black shadow-2xl group min-h-[300px] border border-gray-800">
                  {/* Dynamic Backgrounds */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 animate-pulse"></div>
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600 rounded-full blur-[80px] opacity-30 animate-spin-slow" style={{animationDuration: '10s'}}></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-30 animate-spin-slow" style={{animationDuration: '15s'}}></div>

                  {hallOfFame.length > 0 ? (
                      <div className="relative z-10 flex flex-col h-full p-8">
                          <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                                  <Flame className="h-4 w-4 text-orange-400 fill-current animate-pulse" />
                                  <span className="text-xs font-bold uppercase tracking-wider text-white">Hall of Fame</span>
                              </div>
                              <button 
                                onClick={openHofModal}
                                className="bg-white/5 hover:bg-white/20 p-2 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-sm border border-white/10"
                              >
                                  <History className="h-5 w-5" />
                              </button>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                              <div className="relative group-hover:scale-105 transition-transform duration-500">
                                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-600 rounded-full blur-xl opacity-50"></div>
                                  <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 shadow-2xl relative z-10">
                                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-black text-4xl border-4 border-gray-900/50">
                                          {hallOfFame[hofIndex].name.charAt(0)}
                                      </div>
                                  </div>
                                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1 z-20">
                                      <Trophy className="h-3 w-3 fill-current"/> Legend
                                  </div>
                              </div>
                              
                              <div className="space-y-2">
                                  <h3 className="text-3xl font-black text-white tracking-tight leading-tight">{hallOfFame[hofIndex].name}</h3>
                                  <p className="text-indigo-300 text-sm font-medium tracking-wide uppercase">Thủ khoa năm {hallOfFame[hofIndex].year}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                      <p className="text-xs text-gray-400 uppercase font-bold">GPA</p>
                                      <p className="text-xl font-black text-yellow-400">{hallOfFame[hofIndex].gpa}</p>
                                  </div>
                                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                      <p className="text-xs text-gray-400 uppercase font-bold">Rank</p>
                                      <p className="text-xl font-black text-white">#1</p>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Progress Dots */}
                          <div className="flex justify-center gap-2 mt-6">
                              {hallOfFame.slice(0, 5).map((_, i) => (
                                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === hofIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`}></div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div className="h-full flex items-center justify-center text-gray-500 text-sm relative z-10">Chưa có dữ liệu.</div>
                  )}
              </div>

              {/* SCRATCH CARD (Context Aware) */}
              {isStudent && myRankInfo ? (
                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center"><Zap className="h-4 w-4 mr-2 text-yellow-500 fill-current"/> Vị trí của bạn</h4>
                      </div>
                      <ScratchCard 
                        rank={myRankInfo.rank} 
                        score={myRankInfo.score} 
                        label={myRankInfo.label}
                      />
                  </div>
              ) : isStudent ? (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-sm">
                          {rankingType === 'individual' ? 'Bạn chưa có tên trong bảng xếp hạng kỳ này.' : 'Lớp của bạn chưa có dữ liệu xếp hạng.'}
                      </p>
                  </div>
              ) : null}
          </div>
      </div>

      {/* FULL SCREEN HALL OF FAME MODAL */}
      {showHofModal && activeWinner && createPortal(
          <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] text-white overflow-hidden animate-fade-in">
              
              {/* Dynamic Background */}
              <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0a0a0a] to-black"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                  {/* Spotlights */}
                  <div className="absolute top-[-20%] left-[20%] w-[40%] h-[80%] bg-blue-500/10 blur-[120px] rotate-45 pointer-events-none"></div>
                  <div className="absolute top-[-20%] right-[20%] w-[40%] h-[80%] bg-purple-500/10 blur-[120px] -rotate-45 pointer-events-none"></div>
              </div>

              {/* Close Button */}
              <button 
                  onClick={() => setShowHofModal(false)}
                  className="absolute top-6 right-6 z-50 p-3 bg-white/5 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10 group"
              >
                  <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Header */}
              <div className="relative z-10 pt-10 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
                      <Crown className="h-4 w-4 fill-current" /> EduSphere Legacy
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-600 drop-shadow-[0_0_25px_rgba(234,179,8,0.4)]">
                      BẢNG VÀNG DANH DỰ
                  </h2>
                  <p className="text-indigo-200 text-lg font-light tracking-wide opacity-80">Nơi lưu danh những học sinh xuất sắc nhất qua các năm</p>
              </div>

              {/* Main Content (Center Stage) */}
              <div className="flex-1 relative z-10 flex items-center justify-center w-full max-w-7xl mx-auto px-4 perspective-1000">
                  
                  {/* Left Nav */}
                  <button 
                      onClick={prevHof}
                      className="hidden md:flex p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-all backdrop-blur-md absolute left-8 z-20 group"
                  >
                      <ChevronLeft className="h-8 w-8 group-hover:-translate-x-1 transition-transform" />
                  </button>

                  {/* The Golden Card */}
                  <div className="relative w-full max-w-md md:max-w-3xl aspect-[3/4] md:aspect-[16/9] flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent rounded-[3rem] blur-3xl"></div>
                      
                      <div className="relative w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16 shadow-2xl overflow-hidden ring-1 ring-white/10">
                          {/* Decorative border glow */}
                          <div className="absolute inset-0 rounded-[2.5rem] border border-yellow-500/30 pointer-events-none"></div>
                          
                          {/* Avatar Section */}
                          <div className="relative shrink-0 group">
                              <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full p-1 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                                  <div className="w-full h-full rounded-full bg-gray-900 border-4 border-black flex items-center justify-center overflow-hidden">
                                      <span className="text-7xl md:text-8xl font-black text-white">{activeWinner.name.charAt(0)}</span>
                                  </div>
                                  {/* Wreath decoration (simulated with icons) */}
                                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-yellow-200 flex items-center gap-2 whitespace-nowrap">
                                      <Trophy className="h-4 w-4 fill-black/20" /> TOP 1
                                  </div>
                              </div>
                          </div>

                          {/* Info Section */}
                          <div className="flex-1 text-center md:text-left space-y-6">
                              <div>
                                  <h3 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight mb-2 drop-shadow-lg">{activeWinner.name}</h3>
                                  <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                                      <Calendar className="h-5 w-5 text-yellow-400" />
                                      <span className="text-xl text-yellow-100 font-medium tracking-wide">Niên khóa {activeWinner.year}</span>
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                                      <p className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-1">Điểm Tổng Kết</p>
                                      <p className="text-4xl font-black text-yellow-400">{activeWinner.gpa}</p>
                                  </div>
                                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                                      <p className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-1">Xếp Hạng</p>
                                      <p className="text-4xl font-black text-white">#1 <span className="text-base font-normal text-gray-500">Toàn trường</span></p>
                                  </div>
                              </div>

                              <div className="relative pt-4">
                                  <Quote className="absolute -top-2 -left-4 h-8 w-8 text-white/10 rotate-180" />
                                  <p className="text-lg text-gray-300 italic font-light leading-relaxed">
                                      "Thành tích xuất sắc trong học tập và rèn luyện. Là tấm gương sáng cho các thế hệ học sinh noi theo."
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Nav */}
                  <button 
                      onClick={nextHof}
                      className="hidden md:flex p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-all backdrop-blur-md absolute right-8 z-20 group"
                  >
                      <ChevronRight className="h-8 w-8 group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>

              {/* Bottom Timeline / Navigation */}
              <div className="relative z-20 py-8 bg-black/20 backdrop-blur-xl border-t border-white/5">
                  <div className="max-w-7xl mx-auto px-6 overflow-x-auto custom-scrollbar">
                      <div className="flex gap-4 md:justify-center min-w-max pb-2">
                          {hallOfFame.map((winner, idx) => {
                              const isActive = idx === activeHofIndex;
                              return (
                                  <button 
                                      key={idx}
                                      onClick={() => setActiveHofIndex(idx)}
                                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 min-w-[100px] border ${
                                          isActive 
                                          ? 'bg-white/10 border-yellow-500/50 scale-110 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                                          : 'bg-transparent border-transparent hover:bg-white/5 opacity-50 hover:opacity-100'
                                      }`}
                                  >
                                      <span className={`text-sm font-bold ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>{winner.year}</span>
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                                          isActive ? 'bg-yellow-600 border-yellow-300 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'
                                      }`}>
                                          {winner.name.charAt(0)}
                                      </div>
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};

// Helper component for icon
const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
