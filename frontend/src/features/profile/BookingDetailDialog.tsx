import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Barcode from 'react-barcode';
import type { Booking, Ticket } from '../../api/endpoints/booking.api';
import { bookingApi } from '../../api/endpoints/booking.api';

interface Props {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
}

const BookingDetailDialog = ({ booking, isOpen, onClose }: Props) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);

    // Fetch tickets when dialog opens with a booking
    useEffect(() => {
        if (!isOpen || !booking) {
            setTickets([]);
            return;
        }

        console.log('Fetching tickets for booking:', booking._id);
        const fetchTickets = async () => {
            setLoadingTickets(true);
            try {
                const ticketData = await bookingApi.getTicketsByBookingId(booking._id);
                console.log('API returned tickets:', ticketData);

                if (Array.isArray(ticketData)) {
                    setTickets(ticketData);
                } else if ((ticketData as any).items && Array.isArray((ticketData as any).items)) {
                    // Handle pagination structure from interceptor
                    setTickets((ticketData as any).items);
                } else if ((ticketData as any).data && Array.isArray((ticketData as any).data)) {
                    // Handle standard API response wrapper
                    setTickets((ticketData as any).data);
                } else {
                    console.error('Unknown ticket response structure:', ticketData);
                    setTickets([]);
                }
            } catch (error) {
                console.error('Failed to fetch tickets:', error);
                setTickets([]);
            } finally {
                setLoadingTickets(false);
            }
        };

        fetchTickets();
    }, [isOpen, booking]);

    if (!isOpen || !booking) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            CONFIRMED: 'bg-green-100 text-green-700 border-green-300',
            PENDING_PAYMENT: 'bg-blue-100 text-blue-700 border-blue-300',
            DRAFT: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            CANCELLED: 'bg-red-100 text-red-700 border-red-300',
            EXPIRED: 'bg-gray-100 text-gray-700 border-gray-300',
        };
        return colors[status as keyof typeof colors] || colors.DRAFT;
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            CONFIRMED: 'Confirmed',
            PENDING_PAYMENT: 'Processing',
            DRAFT: 'Pending',
            CANCELLED: 'Cancelled',
            EXPIRED: 'Expired',
        };
        return labels[status as keyof typeof labels] || status;
    };

    return (
        <div
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Movie Info */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {booking.movieTitle || 'N/A'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                                {getStatusLabel(booking.status)}
                            </span>
                            <span className="text-sm text-gray-600">
                                Booking ID: {booking._id}
                            </span>
                        </div>
                    </div>

                    {/* Showtime Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Theater</label>
                            <p className="text-gray-800">{booking.theaterName || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Room</label>
                            <p className="text-gray-800">
                                {booking.roomName || 'N/A'} ({booking.roomType || 'N/A'})
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Showtime</label>
                            <p className="text-gray-800">{formatDateTime(booking.startAt)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Booked On</label>
                            <p className="text-gray-800">{formatDate(booking.createdAt)}</p>
                        </div>
                    </div>

                    {/* Seats */}
                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Seats</label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {booking.seats?.map((seat, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md font-medium text-sm"
                                    >
                                        {seat.seatCode}
                                    </span>
                                ))}
                            </div>
                            <div className="space-y-1">
                                {booking.seats?.map((seat, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {seat.seatCode} ({seat.seatType})
                                        </span>
                                        <span className="font-medium text-gray-800">
                                            {formatCurrency(seat.unitPrice)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="border-t pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base Amount</span>
                                <span className="font-medium">{formatCurrency(booking.baseAmount)}</span>
                            </div>
                            {booking.discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span className="font-medium">-{formatCurrency(booking.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total Amount</span>
                                <span className="text-purple-600">{formatCurrency(booking.finalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    {booking.username && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-sm font-semibold text-gray-600 block mb-1">
                                Customer
                            </label>
                            <p className="text-gray-800">{booking.username}</p>
                        </div>
                    )}

                    {/* Expiry Time */}
                    {booking.expiresAt && booking.status === 'DRAFT' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <label className="text-sm font-semibold text-yellow-700 block mb-1">
                                Expires At
                            </label>
                            <p className="text-yellow-800">{formatDateTime(booking.expiresAt)}</p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Please complete payment before expiration
                            </p>
                        </div>
                    )}

                    {/* Tickets with QR Codes */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-600">Your Tickets</label>
                            {tickets.length > 0 && (
                                <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    {tickets.length} Ticket{tickets.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        {loadingTickets ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-purple-600" size={32} />
                            </div>
                        ) : tickets.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {tickets.map((ticket, idx) => (
                                    <div key={ticket._id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-purple-700">Ticket #{idx + 1}</span>
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                                        {ticket.seatCode}
                                                    </span>
                                                </div>
                                                <div className="text-sm space-y-1 text-gray-700">
                                                    <p><strong>Seat Type:</strong> {ticket.seatType}</p>
                                                    <p><strong>Price:</strong> {formatCurrency(ticket.unitPrice)}</p>
                                                    {ticket.status && (
                                                        <p>
                                                            <strong>Status:</strong>{' '}
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ticket.status === 'VALID' ? 'bg-green-100 text-green-700' :
                                                                ticket.status === 'USED' ? 'bg-gray-100 text-gray-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                {ticket.status}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                <Barcode
                                                    value={ticket.code}
                                                    width={1}
                                                    height={50}
                                                    fontSize={10}
                                                    margin={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500 text-sm">
                                No tickets available yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailDialog;