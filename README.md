# Manos Unidas VE — Frontend (Next.js + TypeScript + Supabase)

Plataforma para coordinar voluntarios e inventario (medicamentos, insumos
quirúrgicos y comida) en los centros de acopio tras el terremoto en Venezuela.

Este paquete contiene **solo el frontend** (Next.js 14, App Router,
TypeScript, Tailwind, framer-motion) ya conectado a los clientes de Supabase.
Tú configuras el proyecto de Supabase (Auth + tablas) con el esquema de abajo.

## 1. Crear el proyecto

```bash
# Si prefieres partir de cero con create-next-app y luego pegar los archivos:
npx create-next-app@14 manos-unidas-ve --typescript --tailwind --app --src-dir --import-alias "@/*"
cd manos-unidas-ve

# Si ya tienes esta carpeta descomprimida, solo entra en ella:
cd ayuda-terremoto
```

## 2. Instalar dependencias

```bash
npm install
```

(El `package.json` incluido ya trae: `@supabase/supabase-js`,
`@supabase/ssr`, `framer-motion`, `lucide-react`, `clsx`.)

## 3. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa con los datos de tu
proyecto de Supabase (Project Settings → API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 4. Esquema de base de datos (ejecútalo en el SQL Editor de Supabase)

```sql
-- Perfiles con rol (organizador y despachador se crean manualmente aquí)
create type rol_usuario as enum ('usuario', 'organizador', 'despachador');

create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  rol rol_usuario not null default 'usuario',
  created_at timestamptz default now()
);

-- Voluntarios (se registran desde el formulario público)
create table voluntarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  cedula text not null,
  telefono text not null,
  email text not null,
  ciudad text not null,
  disponibilidad text not null,
  habilidades text not null,
  experiencia_previa boolean default false,
  vehiculo_propio boolean default false,
  created_at timestamptz default now()
);

-- Inventario por categoría
create type categoria_inventario as enum ('medicamentos', 'insumos', 'comida');

create table inventario (
  id uuid primary key default gen_random_uuid(),
  categoria categoria_inventario not null,
  nombre text not null,
  cantidad integer not null default 0,
  unidad text default 'unidades',
  lote text,
  vencimiento date,
  ubicacion text,
  updated_at timestamptz default now()
);

-- Registro diario de movimientos (ingresos y salidas)
create type tipo_movimiento as enum ('ingreso', 'salida');

create table movimientos (
  id uuid primary key default gen_random_uuid(),
  categoria categoria_inventario not null,
  producto_nombre text not null,
  tipo tipo_movimiento not null,
  cantidad integer not null,
  destino text,
  responsable text,
  created_at timestamptz default now()
);

-- Trigger: cuando un usuario nuevo se autentica, crear su perfil "usuario"
create function public.crear_perfil()
returns trigger as $$
begin
  insert into public.perfiles (id, rol) values (new.id, 'usuario');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.crear_perfil();
```

### Crear organizadores y despachadores

1. Crea el usuario desde **Authentication → Users → Add user** en Supabase.
2. Luego, en la tabla `perfiles`, cambia su `rol` a `organizador` o
   `despachador` manualmente.

### Políticas RLS recomendadas (resumen)

- `voluntarios`: lectura pública, escritura solo del propio usuario (`auth.uid() = id`).
- `inventario`: lectura pública; escritura solo si el perfil del usuario es
  `organizador` (insertar) o `despachador` (actualizar cantidad).
- `movimientos`: lectura pública; inserción solo `organizador`/`despachador`.

## 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`.

## 6. Estructura de carpetas

```
ayuda-terremoto/
├─ public/
│  └─ logo.png
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                 → Landing
│  │  ├─ globals.css
│  │  ├─ login/page.tsx
│  │  ├─ registro/page.tsx        → Formulario de voluntario
│  │  ├─ voluntarios/page.tsx     → Directorio público
│  │  ├─ organizador/page.tsx     → Ingreso de inventario + voluntarios
│  │  └─ despachador/page.tsx     → Salida de inventario + voluntarios
│  ├─ components/
│  │  ├─ ui/ (Button, Card, Input, Select, Badge, Logo, RibbonSignature)
│  │  ├─ layout/ (Navbar, Footer)
│  │  └─ dashboard/ (CategoriaTabs, MovementForm, InventoryTable,
│  │                  MovementLog, VoluntarioCard, DashboardHeader)
│  ├─ lib/
│  │  ├─ supabase/client.ts
│  │  ├─ supabase/server.ts
│  │  └─ utils.ts
│  └─ types/index.ts
├─ tailwind.config.ts
├─ next.config.js
├─ package.json
└─ .env.local.example
```

## Sistema de diseño

- **Colores**: oro `#F2B705`, azul `#1A3FA0`, rojo `#D62839` (los tres tonos
  del logo), fondo crema `#FBFAF6`, tinta `#1E2433`.
- **Tipografía**: Spectral (display, cálida y serena) + Inter (texto e
  interfaz).
- **Elemento distintivo**: `RibbonSignature`, una cinta de tres trazos que se
  dibuja al cargar la página, eco directo del gesto de la mano del logo.
