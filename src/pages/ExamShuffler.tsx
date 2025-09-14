import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  FileDown,
  FileText,
  Loader2,
  Settings,
  Shuffle,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// Khai báo cho TypeScript biết rằng thư viện Mammoth tồn tại trên đối tượng window.
declare global {
  interface Window {
    mammoth: any;
  }
}

// Các loại
interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  isFixed: boolean;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
  originalOrder: number;
}

interface ExamSettings {
  questionPrefix: string;
  startingNumber: number;
  numberOfExams: number;
  examCode: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  includeAnswerKey: boolean;
}

interface GeneratedExam {
  id: string;
  code: string;
  questions: Question[];
  answerKey: string[];
  createdAt: Date;
}

const ExamShuffler = () => {
  // States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [generatedExams, setGeneratedExams] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMammothReady, setIsMammothReady] = useState(false);

  // Default settings
  const [settings, setSettings] = useState({
    questionPrefix: 'Câu',
    startingNumber: 1,
    numberOfExams: 4,
    examCode: '',
    shuffleQuestions: true,
    shuffleAnswers: true,
    includeAnswerKey: true,
  });

  // Tải thư viện mammoth.js một cách an toàn
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/mammoth@1.6.0/mammoth.browser.js';
    script.onload = () => {
      setIsMammothReady(true);
    };
    script.onerror = () => {
      console.error('Không thể tải thư viện Mammoth.');
      setUploadStatus(
        'error: Lỗi khi tải thư viện xử lý file. Vui lòng thử lại sau.',
      );
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Regex để phân tích cú pháp
  const QUESTION_REGEX = /^(Câu\s*\d+|Question\s*\d+|\d+\.)\s*([\s\S]*)$/i;
  const ANSWER_REGEX = /^\s*([A-Z]\.|\*|\d+\.)\s*([\s\S]*)$/;

  // Xử lý đọc và phân tích file
  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!isMammothReady) {
        setUploadStatus(
          'error: Ứng dụng đang tải thư viện cần thiết. Vui lòng đợi một lát và thử lại.',
        );
        return;
      }

      if (
        file.type !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        setUploadStatus('error: Vui lòng chọn file .docx');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus('error: Kích thước file vượt quá 10MB');
        return;
      }

      setIsUploading(true);
      setUploadedFile(file);
      setUploadStatus('uploading');

      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({
          arrayBuffer: arrayBuffer,
        });
        const text = result.value;

        if (!text || text.trim().length === 0) {
          setUploadStatus('error: File trống hoặc không chứa văn bản.');
          return;
        }

        const parsedQuestions = parseQuestions(text);

        if (parsedQuestions.length === 0) {
          setUploadStatus(
            'error: Không tìm thấy câu hỏi nào. Vui lòng kiểm tra định dạng file.',
          );
        } else {
          setQuestions(parsedQuestions);
          setUploadStatus('success: Upload và phân tích file thành công');
        }
      } catch (error) {
        console.error('Lỗi khi đọc file:', error);
        setUploadStatus(
          'error: Không thể đọc file. Vui lòng kiểm tra file có bị lỗi không hoặc định dạng của file.',
        );
      } finally {
        setIsUploading(false);
      }
    },
    [isMammothReady],
  );

  // Hàm phân tích văn bản thành câu hỏi và đáp án
  const parseQuestions = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
    const questions = [];
    let currentQuestion = null;
    let originalOrder = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Kiểm tra nếu là một dòng câu hỏi mới
      const questionMatch = trimmedLine.match(QUESTION_REGEX);
      if (questionMatch) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          id: `q-${originalOrder}`,
          text: questionMatch[2].trim(), // Lấy phần nội dung câu hỏi
          answers: [],
          originalOrder: originalOrder,
        };
        originalOrder++;
      } else if (currentQuestion && trimmedLine.match(ANSWER_REGEX)) {
        // Kiểm tra nếu là một dòng đáp án
        const isCorrect = trimmedLine.includes('(đúng)');
        const isFixed = trimmedLine.includes('#');

        currentQuestion.answers.push({
          id: `a-${currentQuestion.answers.length + 1}`,
          text: trimmedLine.replace('(đúng)', '').replace('#', '').trim(),
          isCorrect,
          isFixed,
        });
      } else if (currentQuestion && trimmedLine.length > 0) {
        // Nếu không phải câu hỏi hoặc đáp án, thêm vào nội dung câu hỏi
        currentQuestion.text += ' ' + trimmedLine;
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    return questions;
  };
  // Shuffle array utility
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate exams
  const generateExams = useCallback(async () => {
    if (!questions.length) {
      alert('Vui lòng upload file đề gốc trước');
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const exams = [];

      for (let i = 0; i < settings.numberOfExams; i++) {
        // Shuffle questions if enabled
        let examQuestions = settings.shuffleQuestions
          ? shuffleArray(questions)
          : [...questions];

        // Shuffle answers for each question if enabled
        examQuestions = examQuestions.map((q) => {
          const nonFixedAnswers = q.answers.filter((a) => !a.isFixed);
          const fixedAnswers = q.answers.filter((a) => a.isFixed);
          return {
            ...q,
            answers: settings.shuffleAnswers
              ? shuffleArray(nonFixedAnswers).concat(fixedAnswers)
              : q.answers,
          };
        });

        // Generate answer key
        const answerKey = examQuestions.map((q) => {
          const correctIndex = q.answers.findIndex((a) => a.isCorrect);
          return String.fromCharCode(65 + correctIndex); // A, B, C, D
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
      alert('Tạo đề thi thất bại. Vui lòng thử lại');
    } finally {
      setIsGenerating(false);
    }
  }, [questions, settings]);

  // Download exam
  const downloadExam = (exam, includeAnswers = false) => {
    let content = `${exam.code}\n\n`;

    exam.questions.forEach((q, index) => {
      content += `${settings.questionPrefix} ${settings.startingNumber + index}. ${q.text}\n`;
      q.answers.forEach((a, aIndex) => {
        content += `${String.fromCharCode(65 + aIndex)}) ${a.text}\n`;
      });
      content += '\n';
    });

    if (includeAnswers) {
      content += '\nĐÁP ÁN:\n';
      exam.answerKey.forEach((answer, index) => {
        content += `${settings.questionPrefix} ${settings.startingNumber + index}: ${answer}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.code}${includeAnswers ? '-DapAn' : ''}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trộn Đề Trắc Nghiệm
        </h1>
        <p className="text-gray-600">
          Upload file Word, trộn câu hỏi và đáp án, tải về miễn phí
        </p>
      </div>

      {/* Instructions Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center text-blue-700 font-medium"
        >
          <FileText className="w-5 h-5 mr-2" />
          Hướng dẫn định dạng file Word
          <span className="ml-auto">{showInstructions ? '−' : '+'}</span>
        </button>

        {showInstructions && (
          <div className="mt-4 space-y-2 text-sm text-blue-800">
            <div className="bg-white p-4 rounded border">
              <p className="font-medium mb-2">Quy tắc định dạng:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • Câu hỏi bắt đầu bằng **"Câu"**, **"Question"** hoặc một số
                  theo sau dấu chấm. VD: "Câu 1.", "Question 1:", "1.", v.v.
                </li>
                <li>
                  • Mỗi đáp án nên ở một dòng riêng. Đáp án bắt đầu bằng một chữ
                  cái in hoa theo sau dấu chấm. VD: "A.", "B.", "C.", "D."
                </li>
                <li>• Đáp án đúng phải được đánh dấu bằng **(đúng)**.</li>
                <li>
                  • Đáp án cố định (không bị trộn): thêm dấu **#** trước. VD:
                  "#A. Đáp án cố định"
                </li>
                <li>
                  • Nếu nội dung câu hỏi quá dài, bạn có thể xuống dòng, miễn là
                  không có dòng trống ở giữa.
                </li>
                <li className="font-bold text-red-700 mt-2">
                  • LƯU Ý QUAN TRỌNG: Để đảm bảo file được đọc thành công, bạn
                  nên tạo file Word mới, chỉ sử dụng văn bản đơn giản và định
                  dạng tiêu chuẩn. Tránh các đối tượng phức tạp như hình ảnh,
                  bảng biểu hoặc các font chữ đặc biệt.
                </li>
              </ul>

              <div className="mt-3 bg-gray-50 p-3 rounded text-xs">
                <p className="font-medium">Ví dụ:</p>
                <pre className="mt-1">{`Câu 1. Thủ đô Việt Nam là?
A. TP.HCM
B. Hà Nội (đúng)
C. Đà Nẵng
D. Cần Thơ

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

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-blue-600" />
          Bước 1: Upload File Đề Gốc
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading || !isMammothReady}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
            )}
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isUploading ? 'Đang xử lý...' : 'Chọn file .docx'}
            </p>
            <p className="text-sm text-gray-500">
              Kéo thả hoặc click để chọn file (tối đa 10MB)
            </p>
          </label>
        </div>

        {uploadedFile && (
          <div className="mt-4 p-3 bg-gray-50 rounded flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-700">{uploadedFile.name}</span>
          </div>
        )}

        {uploadStatus && (
          <div
            className={`mt-4 p-3 rounded flex items-center ${
              uploadStatus.startsWith('error:')
                ? 'bg-red-50 text-red-700'
                : uploadStatus.startsWith('success:')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-blue-50 text-blue-700'
            }`}
          >
            {uploadStatus.startsWith('error:') ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : uploadStatus.startsWith('success:') ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            )}
            <span className="text-sm">
              {uploadStatus.replace(/^(error|success):\s*/, '')}
            </span>
          </div>
        )}

        {!isMammothReady && (
          <div className="mt-4 p-3 bg-gray-100 text-center rounded flex items-center justify-center text-gray-600">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Đang tải các thư viện cần thiết...</span>
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">
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

      {/* Settings */}
      {questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-orange-600" />
            Bước 2: Cài Đặt Trộn Đề
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền tố câu hỏi
                </label>
                <input
                  type="text"
                  value={settings.questionPrefix}
                  onChange={(e) =>
                    setSettings({ ...settings, questionPrefix: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Câu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số thứ tự bắt đầu
                </label>
                <input
                  type="number"
                  value={settings.startingNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      startingNumber: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng đề thi
                </label>
                <input
                  type="number"
                  value={settings.numberOfExams}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      numberOfExams: parseInt(e.target.value) || 4,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã đề (tùy chọn)
                </label>
                <input
                  type="text"
                  value={settings.examCode}
                  onChange={(e) =>
                    setSettings({ ...settings, examCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: KT-2024"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shuffle-questions"
                  checked={settings.shuffleQuestions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shuffleQuestions: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="shuffle-questions"
                  className="ml-2 text-sm text-gray-700"
                >
                  Trộn thứ tự câu hỏi
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shuffle-answers"
                  checked={settings.shuffleAnswers}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shuffleAnswers: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="shuffle-answers"
                  className="ml-2 text-sm text-gray-700"
                >
                  Trộn thứ tự đáp án
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-answer-key"
                  checked={settings.includeAnswerKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      includeAnswerKey: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="include-answer-key"
                  className="ml-2 text-sm text-gray-700"
                >
                  Tạo file đáp án
                </label>
              </div>

              <div className="mt-6">
                <button
                  onClick={generateExams}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang tạo đề...
                    </>
                  ) : (
                    <>
                      <Shuffle className="w-5 h-5 mr-2" />
                      Tạo Đề Thi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Exams */}
      {generatedExams.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2 text-green-600" />
            Bước 3: Tải Đề Thi
          </h2>

          <div className="grid gap-4">
            {generatedExams.map((exam, index) => (
              <div
                key={exam.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{exam.code}</h3>
                      <p className="text-sm text-gray-500">
                        {exam.questions.length} câu hỏi • Tạo lúc{' '}
                        {exam.createdAt.toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadExam(exam)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Đề thi
                    </button>

                    {settings.includeAnswerKey && (
                      <button
                        onClick={() => downloadExam(exam, true)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors flex items-center"
                      >
                        <FileDown className="w-4 h-4 mr-1" />
                        Đáp án
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Đã tạo thành công {generatedExams.length} đề thi! Click để tải
                  về.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamShuffler;
