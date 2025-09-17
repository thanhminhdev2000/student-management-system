import { Loader2, Settings, Shuffle } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { ExamSettings } from '../types/examTypes';

type Props = {
  settings: ExamSettings;
  onSettingsChange: (newSettings: ExamSettings) => void;
  onGenerate: () => void;
  questionsCount: number;
  isGenerating: boolean;
};

const Step2_EssaySettings = ({
  settings,
  onSettingsChange,
  onGenerate,
  questionsCount,
  isGenerating,
}: Props) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val =
      type === 'checkbox' ? checked : type === 'number' ? Number(value) : value;
    onSettingsChange({
      ...settings,
      [name]: val,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-gray-600" />
        Bước 2: Cài đặt đề thi
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
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
            onChange={handleChange}
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
            id="numberOfQuestionsToGenerate"
            value={settings.numberOfQuestionsToGenerate}
            onChange={handleChange}
            min="1"
            max={questionsCount}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="examCode"
            className="block text-sm font-medium text-gray-700"
          >
            Mã đề (tiền tố)
          </label>
          <input
            type="text"
            name="examCode"
            id="examCode"
            value={settings.examCode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating || questionsCount === 0}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tạo đề...
          </>
        ) : (
          <>
            <Shuffle className="w-5 h-5 mr-2" /> Tạo đề thi tự luận
          </>
        )}
      </button>
    </div>
  );
};

export default Step2_EssaySettings;
