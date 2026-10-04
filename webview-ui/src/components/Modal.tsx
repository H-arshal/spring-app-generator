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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={e => {
        if (dismissible && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className="bg-[#fdfaf6] border-[3.5px] border-black shadow-[8px_8px_0px_#000] max-w-lg w-full flex flex-col focus:outline-none max-h-full"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="bg-[#5be8b5] border-b-[3.5px] border-black px-4 py-3 flex items-center gap-3">
          {icon && <div className="text-black text-xl">{icon}</div>}
          <span className="font-pixel text-black font-bold text-lg uppercase tracking-wider">{title}</span>
        </div>
        <div className="p-6 overflow-y-auto font-mono text-black">
          {children}
        </div>
        {footer && (
          <div className="border-t-[3.5px] border-black p-4 bg-gray-50 flex justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}