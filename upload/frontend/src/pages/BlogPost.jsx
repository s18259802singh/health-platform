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
import PageLoader from '../components/PageLoader';
import PieceRow from '../components/PieceRow';
import { ArticleBody, ArticleIndex } from '../components/ArticleBody';
import { parseArticle, outlineOf, readingTime } from '../lib/richtext';

const dateLong = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const initials = (name) => String(name || '?')
  .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

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

      {/* The section headings run down the LEFT, beside the text, with the
          one you are reading marked. A reader can see the shape of the
          piece and jump into it without scrolling to find out what is in
          it. */}
      <div className="article-layout">
        <ArticleIndex outline={outline} />

        <ArticleBody blocks={blocks}>
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
        </ArticleBody>
      </div>

      {/* ------------------------------------------------------ keep reading */}
      {more.length > 0 && (
        <section className="article-more">
          <div className="section-header"><h3>Keep reading</h3></div>
          {/* The same title-and-subtitle rows the index page uses, so
              finishing one article leads into the next the same way. */}
          <ul className="piece-list">
            {more.map((b) => (
              <PieceRow
                key={b._id}
                to={`/blogs/${b._id}`}
                title={b.title}
                subtitle={b.excerpt}
                imageUrl={b.imageUrl}
                photoKey={b._id}
                meta={b.readMinutes ? <i>{b.readMinutes} min read</i> : null}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
