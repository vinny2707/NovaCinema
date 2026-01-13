import React, { useState } from 'react';
import type { Showtime } from '../../api/endpoints/showtime.api';
import TheaterSelector from './TheaterSelector';
import DateSelector from './DateSelector';
import ShowtimeList from './ShowtimeList';
import SeatSelection from './SeatSelection';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

interface ShowtimeSectionProps {
    movieId: string;
}

export const ShowtimeSection: React.FC<ShowtimeSectionProps> = ({ movieId }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [selectedTheaterId, setSelectedTheaterId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

    const handleTheaterSelect = (theaterId: string) => {
        setSelectedTheaterId(theaterId);
        setSelectedDate(''); // Reset date when theater changes
        setSelectedShowtime(null); // Reset showtime
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setSelectedShowtime(null); // Reset showtime when date changes
    };

    const handleShowtimeSelect = (showtime: Showtime) => {
        setSelectedShowtime(showtime);
        // Scroll to seat selection
        setTimeout(() => {
            const seatSection = document.getElementById('seat-selection');
            if (seatSection) {
                seatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };



    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="mt-12 border-t border-gray-700 pt-8">
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <svg
                            className="mx-auto h-16 w-16 text-yellow-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Anton, sans-serif' }}>
                            SIGN IN TO BOOKING
                        </h3>
                        <p className="text-gray-400 mb-6">
                            You need to sign in to book a ticket. Sign in now to experience the convenience of booking tickets!
                        </p>
                        <Button
                            intent="primary"
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-3"
                        >
                            Sign in now
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12 border-t border-gray-700 pt-8">
            {/* Theater Selection */}
            <TheaterSelector
                selectedTheaterId={selectedTheaterId}
                onTheaterSelect={handleTheaterSelect}
            />

            {/* Date Selection */}
            {selectedTheaterId && (
                <DateSelector selectedDate={selectedDate} onDateSelect={handleDateSelect} />
            )}

            {/* Showtime List */}
            {selectedTheaterId && selectedDate && (
                <ShowtimeList
                    movieId={movieId}
                    theaterId={selectedTheaterId}
                    selectedDate={selectedDate}
                    onShowtimeSelect={handleShowtimeSelect}
                    selectedShowtimeId={selectedShowtime?._id}
                />
            )}

            {/* Seat Selection (Expandable) */}
            {selectedShowtime && (
                <div id="seat-selection" className="animate-fadeIn">
                    <SeatSelection showtime={selectedShowtime} />
                </div>
            )}
        </div>
    );
};

export default ShowtimeSection;
