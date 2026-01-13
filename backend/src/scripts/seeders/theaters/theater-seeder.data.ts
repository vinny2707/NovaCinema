import { Seat, SeatMap, Theater } from 'src/modules/theaters';

export const THEATERS_DATA: Theater[] = [
  // Ho Chi Minh City - 4 theaters
  {
    theaterName: 'NovaCinema Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, Ho Chi Minh',
    hotline: '1900 1111',
  },
  {
    theaterName: 'NovaCinema Vincom Đồng Khởi',
    address: '72 Đồng Khởi, Quận 1, Ho Chi Minh',
    hotline: '1900 1112',
  },
  {
    theaterName: 'NovaCinema Aeon Bình Tân',
    address: '30B Avenue, Bình Tân, Ho Chi Minh',
    hotline: '1900 1113',
  },
  {
    theaterName: 'NovaCinema Giga Mall Thủ Đức',
    address: '240-242 Phạm Văn Đồng, Thủ Đức, Ho Chi Minh',
    hotline: '1900 1114',
  },

  // Ha Noi - 4 theaters
  {
    theaterName: 'NovaCinema Royal City',
    address: '72 Nguyễn Trãi, Thanh Xuân, Ha Noi',
    hotline: '1900 2221',
  },
  {
    theaterName: 'NovaCinema Times City',
    address: '458 Minh Khai, Hai Bà Trưng, Ha Noi',
    hotline: '1900 2222',
  },
  {
    theaterName: 'NovaCinema Vincom Bà Triệu',
    address: '191 Bà Triệu, Hai Bà Trưng, Ha Noi',
    hotline: '1900 2223',
  },
  {
    theaterName: 'NovaCinema Lotte Center',
    address: '54 Liễu Giai, Ba Đình, Ha Noi',
    hotline: '1900 2224',
  },

  // Da Nang - 2 theaters
  {
    theaterName: 'NovaCinema Vincom Đà Nẵng',
    address: '910 Ngô Quyền, Sơn Trà, Da Nang',
    hotline: '1900 3331',
  },
  {
    theaterName: 'NovaCinema Indochina Riverside',
    address: '74 Bạch Đằng, Hải Châu, Da Nang',
    hotline: '1900 3332',
  },

  // Can Tho - 2 theaters
  {
    theaterName: 'NovaCinema Vincom Cần Thơ',
    address: '209 Đường 30/4, Ninh Kiều, Can Tho',
    hotline: '1900 4441',
  },
  {
    theaterName: 'NovaCinema Sense City Cần Thơ',
    address: '1 Đại lộ Hòa Bình, Ninh Kiều, Can Tho',
    hotline: '1900 4442',
  },
];

export function generateSeatMap(
  rowCount: number,
  seatsPerRow: number,
): SeatMap {
  const seatMap: SeatMap = [];

  for (let row = 0; row < rowCount; row++) {
    const seatRow: (Seat | null)[] = [];
    for (let col = 0; col < seatsPerRow; col++) {
      seatRow.push({
        seatCode: `${String.fromCharCode(65 + row)}${col + 1}`, // A1, B1, ...
        seatType: 'NORMAL',
        isActive: true,
      });
    }
    seatMap.push(seatRow);
  }

  return seatMap;
}
