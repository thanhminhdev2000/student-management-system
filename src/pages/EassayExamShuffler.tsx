/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Settings,
  Shuffle,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';

// --- TYPES ---
// Định nghĩa các kiểu dữ liệu cần thiết cho đề thi tự luận
interface EssayQuestion {
  id: string;
  text: string;
  originalOrder: number;
}

interface EssayExam {
  id: string;
  code: string;
  questions: EssayQuestion[];
  createdAt: Date;
}

interface EssayExamSettings {
  questionPrefix: string;
  startingNumber: number;
  numberOfExams: number;
  numberOfQuestionsToGenerate: number;
}

// --- REGEX ---
// Regex để xác định một dòng là câu hỏi (ví dụ: "Câu 1:", "Câu 1.", "Question 1:")
const QUESTION_REGEX = /^(câu|question)\s*(\d+)\s*[:.]?\s*(.*)/i;

// --- COMPONENT CHÍNH ---
const EassayExamShuffler = () => {
  const [questions, setQuestions] = useState<EssayQuestion[]>([]);
  const [generatedExams, setGeneratedExams] = useState<EssayExam[]>([]);
  const [settings, setSettings] = useState<EssayExamSettings>({
    questionPrefix: 'Câu',
    startingNumber: 1,
    numberOfExams: 4,
    numberOfQuestionsToGenerate: 0,
  });
  const [loading, setLoading] = useState({
    uploading: false,
    generating: false,
  });
  const [status, setStatus] = useState('');
  const [isMammothReady, setIsMammothReady] = useState(false);
  const [isDocxReady, setIsDocxReady] = useState(false);

  // --- HOOKS ---
  // Tải các thư viện bên ngoài (mammoth.js để đọc .docx, docx để tạo .docx)
  useEffect(() => {
    const mammothScript = document.createElement('script');
    mammothScript.src = 'https://unpkg.com/mammoth@1.6.0/mammoth.browser.js';
    mammothScript.onload = () => setIsMammothReady(true);
    document.body.appendChild(mammothScript);

    const docxScript = document.createElement('script');
    docxScript.src = 'https://unpkg.com/docx@8.2.1/build/index.umd.js';
    docxScript.onload = () => setIsDocxReady(true);
    document.body.appendChild(docxScript);

    return () => {
      document.body.removeChild(mammothScript);
      document.body.removeChild(docxScript);
    };
  }, []);

  // --- FUNCTIONS ---
  /**
   * Phân tích văn bản thành danh sách câu hỏi tự luận.
   * Chỉ tìm các dòng bắt đầu bằng "Câu X:" và bỏ qua mọi thứ khác.
   */
  const parseEssayQuestions = useCallback((text: string): EssayQuestion[] => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
    const parsedQuestions: EssayQuestion[] = [];
    let currentQuestion: EssayQuestion | null = null;
    let originalOrder = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const questionMatch = trimmedLine.match(QUESTION_REGEX);

      if (questionMatch) {
        if (currentQuestion) {
          parsedQuestions.push(currentQuestion);
        }
        currentQuestion = {
          id: `q-${originalOrder}`,
          text: questionMatch[3].trim(), // Lấy nội dung câu hỏi
          originalOrder: originalOrder++,
        };
      } else if (currentQuestion) {
        // Nếu dòng không phải là câu hỏi mới, nối nó vào câu hỏi hiện tại
        currentQuestion.text += ' ' + trimmedLine;
      }
    }

    if (currentQuestion) {
      parsedQuestions.push(currentQuestion);
    }
    return parsedQuestions;
  }, []);

  /**
   * Xử lý file .docx được người dùng tải lên.
   */
  const processFile = useCallback(
    async (file: File) => {
      if (!isMammothReady) {
        setStatus(
          'error: Thư viện xử lý file chưa sẵn sàng. Vui lòng thử lại.',
        );
        return;
      }
      if (!file.name.endsWith('.docx')) {
        setStatus('error: Vui lòng chọn file .docx');
        return;
      }

      setLoading((prev) => ({ ...prev, uploading: true }));
      setStatus('uploading');
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await (window as any).mammoth.extractRawText({
          arrayBuffer,
        });
        const parsed = parseEssayQuestions(result.value);

        if (parsed.length === 0) {
          setStatus(
            'error: Không tìm thấy câu hỏi nào. Vui lòng kiểm tra định dạng file.',
          );
          setQuestions([]);
        } else {
          setQuestions(parsed);
          setSettings((prev) => ({
            ...prev,
            numberOfQuestionsToGenerate: parsed.length,
          }));
          setStatus(`success: Phân tích thành công ${parsed.length} câu hỏi.`);
        }
        setGeneratedExams([]);
      } catch (error) {
        setStatus('error: Không thể đọc file. File có thể bị lỗi.');
        console.error(error);
      } finally {
        setLoading((prev) => ({ ...prev, uploading: false }));
      }
    },
    [isMammothReady, parseEssayQuestions],
  );

  /**
   * Xáo trộn một mảng (thuật toán Fisher-Yates).
   */
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /**
   * Tạo các đề thi đã được trộn.
   */
  const generateExams = useCallback(async () => {
    if (!questions.length) return;
    setLoading((prev) => ({ ...prev, generating: true }));
    setGeneratedExams([]);

    // Giả lập độ trễ để người dùng thấy quá trình
    await new Promise((resolve) => setTimeout(resolve, 500));

    const exams: EssayExam[] = [];
    const questionsToUse = shuffleArray(questions).slice(
      0,
      settings.numberOfQuestionsToGenerate,
    );

    for (let i = 0; i < settings.numberOfExams; i++) {
      const examQuestions = shuffleArray(questionsToUse); // Trộn câu hỏi cho mỗi đề
      exams.push({
        id: `exam-${i + 1}`,
        code: `Đề tự luận ${i + 1}`,
        questions: examQuestions,
        createdAt: new Date(),
      });
    }

    setGeneratedExams(exams);
    setLoading((prev) => ({ ...prev, generating: false }));
  }, [questions, settings]);

  /**
   * Tải xuống một đề thi dưới dạng file .docx.
   */
  const downloadExam = useCallback(
    async (exam: EssayExam) => {
      if (!isDocxReady) {
        alert('Thư viện tạo file Word chưa sẵn sàng. Vui lòng đợi và thử lại.');
        return;
      }

      const { Document, Paragraph, TextRun, AlignmentType } = (window as any)
        .docx;
      const docContent: any[] = [];

      // Thêm mã đề
      docContent.push(
        new Paragraph({
          children: [new TextRun({ text: exam.code, size: 36, bold: true })],
          alignment: AlignmentType.CENTER,
        }),
      );
      docContent.push(new Paragraph('')); // Dòng trống

      // Thêm các câu hỏi
      exam.questions.forEach((question, index) => {
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${settings.questionPrefix} ${index + settings.startingNumber}. ${question.text}`,
                bold: true,
              }),
            ],
          }),
        );
        // Thêm một dòng trống sau mỗi câu hỏi như yêu cầu
        docContent.push(new Paragraph(''));
      });

      const doc = new Document({ sections: [{ children: docContent }] });

      // Tạo và tải file
      try {
        const blob = await (window as any).docx.Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exam.code}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Lỗi khi tạo file Word:', error);
        alert('Tải file Word thất bại.');
      }
    },
    [isDocxReady, settings],
  );

  const handleSettingsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSettings((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    },
    [],
  );

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // --- RENDER ---
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 font-sans">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Trộn Đề Thi Tự Luận
      </h1>

      {/* --- BƯỚC 1: UPLOAD --- */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-blue-600" />
          Bước 1: Upload File Câu Hỏi
        </h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload-essay"
            disabled={loading.uploading || !isMammothReady}
          />
          <label
            htmlFor="file-upload-essay"
            className="cursor-pointer flex flex-col items-center"
          >
            {loading.uploading ? (
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
            )}
            <p className="text-lg font-medium text-gray-700">
              {loading.uploading
                ? 'Đang xử lý...'
                : 'Chọn file .docx chứa câu hỏi'}
            </p>
            <p className="text-sm text-gray-500">
              Định dạng: "Câu 1: Nội dung..."
            </p>
          </label>
        </div>
        {status && (
          <div
            className={`mt-4 p-3 rounded text-sm flex items-center ${status.startsWith('error:') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
          >
            {status.startsWith('error:') ? (
              <FileText className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {status.replace(/^(error|success):\s*/, '')}
          </div>
        )}
      </div>

      {/* --- BƯỚC 2: CÀI ĐẶT & TẠO ĐỀ --- */}
      {questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Bước 2: Cài đặt và Tạo đề
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label
                htmlFor="numberOfExams"
                className="block text-sm font-medium text-gray-700"
              >
                Số lượng đề
              </label>
              <input
                type="number"
                name="numberOfExams"
                value={settings.numberOfExams}
                onChange={handleSettingsChange}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="numberOfQuestionsToGenerate"
                className="block text-sm font-medium text-gray-700"
              >
                Số câu hỏi mỗi đề
              </label>
              <input
                type="number"
                name="numberOfQuestionsToGenerate"
                value={settings.numberOfQuestionsToGenerate}
                onChange={handleSettingsChange}
                min="1"
                max={questions.length}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </div>
          </div>
          <button
            onClick={generateExams}
            disabled={loading.generating}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center"
          >
            {loading.generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tạo đề...
              </>
            ) : (
              <>
                <Shuffle className="w-5 h-5 mr-2" /> Tạo đề tự luận
              </>
            )}
          </button>
        </div>
      )}

      {/* --- BƯỚC 3: TẢI ĐỀ --- */}
      {generatedExams.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2 text-green-600" />
            Bước 3: Tải đề thi
          </h2>
          <div className="grid gap-4">
            {generatedExams.map((exam) => (
              <div
                key={exam.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium">{exam.code}</h3>
                    <p className="text-sm text-gray-500">
                      {exam.questions.length} câu hỏi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => downloadExam(exam)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" /> Tải về
                </button>
              </div>
            ))}
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">
                Đã tạo thành công {generatedExams.length} đề thi tự luận!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EassayExamShuffler;
