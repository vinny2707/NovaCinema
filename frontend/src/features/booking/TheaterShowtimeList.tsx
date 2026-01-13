import React, { useEffect, useState } from 'react';
import { showtimeApi, type Showtime } from '../../api/endpoints/showtime.api';
import { theaterApi, type Theater } from '../../api/endpoints/theater.api';
import TheaterShowtimeCard from './TheaterShowtimeCard';

interface TheaterShowtimeListProps {
    movieId: string;
    selectedDate: string;
    onShowtimeSelect: (showtime: Showtime) => void;
    selectedShowtimeId?: string;
}

interface TheaterWithShowtimes {
    theater: Theater;
    showtimes: Showtime[];
}

export const TheaterShowtimeList: React.FC<TheaterShowtimeListProps> = ({
    movieId,
    selectedDate,
    onShowtimeSelect,
    selectedShowtimeId,
}) => {
    const [theaterShowtimes, setTheaterShowtimes] = useState<TheaterWithShowtimes[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchShowtimes = async () => {
            if (!selectedDate) return;

            try {
                setIsLoading(true);

                // Get all theaters
                const theaters = await theaterApi.getList();

                // Get showtimes for each theater
                const theaterShowtimesData: TheaterWithShowtimes[] = [];

                for (const theater of theaters) {
                    const showtimes = await showtimeApi.getShowtimesByDate({
                        movieId,
                        theaterId: theater._id,
                        date: selectedDate,
                    });

                    if (showtimes.length > 0) {
                        theaterShowtimesData.push({
                            theater,
                            showtimes,
                        });
                    }
                }

                setTheaterShowtimes(theaterShowtimesData);
            } catch (error) {
                console.error('Failed to fetch showtimes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShowtimes();
    }, [movieId, selectedDate]);

    if (!selectedDate) {
        return (
            <div className="text-center py-8 text-gray-400">
                Vui lòng chọn ngày để xem lịch chiếu
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                <p className="mt-4 text-gray-400">Đang tải lịch chiếu...</p>
            </div>
        );
    }

    if (theaterShowtimes.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-gray-400 text-lg">Không có suất chiếu nào cho ngày này</p>
                <p className="text-gray-500 text-sm mt-2">Vui lòng chọn ngày khác</p>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Anton, sans-serif' }}>
                DANH SÁCH RẠP
            </h2>

            <div className="space-y-4">
                {theaterShowtimes.map(({ theater, showtimes }) => (
                    <TheaterShowtimeCard
                        key={theater._id}
                        theaterName={theater.theaterName}
                        theaterAddress={theater.address}
                        showtimes={showtimes}
                        onShowtimeSelect={onShowtimeSelect}
                        selectedShowtimeId={selectedShowtimeId}
                    />
                ))}
            </div>
        </div>
    );
};

export default TheaterShowtimeList;
