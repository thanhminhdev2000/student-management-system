import type { ExamSettings, Question } from '@/types';
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';

export const menuItems = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/dashboard',
    color: 'text-blue-600',
  },
  {
    id: 'students',
    icon: Users,
    label: 'Quản lý học viên',
    path: '/students',
    color: 'text-green-600',
  },
  {
    id: 'exam',
    icon: FileText,
    label: 'Thi & Kiểm tra',
    path: '/exam',
    color: 'text-orange-600',
  },
  {
    id: 'reports',
    icon: BarChart3,
    label: 'Báo cáo',
    path: '/reports',
    color: 'text-red-600',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Cài đặt',
    path: '/settings',
    color: 'text-gray-600',
  },
];

export const APP_CONFIG = {
  name: 'Trộn Đề Trắc Nghiệm',
  version: '1.0.0',
  description: 'Ứng dụng trộn đề trắc nghiệm miễn phí',
} as const;

export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  allowedExtensions: ['.docx'],
} as const;

export const EXAM_CONFIG = {
  maxExams: 20,
  maxQuestionsPerExam: 100,
  defaultSettings: {
    questionPrefix: 'Câu',
    startingNumber: 1,
    numberOfExams: 4,
    examCode: '',
    shuffleQuestions: true,
    shuffleAnswers: true,
    includeAnswerKey: true,
  } as ExamSettings,
} as const;

export const UI_CONFIG = {
  colors: {
    primary: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'indigo',
  },
  animations: {
    duration: 300,
    easing: 'ease-in-out',
  },
} as const;

export const QUESTION_PATTERNS = {
  questionStart: /(Câu|Question)\s*(\d+)[\.\:\s]+/gi,
  answerPattern: /([#]?[A-D])\.(.+?)(?=[#]?[A-D]\.|$)/gis,
  correctAnswerIndicators: [
    /<strong>/i,
    /<u>/i,
    /color:\s*red/i,
    /background-color:\s*red/i,
    /text-decoration:\s*underline/i,
  ],
} as const;

export const EXAM_RULES = {
  instructions: [
    'Xóa hết phần đầu và phần cuối đề thi, chỉ để lại nội dung câu hỏi và câu trả lời',
    'Câu hỏi phải bắt đầu bằng "Câu" hoặc "Question". Ví dụ: "Câu 1.", "Câu 2:", "Question 1."',
    'Phải xuống dòng (Enter) trước khi gõ các đáp án',
    'Các đáp án bắt buộc phải bắt đầu bằng "A.", "B.", "C.", "D."',
    'Nếu cần cố định đáp án nào thì đặt thêm dấu # liền trước. Ví dụ: "#A."',
    'Mỗi đáp án nên nằm trên một dòng riêng',
    'Đáp án đúng phải tô màu đỏ hoặc gạch chân',
    'Hình ảnh cần để ở chế độ "Inline With Text"',
  ],
  example: `Câu 1. What is the capital of Vietnam?
A. Ho Chi Minh City
B. Hanoi (← tô màu đỏ)
C. Da Nang
D. Can Tho

Câu 2. Choose the correct answer:
A. Option A
B. Option B
#C. All of the above (← cố định, tô màu đỏ)
D. Option D`,
} as const;

export const ERROR_MESSAGES = {
  fileUpload: {
    invalidType: 'Vui lòng chọn file .docx',
    tooLarge: `Kích thước file vượt quá ${FILE_CONFIG.maxSize / 1024 / 1024}MB`,
    uploadFailed: 'Upload file thất bại. Vui lòng thử lại',
    parseFailed: 'Không thể đọc file. Vui lòng kiểm tra định dạng',
  },
  parsing: {
    noQuestions: 'Không tìm thấy câu hỏi nào trong file',
    invalidFormat: 'File không đúng định dạng yêu cầu',
    missingAnswers: 'Một số câu hỏi không có đủ đáp án',
  },
  generation: {
    noFile: 'Vui lòng upload file đề gốc trước',
    generationFailed: 'Tạo đề thi thất bại. Vui lòng thử lại',
  },
} as const;

export const SUCCESS_MESSAGES = {
  fileUpload: 'Upload file thành công',
  parsing: 'Phân tích file hoàn tất',
  generation: 'Tạo đề thi thành công',
  download: 'Tải file thành công',
} as const;

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Thủ đô của Việt Nam là gì?',
    answers: [
      {
        id: 'a1',
        text: 'Hồ Chí Minh',
        isCorrect: false,
        isFixed: false,
      },
      { id: 'a2', text: 'Hà Nội', isCorrect: true, isFixed: false },
      { id: 'a3', text: 'Đà Nẵng', isCorrect: false, isFixed: false },
      { id: 'a4', text: 'Cần Thơ', isCorrect: false, isFixed: false },
    ],
    originalOrder: 1,
  },
  {
    id: '2',
    text: 'Ai là người sáng lập ra Microsoft?',
    answers: [
      {
        id: 'a5',
        text: 'Steve Jobs',
        isCorrect: false,
        isFixed: false,
      },
      { id: 'a6', text: 'Bill Gates', isCorrect: true, isFixed: false },
      {
        id: 'a7',
        text: 'Mark Zuckerberg',
        isCorrect: false,
        isFixed: false,
      },
      { id: 'a8', text: 'Elon Musk', isCorrect: false, isFixed: false },
    ],
    originalOrder: 2,
  },
  {
    id: '3',
    text: 'Ngôn ngữ lập trình nào được sử dụng nhiều nhất?',
    answers: [
      { id: 'a9', text: 'Python', isCorrect: false, isFixed: false },
      {
        id: 'a10',
        text: 'JavaScript',
        isCorrect: true,
        isFixed: false,
      },
      { id: 'a11', text: 'Java', isCorrect: false, isFixed: false },
      { id: 'a12', text: 'C++', isCorrect: false, isFixed: false },
    ],
    originalOrder: 3,
  },
];
