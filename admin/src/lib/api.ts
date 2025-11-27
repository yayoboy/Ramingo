import axios from 'axios'

// API base URL - use proxy in development, direct in production
const API_URL = import.meta.env.PROD ? '/api' : '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Sites API
export const sitesApi = {
  getAll: async () => {
    const response = await api.get('/sites')
    return response.data
  },

  getOne: async (id: string) => {
    const response = await api.get(`/sites/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/sites', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/sites/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/sites/${id}`)
    return response.data
  },
}

// Sections API
export const sectionsApi = {
  getAll: async (siteId: string) => {
    const response = await api.get(`/sites/${siteId}/sections`)
    return response.data
  },

  getOne: async (siteId: string, id: string) => {
    const response = await api.get(`/sites/${siteId}/sections/${id}`)
    return response.data
  },

  create: async (siteId: string, data: any) => {
    const response = await api.post(`/sites/${siteId}/sections`, data)
    return response.data
  },

  update: async (siteId: string, id: string, data: any) => {
    const response = await api.put(`/sites/${siteId}/sections/${id}`, data)
    return response.data
  },

  delete: async (siteId: string, id: string) => {
    const response = await api.delete(`/sites/${siteId}/sections/${id}`)
    return response.data
  },

  reorder: async (siteId: string, order: string[]) => {
    const response = await api.post(`/sites/${siteId}/sections/reorder`, { order })
    return response.data
  },
}

// Entries API
export const entriesApi = {
  getAll: async (siteId: string, sectionId: string) => {
    const response = await api.get(`/sites/${siteId}/sections/${sectionId}/entries`)
    return response.data
  },

  getOne: async (siteId: string, id: string) => {
    const response = await api.get(`/sites/${siteId}/entries/${id}`)
    return response.data
  },

  create: async (siteId: string, sectionId: string, data: any) => {
    const response = await api.post(`/sites/${siteId}/sections/${sectionId}/entries`, data)
    return response.data
  },

  update: async (siteId: string, id: string, data: any) => {
    const response = await api.put(`/sites/${siteId}/entries/${id}`, data)
    return response.data
  },

  delete: async (siteId: string, id: string) => {
    const response = await api.delete(`/sites/${siteId}/entries/${id}`)
    return response.data
  },

  reorder: async (siteId: string, sectionId: string, order: string[]) => {
    const response = await api.post(`/sites/${siteId}/sections/${sectionId}/entries/reorder`, { order })
    return response.data
  },
}

export default api
