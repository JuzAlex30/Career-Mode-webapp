-- ============================================================
-- ANTI-SPAM: límites de frecuencia por usuario (rate limiting en el servidor).
--
-- El cliente tiene un cooldown, pero un atacante no usa nuestro JS: la defensa
-- real son estos triggers en Postgres. Idempotente (usa create or replace +
-- drop trigger if exists): puedes ejecutarlo varias veces. Ejecútalo una vez en
-- el SQL Editor de Supabase de producción.
-- ============================================================

-- Comentarios: máx 5 por minuto y 60 por hora por usuario.
create or replace function public.check_comment_rate() returns trigger
language plpgsql as $$
declare per_min int; per_hour int;
begin
  select count(*) into per_min from public.shared_comments
    where author_id = new.author_id and created_at > now() - interval '1 minute';
  if per_min >= 5 then
    raise exception 'Vas muy rapido: espera un momento antes de comentar de nuevo.';
  end if;
  select count(*) into per_hour from public.shared_comments
    where author_id = new.author_id and created_at > now() - interval '1 hour';
  if per_hour >= 60 then
    raise exception 'Has comentado demasiado en la ultima hora. Intentalo mas tarde.';
  end if;
  return new;
end; $$;
drop trigger if exists trg_comment_rate on public.shared_comments;
create trigger trg_comment_rate before insert on public.shared_comments
  for each row execute function public.check_comment_rate();

-- Publicaciones: máx 25 carreras compartidas por usuario (anti-flood).
-- publish() hace upsert por share_id; re-publicar la misma carrera no cuenta.
create or replace function public.check_share_limit() returns trigger
language plpgsql as $$
declare total int;
begin
  if exists (select 1 from public.shared_careers where share_id = new.share_id) then
    return new;
  end if;
  select count(*) into total from public.shared_careers where owner_id = new.owner_id;
  if total >= 25 then
    raise exception 'Has alcanzado el maximo de carreras publicadas.';
  end if;
  return new;
end; $$;
drop trigger if exists trg_share_limit on public.shared_careers;
create trigger trg_share_limit before insert on public.shared_careers
  for each row execute function public.check_share_limit();

-- Nota: la creación masiva de cuentas la limita Supabase en Authentication
-- (rate limits de OTP/signup por IP). Revisa Auth > Rate Limits en el panel
-- si quieres endurecerlos antes del lanzamiento.
