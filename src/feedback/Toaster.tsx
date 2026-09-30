import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import { CheckCircle, Warning, X } from '@phosphor-icons/react';
import { createToastStore, type ToastStore } from './toastStore';

const ToastContext = createContext<ToastStore | null>(null);

export function useToasts(): ToastStore {
  const store = useContext(ToastContext);
  if (!store) throw new Error('useToasts must be used inside <ToastProvider>.');
  return store;
}

/** Owns the toast queue and renders it, so any component or mutation hook can report an outcome. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createToastStore);
  return (
    <ToastContext.Provider value={store}>
      {children}
      <Toaster store={store} />
    </ToastContext.Provider>
  );
}

function Toaster({ store }: { store: ToastStore }) {
  const toasts = useSyncExternalStore(store.subscribe, store.getSnapshot);
  // Two live regions, so screen readers interrupt for failures but not for confirmations.
  return (
    <div className="toasts">
      <div role="status" aria-live="polite" className="toasts__region">
        {toasts.filter((t) => t.tone === 'success').map((t) => (
          <ToastItem key={t.id} tone="success" message={t.message} onDismiss={() => store.dismiss(t.id)} />
        ))}
      </div>
      <div role="alert" aria-live="assertive" className="toasts__region">
        {toasts.filter((t) => t.tone === 'error').map((t) => (
          <ToastItem key={t.id} tone="error" message={t.message} onDismiss={() => store.dismiss(t.id)} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({ tone, message, onDismiss }: { tone: 'success' | 'error'; message: string; onDismiss: () => void }) {
  return (
    <div className={`toast toast--${tone}`}>
      {tone === 'success' ? <CheckCircle className="toast__icon" /> : <Warning className="toast__icon" />}
      <span className="toast__msg">{message}</span>
      <button type="button" className="btn btn-ghost btn--xs toast__close" aria-label="Dismiss" onClick={onDismiss}>
        <X />
      </button>
    </div>
  );
}
