/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Exam, ExamSettings, Question } from '@/types/examTypes';
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
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type JSXElementConstructor,
  type Key,
  type ReactElement,
  type ReactNode,
  type ReactPortal,
} from 'react';
import { ANSWER_REGEX, QUESTION_REGEX } from '../constants/examConstants';

// Khai báo cho TypeScript biết rằng thư viện Mammoth và Docx tồn tại trên đối tượng window.
declare global {
  interface Window {
    mammoth: any;
    docx: any;
  }
}

const ExamShuffler = () => {
  // States
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatedExams, setGeneratedExams] = useState<Exam[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isMammothReady, setIsMammothReady] = useState<boolean>(false);
  const [isDocxReady, setIsDocxReady] = useState<boolean>(false);

  // Default settings
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

  // Tải thư viện mammoth.js và docx một cách an toàn
  useEffect(() => {
    const loadScript = (
      src: string,
      onLoadCallback: ((this: GlobalEventHandlers, ev: Event) => any) | null,
      onErrorCallback: OnErrorEventHandler,
    ) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = onLoadCallback;
      script.onerror = onErrorCallback;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    };

    const cleanupMammoth = loadScript(
      'https://unpkg.com/mammoth@1.6.0/mammoth.browser.js',
      () => setIsMammothReady(true),
      () => {
        // eslint-disable-next-line no-console
        console.error('Không thể tải thư viện Mammoth.');
        setUploadStatus(
          'error: Lỗi khi tải thư viện xử lý file. Vui lòng thử lại sau.',
        );
      },
    );

    const cleanupDocx = loadScript(
      'https://unpkg.com/docx@7.3.0/build/index.js',
      () => setIsDocxReady(true),
      () => {
        // eslint-disable-next-line no-console
        console.error('Không thể tải thư viện Docx.');
        setUploadStatus(
          'error: Lỗi khi tải thư viện tạo file. Vui lòng thử lại sau.',
        );
      },
    );

    return () => {
      cleanupMammoth();
      cleanupDocx();
    };
  }, []);

  // Xử lý đọc và phân tích file
  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!isMammothReady) {
        setUploadStatus(
          'error: Ứng dụng đang tải các thư viện cần thiết. Vui lòng đợi một lát và thử lại.',
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

      // Reset states here when a new file is selected
      setQuestions([]);
      setGeneratedExams([]);
      setUploadedFile(null);
      setUploadStatus('');

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
          setSettings((prev) => ({
            ...prev,
            numberOfQuestionsToGenerate: parsedQuestions.length,
          }));
          setUploadStatus('success: Upload và phân tích file thành công');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
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
  const parseQuestions = (text: string): Question[] => {
    const lines = text
      .split(/\r?\n/)
      .filter((line: string) => line.trim() !== '');
    const questions: Question[] = [];
    let currentQuestion: Question | null = null;
    let originalOrder = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Kiểm tra nếu là một dòng câu hỏi mới
      const questionMatch = trimmedLine.match(QUESTION_REGEX);
      if (questionMatch) {
        if (currentQuestion && currentQuestion.answers.length >= 4) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          id: `q-${originalOrder}`,
          text: questionMatch[2].trim(),
          answers: [],
          originalOrder: originalOrder,
        };
        originalOrder++;
      } else if (currentQuestion && trimmedLine.match(ANSWER_REGEX)) {
        // Kiểm tra nếu là một dòng đáp án và trích xuất nội dung sau tiền tố A) B) C)
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
        // Nếu không phải câu hỏi hoặc đáp án, thêm vào nội dung câu hỏi
        currentQuestion.text += ' ' + trimmedLine;
      }
    }

    if (currentQuestion && currentQuestion.answers.length >= 4) {
      questions.push(currentQuestion);
    }
    return questions;
  };

  // Shuffle array utility
  const shuffleArray = <T,>(array: T[]): T[] => {
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
      // eslint-disable-next-line no-alert
      alert('Vui lòng upload file đề gốc trước');
      return;
    }

    setIsGenerating(true);

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
        // Shuffle answers for each question if enabled
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
      // eslint-disable-next-line no-alert
      alert('Tạo đề thi thất bại. Vui lòng thử lại');
    } finally {
      setIsGenerating(false);
    }
  }, [questions, settings]);

  const downloadExam = async (exam: Exam, includeAnswerKey = false) => {
    if (!isDocxReady) {
      setUploadStatus(
        'error: Thư viện tạo file Word chưa sẵn sàng. Vui lòng đợi và thử lại.',
      );
      return;
    }

    const { Document, Paragraph, TextRun, AlignmentType } = window.docx;

    const docContent: any[] = [];
    let fileName = '';

    if (includeAnswerKey) {
      fileName = `${exam.code}-DapAn.docx`;
      docContent.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `ĐÁP ÁN: ${exam.code}`,
              bold: true,
              font: 'Times New Roman',
              size: 24, // 12pt
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 300,
          },
        }),
      );

      const answerParagraphs = exam.questions.map(
        (q, index) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${settings.questionPrefix} ${
                  settings.startingNumber + index
                }: ${exam.answerKey[index]}`,
                bold: true,
                font: 'Times New Roman',
                size: 17, // 8.5pt
              }),
            ],
            spacing: {
              after: 100,
            },
          }),
      );
      docContent.push(...answerParagraphs);
    } else {
      fileName = `${exam.code}.docx`;
      docContent.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exam.code,
              bold: true,
              font: 'Times New Roman',
              size: 24, // 12pt
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 300,
          },
        }),
      );
      docContent.push(new Paragraph(' '));

      // Threshold for compact layout
      const COMPACT_LAYOUT_THRESHOLD = 100;

      exam.questions.forEach((q, index) => {
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${settings.questionPrefix} ${
                  settings.startingNumber + index
                }. ${q.text}`,
                bold: true,
                font: 'Times New Roman',
                size: 17, // 8.5pt
              }),
            ],
            spacing: {
              after: 100,
            },
          }),
        );

        // Check if answers are short enough for compact layout
        const totalAnswerLength = q.answers.reduce(
          (sum, a) => sum + a.text.length,
          0,
        );

        if (
          settings.useCompactLayout &&
          totalAnswerLength < COMPACT_LAYOUT_THRESHOLD
        ) {
          // Compact layout sử dụng paragraph với tab stops
          const firstTwoAnswers = q.answers.slice(0, 2);
          const lastTwoAnswers = q.answers.slice(2, 4);

          // Dòng đầu tiên: A và C
          docContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${String.fromCharCode(65 + 0)}) ${firstTwoAnswers[0].text}`,
                  font: 'Times New Roman',
                  size: 17,
                }),
                new TextRun({
                  text: '\t\t', // Tab để tạo khoảng cách
                }),
                new TextRun({
                  text: `${String.fromCharCode(65 + 2)}) ${lastTwoAnswers[0].text}`,
                  font: 'Times New Roman',
                  size: 17,
                }),
              ],
              spacing: {
                after: 100,
              },
              tabStops: [
                {
                  type: 'left',
                  position: 4500, // Vị trí tab stop (50% của trang)
                },
              ],
            }),
          );

          // Dòng thứ hai: B và D
          docContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${String.fromCharCode(65 + 1)}) ${firstTwoAnswers[1].text}`,
                  font: 'Times New Roman',
                  size: 17,
                }),
                new TextRun({
                  text: '\t\t',
                }),
                new TextRun({
                  text: `${String.fromCharCode(65 + 3)}) ${lastTwoAnswers[1].text}`,
                  font: 'Times New Roman',
                  size: 17,
                }),
              ],
              spacing: {
                after: 100,
              },
              tabStops: [
                {
                  type: 'left',
                  position: 4500,
                },
              ],
            }),
          );
        } else {
          // Default layout không đổi
          q.answers.forEach((a, aIndex) => {
            docContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${String.fromCharCode(65 + aIndex)}) ${a.text}`,
                    font: 'Times New Roman',
                    size: 17,
                  }),
                ],
                spacing: {
                  after: 100,
                },
              }),
            );
          });
        }
        docContent.push(new Paragraph(' '));
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: docContent,
        },
      ],
    });

    try {
      const blob = await window.docx.Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi tạo và tải file Word:', error);
      alert('Tải file Word thất bại. Vui lòng thử lại.');
    }
  };

  const handleSettingsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
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
                  theo sau dấu chấm hoặc dấu hai chấm. VD: "Câu 1.", "Câu 1:",
                  "Question 1:", "1.", v.v.
                </li>
                <li>
                  • Mỗi đáp án nên ở một dòng riêng. Đáp án bắt đầu bằng một chữ
                  cái in hoa theo sau dấu chấm hoặc dấu ngoặc đóng. VD: "A.",
                  "B.", "C.", "D." hoặc "A)", "B)", "C)".
                </li>
                <li>
                  • Đáp án đúng phải được đánh dấu bằng **(đúng)**. Việc tô màu
                  **không** được hỗ trợ.
                </li>
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

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-blue-600" />
          Bước 1: Upload File đề gốc
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading || !isMammothReady}
            // Add key to force re-render when a new file is uploaded, resetting the input
            key={uploadedFile ? uploadedFile.name : 'empty'}
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
                      {q.answers.map(
                        (
                          a: {
                            id: Key | null | undefined;
                            isCorrect: any;
                            text:
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | ReactPortal
                              | Promise<
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | ReactPortal
                                  | ReactElement<
                                      unknown,
                                      string | JSXElementConstructor<any>
                                    >
                                  | Iterable<ReactNode>
                                  | null
                                  | undefined
                                >
                              | null
                              | undefined;
                          },
                          aIndex: number,
                        ) => (
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
                        ),
                      )}
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
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Bước 2: Cài đặt đề thi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {/* Number of exams */}
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
                id="numberOfExams"
                value={settings.numberOfExams}
                onChange={handleSettingsChange}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              />
            </div>

            {/* Number of questions to generate */}
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
                id="numberOfQuestionsToGenerate"
                value={settings.numberOfQuestionsToGenerate}
                onChange={handleSettingsChange}
                min="1"
                max={questions.length}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              />
            </div>
          </div>

          <button
            onClick={generateExams}
            disabled={isGenerating || questions.length === 0}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang tạo đề...
              </>
            ) : (
              <>
                <Shuffle className="w-5 h-5 mr-2" />
                Tạo đề thi
              </>
            )}
          </button>
        </div>
      )}

      {/* Generated Exams */}
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
