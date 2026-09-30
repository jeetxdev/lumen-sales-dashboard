import type { ButtonHTMLAttributes } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending: boolean;
  pendingLabel: string;
}

/** A button that starts a request. It locks and says what is happening until the request settles. */
export function ActionButton({ pending, pendingLabel, disabled, children, type = 'button', ...rest }: ActionButtonProps) {
  return (
    <button {...rest} type={type} disabled={disabled || pending} aria-busy={pending}>
      {pending ? (
        <>
          <span className="spinner" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
