// THUMBNAILS FOR THE GUIDE LIBRARY.
//
// The guides had no pictures of their own, so the first version of the index
// gave them the site's scene photography. That was wrong twice over: there
// are six photographs and eleven guides, so three rows running could show
// the same picture, and a photograph of sample tubes says nothing useful
// about "Six myths that stop people donating".
//
// These are drawn instead — one mark per category, in the site's own purple,
// as an inline SVG data URL. So they:
//   - say what the guide is about rather than decorating it
//   - differ from one row to the next
//   - need no network at all, which also means they render in the
//     standalone preview build and on a slow connection
//
// The blog keeps its own dark illustrated covers, which is what tells an
// article apart from a guide at a glance.

const INK = '#8a539a';     // --brand
const DEEP = '#56305f';    // --brand-ink
const TINT = '#faf0f7';    // --brand-soft

// A mark per category. Stroked paths on a 64x64 box, centred in the card.
const MARKS = {
  // a drop, splitting into its components
  education: `
    <path d="M32 10c0 0-13 15-13 23a13 13 0 0 0 26 0c0-8-13-23-13-23Z" />
    <path d="M32 33v16M24 41h16" stroke-width="1.7" />`,
  // a checklist: the criteria a donor is measured against
  eligibility: `
    <rect x="14" y="12" width="36" height="42" rx="5" />
    <path d="M22 24l4 4 7-8" stroke-width="1.9" />
    <path d="M38 26h8M22 40h24M22 47h16" stroke-width="1.7" />`,
  // a glass and a clock: the day before
  preparation: `
    <path d="M20 18h16l-2 24a6 6 0 0 1-6 5h0a6 6 0 0 1-6-5Z" />
    <path d="M20 28h16" stroke-width="1.6" />
    <circle cx="45" cy="44" r="10" />
    <path d="M45 39v5l3 3" stroke-width="1.7" />`,
  // a leaf and a rising line: getting your iron back
  recovery: `
    <path d="M18 46c0-14 10-24 28-26 2 16-8 28-22 28a9 9 0 0 1-6-2Z" />
    <path d="M18 48c6-7 13-12 22-16" stroke-width="1.6" />`,
  // a calendar with a repeat arrow: the rhythm
  regular: `
    <rect x="12" y="16" width="40" height="36" rx="5" />
    <path d="M12 26h40M22 11v8M42 11v8" stroke-width="1.7" />
    <path d="M26 40a6 6 0 0 1 11-3" stroke-width="1.7" />
    <path d="M38 33v5h-5" stroke-width="1.7" />`,
};

const esc = (svg) => encodeURIComponent(svg.replace(/\s+/g, ' ').trim());

/**
 * A stable thumbnail for one guide.
 * `variant` shifts the background wash and the dot pattern, so two guides in
 * the same category do not come out identical.
 */
export function guideArt(category = 'education', variant = 0) {
  const mark = MARKS[category] || MARKS.education;
  const v = Math.abs(Number(variant) || 0) % 3;
  // Three washes, all inside the brand's own range.
  const wash = [
    [TINT, '#f3e6f3'],
    ['#f7edf6', '#ece0f0'],
    ['#fbf2f8', '#f0e4f2'],
  ][v];
  const dotOpacity = [0.14, 0.1, 0.18][v];
  const shift = [0, 7, 14][v];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${wash[0]}"/>
        <stop offset="1" stop-color="${wash[1]}"/>
      </linearGradient>
      <pattern id="d" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="translate(${shift} ${shift})">
        <circle cx="2" cy="2" r="1.6" fill="${DEEP}" opacity="${dotOpacity}"/>
      </pattern>
    </defs>
    <rect width="320" height="200" fill="url(#g)"/>
    <rect width="320" height="200" fill="url(#d)"/>
    <g transform="translate(96 36) scale(2)" fill="none" stroke="${INK}" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" opacity="0.92">${mark}</g>
  </svg>`;

  return `data:image/svg+xml,${esc(svg)}`;
}

export default guideArt;
