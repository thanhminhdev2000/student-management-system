/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CheckCircle,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Exam, ExamSettings } from '../types/examTypes';

type Props = {
  exams: Exam[];
  settings: ExamSettings;
};

const Step3_DownloadExams = ({ exams, settings }: Props) => {
  const [isDocxReady, setIsDocxReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/docx@8.2.1/build/index.umd.js'; // Đã sửa đường dẫn để tương thích với trình duyệt
    script.onload = () => setIsDocxReady(true);
    script.onerror = () => {
      console.error('Failed to load Docx library.');
      alert(
        'Tải thư viện tạo file Word thất bại. Vui lòng kiểm tra kết nối mạng và tải lại trang.',
      );
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const downloadExam = useCallback(
    async (exam: Exam, includeAnswerKey = false) => {
      if (!isDocxReady || !window.docx) {
        alert('Thư viện tạo file Word chưa sẵn sàng. Vui lòng đợi và thử lại.');
        return;
      }

      const {
        Document,
        Paragraph,
        TextRun,
        AlignmentType,
        Table,
        TableRow,
        TableCell,
        WidthType,
        TabStopPosition,
        TabStopType,
      } = window.docx;

      const docContent: any[] = [];
      let fileName = '';

      if (includeAnswerKey) {
        // TẠO FILE ĐÁP ÁN RIÊNG LẺ CHO TỪNG ĐỀ
        fileName = `${exam.code}_DapAn.docx`;
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `ĐÁP ÁN ĐỀ THI: ${exam.code}`,
                size: 28,
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        );
        docContent.push(new Paragraph(''));

        const answerTableRows = [];
        const columnCount = 4;
        const totalQuestions = exam.answerKey.length;
        const numRows = Math.ceil(totalQuestions / columnCount);
        const cellsPerRow = Array(columnCount).fill(0);
        const rowsData = cellsPerRow.map(() => []);

        exam.answerKey.forEach((answer, index) => {
          const columnIndex = index % columnCount;
          rowsData[columnIndex].push({
            questionNumber: index + 1,
            answer: answer,
          });
        });

        for (let i = 0; i < numRows; i++) {
          const rowCells = rowsData.map((colData) => {
            const item = colData[i];
            const text = item ? `${item.questionNumber}. ${item.answer}` : '';
            return new TableCell({
              children: [new Paragraph(text)],
            });
          });
          answerTableRows.push(new TableRow({ children: rowCells }));
        }

        const answerTable = new Table({
          rows: answerTableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        });
        docContent.push(answerTable);
      } else {
        // TẠO FILE ĐỀ THI RIÊNG LẺ
        fileName = `${exam.code}.docx`;
        docContent.push(
          new Paragraph({
            children: [new TextRun({ text: exam.code, size: 36, bold: true })],
            alignment: AlignmentType.CENTER,
          }),
        );
        docContent.push(new Paragraph(''));

        exam.questions.forEach((question, index) => {
          docContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${settings.questionPrefix} ${
                    index + settings.startingNumber
                  }. ${question.text}`,
                  bold: true,
                }),
              ],
            }),
          );

          // Check if answers are short enough for compact layout
          const areAnswersShort = question.answers.every(
            (a) => a.text.length < 50,
          );

          if (settings.useCompactLayout && areAnswersShort) {
            // Layout 2x2 với Tabstop cho các đáp án ngắn
            for (let i = 0; i < question.answers.length; i += 2) {
              const firstAnswer = question.answers[i];
              const secondAnswer = question.answers[i + 1];

              docContent.push(
                new Paragraph({
                  children: [
                    new TextRun(
                      `${String.fromCharCode(65 + i)}. ${firstAnswer.text}`,
                    ),
                    new TextRun({ text: '\t' }),
                    new TextRun(
                      secondAnswer
                        ? `${String.fromCharCode(65 + i + 1)}. ${secondAnswer.text}`
                        : '',
                    ),
                  ],
                  tabStops: [{ type: TabStopType.LEFT, position: 4500 }],
                }),
              );
            }
          } else {
            // Layout mỗi đáp án một dòng cho các đáp án dài hoặc khi không bật compact
            question.answers.forEach((answer, aIndex) => {
              docContent.push(
                new Paragraph({
                  children: [
                    new TextRun(
                      `${String.fromCharCode(65 + aIndex)}. ${answer.text}`,
                    ),
                  ],
                }),
              );
            });
          }
          docContent.push(new Paragraph('')); // Dòng trống sau mỗi câu
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
    },
    [isDocxReady, settings],
  );

  // HÀM TẠO FILE ĐÁP ÁN TỔNG HỢP
  const downloadCombinedAnswerKey = useCallback(async () => {
    if (!isDocxReady || !window.docx) {
      alert('Thư viện tạo file Word chưa sẵn sàng. Vui lòng đợi và thử lại.');
      return;
    }

    const {
      Document,
      Table,
      TableRow,
      TableCell,
      Paragraph,
      TextRun,
      AlignmentType,
      WidthType,
    } = window.docx;

    const examCodes = exams.map((exam) => exam.code);
    const questions = exams[0].questions;

    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'STT', bold: true })],
            }),
          ],
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        ...examCodes.map(
          (code) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: code, bold: true })],
                }),
              ],
              width: {
                size: 90 / examCodes.length,
                type: WidthType.PERCENTAGE,
              },
            }),
        ),
      ],
    });

    const dataRows = questions.map((q, index) => {
      const cells = exams.map((exam) => {
        const questionInThisExam = exam.questions.find(
          (item) => item.id === q.id,
        );
        const correctAnswer = questionInThisExam
          ? questionInThisExam.answers.find((a) => a.isCorrect)
          : null;

        let answerText = 'N/A';
        if (correctAnswer) {
          const correctIndex = questionInThisExam.answers.findIndex(
            (a) => a.id === correctAnswer.id,
          );
          if (correctIndex !== -1) {
            answerText = String.fromCharCode(65 + correctIndex);
          }
        }

        return new TableCell({
          children: [new Paragraph(answerText)],
        });
      });

      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
          ...cells,
        ],
      });
    });

    const table = new Table({
      rows: [headerRow, ...dataRows],
    });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Bảng đáp án tổng hợp',
                  size: 30,
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph(''),
            table,
          ],
        },
      ],
    });

    try {
      const blob = await window.docx.Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bảng đáp án tổng hợp.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi tạo và tải file Word:', error);
      alert('Tải file đáp án tổng hợp thất bại. Vui lòng thử lại.');
    }
  }, [exams, isDocxReady]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Download className="w-5 h-5 mr-2 text-green-600" />
        Bước 3: Tải đề thi
      </h2>
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <span className="font-medium text-gray-700 mb-2 md:mb-0">
          Tải về toàn bộ đáp án
        </span>
        <button
          onClick={downloadCombinedAnswerKey}
          disabled={!isDocxReady}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center justify-center disabled:bg-blue-400"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Tải bảng đáp án
        </button>
      </div>

      <div className="grid gap-4">
        {exams.map((exam) => (
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
                  <Download className="w-4 h-4 mr-1" /> Đề thi
                </button>
                {settings.includeAnswerKey && (
                  <button
                    onClick={() => downloadExam(exam, true)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors flex items-center"
                  >
                    <FileDown className="w-4 h-4 mr-1" /> Đáp án
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
              Đã tạo thành công {exams.length} đề thi! Click để tải về.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3_DownloadExams;
