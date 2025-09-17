/* eslint-disable @typescript-eslint/no-explicit-any */
import Step1_FileUpload from '@/components/Step1_FileUpload';
import Step2_EssaySettings from '@/components/Step2_EssaySettings';
import Step3_DownloadEssayExams from '@/components/Step3_DownloadEssayExams';
import { ESSAY_INSTRUCTIONS, QUESTION_REGEX } from '@/constants/examConstants'; // Tái sử dụng Regex để nhận diện câu hỏi
import type { Exam, ExamSettings, Question } from '@/types/examTypes';
import { useCallback, useState } from 'react';

// Khai báo global interface nếu chưa có
declare global {
  interface Window {
    mammoth: any;
    docx: any;
  }
}

// Định nghĩa kiểu Question cho đề tự luận (không cần 'answers')
type EssayQuestion = Omit<Question, 'answers'>;

const EssayExamShuffler = () => {
  const [questions, setQuestions] = useState<EssayQuestion[]>([]);
  const [generatedExams, setGeneratedExams] = useState<Exam[]>([]);
  // Cài đặt mặc định cho đề tự luận
  const [settings, setSettings] = useState<ExamSettings>({
    questionPrefix: 'Câu',
    startingNumber: 1,
    numberOfExams: 2,
    numberOfQuestionsToGenerate: 0,
    examCode: '',
    shuffleQuestions: true,
    // Các trường không áp dụng
    shuffleAnswers: false,
    useCompactLayout: false,
    includeAnswerKey: false,
  });
  const [loading, setLoading] = useState({
    uploading: false,
    generating: false,
  });
  const [status, setStatus] = useState('');

  const parseEssayQuestions = useCallback((text: string): EssayQuestion[] => {
    const lines = text
      .split(/\r?\n/)
      .filter((line: string) => line.trim() !== '');
    const parsedQuestions: EssayQuestion[] = [];
    let currentQuestionText = '';
    let originalOrder = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const isNewQuestion = trimmedLine.match(QUESTION_REGEX);

      if (isNewQuestion) {
        // Lưu câu hỏi trước đó nếu có
        if (currentQuestionText) {
          parsedQuestions.push({
            id: `q-${originalOrder - 1}`,
            text: currentQuestionText,
            originalOrder: originalOrder - 1,
          });
        }
        // Bắt đầu câu hỏi mới
        currentQuestionText = isNewQuestion[2].trim();
        originalOrder++;
      } else if (currentQuestionText) {
        // Nối các dòng tiếp theo vào nội dung câu hỏi hiện tại
        currentQuestionText += ' ' + trimmedLine;
      }
    }

    // Lưu câu hỏi cuối cùng
    if (currentQuestionText) {
      parsedQuestions.push({
        id: `q-${originalOrder - 1}`,
        text: currentQuestionText,
        originalOrder: originalOrder - 1,
      });
    }

    return parsedQuestions;
  }, []);

  const handleTextProcessed = useCallback(
    (text: string) => {
      const essayQuestions = parseEssayQuestions(text); // Tự phân tích văn bản thô
      setQuestions(essayQuestions);
      setGeneratedExams([]);
      setSettings((prev) => ({
        ...prev,
        numberOfQuestionsToGenerate: essayQuestions.length,
      }));
      // Thêm kiểm tra để hiển thị status
      if (essayQuestions.length === 0 && text.length > 0) {
        setStatus(
          'error: Không tìm thấy câu hỏi nào. Vui lòng kiểm tra định dạng file tự luận.',
        );
      } else if (essayQuestions.length > 0) {
        setStatus('success: Upload và phân tích file thành công');
      }
    },
    [parseEssayQuestions],
  );

  // Hàm trộn mảng
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // HÀM TẠO ĐỀ THI
  const generateExams = useCallback(async () => {
    if (!questions.length) return;
    setLoading((prev) => ({ ...prev, generating: true }));
    setGeneratedExams([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập thời gian xử lý
      const exams: Exam[] = [];
      const questionsToUse = settings.shuffleQuestions
        ? shuffleArray(questions)
        : [...questions];
      const selectedQuestions = questionsToUse.slice(
        0,
        settings.numberOfQuestionsToGenerate,
      );

      for (let i = 0; i < settings.numberOfExams; i++) {
        exams.push({
          id: `exam-${i + 1}`,
          code: `${settings.examCode}-${String(i + 1).padStart(3, '0')}`,
          questions: selectedQuestions, // questions không có answers
          answerKey: [], // Không có đáp án
          createdAt: new Date(),
        });
      }
      setGeneratedExams(exams);
    } catch (error) {
      console.error('Lỗi khi tạo đề thi:', error);
      setStatus('error: Tạo đề thi thất bại.');
    } finally {
      setLoading((prev) => ({ ...prev, generating: false }));
    }
  }, [questions, settings]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Trộn Đề Thi Tự Luận
      </h1>

      <Step1_FileUpload
        onTextProcessed={(qs) => handleTextProcessed(qs)}
        loading={loading}
        setLoading={setLoading}
        status={status}
        setStatus={setStatus}
        questions={questions.map((q) => ({ ...q, answers: [] }))}
        instructions={ESSAY_INSTRUCTIONS}
      />

      {questions.length > 0 && (
        <Step2_EssaySettings
          settings={settings}
          onSettingsChange={setSettings}
          onGenerate={generateExams}
          questionsCount={questions.length}
          isGenerating={loading.generating}
        />
      )}

      {generatedExams.length > 0 && (
        <Step3_DownloadEssayExams exams={generatedExams} settings={settings} />
      )}
    </div>
  );
};

export default EssayExamShuffler;
