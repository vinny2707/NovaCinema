import React from 'react';

export const SeatLegend: React.FC = () => {
    return (
        <div className="flex flex-wrap gap-6 justify-center mb-6 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded"></div>
                <span className="text-gray-300">Ghế Thường</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <span className="text-gray-300">Ghế VIP</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-pink-500 rounded"></div>
                <span className="text-gray-300">Ghế Đôi</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-400 rounded"></div>
                <span className="text-gray-300">Ghế Đã Chọn</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <span className="text-gray-300">Ghế Đã Đặt</span>
            </div>
        </div>
    );
};

export default SeatLegend;
