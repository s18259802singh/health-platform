// The shell for everything on the public / member side. The admin console has
// its own shell and never renders any of this.

import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BackLink from './BackLink';
import Footer from './Footer';
import BottomNav from './BottomNav';
import GuidedTour, { TourButton } from './GuidedTour';
import ChatSupport from './ChatSupport';
import ServerWaking from './ServerWaking';

export default function SiteLayout() {
  const { pathname } = useLocation();
  // The scanned-QR emergency page is shown to strangers in a hurry: no chrome.
  const bare = pathname.startsWith('/emergency/');
  const wide = pathname === '/';

  if (bare) {
    return <main id="main" className="container bare"><Outlet /></main>;
  }

  return (
    <>
      {/* First thing a keyboard or screen-reader user reaches, so they can
          skip the navigation instead of tabbing through it on every page. */}
      <a className="skip-link" href="#main">Skip to main content</a>
      <Navbar />
      <ServerWaking />
      <main id="main" className={wide ? 'container wide' : 'container'}>
        <BackLink />
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <GuidedTour />
      <TourButton />
      <ChatSupport />
    </>
  );
}
