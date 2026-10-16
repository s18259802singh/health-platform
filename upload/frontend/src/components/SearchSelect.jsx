// SEARCHABLE DROPDOWN
//
// A native <select> with 26 districts or 110 hospitals in it means scrolling
// a list to find one entry. This is a combobox: type to narrow, arrows to
// move, Enter to pick, Escape to abandon.
//
// Written to be a drop-in for the selects it replaces — same `value` and
// `onChange(event-like)` shape — so a page swaps one tag and nothing else.
//
// Accessibility: the listbox is wired with aria-activedescendant rather than
// moving focus, which keeps the typed query in the input where screen readers
// expect it.

import { useEffect, useMemo, useRef, useState } from 'react';

export default function SearchSelect({
  value,
  onChange,
  options,                 // [{ value, label }] or ['a','b']
  placeholder = 'Select…',
  searchPlaceholder = 'Type to search…',
  disabled = false,
  id,
  className = '',
  // Below this many options a search box is noise, so it is hidden.
  searchThreshold = 7,
}) {
  const items = useMemo(
    () => (options || []).map((o) => (typeof o === 'string' ? { value: o, label: o || placeholder } : o)),
    [options, placeholder],
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = items.find((o) => o.value === value);
  const showSearch = items.length >= searchThreshold;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    // Entries that START with the query come first — typing "va" should offer
    // Vadodara and Valsad before Navsari.
    const starts = [], contains = [];
    items.forEach((o) => {
      const l = String(o.label).toLowerCase();
      if (l.startsWith(q)) starts.push(o);
      else if (l.includes(q)) contains.push(o);
    });
    return [...starts, ...contains];
  }, [items, query]);

  useEffect(() => { setCursor(0); }, [query, open]);

  // Close on an outside click or on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open && showSearch) inputRef.current?.focus();
    if (!open) setQuery('');
  }, [open, showSearch]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-on="1"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  const pick = (opt) => {
    onChange?.({ target: { value: opt.value } });
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault(); setOpen(true); return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(shown.length - 1, c + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setCursor(0); }
    else if (e.key === 'End') { e.preventDefault(); setCursor(shown.length - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[cursor]) pick(shown[cursor]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'Tab') setOpen(false);
  };

  const listId = id ? `${id}-list` : undefined;

  return (
    <div
      className={`ss ${open ? 'ss-open' : ''} ${disabled ? 'ss-disabled' : ''} ${className}`.trim()}
      ref={rootRef}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        id={id}
        className="ss-field"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={selected && selected.value !== '' ? 'ss-value' : 'ss-value ss-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="ss-caret" width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="ss-panel">
          {showSearch && (
            <div className="ss-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                placeholder={searchPlaceholder}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={searchPlaceholder}
                aria-controls={listId}
                aria-activedescendant={shown[cursor] ? `${id || 'ss'}-opt-${cursor}` : undefined}
              />
              {query && (
                <button type="button" className="ss-clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>
              )}
            </div>
          )}

          <ul className="ss-list" role="listbox" id={listId} ref={listRef} tabIndex={-1}>
            {shown.length === 0 && <li className="ss-empty">No match for “{query}”</li>}
            {shown.map((o, i) => (
              <li
                key={`${o.value}-${i}`}
                id={`${id || 'ss'}-opt-${i}`}
                role="option"
                aria-selected={o.value === value}
                data-on={i === cursor ? '1' : '0'}
                className={`ss-opt ${i === cursor ? 'on' : ''} ${o.value === value ? 'sel' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(o)}
              >
                {o.label}
              </li>
            ))}
          </ul>

          {showSearch && (
            <p className="ss-count">
              {shown.length} of {items.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
