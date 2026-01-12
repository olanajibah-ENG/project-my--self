import { useCallback } from 'react'
import { useToastContext } from '@/context/ToastContext'

export function useToast() {
  const { addToast } = useToastContext()

  const toast = {
    success: useCallback((message: string) => {
      addToast('success', message)
    }, [addToast]),

    error: useCallback((message: string) => {
      addToast('error', message)
    }, [addToast]),

    info: useCallback((message: string) => {
      addToast('info', message)
    }, [addToast]),
  }

  return { toast }
}
