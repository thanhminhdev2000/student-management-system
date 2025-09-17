export const QUESTION_REGEX =
  /^(?:Câu|Question|Bài)?\s*(\d+)\s*[\s.:]*\s*([\s\S]*)$/i;
export const ANSWER_REGEX = /^\s*([A-Z]\s*[:.)]|\*|\d+\.)\s*([\s\S]*)$/;

export const MULTIPLE_CHOICE_INSTRUCTIONS = {
  title: 'Hướng dẫn định dạng file Word cho Trắc nghiệm',
  rules: [
    'Câu hỏi bắt đầu bằng **"Câu"**, **"Question"** hoặc một số theo sau dấu chấm hoặc dấu hai chấm. VD: "Câu 1.", "Câu 1:", "Question 1:", "1.", v.v.',
    'Mỗi đáp án nên ở một dòng riêng. Đáp án bắt đầu bằng một chữ cái in hoa theo sau dấu chấm hoặc dấu ngoặc đóng. VD: "A.", "B.", "C.", "D." hoặc "A)", "B)", "C)".',
    'Đáp án đúng phải được đánh dấu bằng **(đúng)**. Việc tô màu **không** được hỗ trợ.',
    'Đáp án cố định (không bị trộn): thêm dấu **#** trước. VD: "#A. Đáp án cố định"',
    'Nếu nội dung câu hỏi quá dài, bạn có thể xuống dòng, miễn là không có dòng trống ở giữa.',
  ],
  importantNote:
    'LƯU Ý QUAN TRỌNG: Để đảm bảo file được đọc thành công, bạn nên tạo file Word mới, chỉ sử dụng văn bản đơn giản và định dạng tiêu chuẩn. Tránh các đối tượng phức tạp như hình ảnh, bảng biểu hoặc các font chữ đặc biệt.',
  example: `Câu 1. Thủ đô Việt Nam là?
A) TP.HCM
B) Hà Nội (đúng)
C) Đà Nẵng
D) Cần Thơ

Câu 2. Dòng thơ này của ai?
Yêu sao
những ngọn sóng
đá bạc đầu
#A. Tố Hữu
B. Xuân Diệu (đúng)`,
};

export const ESSAY_INSTRUCTIONS = {
  title: 'Hướng dẫn định dạng file Word cho Tự luận',
  rules: [
    'Mỗi câu hỏi tự luận bắt đầu bằng **"Câu"**, **"Question"** hoặc một số theo sau dấu chấm hoặc dấu hai chấm. VD: "Câu 1.", "Câu 1:", "Question 1:", "1.", v.v.',
    'Nội dung câu hỏi sẽ bao gồm tất cả các dòng tiếp theo cho đến khi gặp dòng trống hoặc một câu hỏi mới.',
    'Để phân tách hai câu hỏi, hãy sử dụng một dòng trống.',
  ],
  importantNote:
    'LƯU Ý QUAN TRỌNG: Để đảm bảo file được đọc thành công, bạn nên tạo file Word mới, chỉ sử dụng văn bản đơn giản và định dạng tiêu chuẩn. Tránh các đối tượng phức tạp như hình ảnh, bảng biểu hoặc các font chữ đặc biệt.',
  example: `Câu 1. Phân tích bối cảnh lịch sử và ý nghĩa của chiến thắng Điện Biên Phủ năm 1954.

Câu 2. Trình bày suy nghĩ của bạn về vai trò của thanh niên trong công cuộc xây dựng và bảo vệ đất nước hiện nay.`,
};
