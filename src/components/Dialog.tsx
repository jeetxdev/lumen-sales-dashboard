import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Warning as WarningIcon } from '@phosphor-icons/react';

interface DialogProps {
  kicker: string;
  title: string;
  subtitle?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
  actions: ReactNode;
  children: ReactNode;
}

export function Dialog({ kicker, title, subtitle, size = 'md', onClose, actions, children }: DialogProps) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="dialog-backdrop app-backdrop" onClick={onClose}>
      <div className={`dialog app-dialog app-dialog--${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="app-dialog__head">
          <div className="card-kicker">{kicker}</div>
          <div className="dialog-title" id={titleId}>
            {title}
          </div>
          {subtitle && <div className="muted-sm">{subtitle}</div>}
        </div>
        {children}
        <div className="dialog-actions">{actions}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="warn" role="alert">
      <WarningIcon />
      {children}
    </div>
  );
}
