// Colour maths for the generated artboards. Kept out of the component file so
// fast refresh stays happy.

function normalise(hex) {
  const h = String(hex || '1473E6').replace('#', '');
  return h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
}

export function rgba(hex, alpha) {
  const int = parseInt(normalise(hex).slice(0, 6), 16);
  if (Number.isNaN(int)) return `rgba(20,115,230,${alpha})`;
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
}

// Darken toward black, for gradient ends and text on tinted backgrounds.
export function mixDown(hex, amount = 0.35) {
  const int = parseInt(normalise(hex).slice(0, 6), 16);
  if (Number.isNaN(int)) return '#0D4FA0';
  const parts = [(int >> 16) & 255, (int >> 8) & 255, int & 255]
    .map((v) => Math.round(v * (1 - amount)).toString(16).padStart(2, '0'));
  return `#${parts.join('')}`;
}
