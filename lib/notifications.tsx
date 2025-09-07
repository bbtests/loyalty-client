export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationOptions {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  onConfirm?: () => void;
}

import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

export const showNotification = (options: NotificationOptions) => {
  const {
    title,
    message,
    type,
    showConfirmButton = false,
    confirmButtonText = "OK",
    onConfirm,
  } = options;

  if (showConfirmButton) {
    const t = toast({
      title: title || type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      variant: type === "error" ? "destructive" : "default",
      action: (
        <ToastAction
          altText={confirmButtonText}
          onClick={() => {
            if (onConfirm) onConfirm();
            t.dismiss();
          }}
        >
          {confirmButtonText}
        </ToastAction>
      ),
    });
    return true;
  } else {
    toast({
      title: title || type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      variant: type === "error" ? "destructive" : "default",
    });
    return true;
  }
};

// Convenience methods
export const showSuccess = (message: string, title?: string) => {
  showNotification({ type: "success", message, title });
};

export const showError = (message: string, title?: string) => {
  showNotification({ type: "error", message, title });
};

export const showWarning = (message: string, title?: string) => {
  showNotification({ type: "warning", message, title });
};

export const showInfo = (message: string, title?: string) => {
  showNotification({ type: "info", message, title });
};

export const showConfirm = (
  message: string,
  onConfirm: () => void,
  title?: string,
) => {
  return showNotification({
    type: "warning",
    message,
    title,
    showConfirmButton: true,
    onConfirm,
  });
};
