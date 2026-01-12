// src/services/module.service.ts

import { apiClient } from '../config/api.config';
import type { Module, CreateModuleDTO, UpdateModuleDTO, ModulesResponse } from '../types/module.types';

export class ModuleService {
  // Get all modules
  static async getAllModules(): Promise<ModulesResponse> {
    const response = await apiClient.get<ModulesResponse>('modules/');
    return response.data;
  }

  // Get single module
  static async getModuleById(id: number): Promise<Module> {
    const response = await apiClient.get<Module>(`modules/${id}/`);
    return response.data;
  }

  // Create new module
  static async createModule(data: CreateModuleDTO): Promise<Module> {
    const response = await apiClient.post<Module>('modules/', data);
    return response.data;
  }

  // Update module
  static async updateModule(id: number, data: UpdateModuleDTO): Promise<Module> {
    const response = await apiClient.put<Module>(`modules/${id}/`, data);
    return response.data;
  }

  // Delete module
  static async deleteModule(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`modules/${id}/`);
    return response.data;
  }
}
