/**
 * Payment API
 * API endpoints for managing payments
 */

import { apiClient } from '../client';

// ==================== Types ====================

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
export type PaymentProvider = 'PAYOS' | 'MOMO' | 'VNPAY';

export interface Payment {
    _id: string;
    bookingId: string;
    userId: string;
    amount: number;
    status: PaymentStatus;
    provider: PaymentProvider;
    orderCode: string;
    transactionId?: string;
    transactionAt?: string;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentCheckout extends Payment {
    checkoutUrl: string;
    qrCode?: string;
    // PayOS bank transfer info
    bin?: string;           // Bank bin code (e.g., "970422")
    accountNumber?: string; // Bank account number
    accountName?: string;   // Account holder name
    transferContent?: string;   // Transfer description/content
    // Booking snapshot data
    movieTitle?: string;
    theaterName?: string;
    roomName?: string;
    roomType?: string;
    startAt?: string;
    seats?: Array<{
        seatCode: string;
        seatType: string;
        unitPrice: number;
    }>;
}

export interface PaymentDetail extends Payment {
    movieTitle: string;
    theaterName: string;
    roomName: string;
    roomType: string;
    startAt: string;
    seats: Array<{
        seatCode: string;
        seatType: string;
        unitPrice: number;
    }>;
}

// ==================== API ====================

export const paymentApi = {
    /**
     * Create payment for a booking
     * Returns PayOS checkout URL and QR code
     */
    createPayment: async (bookingId: string): Promise<PaymentCheckout> => {
        const response = await apiClient.post(`/bookings/${bookingId}/payments`);
        return response.data;
    },

    /**
     * Get payment by ID
     */
    getPaymentById: async (paymentId: string): Promise<PaymentDetail> => {
        const response = await apiClient.get(`/payments/${paymentId}`);
        return response.data;
    },

    /**
     * Cancel payment
     */
    cancelPayment: async (paymentId: string, reason?: string): Promise<void> => {
        await apiClient.patch(`/payments/${paymentId}/cancel`, { reason });
    },
};
