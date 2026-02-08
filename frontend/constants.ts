
// ... existing imports
import { Student, Teacher, ClassGroup, Subject, ScheduleItem, DashboardStats, TeachingAssignment, Notification, StudentGrade, LessonFeedback, AttendanceRecord, Assignment, LearningMaterial, SemesterTuition } from './types';

// ... (keep all other constants exactly as they are until MOCK_TUITION)

export const SCHOOL_INFO = {
  name: "THCS Phước Tân",
  logo: "/logo.png", 
  logoFallback: "https://cdn-icons-png.flaticon.com/512/1673/1673062.png" 
};

export const MOCK_STATS: DashboardStats = {
  totalStudents: 1245,
  totalTeachers: 84,
  totalClasses: 42,
  attendanceRate: 94.5,
};

// Helper to get dynamic ISO dates
const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Đại hội Thể thao 2025',
    message: 'Tham gia đại hội thể thao thường niên! Đăng ký đang mở cho tất cả các môn điền kinh.',
    time: '1 giờ trước',
    timestamp: oneHourAgo,
    type: 'info',
    read: false,
    bannerImage: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'n2',
    title: 'Giải Nhất Hội thi Khoa học',
    message: 'Chúc mừng Lớp 10A1 đã giành giải Nhất trong Hội thi Khoa học cấp Quận!',
    time: '2 giờ trước',
    timestamp: twoHoursAgo,
    type: 'success',
    read: false,
    bannerImage: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'n3',
    title: 'Lịch thi Giữa kỳ',
    message: 'Lịch thi giữa kỳ đã được công bố. Vui lòng kiểm tra thời khóa biểu của bạn.',
    time: '5 giờ trước',
    timestamp: fiveHoursAgo,
    type: 'alert',
    read: false,
    bannerImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'n4',
    title: 'Thông báo Sửa chữa Thư viện',
    message: 'Thư viện nhà trường sẽ đóng cửa để sửa chữa vào tuần tới.',
    time: '1 ngày trước',
    timestamp: yesterday,
    type: 'warning',
    read: true,
  },
];

