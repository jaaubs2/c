-- ═══════════════════════════════════════════════════════════════════════
--  ACCÈS PAR LA MUTUELLE (particuliers)
-- ═══════════════════════════════════════════════════════════════════════
--  Pour un particulier, le carnet est pris en charge par sa mutuelle : la mutuelle
--  partenaire donne un code à ses adhérents, qui le saisissent dans l'app.
--  Sans code, une période de découverte permet de commencer tout de suite.
--  Les établissements, eux, ont leur propre abonnement (hors de l'app).
--
--  • Les codes sont vérifiés par le serveur, stockés sous forme d'empreinte,
--    et les essais en série sont limités (5 échecs par quart d'heure).
--  • Une mutuelle n'a jamais accès aux carnets ni aux notes.
--  • On ne bloque jamais l'accès d'une famille à ses propres notes.
--
--  Ajouter un code (dans Supabase → SQL Editor) :
--    select private.mutuelle_code_add('Nom de la mutuelle', 'CODE-2026');
--  Désactiver un code :
--    update public.mutuelle_codes set active = false where mutuelle_name = 'Nom de la mutuelle';
-- ═══════════════════════════════════════════════════════════════════════

-- Codes donnés par les mutuelles partenaires (lisibles par personne depuis l'app).
create table public.mutuelle_codes (
  id             uuid primary key default gen_random_uuid(),
  mutuelle_name  text not null check (char_length(btrim(mutuelle_name)) between 1 and 80),
  code_hash      text not null unique,
  active         boolean not null default true,
  expires_at     timestamptz,
  created_at     timestamptz not null default now()
);
alter table public.mutuelle_codes enable row level security;
revoke all on public.mutuelle_codes from anon, authenticated;

-- L'accès de chaque personne : par sa mutuelle, ou en découverte.
create table public.access_grants (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  kind           text not null check (kind in ('mutuelle', 'decouverte')),
  mutuelle_name  text check (char_length(mutuelle_name) <= 80),
  code_id        uuid references public.mutuelle_codes (id) on delete set null,
  ends_at        timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.access_grants enable row level security;
create policy "accès : lecture de son propre accès" on public.access_grants
  for select to authenticated using (user_id = auth.uid());
revoke all on public.access_grants from anon;
revoke insert, update, delete on public.access_grants from authenticated;

-- Même écriture pour tous : majuscules, sans espaces ni tirets (« demo-2026 » = « DEMO 2026 »).
create or replace function private.normalize_code(c text) returns text
language sql immutable set search_path = '' as $$
  select upper(regexp_replace(coalesce(c, ''), '[^A-Za-z0-9]', '', 'g'))
$$;

-- Réservé à l'éditeur (SQL Editor) : ajoute un code de mutuelle.
create or replace function private.mutuelle_code_add(p_mutuelle text, p_code text, p_expires_at timestamptz default null)
returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare v_id uuid;
begin
  if char_length(private.normalize_code(p_code)) < 6 then
    raise exception 'Le code doit contenir au moins 6 lettres ou chiffres.' using errcode = '22023';
  end if;
  insert into public.mutuelle_codes (mutuelle_name, code_hash, expires_at)
  values (btrim(p_mutuelle), private.sha256(private.normalize_code(p_code)), p_expires_at)
  returning id into v_id;
  return v_id;
end $$;
revoke all on function private.mutuelle_code_add(text, text, timestamptz) from public, anon, authenticated;

create or replace function private.access_json(a public.access_grants) returns jsonb
language sql stable set search_path = '' as $$
  select case when a.user_id is null then null else jsonb_build_object(
    'kind', a.kind, 'mutuelle_name', a.mutuelle_name, 'ends_at', a.ends_at, 'since', a.created_at) end
$$;

-- Saisie du code de sa mutuelle.
create or replace function public.access_redeem(p_code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  c public.mutuelle_codes%rowtype;
  a public.access_grants%rowtype;
begin
  if auth.uid() is null then raise exception 'Connecte-toi d''abord.' using errcode = '42501'; end if;
  if (select count(*) from public.invite_attempts
      where user_id = auth.uid() and not succeeded and created_at > now() - interval '15 minutes') >= 5 then
    raise exception 'Trop d''essais. Réessaie dans 15 minutes.' using errcode = '54000';
  end if;

  select * into c from public.mutuelle_codes
  where code_hash = private.sha256(private.normalize_code(p_code)) and active
    and (expires_at is null or expires_at > now());
  if not found then
    insert into public.invite_attempts (user_id, succeeded) values (auth.uid(), false);
    return jsonb_build_object('status', 'invalid');
  end if;

  insert into public.access_grants (user_id, kind, mutuelle_name, code_id, ends_at)
  values (auth.uid(), 'mutuelle', c.mutuelle_name, c.id, null)
  on conflict (user_id) do update
    set kind = 'mutuelle', mutuelle_name = excluded.mutuelle_name, code_id = excluded.code_id,
        ends_at = null, updated_at = now()
  returning * into a;
  insert into public.invite_attempts (user_id, succeeded) values (auth.uid(), true);
  return jsonb_build_object('status', 'ok', 'access', private.access_json(a));
end $$;

-- Commencer sans code : période de découverte de 14 jours, une seule fois.
create or replace function public.access_start_discovery() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare a public.access_grants%rowtype;
begin
  if auth.uid() is null then raise exception 'Connecte-toi d''abord.' using errcode = '42501'; end if;
  insert into public.access_grants (user_id, kind, ends_at)
  values (auth.uid(), 'decouverte', now() + interval '14 days')
  on conflict (user_id) do nothing;
  select * into a from public.access_grants where user_id = auth.uid();
  return private.access_json(a);
end $$;

-- Au démarrage, l'app reçoit aussi l'accès de la personne.
create or replace function public.app_bootstrap() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'profile', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'email', auth.jwt() ->> 'email',
    'carnets', coalesce((
      select jsonb_agg(private.carnet_json(k) order by (k.owner_id = auth.uid()) desc, k.created_at)
      from public.carnets k
      where k.org_id is null
        and (k.owner_id = auth.uid()
             or exists (select 1 from public.carnet_members m where m.carnet_id = k.id and m.user_id = auth.uid()))
    ), '[]'::jsonb) || coalesce((
      select jsonb_agg(private.carnet_json(k) order by k.created_at)
      from public.carnets k
      where k.org_id is not null
        and exists (select 1 from public.carnet_members m where m.carnet_id = k.id and m.user_id = auth.uid())
    ), '[]'::jsonb),
    'membership', (select to_jsonb(m) from public.org_members m where m.user_id = auth.uid()),
    'access', (select private.access_json(a) from public.access_grants a where a.user_id = auth.uid())
  )
$$;

-- L'export des données contient aussi l'accès (quelle mutuelle, depuis quand).
create or replace function public.export_my_data() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'exporte_le', now(),
    'email', auth.jwt() ->> 'email',
    'profil', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'acces', (select to_jsonb(a) - 'code_id' from public.access_grants a where a.user_id = auth.uid()),
    'consentements', coalesce((select jsonb_agg(to_jsonb(k) order by k.created_at)
                               from public.consents k where k.user_id = auth.uid()), '[]'::jsonb),
    'etablissement', (select to_jsonb(m) from public.org_members m where m.user_id = auth.uid()),
    'carnets', coalesce((
      select jsonb_agg(to_jsonb(c) || jsonb_build_object(
        'notes', coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at)
                           from public.notes n where n.carnet_id = c.id), '[]'::jsonb),
        'partages', coalesce((select jsonb_agg(to_jsonb(s) - 'token_hash' order by s.created_at)
                              from public.shares s where s.carnet_id = c.id), '[]'::jsonb),
        'ouvertures_des_fiches', coalesce((select jsonb_agg(to_jsonb(l) order by l.accessed_at)
                                           from public.share_access_log l join public.shares s on s.id = l.share_id
                                           where s.carnet_id = c.id), '[]'::jsonb)))
      from public.carnets c
      where c.owner_id = auth.uid()
         or exists (select 1 from public.carnet_members m where m.carnet_id = c.id and m.user_id = auth.uid())
    ), '[]'::jsonb),
    'notes_ecrites', coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at)
                               from public.notes n where n.author_id = auth.uid()), '[]'::jsonb)
  )
$$;

-- ─── Droits ───
revoke execute on function public.access_redeem(text) from public, anon;
revoke execute on function public.access_start_discovery() from public, anon;
grant execute on function public.access_redeem(text), public.access_start_discovery() to authenticated;
revoke all on function private.normalize_code(text) from public, anon, authenticated;
revoke all on function private.access_json(public.access_grants) from public, anon;
grant execute on function private.access_json(public.access_grants) to authenticated;
grant select on public.access_grants to authenticated;
