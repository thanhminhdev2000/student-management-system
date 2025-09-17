/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle, Download, FileText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Exam, ExamSettings } from '../types/examTypes';

type Props = {
  exams: Exam[];
  settings: ExamSettings;
};

const Step3_DownloadEssayExams = ({ exams, settings }: Props) => {
  const [isDocxReady, setIsDocxReady] = useState(false);

  useEffect(() => {
    // Tải thư viện docx.js
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/docx@8.2.1/build/index.umd.js';
    script.onload = () => setIsDocxReady(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const downloadExam = useCallback(
    async (exam: Exam) => {
      if (!isDocxReady || !window.docx) {
        alert('Thư viện tạo file Word chưa sẵn sàng. Vui lòng đợi và thử lại.');
        return;
      }

      const { Document, Paragraph, TextRun, AlignmentType } = window.docx;

      const docContent: any[] = [];

      // Tiêu đề
      docContent.push(
        new Paragraph({
          children: [new TextRun({ text: exam.code, size: 36, bold: true })],
          alignment: AlignmentType.CENTER,
        }),
      );
      docContent.push(new Paragraph('')); // Dòng trống sau tiêu đề

      // Nội dung câu hỏi
      exam.questions.forEach((question, index) => {
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${settings.questionPrefix} ${index + settings.startingNumber}. ${question.text}`,
                bold: true,
                size: 17, // Cỡ chữ 8.5pt (8.5 * 2)
              }),
            ],
          }),
        );
        // THÊM 1 DÒNG TRẮNG ĐỂ GHI CÂU TRẢ LỜI
        docContent.push(new Paragraph(''));
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  // LỀ HẸP (0.5 inch ~ 720 twips)
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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Download className="w-5 h-5 mr-2 text-green-600" />
        Bước 3: Tải đề thi
      </h2>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <div key={exam.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{exam.code}</h3>
                  <p className="text-sm text-gray-500">
                    {exam.questions.length} câu hỏi
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadExam(exam)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center"
              >
                <Download className="w-4 h-4 mr-1" /> Tải về
              </button>
            </div>
          </div>
        ))}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">
              Đã tạo thành công {exams.length} đề thi tự luận!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3_DownloadEssayExams;