export const MOCK_STUDENTS: Student[] = [
  { 
    id: 'S001', 
    name: 'Lê Thị Mai', 
    username: 'hs.lethimai',
    classId: 'C101', 
    enrollmentYear: 2023, 
    gpa: 8.8, 
    email: 'lethimai@thcsphuoctan.edu.vn', 
    dateOfBirth: '2008-05-15',
    address: '12 Đường 3/2, Quận 10, TP.HCM',
    guardianName: 'Lê Văn Hùng',
    guardianCitizenId: '079080001234',
    guardianYearOfBirth: 1980,
    guardianJob: 'Kỹ sư xây dựng',
    guardianPhone: '0901234567',
    academicHistory: [
        { year: '2024-2025', className: 'Lớp 9A', gpa: 8.7 },
        { year: '2023-2024', className: 'Lớp 8A', gpa: 8.6 }
    ],
    notes: ['Học sinh giỏi cấp Thành phố.', 'Tích cực tham gia phong trào.'],
    semesterEvaluation: 'Mai là học sinh ngoan, lễ phép và có thành tích học tập xuất sắc.'
  },
  { 
    id: 'S002', 
    name: 'Phạm Văn Minh', 
    username: 'hs.phamvanminh',
    classId: 'C101', 
    enrollmentYear: 2023, 
    gpa: 8.2, 
    email: 'phamvanminh@thcsphuoctan.edu.vn', 
    dateOfBirth: '2008-08-20',
    address: '45 Nguyễn Trãi, Quận 5, TP.HCM',
    guardianName: 'Phạm Văn Đức',
    guardianCitizenId: '079082005678',
    guardianYearOfBirth: 1982,
    guardianJob: 'Bác sĩ',
    guardianPhone: '0909876543',
    academicHistory: [
        { year: '2024-2025', className: 'Lớp 9B', gpa: 8.3 },
        { year: '2023-2024', className: 'Lớp 8B', gpa: 8.4 }
    ],
    notes: ['Cần cải thiện môn Ngữ Văn.'],
    semesterEvaluation: 'Minh có tiến bộ rõ rệt trong học kỳ này, cần phát huy hơn nữa.'
  },
  { 
    id: 'S003', 
    name: 'Trần Bảo Ngọc', 
    username: 'hs.tranbaongoc',
    classId: 'C102', 
    enrollmentYear: 2023, 
    gpa: 7.5, 
    email: 'tranbaongoc@thcsphuoctan.edu.vn', 
    dateOfBirth: '2008-12-10',
    address: '88 Lê Văn Sỹ, Quận 3, TP.HCM',
    guardianName: 'Trần Văn Tâm',
    guardianCitizenId: '079075009999',
    guardianYearOfBirth: 1975,
    guardianJob: 'Kiến trúc sư',
    guardianPhone: '0912345678',
    academicHistory: [
        { year: '2024-2025', className: 'Lớp 9A', gpa: 7.5 }
    ],
    notes: [] 
  },
  { 
    id: 'S004', 
    name: 'Nguyễn Thị Lan', 
    username: 'hs.nguyenthilan',
    classId: 'C102', 
    enrollmentYear: 2022, 
    gpa: 9.0, 
    email: 'nguyenthilan@thcsphuoctan.edu.vn', 
    dateOfBirth: '2007-03-25',
    address: '101 Hai Bà Trưng, Quận 1, TP.HCM',
    guardianName: 'Nguyễn Văn Phúc',
    guardianCitizenId: '079070001111',
    guardianYearOfBirth: 1970,
    guardianJob: 'Nhạc sĩ',
    guardianPhone: '0987654321',
    academicHistory: [
        { year: '2024-2025', className: 'Lớp 10A', gpa: 8.9 },
        { year: '2023-2024', className: 'Lớp 9A', gpa: 9.1 }
    ],
    notes: ['Kỹ năng lãnh đạo tốt.'] 
  },
];

export const MOCK_TEACHERS: Teacher[] = [
  { 
    id: 'GV0001', 
    username: 'gv.nguyenvanan',
    name: 'Nguyễn Văn An', 
    subjects: ['Toán học', 'Vật lý'], 
    email: 'nguyenvanan@thcsphuoctan.edu.vn', 
    phone: '0901234567', 
    address: '123 Cách Mạng Tháng 8, P.12, Q.10',
    citizenId: '079185000001',
    gender: 'Male',
    dateOfBirth: '1985-05-12',
    joinYear: 2012,
    classesAssigned: 4, 
    notes: ['Đề xuất quy hoạch tổ trưởng chuyên môn.', 'Tích cực trong công tác giảng dạy.']
  },
  { 
    id: 'GV0002', 
    username: 'gv.tranthib',
    name: 'Trần Thị Bình', 
    subjects: ['Sinh học'], 
    email: 'tranthib@thcsphuoctan.edu.vn', 
    phone: '0901234568', 
    address: '45 Nguyễn Thị Minh Khai, Q.1',
    citizenId: '079180000022',
    gender: 'Female',
    dateOfBirth: '1980-03-24',
    joinYear: 2016,
    classesAssigned: 3, 
    notes: []
  },
  { 
    id: 'GV0003', 
    username: 'gv.lethic',
    name: 'Lê Thị Cẩm', 
    subjects: ['Ngữ văn', 'Lịch sử'], 
    email: 'lethicam@thcsphuoctan.edu.vn', 
    phone: '0901234569', 
    address: '12 Nguyễn Huệ, Q.1',
    citizenId: '079160000333',
    gender: 'Female',
    dateOfBirth: '1960-10-04',
    joinYear: 1989,
    classesAssigned: 5, 
    notes: ['Nghiêm khắc nhưng công bằng.', 'Có kinh nghiệm bồi dưỡng học sinh giỏi.']
  },
  { 
    id: 'GV0004', 
    username: 'gv.phamvand',
    name: 'Phạm Văn Dũng', 
    subjects: ['Hóa học'], 
    email: 'phamvandung@thcsphuoctan.edu.vn', 
    phone: '0901234570', 
    address: '308 Trần Hưng Đạo, Q.5',
    citizenId: '079175000444',
    gender: 'Male',
    dateOfBirth: '1975-09-07',
    joinYear: 2009,
    classesAssigned: 4, 
    notes: ['Phương pháp dạy học sáng tạo.', 'Đề xuất mua thêm thiết bị thí nghiệm.']
  },
];

