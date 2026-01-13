import React, { useEffect, useState } from 'react';
import { bookingApi } from '../../api/endpoints/booking.api';
import type { Showtime } from '../../api/endpoints/showtime.api';

interface ShowtimeListProps {
    movieId: string;
    theaterId: string;
    selectedDate: string;
    onShowtimeSelect: (showtime: Showtime) => void;
    selectedShowtimeId?: string;
}

export const ShowtimeList: React.FC<ShowtimeListProps> = ({
    movieId,
    theaterId,
    selectedDate,
    onShowtimeSelect,
    selectedShowtimeId,
}) => {
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchShowtimes = async () => {
            if (!selectedDate || !theaterId) return;

            try {
                setIsLoading(true);
                const data = await bookingApi.getShowtimeAvailability({
                    movieId,
                    theaterId,
                    date: selectedDate,
                });
                setShowtimes(data);
            } catch (error) {
                console.error('Failed to fetch showtimes:', error);
                setShowtimes([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShowtimes();
    }, [movieId, theaterId, selectedDate]);

    const formatTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Group showtimes by room type
    const groupShowtimesByRoomType = (showtimes: Showtime[]): Map<string, Showtime[]> => {
        const grouped = new Map<string, Showtime[]>();

        showtimes.forEach((showtime) => {
            const roomType = showtime.roomType || 'NORMAL';
            if (!grouped.has(roomType)) {
                grouped.set(roomType, []);
            }
            grouped.get(roomType)!.push(showtime);
        });

        // Sort each group by start time
        grouped.forEach((showtimeList) => {
            showtimeList.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        });

        return grouped;
    };

    // Get badge color for room type
    const getRoomTypeBadgeColor = (roomType: string): string => {
        switch (roomType.toUpperCase()) {
            case '3D':
                return 'bg-purple-600 text-white';
            case 'VIP':
                return 'bg-yellow-500 text-black font-bold';
            case '2D':
            case 'NORMAL':
            default:
                return 'bg-gray-600 text-white';
        }
    };

    // Sort room types in logical order
    const sortRoomTypes = (roomTypes: string[]): string[] => {
        const order: { [key: string]: number } = {
            'NORMAL': 1,
            '2D': 2,
            'VIP': 3,
            '3D': 4
        };

        return roomTypes.sort((a, b) => {
            const orderA = order[a.toUpperCase()] || 999;
            const orderB = order[b.toUpperCase()] || 999;
            return orderA - orderB;
        });
    };

    if (!selectedDate) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <p className="mt-2 text-gray-400 text-sm">Đang tải suất chiếu...</p>
            </div>
        );
    }

    if (!showtimes || showtimes.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-400">Không có suất chiếu nào cho ngày này</p>
            </div>
        );
    }

    const groupedShowtimes = groupShowtimesByRoomType(showtimes);
    const sortedRoomTypes = sortRoomTypes(Array.from(groupedShowtimes.keys()));

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Anton, sans-serif' }}>
                CHỌN SUẤT CHIẾU
            </h2>

            <div className="space-y-4">
                {sortedRoomTypes.map((roomType) => {
                    const roomShowtimes = groupedShowtimes.get(roomType)!;

                    return (
                        <div key={roomType} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="mb-4">
                                <span className={`px-3 py-1 rounded-md text-sm font-semibold ${getRoomTypeBadgeColor(roomType)}`}>
                                    {roomType}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {roomShowtimes.map((showtime) => (
                                    <button
                                        key={showtime._id}
                                        onClick={() => onShowtimeSelect(showtime)}
                                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${selectedShowtimeId === showtime._id
                                            ? 'bg-yellow-400 text-black'
                                            : 'bg-gray-700 text-white hover:bg-yellow-400 hover:text-black'
                                            }`}
                                    >
                                        {formatTime(showtime.startAt)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShowtimeList;
