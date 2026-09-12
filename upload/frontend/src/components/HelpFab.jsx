// A small, persistent "?" button that lives in the corner of every signed-in
// page. Its only job is to reopen the Guided Tour on demand, so help is never
// more than one tap away, even long after the first-visit tour has been dismissed.

import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';

export default function HelpFab() {
  const { user } = useAuth();
  const { openTour, open } = useTour();

  if (!user || open) return null;

  return (
    <button
      type="button"
      className="help-fab"
      onClick={() => openTour(0)}
      aria-label="Open guided tour"
      title="Need help? Take the guided tour"
    >
      ?
    </button>
  );
}
