/**
 * Theater API
 * API endpoints for managing theaters
 */

import { apiClient, type PaginatedResponse } from "../client";

// ==================== Types ====================

export interface Room {
  _id: string;
  roomName: string;
  roomType: string; // "2D", "3D", "IMAX", etc.
  capacity: number;
  theaterId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Theater {
  _id: string;
  theaterName: string;
  address: string;
  hotline: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roomsCount?: number;
}

export interface ListTheatersParams {
  search?: string;
  sort?: string[];
  page?: number;
  limit?: number;
  theaterName?: string;
  address?: string;
  hotline?: string;
  isActive?: boolean;
}

export interface CreateTheaterDto {
  theaterName: string;
  address: string;
  hotline: string;
}

export interface UpdateTheaterDto {
  theaterName?: string;
  address?: string;
  hotline?: string;
  isActive?: boolean;
}

// ==================== API ====================

export const theaterApi = {
  /**
   * Get theaters with pagination
   */
  list: async (params: ListTheatersParams = {}): Promise<PaginatedResponse<Theater>> => {
    // Clean params to avoid validation errors
    const cleanParams: Record<string, any> = {};
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) cleanParams.search = params.search;
    if (params.theaterName && params.theaterName.trim()) cleanParams.theaterName = params.theaterName;
    if (params.address && params.address.trim()) cleanParams.address = params.address;
    if (params.hotline && params.hotline.trim()) cleanParams.hotline = params.hotline;
    if (params.isActive !== undefined) cleanParams.isActive = params.isActive;
    if (params.sort && params.sort.length > 0) cleanParams.sort = params.sort;

    const response = await apiClient.get("/theaters", { params: cleanParams });
    return response as unknown as PaginatedResponse<Theater>;
  },

  /**
   * Get all theaters (no pagination) - for dropdown
   */
  getList: async (params: Omit<ListTheatersParams, 'page' | 'limit'> = {}): Promise<Theater[]> => {
    const cleanParams: Record<string, unknown> = {};
    if (params.search && params.search.trim()) cleanParams.search = params.search;
    if (params.theaterName && params.theaterName.trim()) cleanParams.theaterName = params.theaterName;
    if (params.address && params.address.trim()) cleanParams.address = params.address;
    if (params.hotline && params.hotline.trim()) cleanParams.hotline = params.hotline;
    if (params.isActive !== undefined) cleanParams.isActive = params.isActive;
    if (params.sort && params.sort.length > 0) cleanParams.sort = params.sort;

    const response = await apiClient.get("/theaters/list", { params: cleanParams });

    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      const resp = response as unknown as Record<string, unknown>;
      if (Array.isArray(resp.items)) {
        return resp.items as Theater[];
      }
      if (Array.isArray(resp.data)) {
        return resp.data as Theater[];
      }
    }

    return [];
  },

  /**
   * Get theater by ID
   */
  getById: async (id: string): Promise<Theater> => {
    const response = await apiClient.get(`/theaters/${id}`);
    return response as unknown as Theater;
  },

  /**
   * Create new theater
   */
  create: async (data: CreateTheaterDto): Promise<Theater> => {
    const response = await apiClient.post("/theaters", data);
    return response as unknown as Theater;
  },

  /**
   * Update theater
   */
  update: async (id: string, data: UpdateTheaterDto): Promise<Theater> => {
    const response = await apiClient.patch(`/theaters/${id}`, data);
    return response as unknown as Theater;
  },

  /**
   * Delete theater
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/theaters/${id}`);
  },

  /**
   * Get rooms by theater ID
   */
  getRoomsByTheaterId: async (theaterId: string): Promise<Room[]> => {
    const response = await apiClient.get(`/theaters/${theaterId}/rooms`);
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object') {
      const resp = response as unknown as Record<string, unknown>;
      if (Array.isArray(resp.items)) {
        return resp.items as Room[];
      }
      if (Array.isArray(resp.data)) {
        return resp.data as Room[];
      }
    }
    return [];
  },

  /**
   * Get all rooms (no pagination) - for dropdown
   */
  getRoomsList: async (): Promise<Room[]> => {
    const response = await apiClient.get("/rooms/list");
    return response as unknown as Room[];
  },
};
