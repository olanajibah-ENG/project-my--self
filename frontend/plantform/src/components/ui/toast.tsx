import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "relative flex items-start gap-3 w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const iconColorMap = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
}

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  id: string
  type: "success" | "error" | "info"
  message: string
  onClose: (id: string) => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, id, type, message, onClose, ...props }, ref) => {
    const Icon = iconMap[type]

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant: type, className }))}
        role="alert"
        aria-live="polite"
        {...props}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColorMap[type])} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          type="button"
          onClick={() => onClose(id)}
          className={cn(
            "flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2",
            type === "success" && "focus:ring-green-500",
            type === "error" && "focus:ring-red-500",
            type === "info" && "focus:ring-blue-500"
          )}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast, toastVariants }
