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

export interface Exam {
  id: string;
  code: string;
  questions: Question[];
  answerKey: string[];
  createdAt: Date;
}

export interface Settings {
  questionPrefix: string;
  startingNumber: number;
  numberOfExams: number;
  numberOfQuestionsToGenerate: number;
  examCode: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  useCompactLayout: boolean;
  includeAnswerKey: boolean;
}

export interface ExamSettings {
  questionPrefix: string;
  startingNumber: number;
  numberOfExams: number;
  numberOfQuestionsToGenerate: number;
  examCode: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  useCompactLayout: boolean;
  includeAnswerKey: boolean;
}
