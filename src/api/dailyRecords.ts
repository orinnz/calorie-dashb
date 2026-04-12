import { apiClient } from './client'
import type { DailyRecord, FoodLogRequest } from '../types'

export const dailyRecordsApi = {
  addFoodLog: async (date: string, data: FoodLogRequest) => {
    const response = await apiClient.post<DailyRecord>(
      `/api/daily-records/${date}/food-logs`,
      data
    )
    return response.data
  },

  addWaterLog: async (date: string, amount: number) => {
    const response = await apiClient.post<DailyRecord>(
      `/api/daily-records/${date}/water-logs`,
      { amount }
    )
    return response.data
  },
}
