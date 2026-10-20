// ONE FULL ARTICLE — public.
//
// POINT 11. What this page used to be: the cover image, the title, a byline,
// and then every paragraph of the stored text as an identical <p> at the full
// width of the page. Correct, and completely flat — nothing to scan, nothing
// to look at, and a 90-character line length that nobody reads comfortably.
//
// What it is now:
//   - a proper masthead, with reading time and a contents strip for the
//     article's own sections
//   - the body set at a readable measure, with headings, lists, pull quotes
//     and photographs rendered from the article's own markup
//     (see lib/richtext.js for the five characters' worth of markup)
//   - a standing column beside it on wide screens, and the next articles
//     underneath, so finishing one is not a dead end.

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import Photo from '../components/Photo';
import PageLoader from '../components/PageLoader';
import { PHOTOS, photoFor } from '../lib/photos';
import { parseArticle, inlineParts, outlineOf, readingTime } from '../lib/richtext';

const dateLong = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const initials = (name) => String(name || '?')
  .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

function Inline({ text }) {
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

export default function BlogPost() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [others, setOthers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setBlog(null);
    setError('');
    window.scrollTo({ top: 0 });
    api.get(`/blogs/${id}`)
      .then((res) => setBlog(res.data))
      .catch(() => setError('Article not found.'));
    api.get('/blogs').then((res) => setOthers(res.data)).catch(() => {});
  }, [id]);

  const blocks = useMemo(() => parseArticle(blog?.content), [blog]);
  const outline = useMemo(() => outlineOf(blocks), [blocks]);

  if (error) {
    return (
      <div className="page">
        <p className="error-text">{error}</p>
        <Link to="/blogs" className="tile-link">← Back to the blog</Link>
      </div>
    );
  }
  if (!blog) return <PageLoader label="Loading the article" />;

  const minutes = readingTime(blog.content);
  const more = others.filter((b) => b._id !== blog._id).slice(0, 3);
  // The first paragraph does the work of a standfirst when the article has no
  // excerpt of its own.
  const deck = blog.excerpt || blocks.find((b) => b.type === 'p')?.text || '';
  let h2Index = 0;

  return (
    <div className="page blog-post">
      <Link to="/blogs" className="blog-back">← All articles</Link>

      {/* ---------------------------------------------------------- masthead */}
      <header className="article-head">
        <p className="app-eyebrow">LifeLink journal</p>
        <h1 className="article-title">{blog.title}</h1>
        {deck && <p className="article-deck">{deck}</p>}

        <div className="article-byline">
          <span className="article-avatar" aria-hidden="true">{initials(blog.author)}</span>
          <span>
            <strong>{blog.author}</strong>
            <small>
              {dateLong(blog.createdAt)} · {minutes} min read
            </small>
          </span>
        </div>
      </header>

      {blog.imageUrl && (
        <img className="blog-post-image" src={blog.imageUrl} alt="" />
      )}

      {/* ------------------------------------------------- body + side rail */}
      <div className="article-layout">
        <article className="article-body">
          {blocks.map((b, i) => {
            if (b.type === 'h2') { h2Index += 1; }
            return (
              <Block
                key={i}
                block={b}
                headingId={b.type === 'h2' ? `s${h2Index}` : undefined}
              />
            );
          })}

          <div className="article-end">
            <p>
              <strong>LifeLink is free to use.</strong> Find a camp near you, or
              check which centres have your group on the shelf right now.
            </p>
            <div className="article-end-links">
              <Link className="small-button" to="/camps">Find a camp</Link>
              <Link className="small-button ghost" to="/availability">Check availability</Link>
            </div>
          </div>
        </article>

        <aside className="article-rail">
          {outline.length > 1 && (
            <nav className="article-toc" aria-label="In this article">
              <span className="tile-label">In this article</span>
              <ol>
                {outline.map((o) => (
                  <li key={o.id}><a href={`#${o.id}`}>{o.text}</a></li>
                ))}
              </ol>
            </nav>
          )}
          <div className="article-aside-card">
            <Photo photo={photoFor(blog._id)} ratio="4 / 3" sizes="260px" />
            <p>
              Every article here is written for people deciding whether to
              donate, not for clinicians. If something is unclear, the guides
              go into more detail.
            </p>
            <Link className="tile-link" to="/guides">Open the guide library →</Link>
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------ keep reading */}
      {more.length > 0 && (
        <section className="article-more">
          <div className="section-header"><h3>Keep reading</h3></div>
          <div className="blog-grid">
            {more.map((b) => (
              <article className="blog-card" key={b._id}>
                {b.imageUrl
                  ? <img className="blog-card-image" src={b.imageUrl} alt="" loading="lazy" />
                  : <Photo photo={photoFor(b._id)} className="blog-card-image" ratio="16 / 9" />}
                <div className="blog-card-body">
                  <h4><Link to={`/blogs/${b._id}`}>{b.title}</Link></h4>
                  <p className="blog-excerpt">{b.excerpt}</p>
                  <Link className="blog-readmore" to={`/blogs/${b._id}`}>Read →</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
