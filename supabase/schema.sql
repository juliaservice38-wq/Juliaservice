-- ============================================================
-- Julia service : base de données complète
-- À coller en une seule fois dans Supabase > SQL Editor > Run
-- ============================================================

-- ---------- 1. TABLES ----------
create schema if not exists prive;

create table public.ref_valeurs (
  id uuid primary key default gen_random_uuid(),
  categorie text not null,
  code text not null,
  libelle text not null,
  ordre int not null default 0,
  actif boolean not null default true,
  unique (categorie, code)
);

create table public.intervenants (
  id uuid primary key references auth.users(id) on delete cascade,
  prenom text,
  nom text,
  email text,
  role text not null default 'intervenant',
  actif boolean not null default false,
  cree_le timestamptz not null default now()
);

create table public.entreprise (
  id uuid primary key default gen_random_uuid(),
  intervenant_id uuid not null references public.intervenants(id) on delete cascade,
  raison_sociale text,
  siret text,
  regime text not null default 'auto_entrepreneur',
  periodicite_declaration text,
  versement_liberatoire boolean not null default false,
  tva_applicable boolean not null default false,
  date_debut_activite date,
  cree_le timestamptz not null default now()
);

create table public.parametres_fiscaux (
  id uuid primary key default gen_random_uuid(),
  regime text not null,
  annee int not null,
  taux_cotisations numeric(6,4),
  taux_versement_liberatoire numeric(6,4),
  plafond_ca numeric(12,2),
  plafond_tva numeric(12,2),
  commentaire text,
  unique (regime, annee)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  civilite text,
  nom text not null,
  prenom text,
  date_naissance date,
  adresse text,
  code_postal text,
  ville text,
  telephone text,
  email text,
  contact_famille_nom text,
  contact_famille_lien text,
  contact_famille_tel text,
  personne_confiance text,
  code_acces text,
  etage text,
  cles_info text,
  autonomie text,
  animaux text,
  medecin_traitant text,
  indications_particulieres text,
  actif boolean not null default true,
  cree_par uuid default auth.uid() references public.intervenants(id),
  cree_le timestamptz not null default now()
);

create table public.contrats (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  type_contrat text not null,
  financeur text,
  tarif_horaire numeric(8,2),
  tarif_mode text,
  taux_tva numeric(5,2),
  heures_par_semaine numeric(5,2),
  date_debut date,
  date_fin date,
  actif boolean not null default true,
  notes text,
  cree_le timestamptz not null default now()
);

create table public.planning_series (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contrat_id uuid references public.contrats(id) on delete set null,
  intervenant_id uuid references public.intervenants(id),
  type_planning text not null default 'ponctuel',
  date_debut date not null,
  date_fin date,
  heure_debut time not null,
  heure_fin time not null,
  jours_semaine smallint[],
  frequence_semaines smallint not null default 1,
  notes text,
  cree_le timestamptz not null default now(),
  check (heure_fin > heure_debut),
  check (frequence_semaines >= 1),
  check (jours_semaine is null or jours_semaine <@ array[1,2,3,4,5,6,7]::smallint[])
);

create table public.factures (
  id uuid primary key default gen_random_uuid(),
  numero text unique,
  client_id uuid not null references public.clients(id),
  contrat_id uuid references public.contrats(id) on delete set null,
  date_emission date not null default current_date,
  date_echeance date,
  periode_debut date,
  periode_fin date,
  total_ht numeric(10,2),
  montant_tva numeric(10,2),
  total_ttc numeric(10,2),
  statut text not null default 'brouillon',
  notes text,
  cree_le timestamptz not null default now()
);

create table public.visites (
  id uuid primary key default gen_random_uuid(),
  serie_id uuid references public.planning_series(id) on delete set null,
  client_id uuid not null references public.clients(id) on delete cascade,
  contrat_id uuid references public.contrats(id) on delete set null,
  intervenant_id uuid references public.intervenants(id),
  date_visite date not null,
  heure_debut time not null,
  heure_fin time not null,
  statut text not null default 'planifiee',
  heures_reelles numeric(5,2),
  note text,
  motif_perte text,
  facturee boolean not null default true,
  rattrapee boolean not null default false,
  visite_origine_id uuid references public.visites(id) on delete set null,
  facture_id uuid references public.factures(id) on delete set null,
  cree_le timestamptz not null default now(),
  check (heure_fin > heure_debut)
);
create unique index visites_serie_date_uniq on public.visites (serie_id, date_visite) where serie_id is not null;

