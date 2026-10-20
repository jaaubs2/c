-- Les humeurs du jour, gardées sur le serveur (et plus seulement sur le téléphone).
--
-- 1. « Comment va Jeanne aujourd'hui » : une humeur par jour et par carnet. Tout le cercle
--    la voit (pour suivre comment va la personne dans le temps) ; elle n'apparaît jamais
--    dans les fiches envoyées aux relais.
-- 2. « Et toi, comment tu te sens » (onglet Moi) : le ressenti de l'aidant, un par jour.
--    Personne d'autre que l'aidant ne peut le lire : ni le cercle, ni l'établissement, ni la mutuelle.

-- ─── 1. Comment va la personne ───
create table public.person_moods (
  carnet_id    uuid not null references public.carnets (id) on delete cascade,
  day          date not null,
  mood         text not null check (mood in ('sereine', 'fatiguee', 'fragile', 'belle')),
  author_id    uuid references auth.users (id) on delete set null,
  author_name  text not null default '' check (char_length(author_name) <= 80),
  updated_at   timestamptz not null default now(),
  primary key (carnet_id, day)
);
alter table public.person_moods enable row level security;

create policy "humeur : lecture" on public.person_moods for select to authenticated
  using (private.can_read_carnet(carnet_id));
create policy "humeur : ajout" on public.person_moods for insert to authenticated
  with check (private.can_write_carnet(carnet_id) and author_id = auth.uid());
create policy "humeur : modification" on public.person_moods for update to authenticated
  using (private.can_write_carnet(carnet_id)) with check (private.can_write_carnet(carnet_id) and author_id = auth.uid());
create policy "humeur : suppression" on public.person_moods for delete to authenticated
  using (private.can_write_carnet(carnet_id));

-- Choisit l'humeur du jour (p_mood à null : l'efface).
create or replace function public.person_mood_set(p_carnet uuid, p_day date, p_mood text) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare
  v_name text := coalesce((select display_name from public.profiles where id = auth.uid()), '');
  r public.person_moods%rowtype;
begin
  if p_day is null or p_day > current_date + 1 or p_day < current_date - 400 then
    raise exception 'La date n''est pas valable.' using errcode = '22023';
  end if;
  if p_mood is null then
    delete from public.person_moods where carnet_id = p_carnet and day = p_day;
    return null;
  end if;
  insert into public.person_moods (carnet_id, day, mood, author_id, author_name)
  values (p_carnet, p_day, p_mood, auth.uid(), v_name)
  on conflict (carnet_id, day) do update
    set mood = excluded.mood, author_id = excluded.author_id, author_name = excluded.author_name, updated_at = now()
  returning * into r;
  return jsonb_build_object('day', r.day, 'mood', r.mood, 'author_name', r.author_name);
end $$;

-- Les humeurs des p_days derniers jours, de la plus ancienne à la plus récente.
create or replace function public.person_moods_list(p_carnet uuid, p_days int default 30) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('day', m.day, 'mood', m.mood, 'author_name', m.author_name)
                            order by m.day), '[]'::jsonb)
  from public.person_moods m
  where m.carnet_id = p_carnet and m.day > current_date - least(greatest(p_days, 1), 400)
$$;

-- ─── 2. Le ressenti de l'aidant ───
create table public.caregiver_moods (
  user_id     uuid not null references auth.users (id) on delete cascade,
  day         date not null,
  level       smallint not null check (level between 1 and 4),
  updated_at  timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.caregiver_moods enable row level security;

create policy "ressenti : seulement moi" on public.caregiver_moods for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.my_mood_set(p_day date, p_level int) returns void
language plpgsql volatile security invoker set search_path = '' as $$
begin
  if p_day is null or p_day > current_date + 1 or p_day < current_date - 400 then
    raise exception 'La date n''est pas valable.' using errcode = '22023';
  end if;
  if p_level is null then
    delete from public.caregiver_moods where user_id = auth.uid() and day = p_day;
    return;
  end if;
  insert into public.caregiver_moods (user_id, day, level) values (auth.uid(), p_day, p_level)
  on conflict (user_id, day) do update set level = excluded.level, updated_at = now();
end $$;

create or replace function public.my_moods_list(p_days int default 30) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('day', m.day, 'level', m.level) order by m.day), '[]'::jsonb)
  from public.caregiver_moods m
  where m.user_id = auth.uid() and m.day > current_date - least(greatest(p_days, 1), 400)
$$;

-- ─── RGPD : l'export contient aussi les humeurs ───
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
        'humeurs', coalesce((select jsonb_agg(to_jsonb(h) - 'author_id' order by h.day)
                             from public.person_moods h where h.carnet_id = c.id), '[]'::jsonb),
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
                               from public.notes n where n.author_id = auth.uid()), '[]'::jsonb),
    'mon_ressenti', coalesce((select jsonb_agg(jsonb_build_object('jour', m.day, 'niveau', m.level) order by m.day)
                              from public.caregiver_moods m where m.user_id = auth.uid()), '[]'::jsonb)
  )
$$;

-- ─── Droits ───
revoke execute on function public.person_mood_set(uuid, date, text), public.person_moods_list(uuid, int),
                           public.my_mood_set(date, int), public.my_moods_list(int) from public, anon;
grant execute on function public.person_mood_set(uuid, date, text), public.person_moods_list(uuid, int),
                          public.my_mood_set(date, int), public.my_moods_list(int) to authenticated;
grant select, insert, update, delete on public.person_moods, public.caregiver_moods to authenticated;
