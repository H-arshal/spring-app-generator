import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export interface ModalProps {
  title: string;
  /** Optional leading glyph in the header. */
  icon?: ReactNode;
  onClose?: () => void;
  /** When false the modal cannot be dismissed via Esc / backdrop. */
  dismissible?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Minimal modal dialog: focuses itself on open, dismisses on Escape and
 * backdrop click when allowed, and keeps content within the viewport.
 */
export function Modal({
  title,
  icon,
  onClose,
  dismissible = true,
  children,
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismissible, onClose]);

  return (
    <div
      className="scrim"
      onMouseDown={e => {
        if (dismissible && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="modal-head">
          {icon}
          <span className="modal-title">{title}</span>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}