export const MOCK_CLASSES: ClassGroup[] = [
  { 
    id: 'C101', 
    name: '10A1', 
    gradeLevel: 10, 
    room: 'Phòng 101', 
    academicYear: '2025-2026',
    teacherId: 'GV0003', 
    studentCount: 28,
    maleStudentCount: 12,
    femaleStudentCount: 16,
    averageGpa: 8.6, // Adjusted to 10-scale
    currentWeeklyScore: 98,
    weeklyScoreHistory: [
      { week: 1, score: 95 }, { week: 2, score: 92 }, { week: 3, score: 98 }, { week: 4, score: 96 }
    ],
    description: 'Lớp chọn Khối 10 - Ban Khoa học Xã hội.', 
    notes: ['Máy chiếu phòng 101 cần bảo trì.'] 
  },
  { 
    id: 'C102', 
    name: '10A2', 
    gradeLevel: 10, 
    room: 'Phòng 102', 
    academicYear: '2025-2026',
    teacherId: 'GV0001', 
    studentCount: 26,
    maleStudentCount: 14,
    femaleStudentCount: 12,
    averageGpa: 8.2, // Adjusted
    currentWeeklyScore: 92,
    weeklyScoreHistory: [
      { week: 1, score: 88 }, { week: 2, score: 90 }, { week: 3, score: 92 }, { week: 4, score: 92 }
    ],
    description: 'Lớp Khoa học Tự nhiên cơ bản.', 
    notes: [] 
  },
  { 
    id: 'C103', 
    name: '11A1', 
    gradeLevel: 11, 
    room: 'Phòng 201', 
    academicYear: '2025-2026',
    teacherId: 'GV0004', 
    studentCount: 30,
    maleStudentCount: 15,
    femaleStudentCount: 15,
    averageGpa: 8.4,
    currentWeeklyScore: 88,
    weeklyScoreHistory: [
      { week: 1, score: 90 }, { week: 2, score: 85 }, { week: 3, score: 82 }, { week: 4, score: 88 }
    ],
    description: 'Lớp luyện thi đại học khối A.', 
    notes: ['Đã thu giấy phép tham quan thực tế.'] 
  },
  { 
    id: 'C104', 
    name: '9A1', 
    gradeLevel: 9, 
    room: 'Phòng 305', 
    academicYear: '2024-2025',
    teacherId: 'GV0002', 
    studentCount: 32,
    maleStudentCount: 18,
    femaleStudentCount: 14,
    averageGpa: 8.5,
    currentWeeklyScore: 95,
    weeklyScoreHistory: [
      { week: 1, score: 92 }, { week: 2, score: 94 }, { week: 3, score: 96 }, { week: 4, score: 95 }
    ],
    description: 'Lớp đã tốt nghiệp.', 
    notes: [] 
  },
];

