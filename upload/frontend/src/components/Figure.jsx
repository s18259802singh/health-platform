// A NUMBER THAT IS NOT READY YET
//
// POINT 6. Every counter on the site was written as `{list.length}` or
// `{data.total ?? 0}`, which means that for the few hundred milliseconds
// between the page drawing and the API answering, each one reads a confident
// "0". A zero is not nothing: on a page about donors and units it says the
// register is empty, and people believed it before the real figure replaced
// it a moment later.
//
// This renders a shimmering bar of roughly the right width instead, so the
// tile holds its shape and says "still counting" rather than "none".

export default function Figure({ value, ready = true, width = '2.4ch', format = true }) {
  const missing = value === null || value === undefined || Number.isNaN(value);

  if (!ready || missing) {
    return (
      <span className="fig-wait" style={{ width }} role="status" aria-label="Loading">
        <span className="sr-only">Loading</span>
      </span>
    );
  }

  return (
    <>
      {format && typeof value === 'number' ? value.toLocaleString('en-GB') : value}
    </>
  );
}
