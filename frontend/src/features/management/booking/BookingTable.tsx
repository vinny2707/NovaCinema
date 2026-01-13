import { useEffect, useState } from 'react';
import { Eye, Clock } from 'lucide-react';
import { bookingApi } from '../../../api/endpoints/booking.api';
import type { Booking, AdminBookingQuery } from '../../../api/endpoints/booking.api';

interface Props {
    search?: string;
    status?: string;
    movieId?: string;
    theaterId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    onPageChange?: (nextPage: number) => void;
    onLimitChange?: (nextLimit: number) => void;
    onViewDetail?: (booking: Booking) => void;
}

export default function BookingTable({
    search = '',
    status = '',
    movieId = '',
    theaterId = '',
    fromDate = '',
    toDate = '',
    page = 1,
    limit = 10,
    onPageChange,
    onLimitChange,
    onViewDetail,
}: Props) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, search, status, movieId, theaterId, fromDate, toDate]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const query: AdminBookingQuery = {
                page,
                limit,
                search: search || undefined,
                status: status ? (status as any) : undefined,
                movieId: movieId || undefined,
                theaterId: theaterId || undefined,
                from: fromDate || undefined,
                to: toDate || undefined,
                sort: ['createdAt:desc'],
            };

            const response = await bookingApi.getPaginatedBookings(query);
            const items = (response as any).items || (response as any).data || [];

            setBookings(Array.isArray(items) ? items : []);
            setTotalItems(response.total || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
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
            PENDING_PAYMENT: 'Pending Pay',
            CONFIRMED: 'Confirmed',
            CANCELLED: 'Cancelled',
            EXPIRED: 'Expired',
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Customer / Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Movie & Showtime
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Seats
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Loading bookings...
                                </td>
                            </tr>
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No bookings found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-blue-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-800">{booking.username || 'N/A'}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock size={12} />
                                                {formatDateTime(booking.createdAt)}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-800">{booking.movieTitle || 'Unknown Movie'}</p>
                                            <p className="text-sm text-gray-500">
                                                {booking.theaterName} - {booking.roomName}
                                            </p>
                                            <p className="text-sm text-gray-500 font-mono">
                                                {formatDateTime(booking.startAt)}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {booking.seats && booking.seats.map((seat) => (
                                                <span
                                                    key={`${booking._id}-${seat.seatCode}`}
                                                    className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-700"
                                                >
                                                    {seat.seatCode}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-emerald-700 font-bold text-lg">
                                            {formatCurrency(booking.finalAmount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(booking.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all transform hover:scale-110 shadow-sm hover:shadow-md"
                                            title="View Details"
                                            onClick={() => onViewDetail && onViewDetail(booking)}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t-2 border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Show</span>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
                        className="px-3 py-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600 font-medium">items</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages} (Total {totalItems} items)
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange && onPageChange(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
