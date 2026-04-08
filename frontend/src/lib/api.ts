import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
})

export type User = {
  id: number
  email: string
  full_name?: string | null
  is_active: boolean
  is_admin: boolean
}

export type Item = {
  id: number
  name: string
  description?: string | null
  category?: string | null
  image_url?: string | null
  price: number
  stock: number
}

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}
