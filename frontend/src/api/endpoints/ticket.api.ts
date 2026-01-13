/**
 * Booking API
 * API endpoints for managing bookings
 */

import { apiClient } from '../client';

// ==================== Types ====================

/**
 * Seat type pricing modifier
 */
export interface SeatTypePricingModifier {
    seatType: 'NORMAL' | 'VIP' | 'COUPLE';
    deltaPrice: number;
}

/**
 * Room type pricing modifier
 */
export interface RoomTypePricingModifier {
    roomType: '2D' | '3D' | 'VIP';
    deltaPrice: number;
}

/**
 * Day of week pricing modifier
 */
export interface DayOfWeekPricingModifier {
    dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    deltaPrice: number;
}

/**
 * Pricing modifiers object
 */
export interface PricingModifiers {
    seatTypes: SeatTypePricingModifier[];
    roomTypes: RoomTypePricingModifier[];
    daysOfWeek: DayOfWeekPricingModifier[];
}

/**
 * Pricing configuration response
 */
export interface PricingConfig {
    basePrice: number;
    modifiers: PricingModifiers;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Create pricing config request DTO
 */
export interface CreatePricingConfigDto {
    basePrice: number;
    modifiers?: PricingModifiers;
}

/**
 * Update pricing config request DTO
 */
export interface UpdatePricingConfigDto {
    basePrice?: number;
    modifiers?: PricingModifiers;
}

// ==================== API ====================

export const pricingConfigApi = {
    /**
     * Get current pricing configuration
     * @returns Current pricing config
     */
    getPricingConfig: async (): Promise<PricingConfig> => {
        const response = await apiClient.get('/pricing-configs');
        return response.data;
    },

    /**
     * Create new pricing configuration
     * @param data - Pricing config data
     * @returns Created pricing config
     */
    createPricingConfig: async (data: CreatePricingConfigDto): Promise<PricingConfig> => {
        const response = await apiClient.post('/pricing-configs', data);
        return response.data;
    },

    /**
     * Update existing pricing configuration
     * @param data - Partial pricing config data to update
     * @returns Updated pricing config
     */
    updatePricingConfig: async (data: UpdatePricingConfigDto): Promise<PricingConfig> => {
        const response = await apiClient.patch('/pricing-configs', data);
        return response.data;
    },
};