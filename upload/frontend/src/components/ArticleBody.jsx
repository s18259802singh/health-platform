// THE READING LAYOUT, shared by the blog and the guides.
//
// Both were doing their own thing: the blog split text on blank lines and
// rendered identical paragraphs, the guides did exactly the same in a
// different file, and neither gave the reader any way to see the shape of
// what they were about to read.
//
// Now both pages are built from these three pieces:
//
//   <ArticleIndex>  the piece's own section headings, down the LEFT, with
//                   the one you are currently reading marked
//   <ArticleBody>   the prose, with headings, lists, quotes and photographs
//   <Inline>        **bold** inside any of the above
//
// The markup the blocks come from is in lib/richtext.js.

import { useEffect, useRef, useState } from 'react';
import Photo from './Photo';
import { PHOTOS } from '../lib/photos';
import { inlineParts } from '../lib/richtext';

export function Inline({ text }) {
  return (
    <>
      {inlineParts(text).map((part, i) => (
        part.t === 'b'
          ? <strong key={i}>{part.v}</strong>
          : <span key={i}>{part.v}</span>
      ))}
    </>
  );
}

function Block({ block, headingId }) {
  switch (block.type) {
    case 'h2':
      return <h2 id={headingId}><Inline text={block.text} /></h2>;
    case 'h3':
      return <h3><Inline text={block.text} /></h3>;
    case 'ul':
      return (
        <ul className="article-list">
          {block.items.map((it, i) => <li key={i}><Inline text={it} /></li>)}
        </ul>
      );
    case 'ol':
      return (
        <ol className="article-steps">
          {block.items.map((it, i) => <li key={i}><Inline text={it} /></li>)}
        </ol>
      );
    case 'quote':
      return (
        <blockquote className="article-quote">
          <p><Inline text={block.text} /></p>
        </blockquote>
      );
    case 'callout':
      return (
        <aside className="article-callout">
          <span aria-hidden="true">●</span>
          <p><Inline text={block.text} /></p>
        </aside>
      );
    case 'photo':
      return (
        <figure className="article-figure">
          <Photo photo={PHOTOS[block.key]} ratio="16 / 9" sizes="(max-width: 860px) 100vw, 680px" />
          <figcaption>{PHOTOS[block.key]?.alt}</figcaption>
        </figure>
      );
    default:
      return <p><Inline text={block.text} /></p>;
  }
}

export function ArticleBody({ blocks, children }) {
  let h2Index = 0;
  return (
    <article className="article-body">
      {blocks.map((b, i) => {
        if (b.type === 'h2') h2Index += 1;
        return (
          <Block
            key={i}
            block={b}
            headingId={b.type === 'h2' ? `s${h2Index}` : undefined}
          />
        );
      })}
      {children}
    </article>
  );
}

// THE LEFT-HAND INDEX.
//
// Every section heading in the piece, as one line each, with a rule running
// down the side and a marker against whichever section is on screen. It is
// sticky, so it stays beside you the whole way down — the point of it is to
// answer "how much of this is left, and is the bit I want further on?"
// without scrolling to find out.
export function ArticleIndex({ outline, label = 'In this article' }) {
  const [active, setActive] = useState(outline[0]?.id || '');
  const ref = useRef(null);

  useEffect(() => {
    if (!outline.length) return undefined;

    // rootMargin pulls the trigger line up near the top of the viewport, so
    // a heading counts as "current" once it has scrolled to the top rather
    // than the moment it appears at the bottom.
    const io = new IntersectionObserver(
      (entries) => {
        const onScreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onScreen[0]) setActive(onScreen[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    );

    outline.forEach((o) => {
      const el = document.getElementById(o.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [outline]);

  // Keep the marked line in view when the list is long enough to scroll.
  useEffect(() => {
    const el = ref.current?.querySelector('.is-here');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  // The href is kept so each entry is a real link - focusable, readable to a
  // screen reader, openable in a new tab. The click is handled here rather
  // than left to the browser because the standalone preview build runs on a
  // hash router, where a bare href="#s3" is read as a route change and takes
  // the reader off the article entirely.
  const jump = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setActive(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Move the keyboard caret to the heading, or tabbing carries on from the
    // index rather than from where the reader has just been sent.
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };

  if (outline.length < 2) return null;

  return (
    <nav className="article-index" aria-label={label} ref={ref}>
      <span className="article-index-label">{label}</span>
      <ol>
        {outline.map((o, i) => (
          <li key={o.id} className={active === o.id ? 'is-here' : ''}>
            <a href={`#${o.id}`} onClick={(e) => jump(e, o.id)}>
              <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
              <span>{o.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default ArticleBody;
