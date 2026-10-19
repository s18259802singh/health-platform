// DATA TABLE
//
// One table used by every list of records on the site and in the admin
// console: donors, blood centres, doctors, requests, camps, donations,
// members, appointments. Sorting, searching, filtering, paging and CSV export
// are written once here rather than hand-rolled differently on each page,
// which is how a site ends up with a filter that works in one place and not
// another.
//
// On a narrow screen the same columns are rendered as stacked cards, so a
// page does not have to describe its data twice.
//
// USAGE
//   <DataTable
//     columns={[{ key: 'name', header: 'Name', sortable: true, render: r => ... }]}
//     rows={rows}
//     rowKey={r => r._id}
//     searchKeys={['name', 'city']}
//     filters={[{ key: 'status', label: 'Status', options: [...] }]}
//     initialSort={{ key: 'createdAt', dir: 'desc' }}
//   />

import { useEffect, useMemo, useRef, useState } from 'react';
import SearchSelect from './SearchSelect';
import Pagination, { usePagination } from './Pagination';

const IconSort = ({ dir }) => (
  <svg className={`dt-sort ${dir || ''}`} width="12" height="12" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path className="dt-sort-up" d="m7 14 5-5 5 5" />
    <path className="dt-sort-down" d="m7 10 5 5 5-5" />
  </svg>
);

const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 5h18l-7 8v6l-4 2v-8Z" />
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
);

const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" />
  </svg>
);

// What a cell is worth when sorting or searching: the column can say, and
// otherwise it is whatever sits at that key.
const valueOf = (row, col) => {
  if (col.sortValue) return col.sortValue(row);
  if (col.value) return col.value(row);
  return col.key ? col.key.split('.').reduce((a, p) => (a == null ? a : a[p]), row) : '';
};

const compare = (a, b) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;                 // blanks always sort to the bottom
  if (b == null) return -1;
  const da = a instanceof Date ? a.getTime() : a;
  const db = b instanceof Date ? b.getTime() : b;
  if (typeof da === 'number' && typeof db === 'number') return da - db;
  return String(da).localeCompare(String(db), undefined, { numeric: true, sensitivity: 'base' });
};

