// PHOTOGRAPHY
//
// Source: Unsplash. The Unsplash License grants an irrevocable, worldwide
// copyright licence covering commercial use with no attribution required; the
// only stated restriction is that you may not compile Unsplash images to
// replicate a competing stock service. We are not doing that.
//
// WHY EVERY PHOTO HERE IS FACELESS — and it is deliberate, not an accident of
// picking:
//   1. A copyright licence is not a model release. Putting a recognisable
//      stranger's face on a blood-donation site implies they take part in it.
//      That is a personality-rights problem no stock licence covers.
//   2. The donor stories on this site are written samples. Attaching a real
//      person's photograph to an invented testimonial is a fabricated
//      endorsement, whatever the licence says.
// So the story bylines keep their monogram avatars, and the photography here
// is hands, equipment and rooms: it sets the scene without claiming anybody.
//
// Served from Unsplash's CDN with explicit width and quality, so each one
// lands around 15–30 KB rather than a multi-megabyte original.

const CDN = 'https://images.unsplash.com/photo-';

const build = (id, w, q = 72) =>
  `${CDN}${id}?w=${w}&q=${q}&auto=format&fit=crop`;

export const PHOTOS = {
  donating: {
    id: '1615461066159-fea0960485d5',
    alt: 'A health worker in gloves drawing blood from a donor’s arm',
  },
  bloodBag: {
    id: '1683791895200-201c0c40310f',
    alt: 'A unit of blood hanging on a drip stand in a clinical room',
  },
  lab: {
    id: '1639772823849-6efbd173043c',
    alt: 'Labelled sample tubes in a rack on a laboratory bench',
  },
  testing: {
    id: '1697192156499-d85cfe1452c0',
    alt: 'A gloved hand setting down blood sample tubes for testing',
  },
  community: {
    id: '1469571486292-0ba58a3f068b',
    alt: 'Several pairs of hands together, palms painted to form a red heart',
  },
  armCuff: {
    id: '1753011399874-e4fa3ec22645',
    alt: 'A donor’s arm with a pressure cuff during a donation',
  },
};

// Pick a stable photo for a record, so the same camp or guide always shows the
// same picture rather than shuffling on every render.
const ORDER = ['donating', 'bloodBag', 'lab', 'testing', 'community', 'armCuff'];
const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i += 1) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
export const photoFor = (key) => PHOTOS[ORDER[hash(key) % ORDER.length]];

export const photoUrl = (photo, width = 800) => build(photo.id, width);

// A 2x candidate set so retina screens get a sharper file and small screens
// are not made to download a desktop-sized one.
export const photoSrcSet = (photo, widths = [400, 800, 1200]) =>
  widths.map((w) => `${build(photo.id, w)} ${w}w`).join(', ');
