/**
 * Booking API
 * API endpoints for managing bookings
 */

import { apiClient } from '../client';

// ==================== Types ====================

export interface SeatAvailability {
    seatCode: string;        // "A1", "B2", etc.
    seatType: 'NORMAL' | 'VIP' | 'COUPLE';
    status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
    isAvailable: boolean;
}

export interface SeatTypePrice {
    seatType: 'NORMAL' | 'VIP' | 'COUPLE';
    price: number;
}

export interface BookingAvailability {
    seatMap: (SeatAvailability | null)[][];
    prices: SeatTypePrice[];
}

export interface BookingSeat {
    seatCode: string;
    seatType: 'NORMAL' | 'VIP' | 'COUPLE';
    unitPrice: number;
}

export type BookingStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export type RoomType = '2D' | '3D' | 'VIP';

export interface Ticket {
    _id: string;
    code: string;
    bookingId: string;
    showtimeId: string;
    userId: string;
    status: 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED';
    scannedAt?: string;
    startAt?: string;
    // Snapshot data
    movieTitle?: string;
    moviePoster?: string;
    theaterName?: string;
    roomName?: string;
    roomType?: string;
    // Seat info
    seatType: string;
    seatCode: string;
    unitPrice: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Booking {
    _id: string;
    userId: string;
    showtimeId: string;
    status: BookingStatus;
    expiresAt: string | null;
    seats: BookingSeat[];
    baseAmount: number;
    discountAmount: number;
    finalAmount: number;
    // Snapshot data
    username?: string;
    movieTitle?: string;
    theaterName?: string;
    roomName?: string;
    roomType?: string;
    startAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBookingDto {
    selectedSeats: string[];  // ["A1", "A2", "B5"]
}

export interface ConfirmBookingDto {
    paymentMethod: 'CASH' | 'CARD' | 'MOMO' | 'VNPAY';
    voucherCode?: string;
}

export interface BookingHistoryQuery {
    page?: number;
    limit?: number;
    status?: BookingStatus[];
    from?: string;
    to?: string;
    movieTitle?: string;
    theaterName?: string;
    roomType?: ('2D' | '3D' | 'VIP')[];
}

export interface PaginatedBookings {
    items: Booking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Query params for admin booking management
export interface AdminBookingQuery {
    page?: number;
    limit?: number;
    sort?: string[];
    search?: string;
    userId?: string;
    movieId?: string;
    theaterId?: string;
    roomId?: string;
    status?: BookingStatus | BookingStatus[];
    username?: string;
    movieTitle?: string;
    theaterName?: string;
    roomName?: string;
    roomType?: RoomType | RoomType[];
    from?: string; // Date string
    to?: string; // Date string
}

// Query params for showtime bookings
export interface AdminBookingByShowtimeQuery {
    page?: number;
    limit?: number;
    sort?: string[];
    userId?: string;
    username?: string;
    status?: BookingStatus | BookingStatus[];
}

// ==================== API ====================

export const bookingApi = {
    /**
     * Get booking availability for a showtime
     * Returns seat map and pricing information
     */
    getAvailability: async (showtimeId: string): Promise<BookingAvailability> => {
        const response = await apiClient.get(`/showtimes/${showtimeId}/bookings/availability`);
        return response.data;
    },

    /**
     * Get available showtimes for a movie at a theater on a specific date
     */
    getShowtimeAvailability: async (filters: { movieId: string; theaterId: string; date: string }) => {
        const response = await apiClient.get("/showtimes/availability", { params: filters });
        return (response as any).items || response.data || [];
    },

    /**
     * Create a draft booking
     * Creates a booking with DRAFT status that expires in 10 minutes
     */
    createBooking: async (showtimeId: string, data: CreateBookingDto): Promise<Booking> => {
        const response = await apiClient.post(`/showtimes/${showtimeId}/bookings`, data);
        return response.data;
    },

    /**
     * Get booking by ID
     */
    getBookingById: async (bookingId: string): Promise<Booking> => {
        const response = await apiClient.get(`/bookings/${bookingId}`);
        return response.data;
    },

    /**
     * Confirm booking (payment)
     * Updates booking status from DRAFT to CONFIRMED
     */
    confirmBooking: async (bookingId: string, data: ConfirmBookingDto): Promise<Booking> => {
        const response = await apiClient.post(`/bookings/${bookingId}/confirm`, data);
        return response.data;
    },

    /**
     * Cancel booking
     */
    cancelBooking: async (bookingId: string): Promise<void> => {
        await apiClient.delete(`/bookings/${bookingId}`);
    },

    /**
     * Get paginated list of all bookings (Admin only)
     * Supports filtering by various fields
     */
    getPaginatedBookings: async (query: AdminBookingQuery): Promise<PaginatedBookings> => {
        const response = await apiClient.get('/bookings', { params: query });
        return response as any;
    },

    /**
     * Get paginated bookings for a specific showtime (Admin only)
     */
    getPaginatedBookingsByShowtime: async (showtimeId: string, query: AdminBookingByShowtimeQuery): Promise<PaginatedBookings> => {
        const response = await apiClient.get(`/showtimes/${showtimeId}/bookings`, { params: query });
        return response as any;
    },

    /**
     * Get current user's booking history with pagination
     * Returns paginated list of bookings for the logged-in user
     */
    getUserBookings: async (query?: BookingHistoryQuery): Promise<PaginatedBookings> => {
        const response = await apiClient.get('/users/me/bookings', { params: query });
        // Interceptor already transformed the response, so just return it directly
        return response as any;
    },

    /**
     * Get tickets for a specific booking
     * Returns list of tickets with QR codes for the booking
     */
    getTicketsByBookingId: async (bookingId: string): Promise<Ticket[]> => {
        const response = await apiClient.get(`/bookings/${bookingId}/tickets`);
        // Interceptor returns response.data which contains the full API response
        // So we need to extract the data array from it
        return response.data || response;
    },
};
