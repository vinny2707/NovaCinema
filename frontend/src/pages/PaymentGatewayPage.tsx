/**
 * PaymentGatewayPage
 * Custom payment page with QR code display (alternative to PayOS redirect)
 */

import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QrCode, Clock, CreditCard, AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Showtime } from '../api/endpoints/showtime.api';
import type { BookingSeat } from '../api/endpoints/booking.api';
import { bookingApi } from '../api/endpoints/booking.api';
import { paymentApi, type PaymentCheckout } from '../api/endpoints/payment.api';

interface PaymentGatewayState {
    showtime: Showtime;
    selectedSeats: BookingSeat[];
    totalAmount: number;
}

type PaymentStep = 'creating' | 'pending' | 'checking' | 'success' | 'failed' | 'expired';

export default function PaymentGatewayPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as PaymentGatewayState;

    const [step, setStep] = useState<PaymentStep>('creating');
    const [payment, setPayment] = useState<PaymentCheckout | null>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [error, setError] = useState<string>('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    // Ref to prevent double initialization (React StrictMode)
    const isInitializingRef = useRef(false);

    // Storage key for persisting payment state
    const STORAGE_KEY = 'pendingPaymentGateway';

    // Load saved payment state on mount (for page reload)
    useEffect(() => {
        // Prevent double initialization (React StrictMode runs effects twice)
        if (isInitializingRef.current) return;
        isInitializingRef.current = true;
        
        const savedPayment = sessionStorage.getItem(STORAGE_KEY);
        if (savedPayment) {
            try {
                const parsed = JSON.parse(savedPayment);
                if (parsed.payment && parsed.showtime && parsed.selectedSeats) {
                    setPayment(parsed.payment);
                    setStep('pending');
                    // Calculate remaining time
                    if (parsed.createdAt) {
                        const elapsed = Math.floor((Date.now() - parsed.createdAt) / 1000);
                        const remaining = Math.max(0, 600 - elapsed);
                        setTimeLeft(remaining);
                        if (remaining <= 0) {
                            setStep('expired');
                        }
                    }
                    setIsInitialized(true);
                    return; // Don't redirect, we have saved state
                }
            } catch (e) {
                console.error('Failed to parse saved payment:', e);
                sessionStorage.removeItem(STORAGE_KEY);
            }
        }

        // Redirect if no booking data and no saved state
        if (!state || !state.showtime || !state.selectedSeats || state.selectedSeats.length === 0) {
            navigate('/');
            return;
        }
        
        // Create new payment
        createPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Countdown timer
    useEffect(() => {
        if (step === 'pending' || step === 'checking') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setStep('expired');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [step]);

    // Poll payment status
    useEffect(() => {
        let pollInterval: ReturnType<typeof setInterval> | null = null;

        if (step === 'pending' && payment) {
            pollInterval = setInterval(async () => {
                try {
                    setStep('checking');
                    const paymentDetail = await paymentApi.getPaymentById(payment._id);

                    if (paymentDetail.status === 'PAID') {
                        setStep('success');
                        sessionStorage.removeItem(STORAGE_KEY); // Clear saved state
                        if (pollInterval) clearInterval(pollInterval);
                    } else if (paymentDetail.status === 'CANCELLED' || paymentDetail.status === 'FAILED') {
                        setStep('failed');
                        sessionStorage.removeItem(STORAGE_KEY); // Clear saved state
                        if (pollInterval) clearInterval(pollInterval);
                    } else {
                        setStep('pending');
                    }
                } catch (err) {
                    console.error('Failed to check payment status:', err);
                    setStep('pending');
                }
            }, 3000); // Check every 3 seconds
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [step, payment]);

    const createPayment = async () => {
        try {
            setStep('creating');
            setError('');

            // Create booking
            const booking = await bookingApi.createBooking(state.showtime._id, {
                selectedSeats: state.selectedSeats.map(s => s.seatCode),
            });

            // Create payment
            const paymentData = await paymentApi.createPayment(booking._id);
            setPayment(paymentData);
            setStep('pending');
            setIsInitialized(true);

            // Save to sessionStorage for page reload
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                payment: paymentData,
                bookingId: booking._id,
                showtime: state.showtime,
                selectedSeats: state.selectedSeats,
                totalAmount: state.totalAmount,
                createdAt: Date.now(),
            }));
        } catch (err: unknown) {
            console.error('Payment creation error:', err);
            const errorMessage =
                (err as { message?: string })?.message ||
                'Failed to create payment. Please try again.';
            setError(errorMessage);
            setStep('failed');
            setIsInitialized(true);
        }
    };

    // Clear saved payment state
    const clearSavedPayment = () => {
        sessionStorage.removeItem(STORAGE_KEY);
    };

    const handleCancel = () => {
        if (payment) {
            setShowCancelModal(true);
        } else {
            clearSavedPayment();
            navigate('/');
        }
    };

    const confirmCancel = async () => {
        if (payment) {
            try {
                await paymentApi.cancelPayment(payment._id, 'User cancelled');
                clearSavedPayment();
                navigate('/');
            } catch (err) {
                console.error('Failed to cancel payment:', err);
                clearSavedPayment();
                navigate('/');
            }
        }
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
    };

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
        return date.toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!state) {
        return null;
    }

    const { showtime, selectedSeats, totalAmount } = state;

    // Show loading while initialization is in progress
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={64} />
                    <p className="text-white text-xl">Đang tạo thanh toán...</p>
                    <p className="text-gray-400 mt-2">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    // Payment success
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">Your booking has been confirmed</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-600 mb-1">Order Code</p>
                        <p className="text-lg font-bold text-gray-800">{payment?.orderCode}</p>
                        <div className="border-t border-gray-200 my-3"></div>
                        <p className="text-sm text-gray-600">Movie: {showtime.movieTitle}</p>
                        <p className="text-sm text-gray-600">Seats: {selectedSeats.map(s => s.seatCode).join(', ')}</p>
                        <p className="text-sm text-gray-600">Amount: {formatCurrency(totalAmount)}</p>
                    </div>

                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
                    >
                        View My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Payment failed or expired
    if (step === 'failed' || step === 'expired') {
        const handleRetry = () => {
            clearSavedPayment(); // Clear old payment state
            navigate(-1); // Go back to checkout to create new payment
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-800 to-pink-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <XCircle className="text-red-600" size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {step === 'expired' ? 'Hết thời gian thanh toán' : 'Thanh toán thất bại'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {step === 'expired'
                            ? 'Thời gian thanh toán đã hết. Vui lòng thử lại.'
                            : error || 'Thanh toán không thành công.'}
                    </p>

                    <button
                        onClick={handleRetry}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
                    >
                        Thử lại
                    </button>
                    <button
                        onClick={() => {
                            clearSavedPayment();
                            navigate('/');
                        }}
                        className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-all"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // Payment pending - Show QR Code
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* QR Code Section */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full mb-4">
                                <QrCode size={20} />
                                <span className="font-semibold">Scan to Pay</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
                            <p className="text-gray-600">Scan the QR code with your banking app</p>
                        </div>

                        {/* QR Code Display */}
                        {payment?.qrCode ? (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 flex justify-center">
                                <div className="bg-white p-4 rounded-lg shadow-lg">
                                    <QRCodeSVG
                                        value={payment.qrCode}
                                        size={280}
                                        level="M"
                                        includeMargin={true}
                                    />
                                </div>
                            </div>
                        ) : payment?.checkoutUrl ? (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                                <p className="text-center text-gray-700 mb-4">QR Code not available, but you can use this link:</p>
                                <a
                                    href={payment.checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center text-blue-600 hover:text-blue-800 underline break-all text-sm"
                                >
                                    {payment.checkoutUrl}
                                </a>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 mb-6 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="animate-spin mx-auto mb-3 text-gray-400" size={48} />
                                    <p className="text-gray-500">Loading QR Code...</p>
                                </div>
                            </div>
                        )}

                        {/* Bank Transfer Info */}
                        {payment && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                                <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                                    <CreditCard size={16} />
                                    Hoặc chuyển khoản thủ công:
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {payment.accountName && (
                                        <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                                            <span className="text-gray-600">Chủ TK:</span>
                                            <span className="font-medium text-gray-900">{payment.accountName}</span>
                                        </div>
                                    )}
                                    {payment.accountNumber && (
                                        <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                                            <span className="text-gray-600">Số TK:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-medium text-gray-900">{payment.accountNumber}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(payment.accountNumber || '');
                                                        alert('Đã copy số tài khoản!');
                                                    }}
                                                    className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {payment.bin && (
                                        <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                                            <span className="text-gray-600">Ngân hàng:</span>
                                            <span className="font-medium text-gray-900">Mã BIN: {payment.bin}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                                        <span className="text-gray-600">Số tiền:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-green-700">{formatCurrency(payment.amount)}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(payment.amount.toString());
                                                    alert('Đã copy số tiền!');
                                                }}
                                                className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                                        <span className="text-gray-600">Nội dung CK:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-gray-900">{payment.transferContent || payment.orderCode}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(payment.transferContent || payment.orderCode || '');
                                                    alert('Đã copy nội dung chuyển khoản!');
                                                }}
                                                className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {!payment.accountNumber && (
                                    <p className="text-xs text-amber-700 mt-3 italic">
                                        * Thông tin ngân hàng sẽ hiển thị khi quét QR code bằng app ngân hàng
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Payment Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                <div className="text-sm">
                                    <p className="font-semibold text-blue-900 mb-1">Hướng dẫn thanh toán:</p>
                                    <ul className="text-blue-800 space-y-1 list-disc list-inside">
                                        <li>Mở ứng dụng ngân hàng của bạn</li>
                                        <li>Chọn "Quét mã QR" hoặc chuyển khoản thủ công</li>
                                        <li>Quét mã QR ở trên hoặc nhập thông tin chuyển khoản</li>
                                        <li>Xác nhận thanh toán</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Status indicator */}
                        <div className="mt-4 text-center">
                            {step === 'checking' && (
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                    <Loader2 className="animate-spin" size={18} />
                                    <span className="text-sm font-medium">Đang kiểm tra trạng thái...</span>
                                </div>
                            )}
                            {step === 'pending' && (
                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                    <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm">Đang chờ thanh toán...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 text-white">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <CreditCard size={24} />
                            Payment Details
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <p className="text-sm text-gray-300 mb-1">Order Code</p>
                                <p className="text-xl font-bold">{payment?.orderCode}</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <p className="text-sm text-gray-300 mb-1">Movie</p>
                                <p className="text-lg font-semibold">{showtime.movieTitle}</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <p className="text-sm text-gray-300 mb-1">Theater & Room</p>
                                <p className="font-semibold">{showtime.theaterName}</p>
                                <p className="text-sm text-gray-300">{showtime.roomName} - {showtime.roomType}</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <p className="text-sm text-gray-300 mb-1">Showtime</p>
                                <p className="font-semibold">{formatDateTime(showtime.startAt)}</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <p className="text-sm text-gray-300 mb-2">Selected Seats</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSeats.map(seat => (
                                        <span
                                            key={seat.seatCode}
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 rounded-lg text-sm font-semibold"
                                        >
                                            {seat.seatCode}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-4 border-2 border-yellow-400/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Total Amount</span>
                                    <span className="text-2xl font-bold text-yellow-400">{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Countdown Timer - Prominent */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 border border-indigo-400/50 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="text-indigo-200" size={28} />
                                    <div>
                                        <p className="text-xs text-indigo-200 font-medium">Thời gian còn lại</p>
                                        <p className="text-3xl font-bold text-white">{formatTime(timeLeft)}</p>
                                    </div>
                                </div>
                                <AlertCircle className="text-indigo-200" size={32} />
                            </div>
                            <p className="text-xs text-indigo-100 mt-3">
                                Vui lòng hoàn tất thanh toán trước khi hết thời gian. Hệ thống sẽ tự động kiểm tra trạng thái.
                            </p>
                        </div>

                        {/* Cancel Button */}
                        <button
                            onClick={handleCancel}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl transition-colors font-semibold shadow-lg"
                        >
                            <XCircle size={24} />
                            <span>Hủy thanh toán</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <XCircle className="text-red-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận hủy thanh toán</h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn hủy thanh toán này? Ghế đã chọn sẽ được trả về và bạn cần đặt lại từ đầu.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeCancelModal}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
                                >
                                    Tiếp tục thanh toán
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Hủy thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
