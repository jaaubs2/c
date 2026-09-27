-- ════════════════════════════════════════════════════════════════════
-- Le carnet vivant — base de données (Supabase / PostgreSQL)
--
-- Principes :
--   • chaque table est protégée par des règles d'accès (Row Level Security) :
--     le serveur refuse ce qu'une personne n'a pas le droit de voir ou de faire ;
--   • l'app passe par des fonctions (section « API ») : chaque action est
--     vérifiée côté serveur, jamais seulement masquée dans l'interface ;
--   • un relais ouvre une fiche avec un lien : seul un condensé (hash) du jeton
--     est stocké, le lien expire, peut être révoqué, et chaque ouverture est
--     inscrite dans un journal ;
--   • les consentements sont enregistrés, datés et versionnés ;
--   • chacun peut exporter ou supprimer ses données ;
--   • aucune donnée clinique : des notes de vie, rangées en 7 rubriques.
--
-- Trois espaces :
--   • aidant  : tient le carnet d'un proche, invite d'autres contributeurs ;
--   • relais  : ouvre une fiche de transmission par lien, sans compte ;
--   • équipe  : établissement, unités, soignants, résidents, validation des notes.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ════════════════════════════ TABLES ═════════════════════════════════

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null default '' check (char_length(display_name) <= 80),
  account_type  text not null default 'aidant' check (account_type in ('aidant', 'proche', 'etab')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Établissements (EHPAD, résidence…).
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 120),
  kind        text not null default 'EHPAD' check (char_length(kind) <= 40),
  finess      text check (finess ~ '^[0-9]{9}$'),
  city        text check (char_length(city) <= 80),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.units (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  subtitle    text not null default '' check (char_length(subtitle) <= 80),
  position    int not null default 0,
  created_at  timestamptz not null default now()
);
create index units_org_idx on public.units (org_id, position);

-- Membres d'un établissement. Un compte appartient à un seul établissement.
--   role : cadre (gère tout) ou soignant ;
--   perm (soignant) : read = consulte, validate = notes publiées après visa, write = notes publiées tout de suite.
create table public.org_members (
  org_id        uuid not null references public.organizations (id) on delete cascade,
  user_id       uuid not null unique references auth.users (id) on delete cascade,
  role          text not null check (role in ('cadre', 'soignant')),
  display_name  text not null default '' check (char_length(display_name) <= 80),
  job_title     text not null default '' check (char_length(job_title) <= 60),
  unit_id       uuid references public.units (id) on delete set null,
  perm          text not null default 'validate' check (perm in ('read', 'validate', 'write')),
  created_at    timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Codes d'entrée à 6 chiffres pour les soignants (48 h, usage unique).
create table public.staff_invites (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  code_hash     text not null,
  display_name  text not null check (char_length(btrim(display_name)) between 1 and 80),
  job_title     text not null default '' check (char_length(job_title) <= 60),
  unit_id       uuid references public.units (id) on delete set null,
  perm          text not null check (perm in ('read', 'validate', 'write')),
  created_by    uuid references auth.users (id) on delete set null,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  used_by       uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);
create index staff_invites_code_idx on public.staff_invites (code_hash) where used_at is null;

-- Essais de code (limite contre les tentatives en série).
create table public.invite_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  succeeded   boolean not null,
  created_at  timestamptz not null default now()
);
create index invite_attempts_user_idx on public.invite_attempts (user_id, created_at desc);

