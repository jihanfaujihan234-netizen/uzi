# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Komentar online (Supabase)

Komentar di halaman Contact disimpan di Supabase agar terlihat oleh semua pengunjung.

1. Buat project gratis di https://supabase.com.
2. Buka **SQL Editor**, lalu jalankan:

```sql
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  message text not null check (char_length(btrim(message)) between 1 and 1000),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Public can read comments"
  on public.comments for select
  to anon, authenticated
  using (true);

create policy "Public can insert comments"
  on public.comments for insert
  to anon, authenticated
  with check (true);

do $$
begin
  alter publication supabase_realtime add table public.comments;
exception
  when duplicate_object then null;
end $$;
```

3. Salin **Project URL** dan **anon/publishable key** dari Project Settings > API Keys ke `.env.local` (jangan memakai service_role/secret key di frontend):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxx
```

Setelah mengubah `.env.local`, hentikan lalu jalankan ulang `npm run dev` agar Vite memuat variabel baru.

4. Untuk situs yang sudah di-deploy, tambahkan dua variabel yang sama di dashboard Vercel (Settings > Environment Variables), lalu redeploy.

Tanpa konfigurasi ini, form komentar dinonaktifkan karena komentar hanya disimpan di Supabase.

