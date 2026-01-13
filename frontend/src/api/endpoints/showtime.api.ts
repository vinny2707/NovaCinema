/**
 * Showtime API
 * API endpoints for managing showtimes
 */

import { apiClient, type PaginatedResponse } from "../client";

// ==================== Types ====================

export interface Showtime {
  _id: string;
  movieId: string;
  roomId: string;
  theaterId: string;
  roomType: "2D" | "3D" | "VIP";
  startAt: string;
  endAt: string;
  isActive: boolean;
  // Populated fields from API
  movieTitle: string;
  moviePosterUrl: string;
  roomName: string;
  theaterName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowtimeDetail extends Showtime {
  movie: {
    _id: string;
    title: string;
    posterUrl: string;
    duration: number;
    genres: string[];
    ratingAge: string;
  };
  room: {
    _id: string;
    roomName: string;
    roomType: "2D" | "3D" | "VIP";
    capacity: number;
  };
  theater: {
    _id: string;
    theaterName: string;
    address: string;
  };
}

export interface ShowtimeFilters {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  movieId?: string;
  theaterId?: string;
  roomId?: string;
  date?: string;
}

export interface CreateShowtimeDto {
  movieId: string;
  roomId: string;
  startAt: string;
}

export interface CreateBulkShowtimesDto {
  movieId: string;
  schedules: Array<{
    roomId: string;
    startAts: string[];
  }>;
}





// ==================== API ====================

export const showtimeApi = {
  /**
   * Get showtimes with pagination
   */
  getShowtimes: async (filters: ShowtimeFilters = {}): Promise<PaginatedResponse<Showtime>> => {
    const response = await apiClient.get("/showtimes", { params: filters });
    return response as unknown as PaginatedResponse<Showtime>;
  },

  /**
   * Get all showtimes (no pagination)
   */
  getShowtimesList: async (filters: Omit<ShowtimeFilters, "page" | "limit"> = {}): Promise<Showtime[]> => {
    const response = await apiClient.get("/showtimes/list", { params: filters });
    return response.data;
  },

  /**
   * Get showtime by ID (with full populated details)
   */
  getShowtimeById: async (id: string): Promise<ShowtimeDetail> => {
    const response = await apiClient.get(`/showtimes/${id}`);
    return response.data;
  },

  /**
   * Get showtimes by date
   */
  getShowtimesByDate: async (
    filters: Omit<ShowtimeFilters, "page" | "limit" | "from" | "to"> & { date: string }
  ): Promise<Showtime[]> => {
    const response = await apiClient.get("/showtimes/by-date", { params: filters });
    return response.data;
  },

  /**
   * Get available showtimes (future only)
   */
  getAvailability: async (filters: Omit<ShowtimeFilters, "page" | "limit" | "from" | "to">): Promise<Showtime[]> => {
    const response = await apiClient.get("/showtimes/availability", { params: filters });
    return (response as any).items || response.data || [];
  },

  /**
   * Create a single showtime
   */
  createShowtime: async (data: CreateShowtimeDto): Promise<Showtime> => {
    const { movieId, ...payload } = data;
    const response = await apiClient.post(`/movies/${movieId}/showtimes`, payload);
    return response.data;
  },

  /**
   * Create multiple showtimes at once
   */
  createBulkShowtimes: async (data: CreateBulkShowtimesDto): Promise<Showtime[]> => {
    const { movieId, ...payload } = data;
    const response = await apiClient.post(`/movies/${movieId}/showtimes/bulk`, payload);
    return response.data;
  },

  /**
   * Delete a single showtime
   */
  deleteShowtime: async (id: string): Promise<void> => {
    await apiClient.delete(`/showtimes/${id}`);
  },

  /**
   * Delete multiple showtimes
   */
  deleteShowtimes: async (ids: string[]): Promise<void> => {
    await apiClient.delete("/showtimes", { data: { ids } });
  },
};
