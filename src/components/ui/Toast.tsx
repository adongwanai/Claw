/**
 * Toast Notification Component
 */
import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type ToastItem as ToastRecord, type ToastType } from '@/stores/toast';
import { cn } from '@/lib/utils';

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, string> = {
  success: 'border-green-500/30 bg-green-50 text-green-900 dark:bg-green-950/60 dark:text-green-100',
  error: 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-100',
  info: 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-100',
  warning: 'border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100',
};

const ICON_COLORS: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
};

function ToastCard({ toast }: { toast: ToastRecord }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true));

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => removeToast(toast.id), 300);
    }, toast.duration);

    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, removeToast]);

  const Icon = ICONS[toast.type];

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex w-[320px] items-start gap-3 rounded-xl border px-4 py-3 shadow-lg',
        'transition-all duration-300',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
        COLORS[toast.type],
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', ICON_COLORS[toast.type])} />
      <span className="flex-1 text-[13px] leading-5">{toast.message}</span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="mt-0.5 shrink-0 rounded opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 right-6 z-[99999] flex flex-col items-end gap-2"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} />
        </div>
      ))}
    </div>
  );
}
