import React from 'react';
import type { SeatAvailability } from '../../api/endpoints/booking.api';
import SeatButton from './SeatButton';

interface SeatMapProps {
    seatMap: (SeatAvailability | null)[][];
    selectedSeats: string[];
    onSeatSelect: (seatCode: string) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
    seatMap,
    selectedSeats,
    onSeatSelect,
}) => {
    return (
        <div className="bg-gray-900 rounded-lg p-6">
            {/* Screen */}
            <div className="mb-8">
                <div className="text-center mb-2 text-gray-400 text-sm">Màn hình</div>
                <div className="h-2 bg-gradient-to-b from-gray-300 to-gray-600 rounded-t-3xl mx-auto max-w-4xl"></div>
            </div>

            {/* Seat Grid */}
            <div className="flex flex-col items-center gap-2">
                {seatMap.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2">
                        {/* Seats */}
                        <div className="flex gap-2">
                            {row.map((seat, seatIndex) => {
                                if (!seat) {
                                    // Empty space (aisle)
                                    return <div key={seatIndex} className="w-8 h-8"></div>;
                                }

                                // Check if this is the second seat of a couple pair (same seatCode as previous)
                                if (seat.seatType === 'COUPLE' && seatIndex > 0) {
                                    const prevSeat = row[seatIndex - 1];
                                    if (prevSeat && prevSeat.seatCode === seat.seatCode && prevSeat.seatType === 'COUPLE') {
                                        // This is the second seat of a couple pair, skip it
                                        return null;
                                    }
                                }

                                const isSelected = selectedSeats.includes(seat.seatCode);

                                return (
                                    <SeatButton
                                        key={`${seat.seatCode}-${seatIndex}`}
                                        seat={seat}
                                        isSelected={isSelected}
                                        onSelect={() => onSeatSelect(seat.seatCode)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeatMap;
