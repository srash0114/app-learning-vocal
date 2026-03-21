# WordMind - Ứng dụng Học Từ Vựng Tiếng Anh

Ứng dụng web hiện đại của WordMind được xây dựng bằng **Next.js 16**, **React 19**, và **TypeScript**, tích hợp với **Claude AI** để tra cứu và giải nghĩa từ vựng.

## 🚀 Tính năng

- **Thêm từ với AI**: Tra cứu từ tiếng Anh tự động, lấy phiên âm, loại từ, ví dụ
- **Nhập hàng loạt**: Thêm nhiều từ cùng 1 lúc
- **Thẻ nhớ (Flashcard)**: Học từ bằng cách lật thẻ, đánh giá mức độ hiểu
- **Kiểm tra (Quiz)**: Test kiến thức với câu hỏi trắc nghiệm
- **Lưu trữ cục bộ**: Tất cả dữ liệu được lưu vào localStorage
- **Giao diện hiện đại**: Design đẹp với animations mượt mà

## 📋 Yêu cầu

- Node.js 18+
- npm hoặc yarn
- Anthropic API Key (lấy từ https://console.anthropic.com/)

## ⚙️ Cài đặt

1. **Clone project** (hoặc tạo mới từ Next.js)

2. **Tạo file `.env.local`**:
```bash
cp .env.local.example .env.local
```

3. **Thêm API Key**:
Mở `.env.local` và thay thế:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

4. **Cài đặt dependencies**:
```bash
npm install
```

5. **Chạy development server**:
```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 🏗️ Cấu trúc Project

```
app-vocal/
├── app/
│   ├── api/
│   │   └── words/
│   │       ├── lookup/route.ts      # API tra từ đơn lẻ
│   │       └── bulk/route.ts        # API tra hàng loạt
│   ├── layout.tsx                   # Root layout với providers
│   ├── page.tsx                     # Trang chính
│   └── globals.css                  # CSS toàn cục
├── components/
│   ├── App.tsx                      # Component chính
│   ├── Header.tsx                   # Header với thống kê
│   ├── NavTabs.tsx                  # Tabs điều hướng
│   ├── AddWordsPanel.tsx            # Panel thêm từ
│   ├── FlashcardPanel.tsx           # Panel thẻ nhớ
│   └── QuizPanel.tsx                # Panel kiểm tra
├── lib/
│   ├── context.tsx                  # WordProvider & hooks
│   ├── toast-context.tsx            # ToastProvider & hooks
│   └── types.ts                     # TypeScript types
```

## 🔌 API Endpoints

### POST `/api/words/lookup`
Tra cứu từ đơn lẻ
```json
{
  "word": "resilient"
}
```

**Response**:
```json
{
  "word": "resilient",
  "phonetic": "/rɪˈzɪliənt/",
  "type": "tính từ",
  "meaning": "Có khả năng phục hồi, chống chịu",
  "example": "The community showed a resilient spirit after the disaster.",
  "example_vi": "Cộng đồng thể hiện tinh thần chống chịu sau thảm họa."
}
```

### POST `/api/words/bulk`
Tra cứu nhiều từ
```json
{
  "words": ["apple", "banana", "innovation"]
}
```

**Response**:
```json
{
  "results": [
    { "success": true, "data": {...} },
    { "success": true, "data": {...} },
    ...
  ]
}
```

## 💾 Local Storage

- `wm_words`: Danh sách từ (JSON array)
- `wm_score`: Điểm tổng cộng
- `wm_streak`: Streak hiện tại

## 📱 Responsive Design

Ứng dụng tối ưu cho:
- Desktop (1920px+)
- Tablet (768px+)
- Mobile (320px+)

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS
- **Custom CSS**: Animations và themes tùy chỉnh
- **CSS Variables**: Color palette có thể tùy biến

## 🛠️ Build & Deploy

**Build production**:
```bash
npm run build
```

**Start production server**:
```bash
npm run start
```

**Deploy on Vercel** (recommended):
```bash
vercel
```

Nhớ thêm `ANTHROPIC_API_KEY` vào environment variables trên Vercel.

## 📝 License

MIT

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh!

---

**Tác giả**: WordMind Team
**Version**: 1.0.0
