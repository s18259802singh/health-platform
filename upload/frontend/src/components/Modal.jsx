// MODAL
//
// The member-facing dialog, matching the one the console already uses. It
// closes on Escape and on a backdrop click, locks the page behind it, and
// moves focus inside so a keyboard user is not left tabbing through the page
// underneath.
//
// `tone` tints the header: 'good' for something that worked, 'brand' for a
// plain confirmation.
//
// IT RENDERS INTO document.body, DELIBERATELY. A `position: fixed` element
// anchors to the nearest ancestor carrying a transform rather than to the
// viewport, and .page animates in with one - so a dialog rendered in place
// opened relative to the page and, on a scrolled page, with its header above
// the fold. A portal cannot be captured that way.

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  open,
  title,
  subtitle,
  tone = 'brand',
  icon = null,
  onClose,
  children,
  footer,
  closeLabel = 'Close',
}) {
  const panelRef = useRef(null);
  const returnTo = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    returnTo.current = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Focus the panel rather than the first button, so a screen reader reads
    // the title before it reads "Close".
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      returnTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className={`modal tone-${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={panelRef}
      >
        <header className="modal-head">
          {icon && <span className="modal-icon" aria-hidden="true">{icon}</span>}
          <div>
            <h2 id="modal-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="modal-x" onClick={onClose} aria-label={closeLabel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {children && <div className="modal-body">{children}</div>}
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
