-- ============================================================
-- Julia service : SIMULATION 2025-2026 (2/2) — factures, paiements, URSSAF, dépenses
-- À lancer APRÈS le script 1/2. Données entièrement FICTIVES.
-- Date de la simulation : samedi 3 octobre 2026.
-- Taux utilisés : micro-entreprise, prestations de services : cotisations 21,2 %,
-- formation professionnelle 0,2 %, versement libératoire 1,7 %, franchise de TVA (pas de TVA).
-- ============================================================

-- 1. ENTREPRISE DE JULIA (créée seulement si elle n'existe pas encore)
insert into public.entreprise (intervenant_id, raison_sociale, siret, regime, periodicite_declaration, versement_liberatoire, tva_applicable, date_debut_activite)
select i.id, 'SIM Julia (entreprise individuelle)', '123 456 789 00012', 'auto_entrepreneur', 'trimestrielle', true, false, date '2025-01-06'
from public.intervenants i
where not exists (select 1 from public.entreprise)
order by i.cree_le limit 1;
update public.entreprise
set periodicite_declaration = 'trimestrielle', versement_liberatoire = true, tva_applicable = false,
    date_debut_activite = coalesce(date_debut_activite, date '2025-01-06');

-- 2. FACTURES ET PAIEMENTS
-- Une facture par mois et par payeur : le client lui-même, ou l'entreprise tierce pour la sous-traitance.
do $sim$
declare
  r record;
  fid uuid;
  cnt25 int := 0; cnt26 int := 0; n int;
  h int; delay int; emis date; fin_mois date; echeance date; dpay date;
  cat text; mode text; ref text; total numeric; paye numeric; part_litige numeric; statut text;
  aujourdhui constant date := date '2026-10-03';
begin
  for r in
    select coalesce(k.payeur_id, v.client_id) as payeur_id,
           date_trunc('month', v.date_visite)::date as mois,
           (array_agg(k.id order by v.date_visite))[1] as contrat_id,
           (array_agg(k.type_contrat order by v.date_visite))[1] as type_contrat,
           pc.nom as payeur_nom, pc.prenom as payeur_prenom, pc.type_client as payeur_type,
           count(distinct v.client_id) as nb_benef, count(*) as nb_visites,
           round(sum(coalesce(v.heures_reelles, extract(epoch from (v.heure_fin - v.heure_debut)) / 3600.0)), 2) as heures,
           round(sum(round(coalesce(v.heures_reelles, extract(epoch from (v.heure_fin - v.heure_debut)) / 3600.0)::numeric * k.tarif_horaire, 2)), 2) as montant
    from public.visites v
    join public.clients c on c.id = v.client_id and c.nom like 'SIM %'
    join public.contrats k on k.id = v.contrat_id
    join public.clients pc on pc.id = coalesce(k.payeur_id, v.client_id)
    where v.date_visite < date '2026-10-01' and v.facture_id is null
      and v.statut <> 'planifiee' and (v.statut = 'realisee' or v.facturee)
    group by 1, 2, pc.nom, pc.prenom, pc.type_client
    order by 2, pc.nom, pc.prenom
  loop
    h := abs(hashtext(r.payeur_nom || coalesce(r.payeur_prenom, '') || r.mois::text));
    fin_mois := (r.mois + interval '1 month - 1 day')::date;
    emis := fin_mois + 1 + (h % 2);
    total := r.montant;

    if r.payeur_type = 'entreprise' then
      cat := r.payeur_nom;
      echeance := emis + case r.payeur_nom when 'SIM Maison Aide Isère' then 45 else 30 end;
      delay := case r.payeur_nom when 'SIM Alpes Services à Domicile' then 30 + h % 8
                                 when 'SIM Maison Aide Isère' then 45 + h % 10
                                 else 85 + h % 35 end;
      mode := 'virement';
    else
      cat := r.type_contrat;
      echeance := emis + 30;
      delay := case r.type_contrat when 'particulier' then 6 + h % 20 when 'cesu' then 12 + h % 29 when 'apa' then 60 + h % 36
                                   when 'pch' then 30 + h % 21 when 'mutuelle' then 25 + h % 21 else 20 end;
      if r.payeur_nom = 'SIM Roux' then delay := 25 + h % 46; end if;
      mode := case r.type_contrat
                when 'particulier' then (case when h % 10 < 5 then 'cheque' when h % 10 < 8 then 'virement' when h % 10 < 9 then 'especes' else 'carte' end)
                when 'cesu' then (case when h % 10 < 6 then 'cesu' when h % 10 < 8 then 'cheque' else 'virement' end)
                else 'virement' end;
    end if;
    dpay := emis + delay;
    paye := total;
    ref := null;

    -- Cas particuliers (scénarios à problèmes)
    if r.payeur_nom = 'SIM Roux' and r.mois = date '2026-01-01' then
      dpay := date '2026-03-04'; mode := 'virement'; ref := 'Régularisation du chèque rejeté';
    end if;
    if r.payeur_nom = 'SIM Durand' and r.payeur_prenom = 'Éliane' then
      if r.mois = date '2025-07-01' then paye := round(total * 0.5, 2); end if;
      if r.mois >= date '2025-08-01' then paye := 0; end if;
    end if;
    if r.payeur_nom = 'SIM Maison Aide Isère' and r.mois between date '2026-03-01' and date '2026-05-01' then
      -- l'entreprise conteste les heures de SIM Girard Yvonne : elle ne paie pas cette part
      select coalesce(sum(round(coalesce(v.heures_reelles, extract(epoch from (v.heure_fin - v.heure_debut)) / 3600.0)::numeric * k.tarif_horaire, 2)), 0)
        into part_litige
      from public.visites v join public.clients c on c.id = v.client_id join public.contrats k on k.id = v.contrat_id
      where c.nom = 'SIM Girard' and c.prenom = 'Yvonne' and v.facture_id is null
        and v.date_visite >= r.mois and v.date_visite < (r.mois + interval '1 month')::date
        and v.statut <> 'planifiee' and (v.statut = 'realisee' or v.facturee);
      paye := total - part_litige;
    end if;

    if dpay > aujourdhui then paye := 0; end if;
    statut := case when paye <= 0 then 'emise' when paye < total then 'payee_partiellement' else 'payee' end;

    if extract(year from emis) = 2025 then cnt25 := cnt25 + 1; n := cnt25; else cnt26 := cnt26 + 1; n := cnt26; end if;

    insert into public.factures (numero, client_id, contrat_id, date_emission, date_echeance, periode_debut, periode_fin, total_ht, montant_tva, total_ttc, statut, notes)
    values ('F-' || extract(year from emis)::int || '-' || lpad(n::text, 3, '0'), r.payeur_id, r.contrat_id, emis, echeance, r.mois, fin_mois,
            total, 0, total, statut,
            case when r.payeur_type = 'entreprise'
                 then 'SIM Sous-traitance : ' || r.nb_visites || ' visites, ' || r.nb_benef || ' bénéficiaire(s), ' || r.heures || ' h. TVA non applicable (franchise en base).'
                 else 'SIM ' || r.nb_visites || ' visites, ' || r.heures || ' h. TVA non applicable (franchise en base).' end)
    returning id into fid;

    update public.visites v set facture_id = fid
    from public.contrats k, public.clients c
    where k.id = v.contrat_id and c.id = v.client_id and c.nom like 'SIM %'
      and coalesce(k.payeur_id, v.client_id) = r.payeur_id
      and v.date_visite >= r.mois and v.date_visite < (r.mois + interval '1 month')::date
      and v.facture_id is null and v.statut <> 'planifiee' and (v.statut = 'realisee' or v.facturee);

    if paye > 0 then
      insert into public.paiements (facture_id, client_id, date_paiement, montant, mode_paiement, reference)
      values (fid, r.payeur_id, dpay, paye, mode,
              coalesce(ref, case mode when 'cheque' then 'Chèque n° ' || (1000000 + h % 900000)
                                      when 'cesu' then 'CESU préfinancé ' || to_char(dpay, 'MM/YYYY')
                                      when 'especes' then 'Espèces, reçu remis'
                                      when 'carte' then 'Carte bancaire'
                                      else 'VIR ' || to_char(dpay, 'YYMMDD') || '-' || (100 + h % 900) end));
    end if;
  end loop;
end
$sim$;

-- 3. DÉCLARATIONS URSSAF TRIMESTRIELLES (cotisations 21,2 % + formation 0,2 % + versement libératoire 1,7 %)
insert into public.declarations (periode_debut, periode_fin, periodicite, ca_declare, cotisations, cfp, versement_liberatoire, date_limite, date_declaration, date_paiement, statut, notes)
select q.d1, q.d2, 'trimestrielle', q.ca,
       round(q.ca * 0.212, 2), round(q.ca * 0.002, 2), round(q.ca * 0.017, 2),
       q.lim,
       case when q.d1 = date '2026-07-01' then null
            when q.d1 = date '2025-07-01' then date '2025-11-06'
            else q.lim - (abs(hashtext(q.d1::text)) % 9) end,
       case when q.d1 = date '2026-07-01' then null
            when q.d1 = date '2025-07-01' then date '2025-11-06'
            else q.lim - (abs(hashtext(q.d1::text)) % 9) end,
       case when q.d1 = date '2026-07-01' then 'a_faire' else 'payee' end,
       case when q.d1 = date '2025-07-01' then 'SIM Déclarée avec 6 jours de retard : majoration de 51 € payée en novembre 2025.'
            when q.d1 = date '2026-07-01' then 'SIM À déclarer avant le 31 octobre 2026.'
            else 'SIM Déclaration et paiement effectués à temps.' end
from (
  select t.d1, (t.d1 + interval '3 months - 1 day')::date as d2, (t.d1 + interval '4 months - 1 day')::date as lim,
         coalesce((select sum(p.montant) from public.paiements p join public.clients c on c.id = p.client_id
                   where c.nom like 'SIM %' and p.date_paiement >= t.d1 and p.date_paiement < (t.d1 + interval '3 months')::date), 0) as ca
  from (select generate_series(date '2025-01-01', date '2026-07-01', interval '3 months')::date as d1) t
) q
where q.ca > 0 or q.d1 = date '2026-07-01';

-- 4. DÉPENSES ET CHARGES DE L'ACTIVITÉ
-- Mensuelles : assurance RC pro, forfait mobile, produits d'entretien, frais bancaires, logiciel de facturation, déplacements (barème 0,55 €/km)
insert into public.depenses (date_depense, categorie, libelle, montant, kilometres)
select (m.mois + 4 + (abs(hashtext(l.lib || m.mois::text)) % 4))::date, l.cat, 'SIM ' || l.lib || ' ' || to_char(m.mois, 'MM/YYYY'),
       l.montant + case when l.variable then (abs(hashtext(l.lib || m.mois::text)) % 2500) / 100.0 else 0 end, null
from (select generate_series(date '2025-01-01', date '2026-09-01', interval '1 month')::date as mois) m
cross join (values
  ('assurance','Assurance responsabilité civile pro',18.90,false),
  ('telephone','Forfait mobile (part professionnelle)',12.99,false),
  ('materiel','Produits d''entretien et gants',14.00,true),
  ('autre','Frais de tenue de compte professionnel',8.50,false)
) as l(cat, lib, montant, variable)
where m.mois >= date '2025-01-01';

insert into public.depenses (date_depense, categorie, libelle, montant, kilometres)
select (v.mois + 27)::date, 'frais_km', 'SIM Déplacements ' || to_char(v.mois, 'MM/YYYY'), round((v.nb * 11 + 40) * 0.55, 2), (v.nb * 11 + 40)
from (select date_trunc('month', vi.date_visite)::date as mois, count(*) as nb
      from public.visites vi join public.clients c on c.id = vi.client_id
      where c.nom like 'SIM %' and vi.statut = 'realisee' and vi.date_visite < date '2026-10-01'
      group by 1) v;

insert into public.depenses (date_depense, categorie, libelle, montant, kilometres)
select (date '2025-06-05' + (generate_series(0, 15) * interval '1 month'))::date, 'comptabilite', 'SIM Logiciel de facturation (abonnement)', 9.90, null
where true;

-- Dépenses ponctuelles
insert into public.depenses (date_depense, categorie, libelle, montant, kilometres) values
 (date '2025-01-08', 'materiel',   'SIM Aspirateur professionnel', 189.00, null),
 (date '2025-02-10', 'vetements',  'SIM Blouses de travail (3)', 64.90, null),
 (date '2025-03-14', 'formation',  'SIM Formation gestes et postures', 180.00, null),
 (date '2025-04-22', 'materiel',   'SIM Seau, balais et chiffons microfibres', 47.30, null),
 (date '2025-11-12', 'urssaf',     'SIM Majoration de retard URSSAF (déclaration du 3e trimestre 2025)', 51.00, null),
 (date '2025-12-19', 'materiel',   'SIM Cadeaux de fin d''année aux clients (cartes et chocolats)', 38.40, null),
 (date '2026-02-20', 'formation',  'SIM Recyclage secourisme SST', 85.00, null),
 (date '2026-04-02', 'materiel',   'SIM Fer à repasser vapeur', 89.99, null),
 (date '2026-05-12', 'vetements',  'SIM Chaussures de travail antidérapantes', 79.00, null),
 (date '2026-06-18', 'materiel',   'SIM Nettoyeur vapeur', 129.00, null),
 (date '2026-09-09', 'autre',      'SIM Impression de plaquettes pour démarcher de nouveaux clients', 56.00, null);

-- 5. CONTRÔLE : chiffres par année
select extract(year from p.date_paiement)::int as annee,
       count(*) as paiements, round(sum(p.montant), 2) as ca_encaisse,
       round(sum(p.montant) * 0.212, 2) as cotisations, round(sum(p.montant) * 0.002, 2) as formation, round(sum(p.montant) * 0.017, 2) as versement_liberatoire
from public.paiements p join public.clients c on c.id = p.client_id
where c.nom like 'SIM %'
group by 1 order by 1;