create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  facture_id uuid references public.factures(id) on delete set null,
  client_id uuid not null references public.clients(id),
  date_paiement date not null default current_date,
  montant numeric(10,2) not null,
  mode_paiement text,
  reference text,
  cree_le timestamptz not null default now()
);

create table public.depenses (
  id uuid primary key default gen_random_uuid(),
  date_depense date not null default current_date,
  categorie text not null,
  libelle text,
  montant numeric(10,2) not null,
  kilometres numeric(8,1),
  justificatif_path text,
  cree_par uuid default auth.uid() references public.intervenants(id),
  cree_le timestamptz not null default now()
);

create table public.annotations_client (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  texte text not null,
  auteur_id uuid default auth.uid() references public.intervenants(id),
  cree_le timestamptz not null default now()
);

create index on public.entreprise (intervenant_id);
create index on public.clients (cree_par);
create index on public.clients (nom);
create index on public.contrats (client_id);
create index on public.planning_series (client_id);
create index on public.planning_series (contrat_id);
create index on public.planning_series (intervenant_id);
create index on public.factures (client_id);
create index on public.factures (contrat_id);
create index on public.visites (client_id);
create index on public.visites (contrat_id);
create index on public.visites (intervenant_id);
create index on public.visites (date_visite);
create index on public.visites (facture_id);
create index on public.visites (visite_origine_id);
create index on public.paiements (facture_id);
create index on public.paiements (client_id);
create index on public.depenses (cree_par);
create index on public.depenses (date_depense);
create index on public.annotations_client (client_id);
create index on public.annotations_client (auteur_id);

-- ---------- 2. SÉCURITÉ ET FONCTIONS ----------
create function prive.est_actif() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.intervenants where id = (select auth.uid()) and actif); $$;

create function prive.est_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.intervenants where id = (select auth.uid()) and actif and role = 'admin'); $$;

revoke all on function prive.est_actif() from public, anon;
revoke all on function prive.est_admin() from public, anon;
grant usage on schema prive to authenticated;
grant execute on function prive.est_actif() to authenticated;
grant execute on function prive.est_admin() to authenticated;

-- Le premier compte créé devient administrateur actif ; les suivants sont inactifs jusqu'à activation
create function prive.nouvel_utilisateur() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare premier boolean;
begin
  premier := not exists (select 1 from public.intervenants);
  insert into public.intervenants (id, email, role, actif)
  values (new.id, new.email, case when premier then 'admin' else 'intervenant' end, premier);
  return new;
end;
$$;
revoke all on function prive.nouvel_utilisateur() from public, anon, authenticated;

create trigger a_la_creation_utilisateur
after insert on auth.users
for each row execute function prive.nouvel_utilisateur();

create function public.generer_visites(p_serie uuid, p_jusqua date)
returns int
language plpgsql security invoker set search_path = ''
as $$
declare
  s public.planning_series%rowtype;
  d date;
  fin date;
  debut_semaine date;
  nb int := 0;
  inseres int;
begin
  select * into s from public.planning_series where id = p_serie;
  if not found then return 0; end if;

  if s.type_planning = 'ponctuel' then
    insert into public.visites (serie_id, client_id, contrat_id, intervenant_id, date_visite, heure_debut, heure_fin)
    values (s.id, s.client_id, s.contrat_id, s.intervenant_id, s.date_debut, s.heure_debut, s.heure_fin)
    on conflict (serie_id, date_visite) where serie_id is not null do nothing;
    get diagnostics inseres = row_count;
    return inseres;
  end if;

  fin := least(coalesce(s.date_fin, p_jusqua), p_jusqua);
  debut_semaine := date_trunc('week', s.date_debut)::date;
  d := s.date_debut;
  while d <= fin loop
    if extract(isodow from d)::smallint = any (s.jours_semaine)
       and (((d - debut_semaine) / 7) % s.frequence_semaines) = 0 then
      insert into public.visites (serie_id, client_id, contrat_id, intervenant_id, date_visite, heure_debut, heure_fin)
      values (s.id, s.client_id, s.contrat_id, s.intervenant_id, d, s.heure_debut, s.heure_fin)
      on conflict (serie_id, date_visite) where serie_id is not null do nothing;
      get diagnostics inseres = row_count;
      nb := nb + inseres;
    end if;
    d := d + 1;
  end loop;
  return nb;
