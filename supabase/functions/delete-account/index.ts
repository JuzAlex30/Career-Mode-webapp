// Edge Function: delete-account
// Elimina la cuenta del usuario AUTENTICADO (derecho de supresión, RGPD art. 17).
// Borra el usuario de auth.users; las tablas con `on delete cascade`
// (careers, shared_careers, shared_comments) se limpian automáticamente.
//
// Seguridad: usa la SERVICE_ROLE key SOLO en el servidor (nunca en el cliente).
// El usuario solo puede borrarse a SÍ MISMO: el id se deriva de su propio JWT,
// no de ningún parámetro que el cliente pueda falsificar.
//
// Despliegue (una vez, desde la raíz del repo con la CLI de Supabase):
//   supabase functions deploy delete-account
// (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan solas en el entorno
//  de Edge Functions; no hay que configurar secrets.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "No autorizado" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  // El id del usuario se obtiene de SU PROPIO token: no se puede borrar a otro.
  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data?.user) return json({ error: "Sesión no válida" }, 401);

  const { error: delErr } = await admin.auth.admin.deleteUser(data.user.id);
  if (delErr) return json({ error: delErr.message }, 500);

  return json({ ok: true });
});
