import { apiClient } from './client'
import type {
  AdminUserDetail,
  AdminUserListItem,
  PaginatedResponse,
} from '../types'

export const subscriptionsAdminApi = {
  listUsers: async (page = 1, limit = 20, search?: string) => {
    const response = await apiClient.get<PaginatedResponse<AdminUserListItem>>(
      '/api/admin/subscriptions/users',
      { params: { page, limit, search: search || undefined } },
    )
    return response.data
  },

  getUserDetail: async (userId: string) => {
    const response = await apiClient.get<AdminUserDetail>(
      `/api/admin/subscriptions/users/${userId}`,
    )
    return response.data
  },
}
