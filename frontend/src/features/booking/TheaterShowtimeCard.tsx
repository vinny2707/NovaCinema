import type { Showtime } from '../../api/endpoints/showtime.api';

interface TheaterShowtimeCardProps {
    theaterName: string;
    theaterAddress: string;
    showtimes: Showtime[];
    onShowtimeSelect: (showtime: Showtime) => void;
    selectedShowtimeId?: string;
}

export const TheaterShowtimeCard: React.FC<TheaterShowtimeCardProps> = ({
    theaterName,
    theaterAddress,
    showtimes,
    onShowtimeSelect,
    selectedShowtimeId,
}) => {
    const formatTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };



    return (
        <div className="bg-gray-800 rounded-lg p-6 mb-4 border border-gray-700">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{theaterName}</h3>
                <p className="text-sm text-gray-400 mt-1">{theaterAddress}</p>
            </div>

            {showtimes.length > 0 ? (
                <div>
                    <p className="text-sm text-gray-400 mb-3">
                        {showtimes[0].roomType || 'Standard'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {showtimes.map((showtime) => (
                            <button
                                key={showtime._id}
                                onClick={() => onShowtimeSelect(showtime)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedShowtimeId === showtime._id
                                    ? 'bg-yellow-400 text-black'
                                    : 'bg-gray-700 text-white hover:bg-yellow-400 hover:text-black'
                                    }`}
                            >
                                {formatTime(showtime.startAt)}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500 italic">Không có suất chiếu</p>
            )}
        </div>
    );
};

export default TheaterShowtimeCard;
