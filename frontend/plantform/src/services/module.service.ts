import api from '@/lib/api'
import type { Module } from '@/types'

export interface CreateModuleData {
  title: string
  description: string
  order: number
}

export const moduleService = {
  async getModules(courseId: number): Promise<Module[]> {
    const response = await api.get(`/courses/${courseId}/modules/`)
    return response.data
  },

  async getModule(id: number): Promise<Module> {
    const response = await api.get(`/modules/${id}/`)
    return response.data
  },

  async createModule(courseId: number, data: CreateModuleData): Promise<Module> {
    const response = await api.post(`/courses/${courseId}/modules/`, data)
    return response.data
  },

  async updateModule(id: number, data: Partial<Module>): Promise<Module> {
    const response = await api.put(`/modules/${id}/`, data)
    return response.data
  },

  async deleteModule(id: number): Promise<void> {
    await api.delete(`/modules/${id}/`)
  },

  async reorderModules(courseId: number, moduleIds: number[]): Promise<void> {
    await api.post(`/courses/${courseId}/modules/reorder/`, { module_ids: moduleIds })
  },
}
