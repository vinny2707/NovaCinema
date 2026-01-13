import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Calendar, Users } from 'lucide-react';
import type { Showtime } from '../api/endpoints/showtime.api';
import type { BookingSeat } from '../api/endpoints/booking.api';
import { bookingApi } from '../api/endpoints/booking.api';
import { paymentApi } from '../api/endpoints/payment.api';

interface CheckoutState {
    showtime: Showtime;
    selectedSeats: BookingSeat[];
    totalAmount: number;
}

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as CheckoutState;

    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if no booking data
    useEffect(() => {
        if (!state || !state.showtime || !state.selectedSeats || state.selectedSeats.length === 0) {
            navigate('/');
        }
    }, [state, navigate]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert('Time expired! Please select seats again.');
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    if (!state) {
        return null;
    }

    const { showtime, selectedSeats, totalAmount } = state;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    const handlePayWithPayOS = async () => {
        setIsProcessing(true);
        try {
            // Step 1: Create booking
            const booking = await bookingApi.createBooking(showtime._id, {
                selectedSeats: selectedSeats.map(s => s.seatCode),
            });
            console.log('Booking created:', booking);

            // Step 2: Create payment
            const payment = await paymentApi.createPayment(booking._id);
            console.log('Payment created:', payment);

            // Step 3: Redirect to PayOS checkout
            if (payment.checkoutUrl) {
                // Save booking info to localStorage for callback page
                localStorage.setItem('pendingPayment', JSON.stringify({
                    bookingId: booking._id,
                    paymentId: payment._id,
                    orderCode: payment.orderCode,
                    showtime,
                    selectedSeats,
                    totalAmount
                }));

                // Redirect to PayOS
                window.location.href = payment.checkoutUrl;
            } else {
                throw new Error('No checkout URL received from payment gateway');
            }
        } catch (error: unknown) {
            console.error('Payment error:', error);

            // Handle specific error types
            let errorMessage = 'Failed to process payment. Please try again.';

            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { status: number; data?: { message?: string } }; request?: unknown; message?: string };

                if (apiError.response) {
                    // API error with response
                    const status = apiError.response.status;
                    const message = apiError.response.data?.message || apiError.message || '';

                    if (status === 409) {
                        errorMessage = 'These seats are no longer available. Please select different seats.';
                    } else if (status === 410) {
                        errorMessage = 'Your booking has expired. Please select seats again.';
                    } else if (status === 400) {
                        errorMessage = message || 'Invalid booking data. Please try again.';
                    } else {
                        errorMessage = `Error: ${message}`;
                    }
                } else if (apiError.request) {
                    // Network error
                    errorMessage = 'Network error. Please check your connection and try again.';
                }
            }

            alert(errorMessage);
            setIsProcessing(false);
        }
    };

    const datetime = formatDateTime(showtime.startAt);

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Timer Warning */}
                <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="text-orange-400" size={24} />
                        <div>
                            <h3 className="text-orange-400 font-semibold">Complete payment within</h3>
                            <p className="text-orange-200 text-sm">Your seats are temporarily reserved</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-orange-400 font-mono">
                        {formatTime(timeLeft)}
                    </div>
                </div>

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

                        {/* Payment Button */}
                        <button
                            onClick={handlePayWithPayOS}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                    </svg>
                                    Pay with PayOS
                                </>
                            )}
                        </button>

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
