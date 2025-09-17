/* eslint-disable @typescript-eslint/no-explicit-any */
import Step1_FileUpload from '@/components/Step1_FileUpload';
import Step2_SettingsAndGenerate from '@/components/Step2_SettingsAndGenerate';
import Step3_DownloadExams from '@/components/Step3_DownloadExams';
import { ANSWER_REGEX, QUESTION_REGEX } from '@/constants/examConstants';
import type { Exam, ExamSettings, Question } from '@/types/examTypes';
import { useCallback, useState } from 'react';

declare global {
  interface Window {
    mammoth: any;
    docx: any;
  }
}

const MultipleChoiceExamShuffler = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatedExams, setGeneratedExams] = useState<Exam[]>([]);
  const [settings, setSettings] = useState<ExamSettings>({
    questionPrefix: 'Câu',
    startingNumber: 1,
    numberOfExams: 2,
    numberOfQuestionsToGenerate: 0,
    examCode: '',
    shuffleQuestions: true,
    shuffleAnswers: true,
    useCompactLayout: true,
    includeAnswerKey: true,
  });
  const [loading, setLoading] = useState({
    uploading: false,
    generating: false,
  });
  const [status, setStatus] = useState('');

  // Hàm phân tích văn bản thành câu hỏi và đáp án
  const parseQuestions = useCallback((text: string): Question[] => {
    // ... (Giữ nguyên logic này từ file gốc)
    const lines = text
      .split(/\r?\n/)
      .filter((line: string) => line.trim() !== '');
    const parsedQuestions: Question[] = [];
    let currentQuestion: Question | null = null;
    let originalOrder = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const questionMatch = trimmedLine.match(QUESTION_REGEX);

      if (questionMatch) {
        if (currentQuestion && currentQuestion.answers.length >= 4) {
          parsedQuestions.push(currentQuestion);
        }
        currentQuestion = {
          id: `q-${originalOrder}`,
          text: questionMatch[2].trim(),
          answers: [],
          originalOrder: originalOrder,
        };
        originalOrder++;
      } else if (currentQuestion && trimmedLine.match(ANSWER_REGEX)) {
        const match = trimmedLine.match(ANSWER_REGEX);
        if (match) {
          const rawText = match[2];
          const isCorrect = rawText.includes('(đúng)');
          const isFixed = rawText.includes('#');
          const cleanedText = rawText
            .replace('(đúng)', '')
            .replace('#', '')
            .trim();

          currentQuestion.answers.push({
            id: `a-${currentQuestion.answers.length + 1}`,
            text: cleanedText,
            isCorrect,
            isFixed,
          });
        }
      } else if (currentQuestion && trimmedLine.length > 0) {
        currentQuestion.text += ' ' + trimmedLine;
      }
    }

    if (currentQuestion && currentQuestion.answers.length >= 4) {
      parsedQuestions.push(currentQuestion);
    }
    return parsedQuestions;
  }, []);

  const handleFileProcessed = useCallback((newQuestions: Question[]) => {
    setQuestions(newQuestions);
    setGeneratedExams([]);
    setSettings((prev) => ({
      ...prev,
      numberOfQuestionsToGenerate: newQuestions.length,
    }));
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateExams = useCallback(async () => {
    if (!questions.length) return;
    setLoading((prev) => ({ ...prev, generating: true }));
    setGeneratedExams([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const exams: Exam[] = [];
      const shuffledQuestions = settings.shuffleQuestions
        ? shuffleArray(questions)
        : [...questions];
      const questionsToUse = shuffledQuestions.slice(
        0,
        settings.numberOfQuestionsToGenerate,
      );

      for (let i = 0; i < settings.numberOfExams; i++) {
        const examQuestions = questionsToUse.map((q) => {
          const nonFixedAnswers = q.answers.filter((a) => !a.isFixed);
          const fixedAnswers = q.answers.filter((a) => a.isFixed);
          return {
            ...q,
            answers: settings.shuffleAnswers
              ? shuffleArray(nonFixedAnswers).concat(fixedAnswers)
              : q.answers,
          };
        });
        const answerKey = examQuestions.map((q) => {
          const correctIndex = q.answers.findIndex((a) => a.isCorrect);
          return String.fromCharCode(65 + correctIndex);
        });
        exams.push({
          id: `exam-${i + 1}`,
          code: settings.examCode
            ? `${settings.examCode}-${i + 1}`
            : `Đề ${i + 1}`,
          questions: examQuestions,
          answerKey,
          createdAt: new Date(),
        });
      }
      setGeneratedExams(exams);
    } catch (error) {
      console.error('Lỗi khi tạo đề thi:', error);
      setStatus('error: Tạo đề thi thất bại. Vui lòng thử lại.');
    } finally {
      setLoading((prev) => ({ ...prev, generating: false }));
    }
  }, [questions, settings]);

  const handleSettingsChange = useCallback((newSettings: ExamSettings) => {
    setSettings(newSettings);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Trộn Đề Thi Trắc Nghiệm
      </h1>

      <Step1_FileUpload
        onFileProcessed={handleFileProcessed}
        loading={loading}
        setLoading={setLoading}
        status={status}
        setStatus={setStatus}
        questions={questions}
      />

      {questions.length > 0 && (
        <Step2_SettingsAndGenerate
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onGenerate={generateExams}
          questionsCount={questions.length}
          isGenerating={loading.generating}
        />
      )}

      {generatedExams.length > 0 && (
        <Step3_DownloadExams exams={generatedExams} settings={settings} />
      )}
    </div>
  );
};

export default MultipleChoiceExamShuffler;