export const MOCK_SUBJECTS: Subject[] = [
  { 
    id: 'SUB1', 
    name: 'Toán Cao Cấp', 
    code: 'MATH', 
    department: 'Tổ Toán - Tin', 
    description: 'Giải tích, Đại số tuyến tính và Xác suất.',
    averageGpaHistory: [{year: '2022', gpa: 7.2}, {year: '2023', gpa: 7.5}, {year: '2024', gpa: 7.8}],
    notes: ['Sách giáo khoa mới áp dụng cho năm 2024.'] 
  },
  { 
    id: 'SUB2', 
    name: 'Vật lý Đại cương', 
    code: 'PHYS', 
    department: 'Tổ Khoa học Tự nhiên', 
    description: 'Cơ học Newton, nhiệt động lực học và sóng.', 
    averageGpaHistory: [{year: '2022', gpa: 6.8}, {year: '2023', gpa: 7.0}, {year: '2024', gpa: 7.1}],
    notes: [] 
  },
  { 
    id: 'SUB3', 
    name: 'Ngữ Văn Hiện Đại', 
    code: 'LIT', 
    department: 'Tổ Ngữ Văn', 
    description: 'Phân tích các tác phẩm văn học thế kỷ 20 và 21.', 
    averageGpaHistory: [{year: '2022', gpa: 7.9}, {year: '2023', gpa: 8.0}, {year: '2024', gpa: 8.2}],
    notes: [] 
  },
  { 
    id: 'SUB4', 
    name: 'Hóa Hữu Cơ', 
    code: 'CHEM', 
    department: 'Tổ Khoa học Tự nhiên', 
    description: 'Cấu trúc, tính chất, thành phần và phản ứng của hợp chất hữu cơ.', 
    averageGpaHistory: [{year: '2022', gpa: 7.0}, {year: '2023', gpa: 7.1}, {year: '2024', gpa: 7.4}],
    notes: ['Yêu cầu chứng chỉ an toàn phòng thí nghiệm.'] 
  },
  { 
    id: 'SUB5', 
    name: 'Sinh học', 
    code: 'BIO', 
    department: 'Tổ Khoa học Tự nhiên', 
    description: 'Giới thiệu về Sinh học đại cương.', 
    averageGpaHistory: [{year: '2022', gpa: 7.4}, {year: '2023', gpa: 7.6}, {year: '2024', gpa: 7.5}],
    notes: [] 
  },
  { 
    id: 'SUB6', 
    name: 'Lịch sử', 
    code: 'HIS', 
    department: 'Tổ Khoa học Xã hội', 
    description: 'Lịch sử thế giới và Việt Nam.', 
    averageGpaHistory: [{year: '2022', gpa: 8.1}, {year: '2023', gpa: 8.0}, {year: '2024', gpa: 8.3}],
    notes: [] 
  },
];

