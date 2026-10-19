// One chip for every blood group shown anywhere on the site.
//
// WHY A COMPONENT: the group colouring (A one hue, B another, AB the two
// blended, O its own) used to live only in the Live Blood Supply bags. It is
// now the site's shared visual language for blood groups, and a shared
// language has to come from one place or it drifts — the donor table, the
// requests board, the availability breakdown, the leaderboard and the admin
// console would each have grown their own version.

import { groupParts } from '../lib/blood';

// The drop is the site's symbol for "this is a blood group". It was only on
// the dashboard's supply bags; it now rides with every group everywhere, so a
// group reads the same whether it is in a table cell, a filter chip or a
// stock breakdown. It inherits the group's own colour from the chip.
function Drop() {
  return (
    <svg className="bg-drop" viewBox="0 0 12 16" aria-hidden="true" focusable="false">
      <path d="M6 .8C6 .8 1 7 1 10.2a5 5 0 0 0 10 0C11 7 6 .8 6 .8Z" />
    </svg>
  );
}

/**
 * variant:
 *   'badge' — the default boxed chip used in tables
 *   'pill'  — rounded, for compatibility lists and filter rows
 *   'bare'  — colour only, no background (stat labels, bag captions)
 *
 * symbol={false} drops the glyph where the context already is a drop — the
 * supply bags on the dashboard, which are the shape itself.
 */
export default function BloodGroup({ group, variant = 'badge', className = '', title, symbol = true }) {
  if (!group) return <span className="bg-chip bg-empty">—</span>;
  const { family, sign } = groupParts(group);
  return (
    <span
      className={`bg-chip bg-${variant} g-${family.toLowerCase()} ${className}`.trim()}
      title={title || `Blood group ${group}`}
    >
      {symbol && <Drop />}
      <em>{family}</em>{sign && <i>{sign}</i>}
    </span>
  );
}
