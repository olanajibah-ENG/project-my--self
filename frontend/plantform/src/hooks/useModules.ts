import { useState, useEffect, useCallback } from 'react'
import { moduleService } from '@/services/module.service'
import type { Module } from '@/types'

export function useModules(courseId: number | null) {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModules = useCallback(async () => {
    if (!courseId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await moduleService.getModules(courseId)
      setModules(data)
    } catch (err) {
      setError('Failed to load modules')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  return { modules, isLoading, error, refetch: fetchModules }
}

export function useModule(id: number | null) {
  const [module, setModule] = useState<Module | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchModule = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await moduleService.getModule(id)
        setModule(data)
      } catch (err) {
        setError('Failed to load module')
      } finally {
        setIsLoading(false)
      }
    }

    fetchModule()
  }, [id])

  return { module, isLoading, error }
}
