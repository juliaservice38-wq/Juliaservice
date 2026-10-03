-- ============================================================
-- Julia service : SUPPRIMER TOUTES LES DONNÉES DE TEST
-- Supprime uniquement les clients « TEST … » et tout ce qui s'y rattache.
-- À coller dans Supabase > SQL Editor > Run.
-- ============================================================
delete from public.paiements where client_id in (select id from public.clients where nom like 'TEST %');
delete from public.factures  where client_id in (select id from public.clients where nom like 'TEST %');
delete from public.clients   where nom like 'TEST %';   -- supprime aussi contrats, séries, visites, notes
delete from public.depenses  where libelle like 'TEST %';
