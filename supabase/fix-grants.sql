-- ============================================================
-- PARCHE: permisos de tabla (GRANT) que faltaban en producción.
--
-- Síntoma detectado: con la anon key pública, las tablas públicas
-- (shared_careers, shared_comments) devolvían "permission denied for table"
-- (código 42501) a los visitantes SIN sesión. Las policies RLS estaban bien,
-- pero faltaba el GRANT base de tabla, así que PostgREST rechazaba antes de
-- evaluar la policy. Resultado: ranking, feed, enlaces #share= y comentarios
-- no se veían para quien no había iniciado sesión.
--
-- Esto NO recrea tablas ni borra datos: solo concede permisos. Es idempotente
-- (puedes ejecutarlo varias veces sin problema). Ejecútalo una vez en el
-- SQL Editor de Supabase de tu proyecto de producción.
-- ============================================================

-- careers: privada. Solo el dueño autenticado (RLS limita a sus filas).
-- IMPORTANTE: NO se concede a 'anon' a propósito (datos privados).
grant select, insert, update, delete on public.careers to authenticated;

-- shared_careers: resumen público de solo lectura para todos; escribe el dueño.
grant select on public.shared_careers to anon, authenticated;
grant insert, update, delete on public.shared_careers to authenticated;

-- shared_comments: lectura pública; escribe/borra el autor autenticado.
grant select on public.shared_comments to anon, authenticated;
grant insert, delete on public.shared_comments to authenticated;
