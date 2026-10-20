// ARTICLE MARKUP
//
// POINT 11: "the blog page is good but the content is very simple also use
// images or keep format of the content good."
//
// The article page used to split the stored text on blank lines and render
// every piece as a <p>. Whatever the writer did, the reader got eight
// identical grey paragraphs — no sections to scan, no list where the text was
// obviously a list, nothing to look at.
//
// Articles are stored as plain text in Mongo and edited in a plain textarea
// in the console, so the answer is not a rich-text editor: it is a small,
// forgiving markup that an admin can type without thinking about it. Five
// characters' worth:
//
//   ## Heading            a section
//   ### Heading           a sub-section
//   - item                a bullet list
//   1. item               a numbered list
//   > line                a pull quote
//   !> line               a highlighted point
//   [photo: donating]     an inline photograph (a key from lib/photos.js)
//   **bold**              emphasis inside any of the above
//
// Anything that matches none of these is a paragraph, exactly as before — so
// every article written before this existed still renders correctly.

import { PHOTOS } from './photos';

// --- inline ---------------------------------------------------------------
// **bold** only. Keeping the inline set to one thing means no nesting rules,
// no escaping rules, and nothing an admin can accidentally half-open.
export function inlineParts(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m = re.exec(text);
  while (m) {
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) });
    out.push({ t: 'b', v: m[1] });
    last = m.index + m[0].length;
    m = re.exec(text);
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
  return out;
}

// --- block ----------------------------------------------------------------
export function parseArticle(raw) {
  const lines = String(raw || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let para = [];
  let list = null;           // { type: 'ul' | 'ol', items: [] }

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ').trim() });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };
  const flushAll = () => { flushPara(); flushList(); };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) { flushAll(); continue; }

    const photo = line.match(/^\[photo:\s*([a-zA-Z0-9_-]+)\s*\]$/);
    if (photo) {
      flushAll();
      const key = photo[1];
      if (PHOTOS[key]) blocks.push({ type: 'photo', key });
      continue;
    }

    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      flushAll();
      blocks.push({ type: h[1].length === 2 ? 'h2' : 'h3', text: h[2].trim() });
      continue;
    }

    if (line.startsWith('!>')) {
      flushAll();
      blocks.push({ type: 'callout', text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith('>')) {
      flushAll();
      blocks.push({ type: 'quote', text: line.slice(1).trim() });
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      flushPara();
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
      list.items.push(bullet[1].trim());
      continue;
    }

    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      flushPara();
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; }
      list.items.push(numbered[1].trim());
      continue;
    }

    // A plain line continues the paragraph above it; a list ends at one.
    flushList();
    para.push(line);
  }

  flushAll();
  return blocks;
}

// The section headings, for the contents strip at the top of a long article.
export const outlineOf = (blocks) =>
  blocks.filter((b) => b.type === 'h2').map((b, i) => ({ id: `s${i + 1}`, text: b.text }));

// Roughly how long this will take to read. 220 words a minute is the usual
// figure for non-technical prose; it is rounded up, because promising a
// shorter read than you deliver is the wrong way round.
export function readingTime(raw) {
  const words = String(raw || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
