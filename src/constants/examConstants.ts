export const QUESTION_REGEX =
  /^(?:Câu|Question|Bài)?\s*(\d+)\s*[\s.:]*\s*([\s\S]*)$/i;
export const ANSWER_REGEX = /^\s*([A-Z]\s*[:.)]|\*|\d+\.)\s*([\s\S]*)$/;

export const INSTRUCTION_TEXT = `
• Câu hỏi bắt đầu bằng "Câu", "Question" hoặc một số theo sau dấu chấm hoặc dấu hai chấm. VD: "Câu 1.", "Câu 1:", "Question 1:", "1.", v.v.
• Mỗi đáp án nên ở một dòng riêng. Đáp án bắt đầu bằng một chữ cái in hoa theo sau dấu chấm hoặc dấu ngoặc đóng. VD: "A.", "B.", "C.", "D." hoặc "A)", "B)", "C)".
• Đáp án đúng phải được đánh dấu bằng (đúng). Việc tô màu không được hỗ trợ.
• Đáp án cố định (không bị trộn): thêm dấu # trước. VD: "#A. Đáp án cố định"
• Nếu nội dung câu hỏi quá dài, bạn có thể xuống dòng, miễn là không có dòng trống ở giữa.
• LƯU Ý QUAN TRỌNG: Để đảm bảo file được đọc thành công, bạn nên tạo file Word mới, chỉ sử dụng văn bản đơn giản và định dạng tiêu chuẩn. Tránh các đối tượng phức tạp như hình ảnh, bảng biểu hoặc các font chữ đặc biệt.
`;
