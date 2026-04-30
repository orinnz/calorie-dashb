import axios from 'axios'
import type { AxiosInstance } from 'axios'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hono-cloudflare-app.phuoc-anonydev2k3.workers.dev'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hono-cloudflare-app.phuoc-anonydev2k3.workers.dev'

const APP_CHECK_BYPASS_KEY = import.meta.env.VITE_APP_CHECK_BYPASS_KEY as
  | string
  | undefined

let currentAccessToken: string | null = null

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`
  }
  if (APP_CHECK_BYPASS_KEY) {
    config.headers['X-AppCheck-Bypass'] = APP_CHECK_BYPASS_KEY
  }
  return config
})

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token
}

export const getAccessToken = () => currentAccessToken
