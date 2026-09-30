export type ToastTone = 'success' | 'error';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

// Errors stay longer because the user may need to read and act on them.
export const TOAST_DURATION_MS: Record<ToastTone, number> = { success: 4000, error: 8000 };
const MAX_VISIBLE = 3;

export interface ToastStore {
  push: (tone: ToastTone, message: string) => void;
  dismiss: (id: number) => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => readonly Toast[];
}

export function createToastStore(): ToastStore {
  let toasts: readonly Toast[] = [];
  let nextId = 1;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const dismiss = (id: number) => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  };

  return {
    push(tone, message) {
      const id = nextId++;
      toasts = [...toasts, { id, tone, message }].slice(-MAX_VISIBLE);
      emit();
      setTimeout(() => dismiss(id), TOAST_DURATION_MS[tone]);
    },
    dismiss,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => toasts,
  };
}
