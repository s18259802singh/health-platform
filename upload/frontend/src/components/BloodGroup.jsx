// One chip for every blood group shown anywhere on the site.
//
// WHY A COMPONENT: the group colouring (A one hue, B another, AB the two
// blended, O its own) used to live only in the Live Blood Supply bags. It is
// now the site's shared visual language for blood groups, and a shared
// language has to come from one place or it drifts — the donor table, the
// requests board, the availability breakdown, the leaderboard and the admin
// console would each have grown their own version.

import { groupParts } from '../lib/blood';

/**
 * variant:
 *   'badge' — the default boxed chip used in tables
 *   'pill'  — rounded, for compatibility lists and filter rows
 *   'bare'  — colour only, no background (stat labels, bag captions)
 */
export default function BloodGroup({ group, variant = 'badge', className = '', title }) {
  if (!group) return <span className="bg-chip bg-empty">—</span>;
  const { family, sign } = groupParts(group);
  return (
    <span
      className={`bg-chip bg-${variant} g-${family.toLowerCase()} ${className}`.trim()}
      title={title || `Blood group ${group}`}
    >
      <em>{family}</em>{sign && <i>{sign}</i>}
    </span>
  );
}
