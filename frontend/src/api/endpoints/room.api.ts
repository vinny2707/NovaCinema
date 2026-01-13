/**
 * Room API
 * API endpoints for managing rooms
 */

import { apiClient, type PaginatedResponse } from "../client";

// ==================== Types ====================

export type SeatType = 'NORMAL' | 'VIP' | 'COUPLE';

export interface Room {
  _id: string;
  theaterId: string;
  roomName: string;
  roomType: string; // "2D", "3D", "IMAX", etc.
  isActive: boolean;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomDetail extends Room {
  seatMap: (SeatType | null)[][];
}

export interface RoomFilters {
  theaterID?: string;
  search?: string;
  sort?: string[];
  page?: number;
  limit?: number;
  roomName?: string;
  roomType?: string[];
  isActive?: boolean;
}

export interface UpdateRoomDto {
  roomName?: string;
  roomType?: string;
  isActive?: boolean;
  seatMap?: (SeatType | null)[][];
}

export interface CreateRoomDto {
  roomName: string;
  roomType: string;
  seatMap: (SeatType | null)[][];
}

// Seat object format from API response
export interface SeatObject {
  seatCode: string;
  seatType: SeatType;
  isActive: boolean;
}

// API response has seatMap as SeatObject[][], we need to transform it
interface RoomDetailApiResponse extends Omit<RoomDetail, 'seatMap'> {
  seatMap: (SeatObject | null)[][];
}

// Transform seat objects to simple types for editor
const transformSeatMapFromApi = (seatMap: (SeatObject | null)[][]): (SeatType | null)[][] => {
  return seatMap.map(row =>
    row.map(seat => {
      if (!seat) return null;
      if (!seat.isActive) return null;
      return seat.seatType;
    })
  );
};

// ==================== API ====================

export const roomApi = {
  /**
   * Get rooms by theater ID with pagination and filters
   */
  getRoomsByTheaterId: async (
    theaterId: string,
    filters: RoomFilters = {}
  ): Promise<PaginatedResponse<Room>> => {
    const params: Record<string, unknown> = {};

    if (filters.search) params.search = filters.search;
    if (filters.sort && filters.sort.length > 0) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.roomName) params.roomName = filters.roomName;
    if (filters.roomType && filters.roomType.length > 0) params.roomType = filters.roomType;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;

    const response = await apiClient.get(`/theaters/${theaterId}/rooms`, { params });
    return response as unknown as PaginatedResponse<Room>;
  },

  /**
   * Get room detail by ID
   */
  getById: async (roomId: string): Promise<RoomDetail> => {
    const response = await apiClient.get(`/rooms/${roomId}`);
    let apiData: RoomDetailApiResponse;

    if (response && typeof response === 'object' && 'data' in response) {
      apiData = (response as { data: RoomDetailApiResponse }).data;
    } else {
      apiData = response as unknown as RoomDetailApiResponse;
    }

    // Transform seatMap from SeatObject[][] to (SeatType | null)[][]
    return {
      ...apiData,
      seatMap: apiData.seatMap ? transformSeatMapFromApi(apiData.seatMap) : [],
    };
  },

  /**
   * Update room by ID
   */
  update: async (roomId: string, data: UpdateRoomDto): Promise<RoomDetail> => {
    const response = await apiClient.patch(`/rooms/${roomId}`, data);
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: RoomDetail }).data;
    }
    return response as unknown as RoomDetail;
  },

  /**
   * Delete room by ID
   */
  delete: async (roomId: string): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}`);
  },

  /**
   * Create new room
   */
  create: async (theaterId: string, data: CreateRoomDto): Promise<RoomDetail> => {
    const response = await apiClient.post(`/theaters/${theaterId}/rooms`, data);
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: RoomDetail }).data;
    }
    return response as unknown as RoomDetail;
  },

  /**
   * Get rooms list by theater ID (no pagination - for dropdown)
   * GET /api/theaters/{theaterId}/rooms/list
   */
  getRoomsListByTheaterId: async (
    theaterId: string,
    filters: Omit<RoomFilters, 'page' | 'limit'> = {}
  ): Promise<Room[]> => {
    const params: Record<string, unknown> = {};

    if (filters.search) params.search = filters.search;
    if (filters.sort && filters.sort.length > 0) params.sort = filters.sort;
    if (filters.roomName) params.roomName = filters.roomName;
    if (filters.roomType && filters.roomType.length > 0) params.roomType = filters.roomType;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;

    const response = await apiClient.get(`/theaters/${theaterId}/rooms/list`, { params });

    // Handle different response formats
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: Room[] }).data || [];
    }
    return Array.isArray(response) ? response : [];
  },
};
