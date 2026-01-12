import * as React from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  resolve: ((value: boolean) => void) | null
}

export function useConfirm() {
  const [state, setState] = React.useState<ConfirmState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    resolve: null,
  })

  const confirm = React.useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          isOpen: true,
          title: options.title,
          description: options.description,
          confirmText: options.confirmText ?? "Confirm",
          cancelText: options.cancelText ?? "Cancel",
          variant: options.variant ?? "default",
          resolve,
        })
      })
    },
    []
  )

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true)
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }))
  }, [state.resolve])

  const handleClose = React.useCallback(() => {
    state.resolve?.(false)
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }))
  }, [state.resolve])

  // Create the dialog component as a function that returns JSX
  const ConfirmDialogComponent = React.useCallback(() => {
    return React.createElement(ConfirmDialog, {
      isOpen: state.isOpen,
      onClose: handleClose,
      onConfirm: handleConfirm,
      title: state.title,
      description: state.description,
      confirmText: state.confirmText,
      cancelText: state.cancelText,
      variant: state.variant,
    })
  }, [
    state.isOpen,
    state.title,
    state.description,
    state.confirmText,
    state.cancelText,
    state.variant,
    handleClose,
    handleConfirm,
  ])

  return {
    confirm,
    ConfirmDialogComponent,
  }
}