export const MOCK_SCHEDULE: ScheduleItem[] = [
  // Class 10A1 (C101) - Morning Schedule
  { id: 'SCH001', day: 'Monday', period: 1, session: 'Morning', subjectId: 'SUB1', classId: 'C101', room: '101', teacherId: 'GV0001' },
  { id: 'SCH002', day: 'Monday', period: 2, session: 'Morning', subjectId: 'SUB1', classId: 'C101', room: '101', teacherId: 'GV0001' },
  { id: 'SCH003', day: 'Monday', period: 3, session: 'Morning', subjectId: 'SUB2', classId: 'C101', room: 'Lab A', teacherId: 'GV0001' },
  { id: 'SCH004', day: 'Monday', period: 4, session: 'Morning', subjectId: 'SUB2', classId: 'C101', room: 'Lab A', teacherId: 'GV0001' },
  { id: 'SCH005', day: 'Monday', period: 5, session: 'Morning', subjectId: 'SUB6', classId: 'C101', room: '101', teacherId: 'GV0003' },

  { id: 'SCH006', day: 'Tuesday', period: 1, session: 'Morning', subjectId: 'SUB3', classId: 'C101', room: '101', teacherId: 'GV0003' },
  { id: 'SCH007', day: 'Tuesday', period: 2, session: 'Morning', subjectId: 'SUB3', classId: 'C101', room: '101', teacherId: 'GV0003' },
  { id: 'SCH008', day: 'Tuesday', period: 3, session: 'Morning', subjectId: 'SUB1', classId: 'C101', room: '101', teacherId: 'GV0001' },
  { id: 'SCH009', day: 'Tuesday', period: 4, session: 'Morning', subjectId: 'SUB5', classId: 'C101', room: 'Lab Bio', teacherId: 'GV0002' },
  { id: 'SCH010', day: 'Tuesday', period: 5, session: 'Morning', subjectId: 'SUB5', classId: 'C101', room: 'Lab Bio', teacherId: 'GV0002' },

  { id: 'SCH011', day: 'Wednesday', period: 1, session: 'Morning', subjectId: 'SUB4', classId: 'C101', room: 'Lab Chem', teacherId: 'GV0004' },
  { id: 'SCH012', day: 'Wednesday', period: 2, session: 'Morning', subjectId: 'SUB4', classId: 'C101', room: 'Lab Chem', teacherId: 'GV0004' },
  { id: 'SCH013', day: 'Wednesday', period: 3, session: 'Morning', subjectId: 'SUB6', classId: 'C101', room: '101', teacherId: 'GV0003' },
  { id: 'SCH014', day: 'Wednesday', period: 4, session: 'Morning', subjectId: 'SUB3', classId: 'C101', room: '101', teacherId: 'GV0003' },
  
  { id: 'SCH015', day: 'Thursday', period: 1, session: 'Morning', subjectId: 'SUB1', classId: 'C101', room: '101', teacherId: 'GV0001' },
  { id: 'SCH016', day: 'Thursday', period: 2, session: 'Morning', subjectId: 'SUB1', classId: 'C101', room: '101', teacherId: 'GV0001' },
  { id: 'SCH017', day: 'Thursday', period: 3, session: 'Morning', subjectId: 'SUB2', classId: 'C101', room: 'Lab A', teacherId: 'GV0001' },
  { id: 'SCH018', day: 'Thursday', period: 4, session: 'Morning', subjectId: 'SUB5', classId: 'C101', room: '101', teacherId: 'GV0002' },

  { id: 'SCH019', day: 'Friday', period: 1, session: 'Morning', subjectId: 'SUB3', classId: 'C101', room: '101', teacherId: 'GV0003' },
  { id: 'SCH020', day: 'Friday', period: 2, session: 'Morning', subjectId: 'SUB3', classId: 'C101', room: '101', teacherId: 'GV0003' },
  { id: 'SCH021', day: 'Friday', period: 3, session: 'Morning', subjectId: 'SUB6', classId: 'C101', room: '101', teacherId: 'GV0003' },
  { id: 'SCH022', day: 'Friday', period: 4, session: 'Morning', subjectId: 'SUB1', classId: 'C101', room: '101', teacherId: 'GV0001' },
  { id: 'SCH023', day: 'Friday', period: 5, session: 'Morning', subjectId: 'SUB4', classId: 'C101', room: '101', teacherId: 'GV0004' },

  // Class 10A1 (C101) - Afternoon Schedule (Extracurricular/Labs)
  { id: 'SCH024', day: 'Tuesday', period: 1, session: 'Afternoon', subjectId: 'SUB2', classId: 'C101', room: 'Lab A', teacherId: 'GV0001' },
  { id: 'SCH025', day: 'Tuesday', period: 2, session: 'Afternoon', subjectId: 'SUB2', classId: 'C101', room: 'Lab A', teacherId: 'GV0001' },
  { id: 'SCH026', day: 'Thursday', period: 1, session: 'Afternoon', subjectId: 'SUB5', classId: 'C101', room: 'Garden', teacherId: 'GV0002' },

  // Class 10A2 (C102) - Just a few samples
  { id: 'SCH027', day: 'Monday', period: 1, session: 'Morning', subjectId: 'SUB2', classId: 'C102', room: '102', teacherId: 'GV0001' },
  { id: 'SCH028', day: 'Monday', period: 2, session: 'Morning', subjectId: 'SUB2', classId: 'C102', room: '102', teacherId: 'GV0001' },
];

