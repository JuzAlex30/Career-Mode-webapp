# Edge Function: `delete-account`

Borra la cuenta del usuario autenticado y, en cascada, todos sus datos
(`careers`, `shared_careers`, `shared_comments`). Es lo que necesita el botón
**«Eliminar mi cuenta y datos»** de la app para cumplir el derecho de supresión
del RGPD (art. 17) por completo.

## Por qué hace falta una Edge Function

El cliente (con la *anon key*) puede borrar **sus propias filas** vía RLS, y de
hecho la app lo hace antes de llamar aquí. Pero **no puede** borrar el registro
de `auth.users` (eso requiere la `service_role` key, que nunca debe estar en el
navegador). Esta función corre en el servidor de Supabase con esa key.

## Despliegue (una sola vez)

Necesitas la [CLI de Supabase](https://supabase.com/docs/guides/cli) y haber
hecho `supabase login` y `supabase link --project-ref tqyehsahytpdafehapoi`.

Desde la raíz del repo:

```bash
supabase functions deploy delete-account
```

No hay que configurar secrets: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se
inyectan automáticamente en el entorno de Edge Functions.

## Comprobar que funciona

1. En la app, inicia sesión y entra en **Comunidad → Privacidad y cuenta →
   Eliminar mi cuenta y datos**.
2. Tras confirmar, deberías ver el toast «Cuenta y datos eliminados».
   - Si la función **no** está desplegada, la app borra igualmente tus datos y
     muestra «Tus datos se han eliminado…», pero el registro de acceso (email)
     permanecería en `auth.users` hasta desplegarla. Por eso conviene desplegarla
     antes del lanzamiento público.

## Seguridad

- El id del usuario a borrar se deriva **de su propio JWT** (`getUser(jwt)`), no
  de ningún parámetro del cliente: nadie puede borrar la cuenta de otro.
- La `service_role` key vive solo en el entorno de la función, nunca en el bundle.
