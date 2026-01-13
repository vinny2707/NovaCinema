import { useEffect, useState } from 'react';
import { bookingApi, type Booking, type BookingStatus, type PaginatedBookings } from '../../api/endpoints/booking.api';
import { Calendar, MapPin, Armchair, CreditCard, Clock } from 'lucide-react';
import { useToast } from '../../components/common/ToastProvider';
import BookingDetailDialog from './BookingDetailDialog';

const BookingHistoryCard = () => {
    const toast = useToast();
    const [bookings, setBookings] = useState<PaginatedBookings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'ALL'>('ALL');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const itemsPerPage = 5;

    const fetchBookings = async (page: number, status?: BookingStatus | 'ALL') => {
        setIsLoading(true);
        try {
            const query: any = {
                page,
                limit: itemsPerPage,
            };

            if (status && status !== 'ALL') {
                query.status = [status];
            }

            const data = await bookingApi.getUserBookings(query);

            // Validate response structure
            if (!data) {
                throw new Error('No data received from API');
            }

            if (!data.items) {
                throw new Error('Invalid response structure: missing items');
            }

            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.push('Unable to load booking history', 'error');
            setBookings({ items: [], total: 0, page: 1, limit: itemsPerPage, totalPages: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(currentPage, selectedStatus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, selectedStatus]);

    const handleStatusFilter = (status: BookingStatus | 'ALL') => {
        setSelectedStatus(status);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleViewDetails = (e: React.MouseEvent, booking: Booking) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Opening dialog for booking:', booking._id);
        setSelectedBooking(booking);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        console.log('Closing dialog');
        setIsDialogOpen(false);
        setSelectedBooking(null);
    };

    const getStatusBadge = (status: BookingStatus) => {
        const statusConfig = {
            CONFIRMED: { label: 'Confirmed', className: 'bg-green-100 text-green-700 border-green-300' },
            PENDING_PAYMENT: { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-300' },
            DRAFT: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
            CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-300' },
            EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-700 border-gray-300' },
        };

        const config = statusConfig[status] || statusConfig.DRAFT;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
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

    if (isLoading && !bookings) {
        return (
            <div className="bg-white rounded-md p-6 shadow-md">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-md p-6 shadow-md">
                <h3 className="text-xl font-bold mb-6">Booking History</h3>

                {/* Status Filter */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(['ALL', 'CONFIRMED', 'PENDING_PAYMENT', 'DRAFT', 'CANCELLED', 'EXPIRED'] as const).map((status) => {
                        const labels = {
                            ALL: 'All',
                            CONFIRMED: 'Confirmed',
                            PENDING_PAYMENT: 'Processing',
                            DRAFT: 'Pending',
                            CANCELLED: 'Cancelled',
                            EXPIRED: 'Expired',
                        };

                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === status
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {labels[status]}
                            </button>
                        );
                    })}
                </div>

                {/* Bookings List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                ) : bookings && bookings.items.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.items.map((booking: Booking) => (
                            <div
                                key={booking._id}
                                onClick={(e) => handleViewDetails(e, booking)}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-purple-300"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-gray-800 mb-1">
                                            {booking.movieTitle || 'N/A'}
                                        </h4>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {formatCurrency(booking.finalAmount)}
                                        </div>
                                        {booking.discountAmount > 0 && (
                                            <div className="text-xs text-gray-500 line-through">
                                                {formatCurrency(booking.baseAmount)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-purple-500" />
                                        <span>
                                            <strong>Theater:</strong> {booking.theaterName || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-purple-500" />
                                        <span>
                                            <strong>Room:</strong> {booking.roomName || 'N/A'} ({booking.roomType || 'N/A'})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-purple-500" />
                                        <span>
                                            <strong>Showtime:</strong> {formatDateTime(booking.startAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Armchair size={16} className="text-purple-500" />
                                        <span>
                                            <strong>Seats:</strong> {booking.seats?.map((s) => s.seatCode).join(', ') || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={16} className="text-purple-500" />
                                        <span>
                                            <strong>Booked on:</strong> {formatDate(booking.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Seat Details */}
                                {booking.seats && booking.seats.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="text-xs text-gray-600">
                                            <strong>Seat Details:</strong>
                                            {' '}
                                            {booking.seats.map((seat, idx) => (
                                                <span key={idx}>
                                                    {seat.seatCode} ({seat.seatType}: {formatCurrency(seat.unitPrice)})
                                                    {idx < booking.seats.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            <Armchair size={48} className="mx-auto mb-3 opacity-50" />
                        </div>
                        <p className="text-gray-600 font-medium">No booking history</p>
                        <p className="text-gray-500 text-sm mt-1">Your bookings will appear here</p>
                    </div>
                )}

                {/* Pagination */}
                {bookings && bookings.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                        <div className="text-sm text-gray-600">
                            Page {bookings.page} / {bookings.totalPages} (Total: {bookings.total} bookings)
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(bookings.totalPages, prev + 1))}
                                disabled={currentPage === bookings.totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Detail Dialog */}
            <BookingDetailDialog
                booking={selectedBooking}
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
            />
        </>
    );
};

export default BookingHistoryCard;
