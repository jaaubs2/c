-- ════════════════════════════════════════════════════════════════════
-- Le carnet vivant — IA (à exécuter après 20260925000000_init.sql)
--
--   • traçabilité : chaque note dit si elle a été dictée ou écrite, et quelle
--     rubrique l'IA avait proposée (l'humain garde toujours le dernier mot) ;
--   • fiche de transmission : les « choses à savoir » rédigées avec l'IA et
--     relues par l'aidant sont enregistrées avec le lien ;
--   • quota : un nombre maximal d'appels à l'IA par personne et par jour,
--     pour maîtriser les coûts et limiter les abus.
-- ════════════════════════════════════════════════════════════════════

-- ─── Traçabilité des notes ───
alter table public.notes
  add column input_mode text not null default 'text' check (input_mode in ('text', 'voice')),
  add column ai_category text check (ai_category is null or ai_category in
    ('histoire', 'habitudes', 'apaise', 'parler', 'gouts', 'sante', 'proches'));

create or replace function private.note_json(n public.notes) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'id', n.id, 'carnet_id', n.carnet_id, 'category', n.category, 'body', n.body,
    'author_id', n.author_id, 'author_name', n.author_name, 'author_role', n.author_role,
    'status', n.status, 'confirmed_at', n.confirmed_at, 'archived_at', n.archived_at,
    'input_mode', n.input_mode, 'ai_category', n.ai_category,
    'created_at', n.created_at, 'updated_at', n.updated_at)
$$;

drop function public.note_add(uuid, text, text);
create function public.note_add(
  p_carnet uuid, p_category text, p_body text,
  p_input_mode text default 'text', p_ai_category text default null
) returns jsonb
language sql volatile security invoker set search_path = '' as $$
  insert into public.notes (carnet_id, author_id, category, body, input_mode, ai_category)
  values (p_carnet, auth.uid(), p_category, btrim(p_body), coalesce(p_input_mode, 'text'), p_ai_category)
  returning private.note_json(notes.*)
$$;

-- ─── Fiche rédigée avec l'IA, relue par l'aidant ───
-- Forme : { "essentials": [ { "category": "parler", "text": "…" }, … ] }
alter table public.shares add column ai_summary jsonb;

create or replace function private.valid_summary(s jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select s is null or (
    jsonb_typeof(s) = 'object'
    and jsonb_typeof(s -> 'essentials') = 'array'
    and jsonb_array_length(s -> 'essentials') between 1 and 5
    and octet_length(s::text) <= 4000
    and not exists (
      select 1 from jsonb_array_elements(s -> 'essentials') e
      where jsonb_typeof(e -> 'text') is distinct from 'string'
         or char_length(e ->> 'text') not between 1 and 300
         or (e ->> 'category') not in ('histoire', 'habitudes', 'apaise', 'parler', 'gouts', 'sante', 'proches'))
  )
$$;

alter table public.shares add constraint shares_ai_summary_valid check (private.valid_summary(ai_summary));

drop function public.create_share(uuid, text, text, text[], int, text);
create function public.create_share(
  p_carnet uuid, p_recipient_type text, p_recipient_name text, p_categories text[],
  p_expires_in_days int default 7, p_intro text default null, p_ai_summary jsonb default null
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
  if not private.valid_summary(p_ai_summary) then
    raise exception 'Le résumé de la fiche n''est pas valide.' using errcode = '22023';
  end if;
  insert into public.shares (carnet_id, created_by, from_name, recipient_type, recipient_name, categories, intro,
                             ai_summary, token_hash, expires_at)
  values (p_carnet, auth.uid(), coalesce((select display_name from public.profiles where id = auth.uid()), ''),
          p_recipient_type, coalesce(btrim(p_recipient_name), ''), p_categories, nullif(btrim(p_intro), ''),
          p_ai_summary, private.sha256(v_token), now() + make_interval(days => p_expires_in_days))
  returning * into v_share;
  return jsonb_build_object('id', v_share.id, 'token', v_token, 'expires_at', v_share.expires_at);
end $$;

-- open_share renvoie aussi les « choses à savoir » relues par l'aidant.
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
                                'essentials', coalesce((
                                  select jsonb_agg(e) from jsonb_array_elements(s.ai_summary -> 'essentials') e
                                  where (e ->> 'category') = any (s.categories)), '[]'::jsonb),
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

-- ─── Quota d'appels à l'IA ───
create table public.ai_usage (
  user_id  uuid not null references auth.users (id) on delete cascade,
  day      date not null default current_date,
  calls    int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
create policy "usage IA : lecture" on public.ai_usage for select to authenticated using (user_id = auth.uid());
revoke all on public.ai_usage from anon;

-- Compte un appel de la personne connectée ; refuse au-delà de la limite du jour
-- (plafonnée à 500, même si l'appelant demande plus).
create or replace function public.ai_quota_hit(p_limit int default 150) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare n int;
begin
  if auth.uid() is null then raise exception 'Connecte-toi d''abord.' using errcode = '42501'; end if;
  insert into public.ai_usage (user_id, day, calls) values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set calls = public.ai_usage.calls + 1
  returning calls into n;
  if n > least(greatest(coalesce(p_limit, 150), 1), 500) then
    raise exception 'Limite d''utilisation de l''IA atteinte pour aujourd''hui. Réessaie demain.' using errcode = '54000';
  end if;
  return jsonb_build_object('calls', n);
end $$;

-- ─── Qui peut appeler quoi ───
revoke execute on function public.note_add(uuid, text, text, text, text) from public, anon;
revoke execute on function public.create_share(uuid, text, text, text[], int, text, jsonb) from public, anon;
revoke execute on function public.ai_quota_hit(int) from public, anon;
grant execute on function public.note_add(uuid, text, text, text, text) to authenticated;
grant execute on function public.create_share(uuid, text, text, text[], int, text, jsonb) to authenticated;
grant execute on function public.ai_quota_hit(int) to authenticated;
grant execute on function public.open_share(text) to anon, authenticated;
revoke all on function private.valid_summary(jsonb) from public;
grant execute on function private.valid_summary(jsonb) to authenticated;
