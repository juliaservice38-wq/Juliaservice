-- PÉRIODE DE TEST : tout nouveau compte est actif tout de suite (pour que Julia accède aux données de simulation).
-- À REMETTRE EN MODE « activation manuelle » avant d'utiliser de vraies données.
create or replace function prive.nouvel_utilisateur() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare premier boolean;
begin
  premier := not exists (select 1 from public.intervenants);
  insert into public.intervenants (id, email, role, actif)
  values (new.id, new.email, case when premier then 'admin' else 'intervenant' end, true);
  return new;
end;
$$;
-- Active aussi les comptes déjà créés
update public.intervenants set actif = true;
