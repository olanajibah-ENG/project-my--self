import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ isOpen, onClose, children, className }, ref) => {
    const dialogRef = React.useRef<HTMLDivElement>(null)
    const combinedRef = ref || dialogRef

    // Handle Escape key
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen) {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener("keydown", handleKeyDown)
        // Prevent body scroll when dialog is open
        document.body.style.overflow = "hidden"
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown)
        document.body.style.overflow = ""
      }
    }, [isOpen, onClose])

    // Focus trap - focus dialog on open
    React.useEffect(() => {
      if (isOpen && typeof combinedRef === "object" && combinedRef?.current) {
        combinedRef.current.focus()
      }
    }, [isOpen, combinedRef])

    // Handle backdrop click
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose()
      }
    }

    if (!isOpen) return null

    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        {/* Dialog content */}
        <div
          ref={combinedRef as React.RefObject<HTMLDivElement>}
          className={cn(
            "relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-xl",
            "transition-all duration-200 animate-in fade-in zoom-in-95",
            "focus:outline-none",
            className
          )}
          tabIndex={-1}
        >
          {children}
        </div>
      </div>,
      document.body
    )
  }
)
Dialog.displayName = "Dialog"

// Dialog sub-components for better composition
interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className,
  onClose,
  showCloseButton = false,
}) => {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">{children}</div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
DialogHeader.displayName = "DialogHeader"

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return (
    <h2 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h2>
  )
}
DialogTitle.displayName = "DialogTitle"

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={cn("mt-2 text-sm text-gray-600", className)}>{children}</p>
  )
}
DialogDescription.displayName = "DialogDescription"

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
}) => {
  return <div className={cn("py-2", className)}>{children}</div>
}
DialogContent.displayName = "DialogContent"

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn("mt-6 flex justify-end gap-3", className)}
    >
      {children}
    </div>
  )
}
DialogFooter.displayName = "DialogFooter"

export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
}
