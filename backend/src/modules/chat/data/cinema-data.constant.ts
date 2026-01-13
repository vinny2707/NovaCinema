/**
 * Thông tin cứng về rạp Nova Cinema
 * Dùng làm fallback khi không lấy được dữ liệu từ database
 */
export const CINEMA_INFO = {
  WEBSITE: 'https://nova-cinema-smoky.vercel.app/',
  EMAIL: 'support@nova-cinema.io.vn',
  HOTLINE: '1900-7979',
  SUPPORT_HOURS: '8:00 - 22:00 hàng ngày',

  // Fallback theaters khi database trống
  THEATERS: [
    {
      name: 'Nova Cinema Quận 1',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      hotline: '028-1234-5678',
    },
    {
      name: 'Nova Cinema Quận 7',
      address: '456 Nguyễn Văn Linh, Quận 7, TP.HCM',
      hotline: '028-8765-4321',
    },
  ],

  // Fallback prices khi database trống
  DEFAULT_PRICES: {
    STANDARD: 75000,
    VIP: 95000,
    COUPLE: 180000,
  },
} as const;

/**
 * Keywords cho rule-based matching
 * - Tập trung vào các câu hỏi thông tin cơ bản
 * - Các câu hỏi phức tạp sẽ fallback sang Gemini AI
 */
export const RULE_BASED_KEYWORDS = {
  // Giá vé
  PRICE: [
    'giá vé',
    'giá tiền',
    'bao nhiêu tiền',
    'chi phí',
    'giá cả',
    'vé giá',
  ] as const,

  // Địa chỉ rạp
  ADDRESS: [
    'địa chỉ',
    'ở đâu',
    'vị trí',
    'chỗ nào',
    'đường nào',
    'rạp nào',
  ] as const,

  // Phim đang chiếu
  MOVIES: [
    'phim đang chiếu',
    'phim gì',
    'có phim',
    'danh sách phim',
    'phim nào',
  ] as const,

  // Liên hệ
  CONTACT: [
    'liên hệ',
    'hotline',
    'số điện thoại',
    'liên lạc',
    'hỗ trợ',
    'email',
  ] as const,

  // Lời chào
  GREETING: [
    'xin chào',
    'hello',
    'hi',
    'chào',
    'hey',
  ] as const,
} as const;
