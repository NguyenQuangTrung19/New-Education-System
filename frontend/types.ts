
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  classId?: string; // Optional linkage for students
}

export interface AcademicRecord {
  year: string; // e.g., "2022-2023"
  className: string;
  gpa: number;
}

export interface Student {
  id: string; // Mã học sinh
  name: string; // Họ và tên
  username: string; // Tên đăng nhập
  password?: string; // Mật khẩu
  email: string;
  dateOfBirth: string; // YYYY-MM-DD
  enrollmentYear: number; // Năm vào học
  classId: string; // Lớp hiện tại
  gpa: number; // Điểm TB hiện tại
  address: string; // Địa chỉ
  
  // Guardian Info
  guardianName: string;
  guardianCitizenId: string;
  guardianYearOfBirth: number;
  guardianJob: string;
  guardianPhone: string;

  // History
  academicHistory: AcademicRecord[];
  notes?: string[];
  
  // New: Semester Evaluation by Homeroom Teacher
  semesterEvaluation?: string;
}

// New Interface for Detailed Grades
export interface StudentGrade {
  studentId: string;
  subjectId: string;
  oralScore: number | null; // Hệ số 1
  fifteenMinScores: (number | null)[]; // Hệ số 1 (3-5 cột)
  midTermScore: number | null; // Hệ số 2
  finalScore: number | null; // Hệ số 3
  average: number | null;
  // New fields for history tracking
  semester: 'HK1' | 'HK2';
  academicYear: string;
  feedback?: string; // Subject Teacher Feedback
}

// New Interface for Lesson Feedback
export interface LessonFeedback {
  scheduleId: string;
  date: string; // ISO Date YYYY-MM-DD to track specific history
  rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  comment: string;
  signature: string; // Mock digital signature string
  timestamp: string;
}

// NEW: Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  scheduleId: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface Teacher {
  id: string; // Mã số giáo viên (GVxxxx)
  username: string; // Tên đăng nhập
  password?: string; // Mật khẩu (optional for display)
  name: string;
  subjects: string[]; // Môn dạy (nhiều môn)
  email: string;
  phone: string;
  address: string; // Địa chỉ
  citizenId: string; // Số căn cước công dân
  gender: 'Male' | 'Female' | 'Other'; // Giới tính
  dateOfBirth: string; // Ngày tháng năm sinh (YYYY-MM-DD)
  joinYear: number; // Năm vào trường (YYYY)
  
  // Performance stats
  classesAssigned: number;
  notes?: string[];
}

export interface WeeklyScore {
  week: number;
  score: number;
}

export interface ClassGroup {
  id: string;
  name: string;
  gradeLevel: number; // Derived from name usually
  room: string;
  academicYear: string; // e.g., "2025-2026"
  teacherId: string;
  
  // Stats
  studentCount: number;
  maleStudentCount: number;
  femaleStudentCount: number;
  averageGpa: number;
  currentWeeklyScore: number; // Activity score (e.g., discipline, cleanliness)
  weeklyScoreHistory: WeeklyScore[];

  description?: string;
  notes?: string[];
}

export interface SubjectGpaRecord {
  year: string;
  gpa: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string; // Simple code e.g. "Math"
  department: string;
  description?: string;
  averageGpaHistory: SubjectGpaRecord[];
  notes?: string[];
}

export interface ScheduleItem {
  id: string;
  day: string; // "Monday", "Tuesday", etc.
  period: number; // 1-5
  session: 'Morning' | 'Afternoon';
  subjectId: string;
  classId: string;
  room: string;
  teacherId?: string;
}

export interface TeachingAssignment {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  sessionsPerWeek: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string; // Relative time string (e.g. "2 hours ago")
  timestamp: string; // ISO Date string for filtering
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  bannerImage?: string; // For carousel
}

// Student Specific
export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string; // ISO
  status: 'pending' | 'submitted' | 'late' | 'graded';
  grade?: number;
  // Dynamic fields from Teacher creation
  duration?: number;
  passwordAccess?: string;
  questions?: any[];
}

export interface LearningMaterial {
  id: string;
  classId: string; // Updated: Linked to a specific class
  subjectId: string;
  title: string;
  description?: string; // Updated: Added description
  type: 'pdf' | 'video' | 'link' | 'doc';
  url: string;
  uploadDate: string;
}

// --- NEW TUITION TYPES ---
export interface TuitionItem {
  id: string;
  name: string; // e.g. "Học phí HK1", "Phụ đạo Toán"
  amount: number;
  paidAmount: number;
  dueDate?: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export interface SemesterTuition {
  id: string;
  studentId: string;
  academicYear: string; // "2025-2026"
  semester: 'HK1' | 'HK2' | 'Summer';
  items: TuitionItem[];
  // Computed fields
  totalAmount: number;
  totalPaid: number;
  status: 'complete' | 'incomplete';
}
