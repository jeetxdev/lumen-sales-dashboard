import type { KeyboardEvent, ReactNode } from 'react';

function onEnter(action: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
}

/** A table row that opens a detail screen by click or keyboard. */
export function ClickRow({ onOpen, label, children }: { onOpen: () => void; label: string; children: ReactNode }) {
  return (
    <tr className="clickable" tabIndex={0} aria-label={label} onClick={onOpen} onKeyDown={onEnter(onOpen)}>
      {children}
    </tr>
  );
}

/** A card or list item that opens a detail screen by click or keyboard. */
export function ClickCard({ onOpen, label, className, children }: { onOpen: () => void; label: string; className: string; children: ReactNode }) {
  return (
    <div className={`clickable ${className}`} role="link" tabIndex={0} aria-label={label} onClick={onOpen} onKeyDown={onEnter(onOpen)}>
      {children}
    </div>
  );
}