-- Le carnet d'une personne accompagnée : tenu par un aidant (owner_id)
-- ou par un établissement (org_id, pour un résident).
create table public.carnets (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references auth.users (id) on delete set null,
  org_id          uuid references public.organizations (id) on delete cascade,
  unit_id         uuid references public.units (id) on delete set null,
  room            text check (char_length(room) <= 20),
  person_name     text not null check (char_length(btrim(person_name)) between 1 and 80),
  person_age      int check (person_age between 0 and 130),
  since_label     text check (char_length(since_label) <= 40),
  pronoun         text not null default 'elle' check (pronoun in ('elle', 'il')),
  avatar          text check (char_length(avatar) <= 20),
  owner_relation  text check (owner_relation in ('fille', 'fils', 'conjoint', 'proche', 'pro')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (owner_id is not null or org_id is not null)
);
create index carnets_owner_idx on public.carnets (owner_id);
create index carnets_org_idx on public.carnets (org_id, unit_id);

-- Contributeurs invités sur un carnet (cercle d'aidants, famille d'un résident).
create table public.carnet_members (
  carnet_id     uuid not null references public.carnets (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  role          text not null check (role in ('editor', 'reader')),
  display_name  text not null default '' check (char_length(display_name) <= 80),
  relation      text not null default '' check (char_length(relation) <= 60),
  created_at    timestamptz not null default now(),
  primary key (carnet_id, user_id)
);
create index carnet_members_user_idx on public.carnet_members (user_id);

-- Invitations à contribuer, par lien (usage unique).
create table public.carnet_invites (
  id            uuid primary key default gen_random_uuid(),
  carnet_id     uuid not null references public.carnets (id) on delete cascade,
  created_by    uuid references auth.users (id) on delete set null,
  invited_name  text not null default '' check (char_length(invited_name) <= 80),
  relation      text not null default '' check (char_length(relation) <= 60),
  role          text not null default 'editor' check (role in ('editor', 'reader')),
  token_hash    text not null unique,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  used_by       uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- Les notes.
--   status : published (visible), pending (en attente du visa du cadre), rejected.
create table public.notes (
  id            uuid primary key default gen_random_uuid(),
  carnet_id     uuid not null references public.carnets (id) on delete cascade,
  author_id     uuid references auth.users (id) on delete set null,
  author_name   text not null default '',
  author_role   text not null default '',
  category      text not null check (category in ('histoire', 'habitudes', 'apaise', 'parler', 'gouts', 'sante', 'proches')),
  body          text not null check (char_length(btrim(body)) between 1 and 4000),
  status        text not null default 'published' check (status in ('published', 'pending', 'rejected')),
  validated_by  uuid references auth.users (id) on delete set null,
  validated_at  timestamptz,
  confirmed_at  timestamptz,
  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index notes_carnet_idx on public.notes (carnet_id, created_at desc);
create index notes_author_idx on public.notes (author_id);

-- Consentements, datés et versionnés. Jamais modifiés après coup.
create table public.consents (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  carnet_id   uuid references public.carnets (id) on delete cascade,
  kind        text not null check (kind in ('terms', 'sensitive_data', 'person_consent')),
  value       text not null check (value in ('accepted', 'accord', 'representant', 'later')),
  version     text not null default '2026-09',
  created_at  timestamptz not null default now()
);
create index consents_user_idx on public.consents (user_id);

-- Fiches de transmission partagées par lien.
create table public.shares (
  id              uuid primary key default gen_random_uuid(),
  carnet_id       uuid not null references public.carnets (id) on delete cascade,
  created_by      uuid references auth.users (id) on delete set null,
  from_name       text not null default '',
  recipient_type  text not null check (recipient_type in ('proche', 'pro', 'etab')),
  recipient_name  text not null default '' check (char_length(recipient_name) <= 80),
  categories      text[] not null check (cardinality(categories) >= 1
                    and categories <@ array['histoire','habitudes','apaise','parler','gouts','sante','proches']),
  intro           text check (char_length(intro) <= 300),
  token_hash      text not null unique,
  expires_at      timestamptz not null,
  revoked_at      timestamptz,
  created_at      timestamptz not null default now()
);
create index shares_carnet_idx on public.shares (carnet_id, created_at desc);

-- Journal des ouvertures de fiches (sans adresse IP : minimisation).
create table public.share_access_log (
  id           bigint generated always as identity primary key,
  share_id     uuid not null references public.shares (id) on delete cascade,
  accessed_at  timestamptz not null default now()
);
create index share_access_log_share_idx on public.share_access_log (share_id, accessed_at desc);

-- ═══════════════════ DROITS : FONCTIONS UTILITAIRES ══════════════════

create or replace function private.my_membership() returns public.org_members
language sql stable security definer set search_path = '' as $$
  select * from public.org_members where user_id = auth.uid()
$$;

create or replace function private.is_org_member(o uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.org_members where org_id = o and user_id = auth.uid())
$$;

create or replace function private.is_org_cadre(o uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.org_members where org_id = o and user_id = auth.uid() and role = 'cadre')
$$;

-- Peut lire le carnet : aidant propriétaire, contributeur invité, cadre de
-- l'établissement, ou soignant de l'unité du résident.
create or replace function private.can_read_carnet(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.carnets k
    where k.id = c and (
      k.owner_id = auth.uid()
      or exists (select 1 from public.carnet_members m where m.carnet_id = k.id and m.user_id = auth.uid())
      or exists (select 1 from public.org_members o
                 where o.org_id = k.org_id and o.user_id = auth.uid()
                   and (o.role = 'cadre' or o.unit_id = k.unit_id))
    )
  )
$$;

-- Peut écrire une note.
create or replace function private.can_write_carnet(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.carnets k
    where k.id = c and (
      k.owner_id = auth.uid()
      or exists (select 1 from public.carnet_members m
                 where m.carnet_id = k.id and m.user_id = auth.uid() and m.role = 'editor')
      or exists (select 1 from public.org_members o
                 where o.org_id = k.org_id and o.user_id = auth.uid()
                   and (o.role = 'cadre' or (o.unit_id = k.unit_id and o.perm in ('write', 'validate'))))
    )
  )
$$;

-- Peut gérer le carnet (profil, partages, invitations) : aidant propriétaire ou cadre.
create or replace function private.can_manage_carnet(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.carnets k
    where k.id = c and (k.owner_id = auth.uid() or private.is_org_cadre(k.org_id))
  )
$$;

-- Variante qui ne relit pas le carnet (utilisable pendant sa création).
create or replace function private.can_read_org_carnet(o uuid, u uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select o is not null and exists (
    select 1 from public.org_members m
    where m.org_id = o and m.user_id = auth.uid() and (m.role = 'cadre' or m.unit_id = u))
$$;

create or replace function private.is_carnet_member(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.carnet_members where carnet_id = c and user_id = auth.uid())
$$;

create or replace function private.carnet_org(c uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select org_id from public.carnets where id = c
$$;

create or replace function private.random_token() returns text
language sql volatile set search_path = '' as $$
  select translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_')
$$;

create or replace function private.sha256(t text) returns text
language sql immutable set search_path = '' as $$
  select encode(extensions.digest(t, 'sha256'), 'hex')
$$;

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated;

-- ═════════════════════ RÈGLES D'ACCÈS (RLS) ══════════════════════════

alter table public.profiles          enable row level security;
alter table public.organizations     enable row level security;
alter table public.units             enable row level security;
alter table public.org_members       enable row level security;
alter table public.staff_invites     enable row level security;
alter table public.invite_attempts   enable row level security;
alter table public.carnets           enable row level security;
alter table public.carnet_members    enable row level security;
alter table public.carnet_invites    enable row level security;
alter table public.notes             enable row level security;
alter table public.consents          enable row level security;
alter table public.shares            enable row level security;
alter table public.share_access_log  enable row level security;

-- Profil : chacun le sien.
create policy "profil : lecture" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profil : modification" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Établissement : visible par ses membres, modifiable par les cadres.
create policy "établissement : lecture" on public.organizations for select to authenticated
  using (private.is_org_member(id));
create policy "établissement : modification" on public.organizations for update to authenticated
  using (private.is_org_cadre(id)) with check (private.is_org_cadre(id));

create policy "unités : lecture" on public.units for select to authenticated
  using (private.is_org_member(org_id));
create policy "unités : gestion" on public.units for all to authenticated
  using (private.is_org_cadre(org_id)) with check (private.is_org_cadre(org_id));

create policy "équipe : lecture" on public.org_members for select to authenticated
  using (private.is_org_member(org_id));
create policy "équipe : modification" on public.org_members for update to authenticated
  using (private.is_org_cadre(org_id)) with check (private.is_org_cadre(org_id));
create policy "équipe : retrait" on public.org_members for delete to authenticated
  using (private.is_org_cadre(org_id) or user_id = auth.uid());

create policy "codes : lecture" on public.staff_invites for select to authenticated
  using (private.is_org_cadre(org_id));
create policy "codes : suppression" on public.staff_invites for delete to authenticated
  using (private.is_org_cadre(org_id));

-- Carnets.
create policy "carnet : lecture" on public.carnets for select to authenticated
  using (owner_id = auth.uid() or private.is_carnet_member(id) or private.can_read_org_carnet(org_id, unit_id));
create policy "carnet : création" on public.carnets for insert to authenticated
  with check ((org_id is null and owner_id = auth.uid())
           or (org_id is not null and owner_id is null and private.is_org_cadre(org_id)));
create policy "carnet : modification" on public.carnets for update to authenticated
  using (private.can_manage_carnet(id)) with check (private.can_manage_carnet(id));
create policy "carnet : suppression" on public.carnets for delete to authenticated
  using (private.can_manage_carnet(id));

create policy "cercle : lecture" on public.carnet_members for select to authenticated
  using (private.can_read_carnet(carnet_id));
create policy "cercle : retrait" on public.carnet_members for delete to authenticated
  using (private.can_manage_carnet(carnet_id) or user_id = auth.uid());

create policy "invitations : lecture" on public.carnet_invites for select to authenticated
  using (private.can_manage_carnet(carnet_id));
create policy "invitations : suppression" on public.carnet_invites for delete to authenticated
  using (private.can_manage_carnet(carnet_id));

-- Notes : une note en attente n'est visible que par son auteur et les cadres.
create policy "notes : lecture" on public.notes for select to authenticated
  using (private.can_read_carnet(carnet_id)
         and (status = 'published' or author_id = auth.uid() or private.is_org_cadre(private.carnet_org(carnet_id))));
create policy "notes : ajout" on public.notes for insert to authenticated
  with check (private.can_write_carnet(carnet_id) and author_id = auth.uid());
create policy "notes : modification" on public.notes for update to authenticated
  using (private.can_write_carnet(carnet_id)) with check (private.can_write_carnet(carnet_id));
create policy "notes : suppression" on public.notes for delete to authenticated
  using (author_id = auth.uid() or private.can_manage_carnet(carnet_id));

create policy "consentements : lecture" on public.consents for select to authenticated
  using (user_id = auth.uid());
create policy "consentements : ajout" on public.consents for insert to authenticated
  with check (user_id = auth.uid() and (carnet_id is null or private.can_manage_carnet(carnet_id)));

create policy "partages : lecture" on public.shares for select to authenticated
  using (private.can_manage_carnet(carnet_id));
create policy "partages : révocation" on public.shares for update to authenticated
  using (private.can_manage_carnet(carnet_id)) with check (private.can_manage_carnet(carnet_id));
create policy "partages : suppression" on public.shares for delete to authenticated
  using (private.can_manage_carnet(carnet_id));
revoke update on public.shares from anon, authenticated;
grant update (revoked_at) on public.shares to authenticated;

create policy "journal : lecture" on public.share_access_log for select to authenticated
  using (exists (select 1 from public.shares s
                 where s.id = share_id and private.can_manage_carnet(s.carnet_id)));

-- Les visiteurs non connectés n'accèdent à aucune table directement.
revoke all on all tables in schema public from anon;

-- ═════════════════════════ AUTOMATISMES ══════════════════════════════

create or replace function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();
create trigger organizations_touch before update on public.organizations
  for each row execute function private.touch_updated_at();
create trigger carnets_touch before update on public.carnets
  for each row execute function private.touch_updated_at();

-- Notes : l'auteur est toujours la personne connectée ; le statut est décidé par
-- le serveur (visa du cadre si le soignant a le droit « À valider ») ; seuls les
-- cadres valident ; on ne modifie le texte que de ses propres notes, sauf gestionnaire.
create or replace function private.notes_before_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  k public.carnets%rowtype;
  om public.org_members%rowtype;
  cm public.carnet_members%rowtype;
  is_cadre boolean;
begin
  select * into k from public.carnets where id = new.carnet_id;
  select * into om from public.org_members where user_id = auth.uid() and org_id = k.org_id;
  is_cadre := found and om.role = 'cadre';

  if tg_op = 'INSERT' then
    new.author_id := auth.uid();
    new.created_at := now();
    new.validated_by := null;
    new.validated_at := null;
    new.confirmed_at := null;
    new.archived_at := null;
    new.status := case
      when om.user_id is not null and om.role = 'soignant' and om.perm = 'validate' then 'pending'
      else 'published' end;
    if om.user_id is not null then
      new.author_name := om.display_name;
      new.author_role := case when om.role = 'cadre' and om.job_title = '' then 'Cadre' else om.job_title end;
    else
      select * into cm from public.carnet_members where carnet_id = k.id and user_id = auth.uid();
      new.author_name := coalesce(nullif(cm.display_name, ''),
                                  (select display_name from public.profiles where id = auth.uid()), '');
      new.author_role := coalesce(nullif(cm.relation, ''),
                                  case when k.org_id is not null then 'Famille' else '' end);
    end if;
  else
    new.id := old.id;
    new.carnet_id := old.carnet_id;
    new.author_id := old.author_id;
    new.author_name := old.author_name;
    new.author_role := old.author_role;
    new.created_at := old.created_at;

    if new.status is distinct from old.status then
      if not is_cadre or old.status <> 'pending' or new.status not in ('published', 'rejected') then
        raise exception 'Seul le cadre de santé peut valider une note en attente.' using errcode = '42501';
      end if;
      new.validated_by := auth.uid();
      new.validated_at := now();
    else
      new.validated_by := old.validated_by;
      new.validated_at := old.validated_at;
    end if;

    if (new.body is distinct from old.body or new.category is distinct from old.category)
       and old.author_id is distinct from auth.uid()
       and not private.can_manage_carnet(old.carnet_id) then
      raise exception 'Tu ne peux modifier que tes propres notes.' using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger notes_before_write before insert or update on public.notes
  for each row execute function private.notes_before_write();

-- Inscription : crée le profil et enregistre les consentements du formulaire.
create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  k text;
begin
  insert into public.profiles (id, display_name, account_type)
  values (
    new.id,
    left(btrim(coalesce(meta ->> 'display_name', '')), 80),
    case when meta ->> 'account_type' in ('aidant', 'proche', 'etab') then meta ->> 'account_type' else 'aidant' end
  );
  for k in select jsonb_array_elements_text(coalesce(meta -> 'consents', '[]'::jsonb)) loop
    if k in ('terms', 'sensitive_data') then
      insert into public.consents (user_id, kind, value) values (new.id, k, 'accepted');
    end if;
  end loop;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ════════════════════════════ API ════════════════════════════════════
-- Toutes les actions de l'app. « invoker » = s'exécute avec les droits de
-- la personne connectée (les règles d'accès s'appliquent) ; « definer » =
-- fonction qui vérifie elle-même les droits avant d'agir.

-- Représentation d'une note pour l'app.
create or replace function private.note_json(n public.notes) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'id', n.id, 'carnet_id', n.carnet_id, 'category', n.category, 'body', n.body,
    'author_id', n.author_id, 'author_name', n.author_name, 'author_role', n.author_role,
    'status', n.status, 'confirmed_at', n.confirmed_at, 'archived_at', n.archived_at,
    'created_at', n.created_at, 'updated_at', n.updated_at)
$$;

create or replace function private.carnet_json(k public.carnets) returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(k) || jsonb_build_object(
    'my_role', case
      when k.owner_id = auth.uid() then 'owner'
      when private.is_org_cadre(k.org_id) then 'cadre'
      else coalesce((select role from public.carnet_members where carnet_id = k.id and user_id = auth.uid()),
                    case when private.can_write_carnet(k.id) then 'editor' else 'reader' end)
    end)
$$;

-- Au démarrage : qui suis-je, quels carnets, quel établissement.
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
    'membership', (select to_jsonb(m) from public.org_members m where m.user_id = auth.uid())
  )
$$;

create or replace function public.profile_update(p_display_name text) returns jsonb
language sql volatile security invoker set search_path = '' as $$
  update public.profiles set display_name = left(btrim(coalesce(p_display_name, '')), 80)
  where id = auth.uid()
  returning to_jsonb(profiles.*)
$$;

-- Carnet d'un aidant (créé à la fin de l'accueil).
create or replace function public.carnet_create(
  p_person_name text, p_person_age int default null, p_since text default null,
  p_relation text default null, p_avatar text default null, p_pronoun text default 'elle',
  p_person_consent text default null
) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare k public.carnets%rowtype;
begin
  insert into public.carnets (owner_id, person_name, person_age, since_label, owner_relation, avatar, pronoun)
  values (auth.uid(), btrim(p_person_name), p_person_age, nullif(btrim(p_since), ''), p_relation, p_avatar,
          coalesce(p_pronoun, 'elle'))
  returning * into k;
  if p_person_consent in ('accord', 'representant', 'later') then
    insert into public.consents (user_id, carnet_id, kind, value)
    values (auth.uid(), k.id, 'person_consent', p_person_consent);
  end if;
  return private.carnet_json(k);
end $$;

create or replace function public.carnet_update(
  p_carnet uuid, p_person_name text, p_person_age int, p_since text,
  p_pronoun text default null, p_avatar text default null, p_room text default null, p_unit uuid default null
) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare k public.carnets%rowtype;
begin
  update public.carnets set
    person_name = btrim(p_person_name),
    person_age = p_person_age,
    since_label = nullif(btrim(p_since), ''),
    pronoun = coalesce(p_pronoun, pronoun),
    avatar = coalesce(p_avatar, avatar),
    room = case when org_id is null then room else coalesce(nullif(btrim(p_room), ''), room) end,
    unit_id = case when org_id is null then unit_id else coalesce(p_unit, unit_id) end
  where id = p_carnet
  returning * into k;
  if not found then
    raise exception 'Carnet introuvable ou non modifiable.' using errcode = '42501';
  end if;
  return private.carnet_json(k);
end $$;

create or replace function public.consent_record(p_kind text, p_value text, p_carnet uuid default null) returns void
language sql volatile security invoker set search_path = '' as $$
  insert into public.consents (user_id, carnet_id, kind, value) values (auth.uid(), p_carnet, p_kind, p_value)
$$;

-- Notes.
create or replace function public.notes_list(p_carnet uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(private.note_json(n) order by n.created_at desc), '[]'::jsonb)
  from public.notes n where n.carnet_id = p_carnet
$$;

create or replace function public.note_add(p_carnet uuid, p_category text, p_body text) returns jsonb
language sql volatile security invoker set search_path = '' as $$
  insert into public.notes (carnet_id, author_id, category, body)
  values (p_carnet, auth.uid(), p_category, btrim(p_body))
  returning private.note_json(notes.*)
$$;

create or replace function public.note_update(p_note uuid, p_body text, p_category text default null) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare n public.notes%rowtype;
begin
  update public.notes set body = btrim(p_body), category = coalesce(p_category, category)
  where id = p_note returning * into n;
  if not found then raise exception 'Note introuvable.' using errcode = '42501'; end if;
  return private.note_json(n);
end $$;

create or replace function public.note_confirm(p_note uuid) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare n public.notes%rowtype;
begin
  update public.notes set confirmed_at = now() where id = p_note returning * into n;
  if not found then raise exception 'Note introuvable.' using errcode = '42501'; end if;
  return private.note_json(n);
end $$;

create or replace function public.note_archive(p_note uuid, p_archived boolean default true) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare n public.notes%rowtype;
begin
  update public.notes set archived_at = case when p_archived then now() else null end
  where id = p_note returning * into n;
  if not found then raise exception 'Note introuvable.' using errcode = '42501'; end if;
  return private.note_json(n);
end $$;

create or replace function public.note_delete(p_note uuid) returns void
language plpgsql volatile security invoker set search_path = '' as $$
begin
  delete from public.notes where id = p_note;
  if not found then raise exception 'Note introuvable ou non supprimable.' using errcode = '42501'; end if;
end $$;

-- Validation par le cadre de santé.
create or replace function public.note_validate(p_note uuid, p_approve boolean) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare n public.notes%rowtype;
begin
  update public.notes set status = case when p_approve then 'published' else 'rejected' end
  where id = p_note returning * into n;
  if not found then raise exception 'Note introuvable.' using errcode = '42501'; end if;
  return private.note_json(n);
end $$;

-- Partage par lien. Le jeton n'est renvoyé qu'une fois ; seul son hash est stocké.
create or replace function public.create_share(
  p_carnet uuid, p_recipient_type text, p_recipient_name text, p_categories text[],
  p_expires_in_days int default 7, p_intro text default null
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_token text := private.random_token();
  v_share public.shares%rowtype;
begin
  if auth.uid() is null or not private.can_manage_carnet(p_carnet) then
    raise exception 'Seule la personne qui tient le carnet peut créer un lien.' using errcode = '42501';
  end if;
  if p_expires_in_days is null or p_expires_in_days not between 1 and 90 then
    raise exception 'La durée du lien doit être comprise entre 1 et 90 jours.' using errcode = '22023';
  end if;
  insert into public.shares (carnet_id, created_by, from_name, recipient_type, recipient_name, categories, intro,
                             token_hash, expires_at)
  values (p_carnet, auth.uid(), coalesce((select display_name from public.profiles where id = auth.uid()), ''),
          p_recipient_type, coalesce(btrim(p_recipient_name), ''), p_categories, nullif(btrim(p_intro), ''),
          private.sha256(v_token), now() + make_interval(days => p_expires_in_days))
  returning * into v_share;
  return jsonb_build_object('id', v_share.id, 'token', v_token, 'expires_at', v_share.expires_at);
end $$;

create or replace function public.list_shares(p_carnet uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x ->> 'created_at' desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', s.id, 'recipient_type', s.recipient_type, 'recipient_name', s.recipient_name,
      'categories', to_jsonb(s.categories), 'created_at', s.created_at, 'expires_at', s.expires_at,
      'revoked_at', s.revoked_at,
      'open_count', (select count(*) from public.share_access_log l where l.share_id = s.id),
      'last_opened_at', (select max(accessed_at) from public.share_access_log l where l.share_id = s.id)) as x
    from public.shares s where s.carnet_id = p_carnet
  ) t
$$;

create or replace function public.revoke_share(p_share uuid) returns void
language plpgsql volatile security invoker set search_path = '' as $$
begin
  update public.shares set revoked_at = coalesce(revoked_at, now()) where id = p_share;
  if not found then raise exception 'Lien introuvable.' using errcode = '42501'; end if;
end $$;

-- Ouvre une fiche : tout est vérifié ici, seules les rubriques choisies sont
-- renvoyées, et l'ouverture est journalisée. Accessible sans compte.
create or replace function public.open_share(p_token text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  s public.shares%rowtype;
  c public.carnets%rowtype;
begin
  if p_token is null or char_length(p_token) not between 20 and 64 then
    return jsonb_build_object('status', 'invalid');
  end if;
  select * into s from public.shares where token_hash = private.sha256(p_token);
  if not found then return jsonb_build_object('status', 'invalid'); end if;
  if s.revoked_at is not null then return jsonb_build_object('status', 'revoked', 'from_name', s.from_name); end if;
  if s.expires_at <= now() then return jsonb_build_object('status', 'expired', 'from_name', s.from_name); end if;

  select * into c from public.carnets where id = s.carnet_id;
  insert into public.share_access_log (share_id) values (s.id);

  return jsonb_build_object(
    'status', 'ok',
    'share', jsonb_build_object('id', s.id, 'recipient_type', s.recipient_type, 'recipient_name', s.recipient_name,
                                'categories', to_jsonb(s.categories), 'intro', s.intro,
                                'created_at', s.created_at, 'expires_at', s.expires_at),
    'from_name', s.from_name,
    'person', jsonb_build_object('name', c.person_name, 'age', c.person_age, 'since', c.since_label,
                                 'pronoun', c.pronoun, 'avatar', c.avatar),
    'notes', coalesce((
      select jsonb_agg(jsonb_build_object('id', n.id, 'category', n.category, 'body', n.body,
                                          'author_name', n.author_name, 'author_role', n.author_role,
                                          'created_at', n.created_at) order by n.created_at desc)
      from public.notes n
      where n.carnet_id = s.carnet_id and n.status = 'published' and n.archived_at is null
        and n.category = any (s.categories)), '[]'::jsonb));
end $$;

-- Invitations à contribuer à un carnet (cercle d'aidants, famille d'un résident).
create or replace function public.carnet_invite_create(
  p_carnet uuid, p_invited_name text default '', p_relation text default '',
  p_role text default 'editor', p_expires_in_days int default 14
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_token text := private.random_token();
  v_inv public.carnet_invites%rowtype;
begin
  if auth.uid() is null or not private.can_manage_carnet(p_carnet) then
    raise exception 'Seule la personne qui tient le carnet peut inviter.' using errcode = '42501';
  end if;
  if p_expires_in_days not between 1 and 30 then
    raise exception 'Durée d''invitation invalide.' using errcode = '22023';
  end if;
  insert into public.carnet_invites (carnet_id, created_by, invited_name, relation, role, token_hash, expires_at)
  values (p_carnet, auth.uid(), coalesce(btrim(p_invited_name), ''), coalesce(btrim(p_relation), ''),
          coalesce(p_role, 'editor'), private.sha256(v_token), now() + make_interval(days => p_expires_in_days))
  returning * into v_inv;
  return jsonb_build_object('id', v_inv.id, 'token', v_token, 'expires_at', v_inv.expires_at);
end $$;

-- Aperçu d'une invitation avant de créer son compte (sans rien révéler du carnet).
create or replace function public.carnet_invite_preview(p_token text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select case
      when i.used_at is not null then jsonb_build_object('status', 'used')
      when i.expires_at <= now() then jsonb_build_object('status', 'expired')
      else jsonb_build_object('status', 'ok', 'person_first_name', split_part(k.person_name, ' ', 1),
                              'invited_name', i.invited_name,
                              'from_name', coalesce(nullif(o.name, ''), p.display_name, ''))
    end
    from public.carnet_invites i
    join public.carnets k on k.id = i.carnet_id
    left join public.organizations o on o.id = k.org_id
    left join public.profiles p on p.id = i.created_by
    where i.token_hash = private.sha256(p_token)
  ), jsonb_build_object('status', 'invalid'))
$$;

create or replace function public.carnet_invite_accept(p_token text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  i public.carnet_invites%rowtype;
  k public.carnets%rowtype;
begin
  if auth.uid() is null then raise exception 'Connecte-toi pour accepter l''invitation.' using errcode = '42501'; end if;
  select * into i from public.carnet_invites where token_hash = private.sha256(p_token) for update;
  if not found then return jsonb_build_object('status', 'invalid'); end if;
  select * into k from public.carnets where id = i.carnet_id;
  if k.owner_id = auth.uid() or exists (select 1 from public.carnet_members
                                         where carnet_id = k.id and user_id = auth.uid()) then
    return jsonb_build_object('status', 'ok', 'carnet', private.carnet_json(k));
  end if;
  if i.used_at is not null then return jsonb_build_object('status', 'used'); end if;
  if i.expires_at <= now() then return jsonb_build_object('status', 'expired'); end if;

  insert into public.carnet_members (carnet_id, user_id, role, display_name, relation)
  values (k.id, auth.uid(), i.role,
          coalesce(nullif((select display_name from public.profiles where id = auth.uid()), ''), i.invited_name),
          i.relation);
  update public.carnet_invites set used_at = now(), used_by = auth.uid() where id = i.id;
  return jsonb_build_object('status', 'ok', 'carnet', private.carnet_json(k));
end $$;

create or replace function public.carnet_members_list(p_carnet uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'user_id', m.user_id, 'role', m.role, 'display_name', m.display_name, 'relation', m.relation,
           'created_at', m.created_at,
           'contributions', (select count(*) from public.notes n where n.carnet_id = m.carnet_id and n.author_id = m.user_id)
         ) order by m.created_at), '[]'::jsonb)
  from public.carnet_members m where m.carnet_id = p_carnet
$$;

-- ─── Établissement ───

create or replace function public.org_create(
  p_name text, p_kind text, p_finess text, p_city text,
  p_display_name text, p_job_title text, p_units text[]
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  o public.organizations%rowtype;
  u text;
  i int := 0;
begin
  if auth.uid() is null then raise exception 'Connecte-toi d''abord.' using errcode = '42501'; end if;
  if exists (select 1 from public.org_members where user_id = auth.uid()) then
    raise exception 'Ce compte fait déjà partie d''un établissement.' using errcode = '23505';
  end if;
  if coalesce(cardinality(p_units), 0) = 0 or cardinality(p_units) > 30 then
    raise exception 'Il faut entre 1 et 30 unités.' using errcode = '22023';
  end if;
  insert into public.organizations (name, kind, finess, city, created_by)
  values (btrim(p_name), coalesce(nullif(btrim(p_kind), ''), 'EHPAD'), nullif(btrim(p_finess), ''),
          nullif(btrim(p_city), ''), auth.uid())
  returning * into o;
  foreach u in array p_units loop
    if nullif(btrim(u), '') is not null then
      insert into public.units (org_id, name, position) values (o.id, btrim(u), i);
      i := i + 1;
    end if;
  end loop;
  insert into public.org_members (org_id, user_id, role, display_name, job_title, perm)
  values (o.id, auth.uid(), 'cadre', left(btrim(coalesce(p_display_name, '')), 80),
          left(btrim(coalesce(p_job_title, '')), 60), 'write');
  update public.profiles set account_type = 'etab',
    display_name = case when display_name = '' then left(btrim(coalesce(p_display_name, '')), 80) else display_name end
  where id = auth.uid();
  return to_jsonb(o);
end $$;

-- Tout ce que voit la personne connectée dans son établissement.
create or replace function public.org_snapshot() returns jsonb
language sql stable security invoker set search_path = '' as $$
  with me as (select * from public.org_members where user_id = auth.uid())
  select case when not exists (select 1 from me) then null else jsonb_build_object(
    'org', (select to_jsonb(o) from public.organizations o where o.id = (select org_id from me)),
    'me', (select to_jsonb(me) from me),
    'units', coalesce((select jsonb_agg(to_jsonb(u) order by u.position, u.created_at)
                       from public.units u where u.org_id = (select org_id from me)), '[]'::jsonb),
    'members', coalesce((select jsonb_agg(to_jsonb(m) order by m.role, m.display_name)
                         from public.org_members m where m.org_id = (select org_id from me)), '[]'::jsonb),
    'residents', coalesce((select jsonb_agg(to_jsonb(k) || jsonb_build_object(
                             'family', coalesce((select jsonb_agg(jsonb_build_object('display_name', m.display_name, 'relation', m.relation))
                                                 from public.carnet_members m where m.carnet_id = k.id), '[]'::jsonb))
                           order by k.person_name)
                           from public.carnets k where k.org_id = (select org_id from me)), '[]'::jsonb),
    'notes', coalesce((select jsonb_agg(private.note_json(n) order by n.created_at desc)
                       from public.notes n join public.carnets k on k.id = n.carnet_id
                       where k.org_id = (select org_id from me)), '[]'::jsonb),
    'invites', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'display_name', i.display_name,
                                                             'job_title', i.job_title, 'unit_id', i.unit_id,
                                                             'perm', i.perm, 'expires_at', i.expires_at)
                                          order by i.created_at desc)
                         from public.staff_invites i
                         where i.org_id = (select org_id from me) and i.used_at is null and i.expires_at > now()), '[]'::jsonb)
  ) end