end;
$$;
revoke all on function public.generer_visites(uuid, date) from public, anon;
grant execute on function public.generer_visites(uuid, date) to authenticated;

create view public.v_visites_perdues with (security_invoker = true) as
select v.id, v.date_visite, v.heure_debut, v.heure_fin, v.statut, v.motif_perte,
       v.facturee, v.rattrapee, v.client_id, c.nom, c.prenom, c.ville
from public.visites v
join public.clients c on c.id = v.client_id
where v.statut in ('annulee','reportee','absence_beneficiaire','absence_intervenant');
grant select on public.v_visites_perdues to authenticated;
revoke all on public.v_visites_perdues from anon;

alter table public.ref_valeurs enable row level security;
alter table public.intervenants enable row level security;
alter table public.entreprise enable row level security;
alter table public.parametres_fiscaux enable row level security;
alter table public.clients enable row level security;
alter table public.contrats enable row level security;
alter table public.planning_series enable row level security;
alter table public.visites enable row level security;
alter table public.factures enable row level security;
alter table public.paiements enable row level security;
alter table public.depenses enable row level security;
alter table public.annotations_client enable row level security;

create policy lecture_ref on public.ref_valeurs for select to authenticated using ((select prive.est_actif()));
create policy ecriture_ref on public.ref_valeurs for all to authenticated using ((select prive.est_admin())) with check ((select prive.est_admin()));

create policy lecture_fiscal on public.parametres_fiscaux for select to authenticated using ((select prive.est_actif()));
create policy ecriture_fiscal on public.parametres_fiscaux for all to authenticated using ((select prive.est_admin())) with check ((select prive.est_admin()));

create policy lecture_intervenants on public.intervenants for select to authenticated using (id = (select auth.uid()) or (select prive.est_admin()));
create policy modif_intervenants on public.intervenants for update to authenticated using ((select prive.est_admin())) with check ((select prive.est_admin()));

create policy acces_entreprise on public.entreprise for all to authenticated
  using ((select prive.est_actif()) and (intervenant_id = (select auth.uid()) or (select prive.est_admin())))
  with check ((select prive.est_actif()) and (intervenant_id = (select auth.uid()) or (select prive.est_admin())));

create policy acces_clients on public.clients for all to authenticated using ((select prive.est_actif())) with check ((select prive.est_actif()));
create policy acces_contrats on public.contrats for all to authenticated using ((select prive.est_actif())) with check ((select prive.est_actif()));
create policy acces_series on public.planning_series for all to authenticated using ((select prive.est_actif())) with check ((select prive.est_actif()));
create policy acces_visites on public.visites for all to authenticated using ((select prive.est_actif())) with check ((select prive.est_actif()));
create policy acces_factures on public.factures for all to authenticated using ((select prive.est_actif())) with check ((select prive.est_actif()));
create policy acces_paiements on public.paiements for all to authenticated using ((select prive.est_actif())) with check ((select prive.est_actif()));
create policy acces_depenses on public.depenses for all to authenticated using ((select prive.est_actif())) with check ((select prive.est_actif()));
create policy acces_annotations on public.annotations_client for all to authenticated using ((select prive.est_actif())) with check ((select prive.est_actif()));

-- ---------- 3. MENUS DÉROULANTS ----------
insert into public.ref_valeurs (categorie, code, libelle, ordre) values
('civilite','madame','Madame',1),
('civilite','monsieur','Monsieur',2),

('type_contrat','apa','APA (allocation personnalisée d''autonomie)',1),
('type_contrat','cesu','CESU (emploi direct)',2),
('type_contrat','prestataire','Prestataire',3),
('type_contrat','pch','PCH (prestation de compensation du handicap)',4),
('type_contrat','mutuelle','Mutuelle / caisse de retraite',5),
('type_contrat','particulier','Particulier (paiement direct)',6),
('type_contrat','autre','Autre',99),

