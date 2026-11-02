# Bet Tracker

App para registrar apuestas (simples y combinadas), seguir su estado y ver
métricas. Construida con React + Vite + Tailwind CSS y sincronizada con
Supabase (auth por email/contraseña y base de datos Postgres con RLS).

## 1. Crear el proyecto en Supabase

1. Entra en <https://supabase.com> y crea una cuenta si no tienes.
2. Pulsa **New project**, elige nombre, contraseña de base de datos y región.
   Espera a que termine de aprovisionarse.
3. Ve a **Project Settings → API** y copia:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** / **Publishable key**
4. Abre **SQL Editor → New query**, pega el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
   - El script crea tablas, políticas RLS, la función `create_bet` y los
     `GRANT` explícitos para `authenticated`.
5. En **Project Settings → API / Data API**:
   - Activa **Enable automatic RLS** (red de seguridad para tablas futuras).
   - Deja **desactivado** **Automatically expose new tables**. Desde el
     30/10/2026 Supabase no da acceso a la Data API a las tablas nuevas por
     defecto; por eso `schema.sql` incluye los `GRANT` necesarios.
6. Ve a **Authentication → Providers → Email** y confirma que está habilitado.
   - Si quieres probar rápido sin confirmar correos, desactiva
     **Confirm email** en **Authentication → Sign In / Providers**.
   - Si lo dejas activado, tras registrarte deberás abrir el enlace que llega
     al correo antes de iniciar sesión.
7. (Opcional) En **Authentication → URL Configuration**, pon
   `http://localhost:5173` como **Site URL** y añádelo también en
   **Redirect URLs**. Es necesario para los enlaces de recuperación de
   contraseña.

## 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Puedes basarte en [`.env.example`](.env.example). La `anon key` es pública y
segura de exponer en el cliente; la protección real la da RLS.

## 3. Desarrollo

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>, crea una cuenta y empieza a registrar apuestas.

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de producción.
- `npm run preview`: previsualiza el build.
- `npm run lint`: ESLint.
- `npm run test`: tests de los cálculos de apuestas (runner nativo de Node).

## Modelo de datos

- `bets`: apuesta (cuota total, monto, estado, cash out y fecha).
- `bet_legs`: selecciones de cada apuesta (partido, competición, mercado,
  selección y cuota).
- Cada fila tiene `user_id` y RLS garantiza que solo el dueño pueda leer o
  modificar sus datos.
- La función `create_bet` inserta la apuesta y sus selecciones de forma atómica.
- La función `update_bet` actualiza la apuesta y reemplaza sus selecciones de
  forma atómica.

## Contraseñas

- **Olvidé mi contraseña**: desde la pantalla de acceso, el enlace envía un
  correo con una URL de recuperación (requiere configurar las Redirect URLs).
- **Cambiar contraseña**: con la sesión iniciada, botón **Cuenta** en la
  cabecera. Pide la contraseña actual antes de actualizarla.
