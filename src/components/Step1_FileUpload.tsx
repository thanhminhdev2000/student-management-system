import { ANSWER_REGEX, QUESTION_REGEX } from '@/constants/examConstants';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import type { Question } from '../types/examTypes';

type Props = {
  onFileProcessed: (questions: Question[]) => void;
  loading: { uploading: boolean; generating: boolean };
  setLoading: React.Dispatch<
    React.SetStateAction<{ uploading: boolean; generating: boolean }>
  >;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  questions: Question[];
};

const Step1_FileUpload = ({
  onFileProcessed,
  loading,
  setLoading,
  status,
  setStatus,
  questions,
}: Props) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isMammothReady, setIsMammothReady] = useState(false);

  // Tải thư viện mammoth.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/mammoth@1.6.0/mammoth.browser.js';
    script.onload = () => setIsMammothReady(true);
    script.onerror = () => {
      console.error('Failed to load Mammoth library.');
      setStatus(
        'error: Lỗi khi tải thư viện xử lý file. Vui lòng thử lại sau.',
      );
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [setStatus]);

  // Hàm phân tích văn bản từ file (Giữ nguyên logic)
  // This is the corrected version of your parseQuestions function
  const parseQuestions = useCallback((text: string): Question[] => {
    const lines = text
      .split(/\r?\n/)
      .filter((line: string) => line.trim() !== '');
    const questions: Question[] = [];
    let currentQuestion: Question | null = null;
    let originalOrder = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for a new question line
      const questionMatch = trimmedLine.match(QUESTION_REGEX);
      if (questionMatch) {
        // If a previous question exists, push it before starting a new one
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        // Initialize new question with an empty answers array
        currentQuestion = {
          id: `q-${originalOrder}`,
          text: questionMatch[2].trim(),
          answers: [], // Ensures answers array is never undefined
          originalOrder: originalOrder,
        };
        originalOrder++;
      } else if (currentQuestion && trimmedLine.match(ANSWER_REGEX)) {
        // Check for an answer line
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
        // If it's a continuation of the question text
        currentQuestion.text += ' ' + trimmedLine;
      }
    }

    // Push the last question after the loop finishes
    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    // Filter out any questions that have too few answers to be valid
    return questions.filter((q) => q.answers.length >= 2);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (!isMammothReady) {
        setStatus(
          'error: Ứng dụng đang tải các thư viện cần thiết. Vui lòng đợi một lát và thử lại.',
        );
        return;
      }
      if (
        file.type !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        setStatus('error: Vui lòng chọn file .docx');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setStatus('error: Kích thước file vượt quá 10MB');
        return;
      }

      setLoading((prev) => ({ ...prev, uploading: true }));
      setUploadedFile(file);
      setStatus('uploading');

      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({
          arrayBuffer: arrayBuffer,
        });
        const text = result.value;

        if (!text || text.trim().length === 0) {
          setStatus('error: File trống hoặc không chứa văn bản.');
          onFileProcessed([]);
        } else {
          const parsedQuestions = parseQuestions(text);
          if (parsedQuestions.length === 0) {
            setStatus(
              'error: Không tìm thấy câu hỏi nào. Vui lòng kiểm tra định dạng file.',
            );
            onFileProcessed([]);
          } else {
            onFileProcessed(parsedQuestions);
            setStatus('success: Upload và phân tích file thành công');
          }
        }
      } catch (error) {
        console.error('Lỗi khi đọc file:', error);
        setStatus(
          'error: Không thể đọc file. Vui lòng kiểm tra file có bị lỗi không hoặc định dạng của file.',
        );
      } finally {
        setLoading((prev) => ({ ...prev, uploading: false }));
      }
    },
    [isMammothReady, setLoading, setStatus, onFileProcessed, parseQuestions],
  );

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  // Thêm xử lý Drag-and-Drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-blue-600" />
        Bước 1: Upload File đề gốc
      </h2>

      {/* Instructions Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center text-blue-700 font-medium"
        >
          <FileText className="w-5 h-5 mr-2" />
          Hướng dẫn định dạng file Word
          <span className="ml-auto text-xl font-light">
            {showInstructions ? '−' : '+'}
          </span>
        </button>

        {showInstructions && (
          <div className="mt-4 space-y-2 text-sm text-blue-800">
            <div className="bg-white p-4 rounded border">
              <p className="font-medium mb-2">Quy tắc định dạng:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>
                  Câu hỏi bắt đầu bằng **"Câu"**, **"Question"** hoặc một số
                  theo sau dấu chấm hoặc dấu hai chấm. VD: "Câu 1.", "Câu 1:",
                  "Question 1:", "1.", v.v.
                </li>
                <li>
                  Mỗi đáp án nên ở một dòng riêng. Đáp án bắt đầu bằng một chữ
                  cái in hoa theo sau dấu chấm hoặc dấu ngoặc đóng. VD: "A.",
                  "B.", "C.", "D." hoặc "A)", "B)", "C)".
                </li>
                <li>
                  Đáp án đúng phải được đánh dấu bằng **(đúng)**. Việc tô màu
                  **không** được hỗ trợ.
                </li>
                <li>
                  Đáp án cố định (không bị trộn): thêm dấu **#** trước. VD: "#A.
                  Đáp án cố định"
                </li>
                <li>
                  Nếu nội dung câu hỏi quá dài, bạn có thể xuống dòng, miễn là
                  không có dòng trống ở giữa.
                </li>
                <li className="font-bold text-red-700 mt-2">
                  LƯU Ý QUAN TRỌNG: Để đảm bảo file được đọc thành công, bạn nên
                  tạo file Word mới, chỉ sử dụng văn bản đơn giản và định dạng
                  tiêu chuẩn. Tránh các đối tượng phức tạp như hình ảnh, bảng
                  biểu hoặc các font chữ đặc biệt.
                </li>
              </ul>
              <div className="mt-3 bg-gray-50 p-3 rounded text-xs">
                <p className="font-medium">Ví dụ:</p>
                <pre className="mt-1 whitespace-pre-wrap">{`Câu 1. Thủ đô Việt Nam là?
A) TP.HCM
B) Hà Nội (đúng)
C) Đà Nẵng
D) Cần Thơ

Câu 2. Dòng thơ này của ai?
Yêu sao
những ngọn sóng
đá bạc đầu
#A. Tố Hữu
B. Xuân Diệu (đúng)`}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".docx"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-upload"
          disabled={loading.uploading || !isMammothReady}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          {loading.uploading ? (
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
          )}
          <p className="text-lg font-medium text-gray-700 mb-2">
            {loading.uploading
              ? 'Đang xử lý...'
              : 'Kéo thả hoặc click để chọn file .docx'}
          </p>
          <p className="text-sm text-gray-500">Tối đa 10MB</p>
        </label>
      </div>

      {uploadedFile && (
        <div className="mt-4 p-3 bg-gray-50 rounded flex items-center">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm text-gray-700">{uploadedFile.name}</span>
        </div>
      )}

      {status && (
        <div
          className={`mt-4 p-3 rounded flex items-center ${status.startsWith('error:') ? 'bg-red-50 text-red-700' : status.startsWith('success:') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}
        >
          {status.startsWith('error:') ? (
            <AlertCircle className="w-5 h-5 mr-2" />
          ) : status.startsWith('success:') ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          )}
          <span className="text-sm">
            {status.replace(/^(error|success):\s*/, '')}
          </span>
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">
                Đã phân tích được {questions.length} câu hỏi
              </span>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center text-sm text-green-600 hover:text-green-800"
            >
              <Eye className="w-4 h-4 mr-1" />
              {showPreview ? 'Ẩn' : 'Xem'} trước
            </button>
          </div>
          {showPreview && (
            <div className="mt-3 max-h-40 overflow-y-auto bg-white p-3 rounded border">
              {questions.slice(0, 2).map((q, index) => (
                <div key={q.id} className="mb-3 text-xs">
                  <p className="font-medium">
                    Câu {index + 1}: {q.text}
                  </p>
                  <div className="ml-3 mt-1">
                    {q.answers.map((a, aIndex) => (
                      <p
                        key={a.id}
                        className={
                          a.isCorrect
                            ? 'text-green-600 font-medium'
                            : 'text-gray-600'
                        }
                      >
                        {String.fromCharCode(65 + aIndex)}. {a.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {questions.length > 2 && (
                <p className="text-gray-500 text-xs">
                  ...và {questions.length - 2} câu khác
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Step1_FileUpload;