const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function DataTable({
  columns,
  rows,
  rowKey = (r, i) => r?._id || r?.id || i,
  loading = false,
  error = '',
  searchKeys = [],
  searchPlaceholder = 'Search…',
  filters = [],
  initialSort = null,
  defaultPerPage = 10,
  perPageOptions = [10, 25, 50, 100],
  empty = {},
  toolbar = null,
  onRowClick = null,
  rowClass = null,
  exportName = '',
  dense = false,
  caption = 'records',
  className = '',
}) {
  const [sort, setSort] = useState(initialSort);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const panelRef = useRef(null);

  const cols = useMemo(() => (columns || []).filter(Boolean), [columns]);

  // --- search ------------------------------------------------------------
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchKeys.length) return rows || [];
    return (rows || []).filter((r) =>
      searchKeys.some((k) => {
        const v = typeof k === 'function' ? k(r) : k.split('.').reduce((a, p) => (a == null ? a : a[p]), r);
        return String(v ?? '').toLowerCase().includes(q);
      }));
  }, [rows, query, searchKeys]);

  // --- filters -----------------------------------------------------------
  const filtered = useMemo(() => {
    const active = Object.entries(picked).filter(([, v]) => v !== '' && v != null);
    if (!active.length) return searched;
    return searched.filter((r) => active.every(([key, val]) => {
      const f = filters.find((x) => x.key === key);
      if (!f) return true;
      if (f.match) return f.match(r, val);
      const v = key.split('.').reduce((a, p) => (a == null ? a : a[p]), r);
      return String(v ?? '') === String(val);
    }));
  }, [searched, picked, filters]);

  // --- sort --------------------------------------------------------------
  const sorted = useMemo(() => {
    if (!sort?.key) return filtered;
    const col = cols.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const dir = sort.dir === 'desc' ? -1 : 1;
    return [...filtered].sort((a, b) => compare(valueOf(a, col), valueOf(b, col)) * dir);
  }, [filtered, sort, cols]);

  const pager = usePagination(sorted, perPage);

  // Reset to the first page whenever the shape of the list changes.
  useEffect(() => { pager.setPage(1); }, [query, picked, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the filter panel on an outside click, like any other popover.
  useEffect(() => {
    if (!showFilters) return undefined;
    const onDown = (e) => { if (!panelRef.current?.contains(e.target)) setShowFilters(false); };
    const onKey = (e) => { if (e.key === 'Escape') setShowFilters(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [showFilters]);

  const activeCount = Object.values(picked).filter((v) => v !== '' && v != null).length;

  // Two states, not three. The old cycle ran descending -> unsorted ->
  // ascending, so the first click on the column a table already sorted by
  // appeared to do nothing: it dropped to no sort, which on most tables
  // looks identical to the order you were already looking at.
  const toggleSort = (col) => {
    if (col.sortable === false) return;
    setSort((s) => (s?.key === col.key
      ? { key: col.key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key: col.key, dir: col.defaultDir || 'asc' }));
  };

  const exportCsv = () => {
    const head = cols.filter((c) => c.export !== false).map((c) => csvCell(c.header)).join(',');
    const body = sorted.map((r) =>
      cols.filter((c) => c.export !== false)
        .map((c) => csvCell(c.csv ? c.csv(r) : valueOf(r, c)))
        .join(','));
    const blob = new Blob([[head, ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${exportName || 'records'}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  };

  const showToolbar = searchKeys.length > 0 || filters.length > 0 || exportName || toolbar;

  return (
    <div className={`dt ${dense ? 'dt-dense' : ''} ${className}`.trim()}>
      {showToolbar && (
        <div className="dt-toolbar">
          {searchKeys.length > 0 && (
            <div className="dt-search">
              <IconSearch />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />
              {query && (
                <button type="button" className="dt-search-clear" onClick={() => setQuery('')}
                        aria-label="Clear search">×</button>
              )}
            </div>
          )}

          <div className="dt-tools">
            {toolbar}

            {filters.length > 0 && (
              <div className="dt-filter-wrap" ref={panelRef}>
                <button
                  type="button"
                  className={`dt-btn ${activeCount ? 'on' : ''}`}
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                >
                  <IconFilter />
                  Filters
                  {activeCount > 0 && <span className="dt-filter-count">{activeCount}</span>}
                </button>

                {showFilters && (
                  <div className="dt-filter-panel">
                    <div className="dt-filter-head">
                      <strong>Filter {caption}</strong>
                      <button type="button" className="dt-link" onClick={() => setPicked({})}
                              disabled={!activeCount}>
                        Clear all
                      </button>
                    </div>
                    {filters.map((f) => (
                      <label key={f.key} className="dt-filter-row">
                        <span>{f.label}</span>
                        <SearchSelect
                          value={picked[f.key] ?? ''}
                          onChange={(e) => setPicked((p) => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder || `All ${f.label.toLowerCase()}`}
                          options={[{ value: '', label: f.placeholder || `All ${f.label.toLowerCase()}` },
                                    ...(f.options || []).map((o) => (typeof o === 'string' ? { value: o, label: o } : o))]}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {exportName && (
              <button type="button" className="dt-btn" onClick={exportCsv}
                      disabled={!sorted.length} title="Download what is shown as a CSV file">
                <IconDownload />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <div className="dt-chips">
          {Object.entries(picked).filter(([, v]) => v !== '' && v != null).map(([k, v]) => {
            const f = filters.find((x) => x.key === k);
            const opt = (f?.options || []).find((o) => (typeof o === 'string' ? o : o.value) === v);
            const label = typeof opt === 'string' ? opt : (opt?.label ?? v);
            return (
              <button key={k} type="button" className="dt-chip"
                      onClick={() => setPicked((p) => ({ ...p, [k]: '' }))}>
                {f?.label}: <strong>{label}</strong> <span aria-hidden="true">×</span>
                <span className="sr-only">Remove this filter</span>
              </button>
            );
          })}
          <button type="button" className="dt-link" onClick={() => setPicked({})}>Clear all</button>
        </div>
      )}

      {error ? (
        <p className="dt-error" role="alert">{error}</p>
      ) : loading ? (
        <div className="dt-skeleton" aria-busy="true" aria-label={`Loading ${caption}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="dt-skel-row" key={i}>
              {cols.slice(0, 5).map((c, j) => <span key={j} style={{ width: `${18 + ((i + j) % 4) * 12}%` }} />)}
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="dt-empty">
          <strong>{empty.title || `No ${caption} found`}</strong>
          <p>{empty.message || (query || activeCount
            ? 'Nothing matches what you have selected. Try clearing a filter.'
            : 'There is nothing here yet.')}</p>
          {(query || activeCount > 0) && (
            <button type="button" className="dt-btn" onClick={() => { setQuery(''); setPicked({}); }}>
              Clear search and filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="dt-scroll">
            <table className="dt-table">
              <thead>
                <tr>
                  {cols.map((c) => {
                    const on = sort?.key === c.key;
                    const sortable = c.sortable !== false;
                    return (
                      <th
                        key={c.key || c.header}
                        style={c.width ? { width: c.width } : undefined}
                        className={`${c.align ? `ta-${c.align}` : ''} ${sortable ? 'is-sortable' : ''} ${on ? 'is-sorted' : ''}`.trim()}
                        aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        scope="col"
                      >
                        {sortable ? (
                          <button type="button" onClick={() => toggleSort(c)}>
                            {c.header}
                            <IconSort dir={on ? sort.dir : ''} />
                          </button>
                        ) : c.header}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((row, i) => (
                  <tr
                    key={rowKey(row, i)}
                    className={rowClass ? rowClass(row) : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(row); } : undefined}
                    role={onRowClick ? 'button' : undefined}
                  >
                    {cols.map((c) => (
                      <td key={c.key || c.header} className={c.align ? `ta-${c.align}` : undefined}
                          data-label={c.header}>
                        {c.render ? c.render(row) : (valueOf(row, c) ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* The same rows as cards, for phones. */}
          <ul className="dt-cards">
            {pager.slice.map((row, i) => (
              <li key={rowKey(row, i)} className={rowClass ? rowClass(row) : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {cols.filter((c) => c.card !== false).map((c) => (
                  <div className="dt-card-row" key={c.key || c.header}>
                    <span className="dt-card-label">{c.header}</span>
                    <span className="dt-card-value">{c.render ? c.render(row) : (valueOf(row, c) ?? '—')}</span>
                  </div>
                ))}
              </li>
            ))}
          </ul>

          <div className="dt-foot">
            {/* A rows-per-page control on a list that fits on one page is a
                dead control. */}
            {sorted.length > Math.min(...perPageOptions) && (
            <label className="dt-perpage">
              <span>Rows</span>
              <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}
                      aria-label={`${caption} per page`}>
                {perPageOptions.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            )}
            <Pagination {...pager} onChange={pager.setPage} label={caption} />
          </div>
        </>
      )}
    </div>
  );
}
