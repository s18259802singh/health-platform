// THE MARK
// A blood drop whose negative space is a pulse line — the two halves of the
// name in one shape: "life" (the pulse) carried inside "link" (the drop that
// passes from one person to another). Drawn as SVG so it stays sharp at a
// 20px favicon and a 200px print header, and so the colour follows the theme
// instead of being baked into an image.

export function LogoMark({ size = 32, title }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 40 40"
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
      className="logo-mark"
    >
      <defs>
        <linearGradient id="ll-drop" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#f2566f" />
          <stop offset="55%" stopColor="#d7263d" />
          <stop offset="100%" stopColor="#8f1526" />
        </linearGradient>
        {/* The pulse is punched out of the drop rather than drawn on top,
            so the mark still reads correctly on any background. */}
        <mask id="ll-pulse">
          <rect width="40" height="40" fill="#fff" />
          <path
            d="M8.5 23h4.2l2.3-5.4 3.1 9.2 2.6-6.1 1.8 2.3h5"
            fill="none" stroke="#000" strokeWidth="2.6"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </mask>
      </defs>

      {/* Drop: a point at the top easing into a circle at the bottom. */}
      <path
        d="M20 2.5c0 0 12.5 12.1 12.5 20.2A12.5 12.5 0 0 1 20 35.5 12.5 12.5 0 0 1 7.5 22.7C7.5 14.6 20 2.5 20 2.5Z"
        fill="url(#ll-drop)"
        mask="url(#ll-pulse)"
      />
    </svg>
  );
}

// The full lockup: mark plus wordmark, with an optional descriptor line that
// the condensing header hides on scroll.
export default function Logo({ size = 32, descriptor = 'Blood donor network', showDescriptor = true }) {
  return (
    <>
      <LogoMark size={size} title="LifeLink" />
      <span className="brand-text">
        <span className="brand-word">
          Life<span className="brand-word-alt">Link</span>
        </span>
        {showDescriptor && <small>{descriptor}</small>}
      </span>
    </>
  );
}
