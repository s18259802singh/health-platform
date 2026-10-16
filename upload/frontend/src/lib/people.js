// Small helpers for showing a person without a photograph.
//
// WHY: donor stories carry no portrait (imageUrl is empty on every record, and
// a demo should not depend on external image hosts that can 404 or slow the
// page down). So every byline rendered the same single-letter red circle,
// which made the story wall read as a list rather than as people.
//
// These give each person two initials and a stable colour derived from their
// name, so the same person always looks the same across the site.

// Stable 32-bit hash - same input, same colour, every render and every reload.
const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i += 1) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// "Meera Joshi" -> "MJ"  |  "Anita" -> "A"
export const initials = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

// One of six avatar tints, picked deterministically from the name.
export const avatarTint = (name) => `av-${(hash(name) % 6) + 1}`;

// First paragraph of a story, trimmed to a single line for card previews.
export const excerpt = (text, max = 128) => {
  const first = String(text || '').split(/\n\s*\n/)[0].trim();
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:]$/, '')}…`;
};