export const MOCK_ASSIGNMENTS: TeachingAssignment[] = [
    { id: 'ASN001', teacherId: 'GV0001', subjectId: 'SUB1', classId: 'C101', sessionsPerWeek: 4 },
    { id: 'ASN002', teacherId: 'GV0001', subjectId: 'SUB2', classId: 'C101', sessionsPerWeek: 2 },
    { id: 'ASN003', teacherId: 'GV0003', subjectId: 'SUB3', classId: 'C101', sessionsPerWeek: 4 },
    { id: 'ASN004', teacherId: 'GV0003', subjectId: 'SUB6', classId: 'C101', sessionsPerWeek: 3 },
    { id: 'ASN005', teacherId: 'GV0004', subjectId: 'SUB4', classId: 'C101', sessionsPerWeek: 3 },
    { id: 'ASN006', teacherId: 'GV0002', subjectId: 'SUB5', classId: 'C101', sessionsPerWeek: 3 },
    // Class C102 (10A2)
    { id: 'ASN007', teacherId: 'GV0001', subjectId: 'SUB2', classId: 'C102', sessionsPerWeek: 2 },
    { id: 'ASN008', teacherId: 'GV0003', subjectId: 'SUB6', classId: 'C102', sessionsPerWeek: 2 },
];



export const CHART_DATA_STUDENTS_YEAR = [
  { year: '2019', students: 850 },
  { year: '2020', students: 920 },
  { year: '2021', students: 980 },
  { year: '2022', students: 1100 },
  { year: '2023', students: 1245 },
];

export const CHART_DATA_GENDER = [
  { name: 'Male', value: 600 },
  { name: 'Female', value: 645 },
];

// Initial Grades for Demonstration
export const MOCK_GRADES: StudentGrade[] = [
  // --- CURRENT SEMESTER (2025-2026, HK1) for Alice (S001) ---
  { 
    studentId: 'S001', subjectId: 'SUB1', oralScore: 9, fifteenMinScores: [8, 9, 8], midTermScore: 9, finalScore: 9.5, average: 9.1,
    academicYear: '2025-2026', semester: 'HK1', feedback: 'Nắm vững kiến thức, tư duy logic tốt. Cần phát huy.'
  },
  { 
    studentId: 'S001', subjectId: 'SUB2', oralScore: 8, fifteenMinScores: [8, 7], midTermScore: 8.5, finalScore: 9, average: 8.6,
    academicYear: '2025-2026', semester: 'HK1', feedback: 'Thái độ học tập nghiêm túc, làm bài tập đầy đủ.'
  },
  { 
    studentId: 'S001', subjectId: 'SUB3', oralScore: 8.5, fifteenMinScores: [9, 8.5], midTermScore: 9, finalScore: 8.5, average: 8.7,
    academicYear: '2025-2026', semester: 'HK1', feedback: 'Văn phong tốt, giàu cảm xúc.'
  },
  
  // --- PAST SEMESTER (2024-2025, HK2) for Alice (S001) ---
  { 
    studentId: 'S001', subjectId: 'SUB1', oralScore: 8, fifteenMinScores: [7, 8], midTermScore: 8, finalScore: 8.5, average: 8.2,
    academicYear: '2024-2025', semester: 'HK2', feedback: 'Có tiến bộ so với học kỳ trước.'
  },
  { 
    studentId: 'S001', subjectId: 'SUB2', oralScore: 9, fifteenMinScores: [9, 9], midTermScore: 9.5, finalScore: 10, average: 9.6,
    academicYear: '2024-2025', semester: 'HK2', feedback: 'Xuất sắc! Là học sinh giỏi nhất môn Lý của lớp.'
  },

  // --- Bob (S002) - Current Semester ---
  { 
    studentId: 'S002', subjectId: 'SUB1', oralScore: 7, fifteenMinScores: [6, 7], midTermScore: 7, finalScore: 6.5, average: 6.8,
    academicYear: '2025-2026', semester: 'HK1', feedback: 'Cần cố gắng làm bài tập về nhà đầy đủ hơn.'
  },
];