('financeur','conseil_departemental','Conseil départemental',1),
('financeur','caisse_retraite','Caisse de retraite',2),
('financeur','mutuelle','Mutuelle',3),
('financeur','mdph','MDPH',4),
('financeur','particulier','Particulier',5),
('financeur','autre','Autre',99),

('mode_tarif','brut','Brut',1),
('mode_tarif','net','Net',2),
('mode_tarif','ht','Hors taxes (HT)',3),
('mode_tarif','ttc','Toutes taxes comprises (TTC)',4),

('autonomie','gir1','GIR 1 (dépendance totale)',1),
('autonomie','gir2','GIR 2',2),
('autonomie','gir3','GIR 3',3),
('autonomie','gir4','GIR 4',4),
('autonomie','gir5','GIR 5',5),
('autonomie','gir6','GIR 6 (autonome)',6),
('autonomie','non_evalue','Non évalué',99),

('lien_famille','enfant','Fils / fille',1),
('lien_famille','conjoint','Conjoint(e)',2),
('lien_famille','frere_soeur','Frère / sœur',3),
('lien_famille','voisin','Voisin(e) / ami(e)',4),
('lien_famille','tuteur','Tuteur / curateur',5),
('lien_famille','autre','Autre',99),

('type_planning','ponctuel','Ponctuel',1),
('type_planning','recurrent','Récurrent',2),

('statut_visite','planifiee','Planifiée',1),
('statut_visite','realisee','Réalisée',2),
('statut_visite','annulee','Annulée',3),
('statut_visite','reportee','Reportée',4),
('statut_visite','absence_beneficiaire','Absence du bénéficiaire',5),
('statut_visite','absence_intervenant','Absence de l''intervenant',6),

('motif_perte','annulation_client','Annulation par le client',1),
('motif_perte','annulation_intervenant','Annulation par l''intervenant',2),
('motif_perte','report','Report',3),
('motif_perte','absence_beneficiaire','Absence du bénéficiaire',4),
('motif_perte','maladie_intervenant','Maladie de l''intervenant',5),
('motif_perte','hospitalisation','Hospitalisation du bénéficiaire',6),
('motif_perte','conges_beneficiaire','Congés du bénéficiaire',7),
('motif_perte','intemperies','Intempéries',8),
('motif_perte','autre','Autre',99),

('statut_facture','brouillon','Brouillon',1),
('statut_facture','emise','Émise',2),
('statut_facture','payee_partiellement','Payée partiellement',3),
('statut_facture','payee','Payée',4),
('statut_facture','annulee','Annulée',5),

('mode_paiement','virement','Virement',1),
('mode_paiement','cheque','Chèque',2),
('mode_paiement','cesu','CESU',3),
('mode_paiement','especes','Espèces',4),
('mode_paiement','prelevement','Prélèvement',5),
('mode_paiement','carte','Carte bancaire',6),

('categorie_depense','frais_km','Frais kilométriques',1),
('categorie_depense','materiel','Matériel / produits',2),
('categorie_depense','assurance','Assurance',3),
('categorie_depense','formation','Formation',4),
('categorie_depense','telephone','Téléphone / internet',5),
('categorie_depense','comptabilite','Comptabilité',6),
('categorie_depense','cfe','CFE (cotisation foncière)',7),
('categorie_depense','autre','Autre',99),

('regime_fiscal','auto_entrepreneur','Auto-entrepreneur (micro-entreprise)',1),
('regime_fiscal','micro_bnc','Micro-BNC',2),
('regime_fiscal','micro_bic_services','Micro-BIC prestations de services',3),
('regime_fiscal','ei_reel_simplifie','Entreprise individuelle (réel simplifié)',4),
('regime_fiscal','societe','Société (EURL, SASU…)',5),

('periodicite_declaration','mensuelle','Mensuelle',1),
('periodicite_declaration','trimestrielle','Trimestrielle',2),

('role','admin','Administrateur',1),
('role','intervenant','Intervenant',2);

insert into public.parametres_fiscaux (regime, annee, commentaire)
values ('auto_entrepreneur', 2026, 'Taux de cotisations et plafond de chiffre d''affaires à renseigner');
