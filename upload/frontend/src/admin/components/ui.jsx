// Shared building blocks for every admin screen, so each page looks like part
// of the same product instead of a separate experiment.

import { IconSearch } from './Icons';

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="adm-page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="adm-page-head-actions">{children}</div>}
    </header>
  );
}

export function StatCard({ icon, label, value, hint, tone = 'default' }) {
  return (
    <div className={`adm-stat tone-${tone}`}>
      <span className="adm-stat-icon">{icon}</span>
      <span className="adm-stat-label">{label}</span>
      <strong className="adm-stat-value">{value}</strong>
      {hint && <span className="adm-stat-hint">{hint}</span>}
    </div>
  );
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || action) && (
        <div className="adm-card-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      <div className="adm-card-body">{children}</div>
    </section>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`adm-badge ${tone}`}>{children}</span>;
}

export function BloodTag({ group }) {
  return <span className="adm-blood">{group}</span>;
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="adm-search">
      <IconSearch width={17} height={17} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Toolbar({ children }) {
  return <div className="adm-toolbar">{children}</div>;
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="adm-loading">
      <span className="adm-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="adm-empty">
      <strong>{title}</strong>
      <p>{message}</p>
      {action}
    </div>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(pages, from + 4);
  for (let i = from; i <= to; i += 1) nums.push(i);

  return (
    <nav className="adm-pagination" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      {nums.map((n) => (
        <button key={n} type="button" className={n === page ? 'active' : ''} onClick={() => onChange(n)}>{n}</button>
      ))}
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}

// Wraps a table so it scrolls sideways on small screens instead of breaking
// the layout - admin tables are wide by nature.
export function TableWrap({ children }) {
  return <div className="adm-table-wrap">{children}</div>;
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';
}
