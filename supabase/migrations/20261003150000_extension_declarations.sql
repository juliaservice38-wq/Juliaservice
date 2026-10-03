-- Extension : types de clients (entreprise tierce), payeur du contrat,
-- déclarations URSSAF, paramètres fiscaux complémentaires.

alter table public.clients add column type_client text not null default 'particulier';
alter table public.contrats add column payeur_id uuid references public.clients(id) on delete set null;
create index on public.contrats (payeur_id);

alter table public.parametres_fiscaux
  add column taux_cfp numeric(6,4),
  add column seuil_tva_tolerance numeric(12,2),
  add column seuil_tva_base numeric(12,2);

create table public.declarations (
  id uuid primary key default gen_random_uuid(),
  periode_debut date not null,
  periode_fin date not null,
  periodicite text,
  ca_declare numeric(12,2) not null default 0,
  cotisations numeric(10,2) not null default 0,
  cfp numeric(10,2) not null default 0,
  versement_liberatoire numeric(10,2) not null default 0,
  date_limite date,
  date_declaration date,
  date_paiement date,
  statut text not null default 'a_faire',
  notes text,
  cree_le timestamptz not null default now(),
  unique (periode_debut, periode_fin)
);
alter table public.declarations enable row level security;
create policy acces_declarations on public.declarations for all to authenticated
  using ((select prive.est_actif())) with check ((select prive.est_actif()));

insert into public.ref_valeurs (categorie, code, libelle, ordre) values
('type_client','particulier','Particulier (bénéficiaire)',1),
('type_client','entreprise','Entreprise tierce (donneur d''ordre)',2),
('type_client','organisme','Organisme / caisse',3),
('statut_declaration','a_faire','À faire',1),
('statut_declaration','declaree','Déclarée',2),
('statut_declaration','payee','Déclarée et payée',3),
('statut_declaration','en_retard','En retard',4),
('categorie_depense','urssaf','Cotisations URSSAF',8),
('categorie_depense','impot','Impôt sur le revenu',9),
('categorie_depense','carburant','Carburant',10),
('categorie_depense','vetements','Vêtements de travail',11),
('categorie_depense','banque','Frais bancaires',12);

-- Taux 2025 et 2026 (micro-entreprise, prestations de services BIC)
update public.parametres_fiscaux
  set taux_cotisations = 0.212, taux_cfp = 0.002, taux_versement_liberatoire = 0.017,
      plafond_ca = 83600, plafond_tva = 37500, seuil_tva_base = 37500, seuil_tva_tolerance = 41250
  where regime = 'auto_entrepreneur';
insert into public.parametres_fiscaux
  (regime, annee, taux_cotisations, taux_cfp, taux_versement_liberatoire, plafond_ca, plafond_tva, seuil_tva_base, seuil_tva_tolerance, commentaire)
select 'auto_entrepreneur', 2025, 0.212, 0.002, 0.017, 83600, 37500, 37500, 41250, 'Micro-BIC prestations de services 2025'
where not exists (select 1 from public.parametres_fiscaux where regime='auto_entrepreneur' and annee=2025);
