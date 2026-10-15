// The shell for everything on the public / member side. The admin console has
// its own shell and never renders any of this.

import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import GuidedTour from './GuidedTour';
import HelpFab from './HelpFab';

export default function SiteLayout() {
  const { pathname } = useLocation();
  // The scanned-QR emergency page is shown to strangers in a hurry: no chrome.
  const bare = pathname.startsWith('/emergency/');
  const wide = pathname === '/';

  if (bare) {
    return <main className="container bare"><Outlet /></main>;
  }

  return (
    <>
      <Navbar />
      <main className={wide ? 'container wide' : 'container'}>
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <GuidedTour />
      <HelpFab />
    </>
  );
}
