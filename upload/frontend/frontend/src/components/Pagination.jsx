// Two ways of breaking a long list up, plus the hook they share.
//
//   <Pagination>  numbered pages — used on data tables, where knowing you are
//                 on page 4 of 9 matters.
//   <LoadMore>    a single button that reveals the next batch — used on card
//                 grids, where the flow matters more than the position.

import { useEffect, useMemo, useState } from 'react';

// Slices a list and resets to page one whenever the list itself changes
// (a new search, a new filter), which is the bug every hand-rolled version has.
export function usePagination(items, perPage = 10) {
  const [page, setPage] = useState(1);
  const total = items?.length || 0;
  const pages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => { setPage(1); }, [total, perPage]);

  const slice = useMemo(
    () => (items || []).slice((page - 1) * perPage, page * perPage),
    [items, page, perPage]
  );

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);

  return { page, pages, total, from, to, slice, setPage };
}

// Reveals items in batches instead of paging.
export function useLoadMore(items, step = 6) {
  const [shown, setShown] = useState(step);
  const total = items?.length || 0;

  useEffect(() => { setShown(step); }, [total, step]);

  return {
    slice: (items || []).slice(0, shown),
    shown: Math.min(shown, total),
    total,
    hasMore: shown < total,
    more: () => setShown((s) => s + step),
  };
}

function pageNumbers(page, pages) {
  // Always show first and last, a window around the current page, and gaps.
  const out = [];
  const push = (v) => { if (out[out.length - 1] !== v) out.push(v); };

  push(1);
  if (page > 3) push('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i += 1) push(i);
  if (page < pages - 2) push('…');
  if (pages > 1) push(pages);

  return out;
}

export default function Pagination({ page, pages, total, from, to, onChange, label = 'items' }) {
  if (pages <= 1) {
    return total > 0
      ? <p className="pager-count">Showing all {total} {label}</p>
      : null;
  }

  const go = (n) => {
    onChange(Math.min(pages, Math.max(1, n)));
    // Keep the top of the list in view when the page changes.
    window.scrollTo({ top: Math.max(0, window.scrollY - 120), behavior: 'smooth' });
  };

  return (
    <nav className="pager" aria-label="Pagination">
      <p className="pager-count">
        <strong>{from}–{to}</strong> of <strong>{total}</strong> {label}
      </p>

      <div className="pager-controls">
        <button type="button" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
          ‹
        </button>

        {pageNumbers(page, pages).map((n, i) => (
          n === '…'
            ? <span className="pager-gap" key={`gap-${i}`}>…</span>
            : (
              <button
                key={n}
                type="button"
                className={n === page ? 'active' : ''}
                onClick={() => go(n)}
                aria-current={n === page ? 'page' : undefined}
              >
                {n}
              </button>
            )
        ))}

        <button type="button" onClick={() => go(page + 1)} disabled={page >= pages} aria-label="Next page">
          ›
        </button>
      </div>
    </nav>
  );
}

export function LoadMore({ shown, total, hasMore, onMore, label = 'items' }) {
  if (total === 0) return null;

  return (
    <div className="load-more">
      <div className="load-more-track" aria-hidden="true">
        <span style={{ width: `${(shown / total) * 100}%` }} />
      </div>
      <p>Showing <strong>{shown}</strong> of <strong>{total}</strong> {label}</p>
      {hasMore && (
        <button type="button" className="btn-secondary" onClick={onMore}>
          Load more
        </button>
      )}
    </div>
  );
}
