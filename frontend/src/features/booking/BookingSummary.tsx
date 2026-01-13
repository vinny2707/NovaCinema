import React from 'react';
import type { BookingSeat } from '../../api/endpoints/booking.api';

interface BookingSummaryProps {
    selectedSeats: string[];
    seats: BookingSeat[];
    totalAmount: number;
    onCheckout: () => void;
    isLoading?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
    selectedSeats,
    seats,
    totalAmount,
    onCheckout,
    isLoading = false,
}) => {
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    return (
        <div className="bg-blue-600 rounded-lg p-6 text-white sticky top-4">
            <h3 className="text-xl font-bold mb-4">THÔNG TIN ĐẶT VÉ</h3>

            {selectedSeats.length > 0 ? (
                <>
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                            <span>Số ghế</span>
                            <span className="font-semibold">{selectedSeats.join(', ')}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Loại ghế</span>
                            <span className="font-semibold">
                                {seats.length > 0 ? seats[0].seatType : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Số lượng</span>
                            <span className="font-semibold">{selectedSeats.length} vé</span>
                        </div>
                    </div>

                    <div className="border-t border-blue-400 pt-4 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">TỔNG TIỀN</span>
                            <span className="text-2xl font-bold">{formatPrice(totalAmount)}</span>
                        </div>
                    </div>

                    <button
                        onClick={onCheckout}
                        disabled={isLoading}
                        className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang xử lý...' : 'THANH TOÁN'}
                    </button>
                </>
            ) : (
                <div className="text-center py-8 text-blue-200">
                    Vui lòng chọn ghế để tiếp tục
                </div>
            )}
        </div>
    );
};

export default BookingSummary;
