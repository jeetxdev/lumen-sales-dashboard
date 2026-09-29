import { useSyncExternalStore } from 'react';

// Keep in sync with the mobile media queries in app.css.
export const MOBILE_MAX_WIDTH = 767;
const QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

/** True below the mobile breakpoint, where lists become cards and the sidebar becomes a tab bar. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
