-- Le cercle d'aidants : retirer un proche.
--
-- La personne qui tient le carnet (ou le cadre, pour un carnet d'établissement)
-- peut retirer un proche du cercle ; un proche peut aussi quitter le cercle lui-même.
-- Les droits sont ceux de la règle « cercle : retrait » : la fonction s'exécute
-- avec les droits de la personne connectée. Les notes du proche restent dans le
-- carnet, signées de son prénom.

create or replace function public.member_remove(p_carnet uuid, p_user uuid) returns void
language plpgsql volatile security invoker set search_path = '' as $$
begin
  delete from public.carnet_members where carnet_id = p_carnet and user_id = p_user;
  if not found then raise exception 'Membre introuvable, ou tu n''as pas le droit de le retirer.' using errcode = '42501'; end if;
end $$;

revoke all on function public.member_remove(uuid, uuid) from public, anon;
grant execute on function public.member_remove(uuid, uuid) to authenticated;
