// src/types/module.types.ts

export interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  course: number;
  lessons?: any[]; // اختياري - للدروس المرتبطة بالوحدة
}

export interface CreateModuleDTO {
  title: string;
  description: string;
  order: number;
  course: number;
}

export interface UpdateModuleDTO {
  title?: string;
  description?: string;
  order?: number;
  course?: number;
}

export interface ModuleFormData {
  title: string;
  description: string;
  order: number;
  course: number;
}

export interface ModulesResponse {
  message: string;
  count: number;
  results: Module[];
}
