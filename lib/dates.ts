export const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const JOURS_LONGS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
export const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const p2 = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
};
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
export const hm = (t: string) => t.slice(0, 5);
export const fmtDate = (s?: string | null) => {
  if (!s) return '';
  const d = parse(s);
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`;
};
export const fmtJour = (d: Date) => `${JOURS_LONGS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MOIS[d.getMonth()].toLowerCase()}`;
export const euro = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
export const hoursBetween = (a: string, b: string) => {
  const [h1, m1] = a.split(':').map(Number);
  const [h2, m2] = b.split(':').map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
};
