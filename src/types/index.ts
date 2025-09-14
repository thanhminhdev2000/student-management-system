export interface UserData {
  id: string;
  username: string;
  full_name: string;
  role: string;
  unit: string;
  avatar_url?: string;
}

// types/index.ts
export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  isFixed: boolean;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
  originalOrder: number;
}

export interface ExamSettings {
  questionPrefix: string;
  startingNumber: number;
  numberOfExams: number;
  examCode: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  includeAnswerKey: boolean;
}

export interface GeneratedExam {
  id: string;
  code: string;
  questions: Question[];
  answerKey: string[];
  createdAt: Date;
}
