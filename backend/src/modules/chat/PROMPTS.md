# Nova Cinema Chatbot - Prompts & Capabilities

## Phạm vi hỗ trợ

Chatbot Nova Cinema sử dụng cơ chế **Hybrid**:

- **Rule-based** (ưu tiên): Keyword matching cho 6 nhóm câu hỏi phổ biến
- **AI Gemini** (fallback): Trả lời câu hỏi phức tạp với context từ database

---

## 1. Giá vé 💰

**Keywords:** `giá`, `vé`, `price`, `bao nhiêu tiền`, `giá tiền`, `ticket`

**API:** `PricingConfigService.findPricingConfig()`

**Ví dụ:** "Giá vé bao nhiêu?", "Vé phim bao nhiêu tiền?"

**Response:** Giá cơ bản + phụ thu theo loại ghế/phòng/ngày

---

## 2. Địa chỉ rạp 📍

**Keywords:** `địa chỉ`, `ở đâu`, `location`, `rạp ở`, `chỗ nào`, `đường nào`

**API:** `TheaterService.findTheaters({ isActive: true })`

**Ví dụ:** "Rạp ở đâu?", "Địa chỉ Nova Cinema?"

**Response:** Tên rạp, địa chỉ, hotline, số phòng chiếu

---

## 3. Lịch chiếu 🎬

**Keywords:** `giờ chiếu`, `lịch chiếu`, `suất chiếu`, `mấy giờ`, `hôm nay`

**Response:** Hướng dẫn truy cập website/app để xem lịch chiếu

---

## 4. Phim đang chiếu 🎬

**Keywords:** `phim gì`, `phim nào`, `đang chiếu`, `phim mới`, `phim hay`

**API:** `MovieService.findShowingMoviesPaginated({ page: 1, limit: 5 })`

**Ví dụ:** "Có phim gì đang chiếu?", "Hôm nay chiếu phim gì?"

**Response:** Top 5 phim (tên, thể loại, thời lượng, độ tuổi)

---

## 5. Liên hệ 📞

**Keywords:** `liên hệ`, `hotline`, `hỗ trợ`, `email`, `điện thoại`

**Response:** Website, email, hotline, thời gian hỗ trợ (hardcoded)

---

## 6. Lời chào 👋

**Keywords:** `xin chào`, `hello`, `hi`, `chào`, `hey`, `alo`

**Response:** Random greeting với giới thiệu tính năng

---

## Cấu hình

```env
# Required for AI fallback
GEMINI_API_KEY=your_api_key
```

> Nếu không có GEMINI_API_KEY, chatbot vẫn hoạt động với rule-based responses.
