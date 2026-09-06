import { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

export function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className="error-toast" role="alert">
      <AlertCircle size={16} />
      <span>{message}</span>
      <button type="button" aria-label="Dismiss" onClick={onDismiss}>
        <X size={14} />
      </button>
    </div>
  );
}
