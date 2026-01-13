/**
 * Dashboard API
 * API endpoints for admin dashboard statistics
 */

import { apiClient } from '../client';

// ==================== Types ====================

export interface StatItem {
    value: number;
    growth: number;  // percentage growth from last month
}

export interface DashboardStats {
    totalMovies: StatItem;
    totalUsers: StatItem;
    revenue: StatItem;      // revenue in VND
    totalBookings: StatItem;
}

export interface ActivityItem {
    type: 'movie' | 'user' | 'theater' | 'booking';
    title: string;
    description: string;
    createdAt: string;
}

export interface RecentActivity {
    activities: ActivityItem[];
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
    transactions: number;
}

export interface RevenueChartData {
    data: RevenueDataPoint[];
    totalRevenue: number;
    totalTransactions: number;
}

// ==================== API ====================

interface ApiWrapper<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const dashboardApi = {
    /**
     * Get dashboard statistics including totals and month-over-month growth
     * Requires ADMIN role
     */
    getStatistics: async (): Promise<DashboardStats> => {
        const response = await apiClient.get('/dashboard/statistics');
        // Response is wrapped in { success, data, ... }
        const wrapper = response as unknown as ApiWrapper<DashboardStats>;
        return wrapper.data;
    },

    /**
     * Get recent activity feed (movies added, users registered, etc.)
     * Requires ADMIN role
     */
    getRecentActivity: async (limit?: number): Promise<RecentActivity> => {
        const response = await apiClient.get('/dashboard/recent-activity', {
            params: limit ? { limit } : undefined,
        });
        // Response is wrapped in { success, data, ... }
        const wrapper = response as unknown as ApiWrapper<RecentActivity>;
        return wrapper.data;
    },

    /**
     * Get revenue chart data for a date range
     * Requires ADMIN role
     */
    getRevenueChart: async (startDate: string, endDate: string): Promise<RevenueChartData> => {
        const response = await apiClient.get('/dashboard/revenue-chart', {
            params: { startDate, endDate },
        });
        // Response is wrapped in { success, data, ... }
        const wrapper = response as unknown as ApiWrapper<RevenueChartData>;
        return wrapper.data;
    },
};
