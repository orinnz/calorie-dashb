import axios from 'axios'

interface ErrorPayload {
  message?: string
  error?: string
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorPayload | string | undefined
    if (typeof data === 'string' && data.trim()) {
      return data
    }
    if (data && typeof data === 'object') {
      if (data.message && data.message.trim()) {
        return data.message
      }
      if (data.error && data.error.trim()) {
        return data.error
      }
    }
    if (error.message?.trim()) {
      return error.message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