$$;

create or replace function public.resident_create(p_name text, p_age int, p_room text, p_unit uuid) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare
  me public.org_members%rowtype := private.my_membership();
  k public.carnets%rowtype;
begin
  if me.user_id is null or me.role <> 'cadre' then
    raise exception 'Seul le cadre de santé peut ouvrir un carnet de résident.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.units where id = p_unit and org_id = me.org_id) then
    raise exception 'Unité inconnue.' using errcode = '22023';
  end if;
  insert into public.carnets (org_id, unit_id, room, person_name, person_age)
  values (me.org_id, p_unit, nullif(btrim(p_room), ''), btrim(p_name), p_age)
  returning * into k;
  return to_jsonb(k);
end $$;

-- Code d'entrée à 6 chiffres pour un nouveau soignant (48 h, usage unique).
create or replace function public.staff_invite_create(p_display_name text, p_job_title text, p_unit uuid, p_perm text)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  me public.org_members%rowtype := private.my_membership();
  v_code text;
  v_inv public.staff_invites%rowtype;
begin
  if me.user_id is null or me.role <> 'cadre' then
    raise exception 'Seul le cadre de santé peut ajouter un membre.' using errcode = '42501';
  end if;
  if p_unit is not null and not exists (select 1 from public.units where id = p_unit and org_id = me.org_id) then
    raise exception 'Unité inconnue.' using errcode = '22023';
  end if;
  loop
    v_code := lpad(((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');
    exit when not exists (select 1 from public.staff_invites
                          where code_hash = private.sha256(v_code) and used_at is null and expires_at > now());
  end loop;
  insert into public.staff_invites (org_id, code_hash, display_name, job_title, unit_id, perm, created_by, expires_at)
  values (me.org_id, private.sha256(v_code), btrim(p_display_name), coalesce(btrim(p_job_title), ''), p_unit, p_perm,
          auth.uid(), now() + interval '48 hours')
  returning * into v_inv;
  return jsonb_build_object('id', v_inv.id, 'code', v_code, 'expires_at', v_inv.expires_at);
end $$;

-- Le soignant entre son code : il rejoint l'établissement avec l'unité et les droits prévus.
create or replace function public.staff_invite_accept(p_code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  i public.staff_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'Connecte-toi d''abord.' using errcode = '42501'; end if;
  if (select count(*) from public.invite_attempts
      where user_id = auth.uid() and not succeeded and created_at > now() - interval '15 minutes') >= 5 then
    raise exception 'Trop d''essais. Réessaie dans 15 minutes.' using errcode = '54000';
  end if;
  if exists (select 1 from public.org_members where user_id = auth.uid()) then
    raise exception 'Ce compte fait déjà partie d''un établissement.' using errcode = '23505';
  end if;

  select * into i from public.staff_invites
  where code_hash = private.sha256(btrim(coalesce(p_code, ''))) and used_at is null and expires_at > now()
  for update;
  if not found then
    insert into public.invite_attempts (user_id, succeeded) values (auth.uid(), false);
    return jsonb_build_object('status', 'invalid');
  end if;

  insert into public.org_members (org_id, user_id, role, display_name, job_title, unit_id, perm)
  values (i.org_id, auth.uid(), 'soignant', i.display_name, i.job_title, i.unit_id, i.perm);
  update public.staff_invites set used_at = now(), used_by = auth.uid() where id = i.id;
  update public.profiles set account_type = 'etab',
    display_name = case when display_name = '' then i.display_name else display_name end
  where id = auth.uid();
  insert into public.invite_attempts (user_id, succeeded) values (auth.uid(), true);
  return jsonb_build_object('status', 'ok');
end $$;

create or replace function public.member_update(p_user uuid, p_unit uuid, p_perm text) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare m public.org_members%rowtype;
begin
  update public.org_members set unit_id = p_unit, perm = p_perm
  where user_id = p_user
    and (p_unit is null or exists (select 1 from public.units u where u.id = p_unit and u.org_id = org_members.org_id))
  returning * into m;
  if not found then raise exception 'Membre introuvable ou non modifiable.' using errcode = '42501'; end if;
  return to_jsonb(m);
end $$;

-- ─── RGPD ───

-- Les consentements donnés, avec leur date (affichés dans « Confidentialité »).
create or replace function public.my_consents() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('kind', kind, 'value', value, 'version', version,
                                               'carnet_id', carnet_id, 'created_at', created_at)
                            order by created_at), '[]'::jsonb)
  from public.consents where user_id = auth.uid()
$$;

create or replace function public.export_my_data() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'exporte_le', now(),
    'email', auth.jwt() ->> 'email',
    'profil', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
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

-- Suppression définitive : les carnets tenus par la personne disparaissent avec
-- leurs notes, partages et journaux. Dans un établissement, les carnets des
-- résidents restent (ils appartiennent à l'établissement).
create or replace function public.delete_my_account() returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Aucun compte connecté.' using errcode = '42501'; end if;
  delete from public.carnets where owner_id = auth.uid() and org_id is null;
  delete from auth.users where id = auth.uid();
end $$;

-- ═════════════════════════ QUI PEUT APPELER QUOI ═════════════════════

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
grant execute on function public.open_share(text) to anon;
grant execute on function public.carnet_invite_preview(text) to anon;