// Mock Feedback
export const MOCK_FEEDBACK: LessonFeedback[] = [
  { scheduleId: 'SCH001', date: '2025-01-10', rating: 'A', comment: 'Lớp tham gia xây dựng bài rất sôi nổi.', signature: 'Đã ký bởi Nguyễn Văn An', timestamp: '2025-01-10T08:00:00Z' }
];

// Mock Attendance (New)
export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', scheduleId: 'SCH001', date: '2025-01-10', studentId: 'S001', status: 'present' },
  { id: 'att2', scheduleId: 'SCH001', date: '2025-01-10', studentId: 'S002', status: 'absent' },
];

// --- MOCK STUDENT DATA ---
export const MOCK_ASSIGNMENTS_STUDENT: Assignment[] = [
  { id: 'AS001', subjectId: 'SUB1', title: 'Bài tập Đại số số 3', dueDate: '2025-10-25', status: 'pending' },
  { id: 'AS002', subjectId: 'SUB1', title: 'Kiểm tra Vector', dueDate: '2025-10-28', status: 'pending' },
  { id: 'AS003', subjectId: 'SUB2', title: 'Báo cáo thí nghiệm: Con lắc đơn', dueDate: '2025-10-22', status: 'submitted' },
  { id: 'AS004', subjectId: 'SUB3', title: 'Tiểu luận: Văn học hiện đại', dueDate: '2025-10-20', status: 'graded', grade: 9 },
  { id: 'AS005', subjectId: 'SUB4', title: 'Cấu trúc Hợp chất Hữu cơ', dueDate: '2025-10-30', status: 'pending' },
  { id: 'AS006', subjectId: 'SUB6', title: 'Thuyết trình Lịch sử', dueDate: '2025-10-15', status: 'late' },
];

export const MOCK_MATERIALS: LearningMaterial[] = [
  { 
    id: 'MAT001', 
    classId: 'C101', 
    subjectId: 'SUB1', 
    title: 'Tài liệu Giải tích cơ bản', 
    description: 'Giới thiệu về giới hạn và đạo hàm.',
    type: 'pdf', 
    url: '#', 
    uploadDate: '2025-10-01' 
  },
  { 
    id: 'MAT002', 
    classId: 'C101', 
    subjectId: 'SUB2', 
    title: 'Video: Định luật Newton', 
    description: 'Giải thích trực quan về 3 định luật chuyển động.',
    type: 'video', 
    url: '#', 
    uploadDate: '2025-10-05' 
  },
  { 
    id: 'MAT003', 
    classId: 'C101', 
    subjectId: 'SUB3', 
    title: 'Các biện pháp tu từ', 
    description: 'Bảng tóm tắt các biện pháp so sánh, ẩn dụ...',
    type: 'doc', 
    url: '#', 
    uploadDate: '2025-10-10' 
  },
  // Added materials for Class 10A2 (C102) to show filtering
  { 
    id: 'MAT004', 
    classId: 'C102', 
    subjectId: 'SUB2', 
    title: 'Công thức Động học', 
    description: 'Tổng hợp các công thức Vật lý cần nhớ.',
    type: 'pdf', 
    url: '#', 
    uploadDate: '2025-10-12' 
  },
];

