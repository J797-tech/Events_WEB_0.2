const base = { viewBox: '0 0 20 20', width: 16, height: 16, 'aria-hidden': true, focusable: 'false' };
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Reloj = () => (
  <svg {...base}>
    <circle cx="10" cy="10" r="7.5" {...trazo} />
    <path d="M10 5.5V10l3 2" {...trazo} />
  </svg>
);

export const Pin = () => (
  <svg {...base}>
    <path d="M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" {...trazo} />
    <circle cx="10" cy="8" r="2.2" {...trazo} />
  </svg>
);

export const Lupa = () => (
  <svg {...base} width={20} height={20}>
    <circle cx="8.5" cy="8.5" r="5.5" {...trazo} />
    <path d="M13 13l4 4" {...trazo} />
  </svg>
);
