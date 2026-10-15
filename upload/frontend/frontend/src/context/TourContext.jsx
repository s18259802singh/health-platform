// TourContext - shared state for the Guided Tour.
// Kept separate from AuthContext because "is the tour open, and on which
// step" has nothing to do with "who is logged in" - any component (Navbar
// help button, the floating help FAB, Dashboard's first-visit check) can
// open or close the tour without prop-drilling.

import { createContext, useCallback, useContext, useState } from 'react';

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const openTour = useCallback((atStep = 0) => {
    setStep(atStep);
    setOpen(true);
  }, []);

  const closeTour = useCallback(() => setOpen(false), []);

  return (
    <TourContext.Provider value={{ open, step, setStep, openTour, closeTour }}>
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);

// A first-time visitor should see the tour once, automatically, without
// it re-appearing on every login. The flag is stored per-account (not
// globally) so a shared/demo browser still greets each new user once.
export function hasSeenTour(userId) {
  if (!userId) return true;
  return localStorage.getItem(`lifelink-tour-seen:${userId}`) === '1';
}

export function markTourSeen(userId) {
  if (!userId) return;
  localStorage.setItem(`lifelink-tour-seen:${userId}`, '1');
}
