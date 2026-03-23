# WordMind — Ứng dụng học từ vựng tiếng Anh

Ứng dụng học từ vựng tiếng Anh được xây dựng bằng **Next.js 15**, hỗ trợ tra từ bằng AI, thẻ nhớ lật, kiểm tra trắc nghiệm và điền từ.

---

## Tính năng

### Thêm từ
- Tra nghĩa từ đơn bằng AI (Claude) — tự động lấy phiên âm, loại từ, nghĩa tiếng Việt, câu ví dụ
- Nhập hàng loạt (mỗi từ một dòng), AI tra từng từ tự động
- Nghe phát âm chuẩn bằng Web Speech API
- Xem và xóa danh sách từ đã lưu

### Thẻ nhớ (Flashcard)
- Lật thẻ 3D để xem nghĩa, câu ví dụ và bản dịch tiếng Việt
- Đánh dấu **Thuộc rồi** (chuyển trạng thái sang *mastered*) hoặc **Còn khó** (*learning*)
- Lọc theo: Tất cả / Chưa thuộc / Đã thuộc
- Nghe phát âm ngay trên thẻ

### Kiểm tra (Trắc nghiệm)
- Chọn nghĩa đúng trong 4 đáp án
- Lọc theo trạng thái từ
- Hiển thị kết quả + modal tổng kết khi hoàn thành

### Điền từ
- Nhìn nghĩa tiếng Việt + câu ví dụ có chỗ trống → điền từ tiếng Anh
- Nếu từ không có trong câu ví dụ: hiển thị dạng *"Xác định đúng từ tiếng Anh (loại từ)"*
- Nút **Gợi ý** hiển thị từng chữ cái một
- Lọc theo trạng thái từ

### Theo dõi tiến độ
- Header hiển thị số từ, streak và điểm
- Thanh tiến độ trực quan trong từng bài

---

## Công nghệ

| Công nghệ | Mục đích |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Claude AI (Anthropic) | Tra nghĩa từ tự động |
| Web Speech API | Phát âm tiếng Anh |
| localStorage | Lưu dữ liệu từ vựng |

---

## Cài đặt & Chạy

```bash
# Cài dependencies
npm install

# Tạo file .env.local và thêm API key
ANTHROPIC_API_KEY=your_api_key_here

# Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## Cấu trúc thư mục

```
app/              # Next.js App Router (pages, API routes)
components/       # UI components
  App.tsx         # Root component + tab routing
  Header.tsx      # Header với stats
  NavTabs.tsx     # Thanh điều hướng
  AddWordsPanel.tsx
  FlashcardPanel.tsx
  QuizPanel.tsx
  FillQuizPanel.tsx
lib/              # Logic dùng chung (context, types, speak, toast)
```

---

## Deploy

Dự án được deploy trên **Vercel**. Thêm biến môi trường `ANTHROPIC_API_KEY` trong Vercel Dashboard.
