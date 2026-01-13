import { apiClient } from '../client';
import type { PaginatedResponse } from '../client';
import type { User } from './auth.api';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roles?: string;
  isActive?: string;
}

export const userApi = {
  list: async (params: ListUsersParams = {}): Promise<PaginatedResponse<User>> => {
    // Lọc bỏ params rỗng để tránh lỗi validation
    const cleanParams: Record<string, any> = {};
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim()) cleanParams.search = params.search;
    if (params.roles && params.roles.trim()) cleanParams.roles = params.roles;
    if (params.isActive && params.isActive.trim()) cleanParams.isActive = params.isActive;
    
    const response = await apiClient.get('/users', { params: cleanParams });
    return response as unknown as PaginatedResponse<User>;
  },
  activate: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/activate`);
    return response as unknown as User;
  },
  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/deactivate`);
    return response as unknown as User;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
  changeRoles: async (id: string, roles: string[]): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/roles`, { roles });
    return response as unknown as User;
  },
};
