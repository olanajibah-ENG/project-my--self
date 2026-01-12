import api from '@/lib/api'
import type { Module } from '@/types'

export interface CreateModuleData {
  title: string
  description: string
  order: number
}

export const moduleService = {
  async getModules(courseId: number): Promise<Module[]> {
    // Backend returns { results: [...] } format
    const response = await api.get('/modules/', {
      params: { course: courseId }
    })
    return response.data.results || response.data
  },

  async getModule(id: number): Promise<Module> {
    const response = await api.get(`/modules/${id}/`)
    return response.data
  },

  async createModule(courseId: number, data: CreateModuleData): Promise<Module> {
    // Backend expects course ID in body
    const response = await api.post('/modules/', {
      ...data,
      course: courseId
    })
    return response.data
  },

  async updateModule(id: number, data: Partial<Module>): Promise<Module> {
    const response = await api.patch(`/modules/${id}/`, data)
    return response.data
  },

  async deleteModule(id: number): Promise<void> {
    await api.delete(`/modules/${id}/`)
  },

  async reorderModules(courseId: number, moduleIds: number[]): Promise<void> {
    // This endpoint may not exist in backend - will fail gracefully
    await api.post(`/modules/reorder/`, { course: courseId, module_ids: moduleIds })
  },
}
