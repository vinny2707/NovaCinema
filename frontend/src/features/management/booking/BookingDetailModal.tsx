import { useState, useEffect } from 'react';
import { X, User, Film, MapPin, Calendar, Clock, Ticket as TicketIcon, CreditCard } from 'lucide-react';
import { bookingApi } from '../../../api/endpoints/booking.api';
import type { Booking } from '../../../api/endpoints/booking.api';

interface Props {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingDetailModal({ booking, isOpen, onClose }: Props) {
    const [bookingDetail, setBookingDetail] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && booking?._id) {
            loadBookingDetail();
        } else if (!isOpen) {
            setBookingDetail(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, booking?._id]);

    const loadBookingDetail = async () => {
        if (!booking?._id) return;
        
        setLoading(true);
        try {
            const detail = await bookingApi.getBookingById(booking._id);
            setBookingDetail(detail);
        } catch (error) {
            console.error('Failed to load booking detail:', error);
            setBookingDetail(booking);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const displayBooking = bookingDetail || booking;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            DRAFT: 'bg-gray-100 text-gray-800',
            PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
            EXPIRED: 'bg-gray-100 text-gray-600',
        };
        const labels: Record<string, string> = {
            DRAFT: 'Draft',
            PENDING_PAYMENT: 'Pending Payment',
            CONFIRMED: 'Confirmed',
            CANCELLED: 'Cancelled',
            EXPIRED: 'Expired',
        };
        return (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Booking Details</h2>
                        <p className="text-blue-100 text-sm mt-1">Booking ID: {displayBooking?._id || 'N/A'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                        title="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-500">Loading booking details...</div>
                    </div>
                ) : !displayBooking ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-500">No booking data available</div>
                    </div>
                ) : (
                    <>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Status and Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                                <User size={20} className="text-blue-600" />
                                Customer Information
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-900">{displayBooking.username || 'N/A'}</p>
                                <p className="text-gray-600">User ID: {displayBooking.userId}</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                                <CreditCard size={20} className="text-blue-600" />
                                Booking Status
                            </div>
                            <div className="space-y-3">
                                {getStatusBadge(displayBooking.status)}
                                {displayBooking.expiresAt && (
                                    <p className="text-xs text-gray-600">
                                        Expires: {formatDateTime(displayBooking.expiresAt)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Movie and Showtime Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-2 text-gray-800 font-bold mb-4">
                            <Film size={22} className="text-blue-600" />
                            Movie & Showtime Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Movie</p>
                                    <p className="font-bold text-lg text-gray-900">{displayBooking.movieTitle || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
                                        <MapPin size={14} />
                                        Theater & Room
                                    </p>
                                    <p className="font-medium text-gray-800">{displayBooking.theaterName}</p>
                                    <p className="text-sm text-gray-600">{displayBooking.roomName} ({displayBooking.roomType})</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
                                        <Calendar size={14} />
                                        Showtime
                                    </p>
                                    <p className="font-medium text-gray-800">{formatDateTime(displayBooking.startAt)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
                                        <Clock size={14} />
                                        Booking Created
                                    </p>
                                    <p className="font-medium text-gray-800">{formatDateTime(displayBooking.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seats */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-800 font-bold mb-4">
                            <TicketIcon size={22} className="text-blue-600" />
                            Selected Seats ({displayBooking.seats?.length || 0})
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {displayBooking.seats && displayBooking.seats.map((seat, index) => (
                                <div
                                    key={index}
                                    className="bg-white border-2 border-blue-300 rounded-lg px-4 py-2 shadow-sm"
                                >
                                    <p className="font-bold text-lg text-blue-600">{seat.seatCode}</p>
                                    <p className="text-xs text-gray-600">{seat.seatType}</p>
                                    <p className="text-xs font-semibold text-gray-800">{formatCurrency(seat.unitPrice)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                        <div className="flex items-center gap-2 text-gray-800 font-bold mb-4">
                            <CreditCard size={22} className="text-emerald-600" />
                            Payment Summary
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Base Amount:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(displayBooking.baseAmount)}</span>
                            </div>
                            {displayBooking.discountAmount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Discount:</span>
                                    <span className="font-semibold text-red-600">-{formatCurrency(displayBooking.discountAmount)}</span>
                                </div>
                            )}
                            <div className="border-t-2 border-emerald-300 pt-3 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                                <span className="text-2xl font-bold text-emerald-600">{formatCurrency(displayBooking.finalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        Close
                    </button>
                </div>
                    </>
                )}
            </div>
        </div>
    );
}