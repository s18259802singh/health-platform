// Motion utilities.
// Two effects, both built on one IntersectionObserver and both no-ops when the
// viewer asks for reduced motion. Nothing here hides content from a reader who
// never scrolls: elements start visible and the observer only adds a class, so
// a page with JS disabled, or a screenshot of the first frame, still reads.

import { useEffect, useRef, useState } from 'react';

const reduced = () =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Fades a block up as it comes into view. `delay` staggers siblings.
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => reduced());

  useEffect(() => {
    if (reduced() || shown) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Counts a figure up once it is on screen. Eases out, so it settles rather
// than stopping dead, and lands exactly on the real value.
// POINT 6: it used to start the count at a literal 0, so every figure on the
// home page said "no donors, no donations, no units" for the first beat. It
// now starts a third of the way up - still visibly counting, never claiming
// the register is empty - and settles faster.
const START_AT = 0.34;

export function Counter({ value = 0, duration = 850, className = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(() => (reduced() ? value : Math.round(value * START_AT)));

  useEffect(() => {
    if (reduced()) { setN(value); return undefined; }
    const el = ref.current;
    if (!el) return undefined;

    let raf = 0;
    let started = false;

    const run = (t0) => {
      const step = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - (1 - p) ** 3;
        setN(Math.round(value * (START_AT + (1 - START_AT) * eased)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        started = true;
        run(performance.now());
        io.disconnect();
      }
    }, { threshold: 0.3 });

    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);

  return <span ref={ref} className={className}>{n.toLocaleString('en-GB')}</span>;
}
