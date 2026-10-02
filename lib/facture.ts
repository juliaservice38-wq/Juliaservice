import { euro, fmtDate } from './dates';

export type Montants = { ht: number; tva: number; ttc: number };

// Le tarif peut être saisi en brut, net, HT ou TTC. Seuls HT et TTC déclenchent un calcul de TVA.
export function calcul(heures: number, tarif: number, mode?: string | null, tauxTva?: number | null): Montants {
  const base = Math.round(heures * tarif * 100) / 100;
  const t = tauxTva ?? 0;
  if (mode === 'ht') { const tva = Math.round(base * t) / 100; return { ht: base, tva, ttc: Math.round((base + tva) * 100) / 100 }; }
  if (mode === 'ttc') { const ht = Math.round((base / (1 + t / 100)) * 100) / 100; return { ht, tva: Math.round((base - ht) * 100) / 100, ttc: base }; }
  return { ht: base, tva: 0, ttc: base };
}

export function imprimerFacture(f: any, client: any, ent: any, lignes: { date: string; heures: number }[], tarif: number | null) {
  if (typeof window === 'undefined' || !window.open) return;
  const w = window.open('', '_blank');
  if (!w) return;
  const esc = (s: any) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
  const total = lignes.reduce((s, l) => s + l.heures, 0);
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Facture ${esc(f.numero)}</title>
<style>body{font-family:Arial,sans-serif;color:#1F2A2E;max-width:760px;margin:30px auto;padding:0 20px}
h1{color:#1F6F6B;margin:0}table{width:100%;border-collapse:collapse;margin-top:20px}
td,th{padding:8px;border-bottom:1px solid #ddd;text-align:left}.r{text-align:right}.box{display:flex;justify-content:space-between;margin-top:24px}
.small{color:#666;font-size:12px;margin-top:30px}</style></head><body>
<h1>FACTURE ${esc(f.numero)}</h1><div>Date : ${fmtDate(f.date_emission)}${f.date_echeance ? ' · Échéance : ' + fmtDate(f.date_echeance) : ''}</div>
<div class="box"><div><b>${esc(ent?.raison_sociale || 'Prestataire')}</b><br>${ent?.siret ? 'SIRET : ' + esc(ent.siret) : ''}</div>
<div><b>${esc((client.prenom ?? '') + ' ' + client.nom)}</b><br>${esc(client.adresse)}<br>${esc(client.code_postal)} ${esc(client.ville)}</div></div>
<p>Prestations de service à la personne du ${fmtDate(f.periode_debut)} au ${fmtDate(f.periode_fin)}</p>
<table><tr><th>Date</th><th class="r">Heures</th></tr>${lignes.map((l) => `<tr><td>${fmtDate(l.date)}</td><td class="r">${l.heures.toLocaleString('fr-FR')} h</td></tr>`).join('')}
<tr><td><b>Total heures${tarif != null ? ' × ' + euro(tarif) : ''}</b></td><td class="r"><b>${total.toLocaleString('fr-FR')} h</b></td></tr></table>
<table style="width:50%;margin-left:auto"><tr><td>Total HT</td><td class="r">${euro(f.total_ht)}</td></tr>
<tr><td>TVA</td><td class="r">${euro(f.montant_tva)}</td></tr><tr><td><b>Total TTC</b></td><td class="r"><b>${euro(f.total_ttc)}</b></td></tr></table>
${ent?.tva_applicable ? '' : '<p class="small">TVA non applicable, art. 293 B du CGI.</p>'}
<script>window.onload=function(){window.print()}</script></body></html>`);
  w.document.close();
}