// --- MOCK TUITION DATA ---
export const MOCK_TUITION: SemesterTuition[] = [
  // --- Alice (S001) ---
  // HK1 2025-2026: Scenario - Partial Payment & Some Unpaid
  {
    id: 'T2025-HK1-S001',
    studentId: 'S001', 
    academicYear: '2025-2026',
    semester: 'HK1',
    totalAmount: 7330000, 
    totalPaid: 6130000,
    status: 'incomplete',
    items: [
      { id: 'i1', name: 'Học phí chính khóa (Học kỳ 1)', amount: 4500000, paidAmount: 4500000, status: 'paid' },
      { id: 'i2', name: 'Bảo hiểm Y tế (Bắt buộc)', amount: 680000, paidAmount: 680000, status: 'paid' },
      { id: 'i3', name: 'Đồng phục (Áo trắng + Váy)', amount: 950000, paidAmount: 950000, status: 'paid' },
      { id: 'i4', name: 'Phụ đạo Toán nâng cao', amount: 1200000, paidAmount: 0, status: 'unpaid', dueDate: '2025-10-15' },
    ]
  },
  // HK2 2024-2025: Scenario - Fully Paid (History)
  {
    id: 'T2024-HK2-S001',
    studentId: 'S001', 
    academicYear: '2024-2025',
    semester: 'HK2',
    totalAmount: 7800000,
    totalPaid: 7800000,
    status: 'complete',
    items: [
      { id: 'i1-old', name: 'Học phí chính khóa', amount: 4500000, paidAmount: 4500000, status: 'paid' },
      { id: 'i2-old', name: 'Xe đưa đón (4 tháng)', amount: 3000000, paidAmount: 3000000, status: 'paid' },
      { id: 'i3-old', name: 'Nước uống tinh khiết', amount: 300000, paidAmount: 300000, status: 'paid' }
    ]
  },
  
  // --- Bob (S002) ---
  // HK1 2025-2026: Scenario - Mostly Unpaid
  {
    id: 'T2025-HK1-S002',
    studentId: 'S002',
    academicYear: '2025-2026',
    semester: 'HK1',
    totalAmount: 5180000,
    totalPaid: 680000,
    status: 'incomplete',
    items: [
      { id: 'i1-bob', name: 'Học phí chính khóa (Học kỳ 1)', amount: 4500000, paidAmount: 0, status: 'unpaid', dueDate: '2025-09-30' },
      { id: 'i2-bob', name: 'Bảo hiểm Y tế', amount: 680000, paidAmount: 680000, status: 'paid' }
    ]
  },

  // --- Charlie (S003) ---
  // HK1 2025-2026: Scenario - Fully Paid
  {
    id: 'T2025-HK1-S003',
    studentId: 'S003',
    academicYear: '2025-2026',
    semester: 'HK1',
    totalAmount: 5580000,
    totalPaid: 5580000,
    status: 'complete',
    items: [
      { id: 'i1-charlie', name: 'Học phí chính khóa (Học kỳ 1)', amount: 4500000, paidAmount: 4500000, status: 'paid' },
      { id: 'i2-charlie', name: 'Bảo hiểm Y tế', amount: 680000, paidAmount: 680000, status: 'paid' },
      { id: 'i3-charlie', name: 'Quỹ hội phụ huynh', amount: 400000, paidAmount: 400000, status: 'paid' }
    ]
  },

  // --- Diana (S004) ---
  // HK1 2025-2026: Scenario - Late / Overdue
  {
    id: 'T2025-HK1-S004',
    studentId: 'S004',
    academicYear: '2025-2026',
    semester: 'HK1',
    totalAmount: 6580000,
    totalPaid: 4500000,
    status: 'incomplete',
    items: [
      { id: 'i1-diana', name: 'Học phí chính khóa (Học kỳ 1)', amount: 4500000, paidAmount: 4500000, status: 'paid' },
      { id: 'i2-diana', name: 'Bảo hiểm Y tế', amount: 680000, paidAmount: 0, status: 'unpaid', dueDate: '2025-09-15' },
      { id: 'i3-diana', name: 'Học phí Anh văn tăng cường', amount: 1400000, paidAmount: 0, status: 'unpaid', dueDate: '2025-10-01' }
    ]
  }
];
