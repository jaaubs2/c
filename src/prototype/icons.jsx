// Simple, soft-line SVG icons. Stroke-based, currentColor.
const Ic = ({d, size=22, sw=1.8, children, fill, ...rest}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill||"none"}
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
       aria-hidden="true" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IconMic = (p) => (
  <Ic {...p}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
    <path d="M8.5 21h7" />
  </Ic>
);
const IconBack = (p) => <Ic {...p} d="M15 5l-7 7 7 7" />;
const IconClose = (p) => <Ic {...p}><path d="M6 6l12 12" /><path d="M18 6L6 18" /></Ic>;
const IconSettings = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
  </Ic>
);
const IconShare = (p) => (
  <Ic {...p}>
    <path d="M12 3v13" />
    <path d="M7 8l5-5 5 5" />
    <rect x="4" y="14" width="16" height="7" rx="2" />
  </Ic>
);
const IconCheck = (p) => <Ic {...p} d="M4 12l5 5 11-12" />;
const IconEdit = (p) => (
  <Ic {...p}>
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </Ic>
);
const IconPlus = (p) => <Ic {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Ic>;
const IconLock = (p) => (
  <Ic {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Ic>
);
const IconChevron = (p) => <Ic {...p} d="M9 6l6 6-6 6" />;
const IconLink = (p) => (
  <Ic {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/>
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>
  </Ic>
);
const IconCopy = (p) => (
  <Ic {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.5"/>
    <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
  </Ic>
);
const IconEye = (p) => (
  <Ic {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
    <circle cx="12" cy="12" r="3"/>
  </Ic>
);
const IconSwap = (p) => (
  <Ic {...p}>
    <path d="M7 4l-3 3 3 3"/>
    <path d="M4 7h12a4 4 0 0 1 4 4"/>
    <path d="M17 20l3-3-3-3"/>
    <path d="M20 17H8a4 4 0 0 1-4-4"/>
  </Ic>
);
const IconSearch = (p) => (
  <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></Ic>
);
const IconBell = (p) => (
  <Ic {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z"/>
    <path d="M10 20a2 2 0 0 0 4 0"/>
  </Ic>
);
const IconHomeT = (p) => (
  <Ic {...p}>
    <path d="M4 11l8-7 8 7"/>
    <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/>
    <path d="M10 20v-5h4v5"/>
  </Ic>
);
const IconCompass = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M15 9l-2 5-5 2 2-5 5-2z"/>
  </Ic>
);
const IconCalendar = (p) => (
  <Ic {...p}>
    <rect x="3.5" y="5.5" width="17" height="15" rx="3"/>
    <path d="M3.5 10h17"/>
    <path d="M8 3v4M16 3v4"/>
  </Ic>
);
const IconReply = (p) => (
  <Ic {...p}>
    <path d="M21 11.5a8.5 8.5 0 1 1-3.5-6.9"/>
    <path d="M22 4v5h-5"/>
    <path d="M8 12h.01M12 12h.01M16 12h.01"/>
  </Ic>
);
const IconQuestion = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7"/>
    <circle cx="12" cy="17" r=".8" fill="currentColor"/>
  </Ic>
);
const IconSparkle = (p) => (
  <Ic {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/>
  </Ic>
);

/* Category glyphs — hand-feel, each unique */
const CatBook = (p) => (   // Histoire de vie
  <Ic {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2V5z" />
    <path d="M20 5a2 2 0 0 0-2-2h-5v18h5a2 2 0 0 0 2-2V5z" />
    <path d="M7 8h2M7 11h2M15 8h2M15 11h2" />
  </Ic>
);
const CatSun = (p) => (    // Habitudes et routines
  <Ic {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
  </Ic>
);
const CatHeart = (p) => (  // Ce qui apaise
  <Ic {...p}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
  </Ic>
);
const CatTalk = (p) => (   // Comment lui parler
  <Ic {...p}>
    <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
  </Ic>
);
const CatCup = (p) => (    // Goûts et plaisirs
  <Ic {...p}>
    <path d="M4 7h13v6a5 5 0 0 1-10 0V7z" />
    <path d="M17 9h2a2 2 0 0 1 0 4h-2" />
    <path d="M7 3v2M10 3v2M13 3v2" />
    <path d="M3 21h16" />
  </Ic>
);
const CatLeaf = (p) => (   // Santé et vigilance
  <Ic {...p}>
    <path d="M20 4c-9 0-15 4-15 12 0 2 1 4 3 4 8 0 12-6 12-16z" />
    <path d="M5 20c4-6 8-9 14-12" />
  </Ic>
);
const CatPeople = (p) => ( // Personnes importantes
  <Ic {...p}>
    <circle cx="9" cy="9" r="3" />
    <circle cx="17" cy="11" r="2.5" />
    <path d="M3 20c.6-3.4 3-5 6-5s5.4 1.6 6 5" />
    <path d="M15 20c.4-2 1.6-3.2 4-3.2" />
  </Ic>
);

/* Anne — the caregiver. Younger, in a warm sweater. */
const AnneIllustration = ({size=140}) => (
  <svg viewBox="0 0 220 200" width={size} height={size*200/220} aria-hidden="true" style={{display:"block"}}>
    <defs>
      <clipPath id="anneClip"><rect x="0" y="0" width="220" height="200" rx="32"/></clipPath>
    </defs>
    <path d="M 32 102 C 22 48, 86 14, 130 28 C 184 46, 210 96, 196 144 C 180 184, 110 196, 70 178 C 30 160, 42 134, 32 102 Z" fill="#C9D9E4"/>
    <ellipse cx="32" cy="44" rx="14" ry="10" fill="#F1DCA8"/>
    <ellipse cx="192" cy="54" rx="12" ry="10" fill="#F1CFCB"/>
    <circle cx="202" cy="160" r="10" fill="#C8D6B7"/>
    <g clipPath="url(#anneClip)">
      <path d="M 78 100 Q 76 60 110 50 Q 144 60 142 100 L 138 130 Q 132 100 130 90 Q 120 78 110 78 Q 100 78 90 90 Q 88 100 82 130 Z" fill="#5C4A3C"/>
      <ellipse cx="110" cy="96" rx="26" ry="30" fill="#F4D7BD"/>
      <rect x="102" y="122" width="16" height="14" rx="4" fill="#F4D7BD"/>
      <path d="M 56 220 C 56 150, 90 134, 110 134 C 130 134, 164 150, 164 220 Z" fill="#C26049"/>
      <circle cx="110" cy="142" r="3" fill="#FCF6EC"/>
      <circle cx="86" cy="108" r="2.5" fill="#C26049"/>
    </g>
  </svg>
);

/* Jeanne — abstract, dignified illustration (no facial features) */
const JeanneIllustration = ({size=180}) => <window.Persona name="Jeanne Martin" seed="jeanne-bun-2" style="bun" size={size} bg="transparent"/>;

window.Icons = {
  IconMic, IconBack, IconClose, IconSettings, IconShare, IconCheck, IconEdit, IconPlus, IconLock, IconChevron,
  IconLink, IconCopy, IconEye, IconSwap,
  IconSearch, IconBell, IconHomeT, IconCompass, IconCalendar, IconReply, IconQuestion, IconSparkle,
  CatBook, CatSun, CatHeart, CatTalk, CatCup, CatLeaf, CatPeople,
  JeanneIllustration, AnneIllustration
};
