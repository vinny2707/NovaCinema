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

export type BookingStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

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
};
