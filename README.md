# Hệ thống Quản lý Học viên Quân đội

Hệ thống quản lý học viên quân đội được xây dựng bằng React, TypeScript và TailwindCSS.

## 🚀 Tính năng chính

- **Dashboard**: Tổng quan thống kê, cảnh báo học viên
- **Quản lý học viên**: Danh sách, tìm kiếm, phân loại
- **Ngân hàng câu hỏi**: Quản lý câu hỏi theo chủ đề
- **Kiểm tra - Thi**: Tạo đề, chấm điểm tự động
- **Báo cáo - Thống kê**: AI phân tích, xuất báo cáo
- **Quản trị hệ thống**: Cài đặt, quản lý người dùng

## 📁 Cấu trúc thư mục

```
src/
├── components/           # React components
│   ├── ui/              # UI components (Button, Card, etc.)
│   ├── Dashboard.tsx    # Dashboard component
│   ├── StudentsManagement.tsx
│   └── Layout.tsx       # Layout wrapper
├── types/               # TypeScript types
│   └── index.ts
├── constants/           # Constants & dummy data
│   └── data.ts
├── App.tsx              # Main app component
├── main.tsx            # Entry point
└── index.css           # Styles
```

## 🛠️ Cài đặt và chạy

1. **Cài đặt dependencies:**

```bash
npm install
```

2. **Chạy development server:**

```bash
npm run dev
```

3. **Build production:**

```bash
npm run build
```

## 🎨 Công nghệ sử dụng

- **React 19**: Frontend framework
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Vite**: Build tool
- **Lucide React**: Icons

## 📊 Dữ liệu mẫu

- 5 học viên với điểm số và xu hướng khác nhau
- 4 chủ đề ngân hàng câu hỏi
- 3 kỳ thi lịch sử với thống kê
- Cảnh báo học viên yếu kém

## 🔧 Tùy chỉnh

### Thêm trang mới

1. Tạo component trong `src/components/`
2. Thêm route trong `App.tsx`
3. Cập nhật `PageType` trong `types/index.ts`
4. Thêm menu item trong `constants/data.ts`

### Thêm dữ liệu mới

Cập nhật các array trong `src/constants/data.ts`:

- `studentData`: Danh sách học viên
- `questionBankData`: Ngân hàng câu hỏi
- `examHistory`: Lịch sử kiểm tra

### Tùy chỉnh UI

- Components UI trong `src/components/ui/`
- Styles trong `src/index.css`
- Colors và spacing theo TailwindCSS

## 🚧 Tính năng đang phát triển

- [ ] Ngân hàng câu hỏi
- [ ] Hệ thống thi và chấm điểm
- [ ] Báo cáo chi tiết
- [ ] Quản trị hệ thống
- [ ] Authentication
- [ ] API integration

## 📝 Ghi chú

- Hiện tại sử dụng dummy data
- UI responsive cho mobile/tablet
- Tuân thủ TypeScript strict mode
- Component-based architecture
