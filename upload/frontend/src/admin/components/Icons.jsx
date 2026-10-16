// A small, dependency-free icon set drawn as inline SVG. Keeping them here
// means the admin console gets consistent 1.6px stroke icons everywhere
// without pulling in an icon library.

const base = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
};

const make = (paths) => function Icon(props) {
  return <svg {...base} {...props} aria-hidden="true">{paths}</svg>;
};

export const IconGrid = make(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>);
export const IconUsers = make(<><path d="M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19" /><circle cx="9" cy="7" r="3.2" /><path d="M22 19v-1.5a4 4 0 0 0-3-3.87" /><path d="M16 4.13a4 4 0 0 1 0 7.75" /></>);
export const IconHospital = make(<><path d="M3 21h18" /><path d="M5 21V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v15" /><path d="M12 8v6" /><path d="M9 11h6" /></>);
export const IconStethoscope = make(<><path d="M5 3v5a4 4 0 0 0 8 0V3" /><path d="M5 3H4" /><path d="M13 3h1" /><path d="M9 12v2.5a5.5 5.5 0 0 0 11 0V13" /><circle cx="19.5" cy="11" r="2" /></>);
export const IconArticle = make(<><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M7.5 8.5h9" /><path d="M7.5 12h9" /><path d="M7.5 15.5h5" /></>);
export const IconDrop = make(<><path d="M12 3.2s5.5 5.6 5.5 9.3a5.5 5.5 0 1 1-11 0C6.5 8.8 12 3.2 12 3.2Z" /></>);
export const IconCalendar = make(<><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17" /><path d="M8 3.2v3.4" /><path d="M16 3.2v3.4" /></>);
export const IconSettings = make(<><circle cx="12" cy="12" r="3.2" /><path d="M19.4 14.5a1.6 1.6 0 0 0 .33 1.78l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.78-.33 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.78.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .33-1.78 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.33-1.78l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.78.33H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.78-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.33 1.78V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.47 1Z" /></>);
export const IconSearch = make(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.6-3.6" /></>);
export const IconPlus = make(<><path d="M12 5v14" /><path d="M5 12h14" /></>);
export const IconEdit = make(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>);
export const IconTrash = make(<><path d="M3.5 6h17" /><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" /><path d="M18.5 6l-.8 13a2 2 0 0 1-2 1.9H8.3a2 2 0 0 1-2-1.9L5.5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></>);
export const IconClose = make(<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>);
export const IconLogout = make(<><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>);
export const IconExternal = make(<><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M19 14v5a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5h5" /></>);
export const IconCheck = make(<><path d="m4.5 12.5 5 5 10-11" /></>);
export const IconRefresh = make(<><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" /><path d="M20.5 4v5h-5" /></>);
export const IconDownload = make(<><path d="M12 3.5v11" /><path d="m7.5 10 4.5 4.5L16.5 10" /><path d="M4.5 20.5h15" /></>);
export const IconAlert = make(<><path d="M12 8.5v5" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></>);
export const IconMenu = make(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>);
export const IconChart = make(<><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>);
export const IconBook = make(<><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5Z" /><path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H19v3H5.5A1.5 1.5 0 0 1 4 19.5Z" /><path d="M8 7.5h7" /><path d="M8 11h7" /></>);
export const IconQuote = make(<><path d="M9 7.5C6.5 8.4 5 10.6 5 13.2V17h5v-5.2H7.6c.1-1.3.7-2.3 1.9-2.9Z" /><path d="M19 7.5c-2.5.9-4 3.1-4 5.7V17h5v-5.2h-2.4c.1-1.3.7-2.3 1.9-2.9Z" /></>);
export const IconAward = make(<><circle cx="12" cy="9" r="5.2" /><path d="m8.2 13.4-1.4 7 5.2-2.6 5.2 2.6-1.4-7" /></>);
