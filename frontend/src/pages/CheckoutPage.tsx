import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import type { Showtime } from '../api/endpoints/showtime.api';
import type { BookingSeat } from '../api/endpoints/booking.api';

interface CheckoutState {
    showtime: Showtime;
    selectedSeats: BookingSeat[];
    totalAmount: number;
}

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as CheckoutState;

    // Redirect if no booking data
    useEffect(() => {
        if (!state || !state.showtime || !state.selectedSeats || state.selectedSeats.length === 0) {
            navigate('/');
        }
    }, [state, navigate]);

    if (!state) {
        return null;
    }

    const { showtime, selectedSeats, totalAmount } = state;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            }),
        };
    };

    const datetime = formatDateTime(showtime.startAt);

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
                        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Anton, sans-serif' }}>
                            CHECKOUT
                        </h1>
                        <p className="text-gray-800 mt-1">Review your booking and complete payment</p>
                    </div>

                    {/* Movie & Showtime Info */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex gap-6">
                            {showtime.moviePosterUrl && (
                                <img
                                    src={showtime.moviePosterUrl}
                                    alt={showtime.movieTitle}
                                    className="w-32 h-48 object-cover rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-4">{showtime.movieTitle}</h2>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <MapPin size={20} className="text-yellow-400" />
                                        <div>
                                            <p className="font-semibold">{showtime.theaterName}</p>
                                            <p className="text-sm text-gray-400">Room: {showtime.roomName} ({showtime.roomType})</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Calendar size={20} className="text-yellow-400" />
                                        <div>
                                            <p className="font-semibold">{datetime.date}</p>
                                            <p className="text-sm text-gray-400">{datetime.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Users size={20} className="text-yellow-400" />
                                        <p className="font-semibold">{selectedSeats.length} seat(s)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Seats */}
                    <div className="p-6 border-b border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Selected Seats</h3>
                        <div className="space-y-2">
                            {selectedSeats.map((seat) => (
                                <div key={seat.seatCode} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-yellow-400 font-bold">{seat.seatCode}</span>
                                        <span className="text-gray-400 text-sm">({seat.seatType})</span>
                                    </div>
                                    <span className="text-white font-semibold">{formatCurrency(seat.unitPrice)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="p-6 bg-gray-700/30">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-2xl font-bold text-white">Total Amount</span>
                            <span className="text-3xl font-bold text-yellow-400">{formatCurrency(totalAmount)}</span>
                        </div>

                        {/* Payment Buttons */}
                        <div className="space-y-3">
                            {/* QR Payment Gateway */}
                            <button
                                onClick={() => navigate('/payment-gateway', {
                                    state: {
                                        showtime,
                                        selectedSeats,
                                        totalAmount
                                    }
                                })}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z" />
                                </svg>
                                Thanh toán bằng QR Code
                            </button>
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Back to Seat Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
