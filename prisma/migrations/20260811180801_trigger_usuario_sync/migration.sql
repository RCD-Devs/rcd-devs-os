-- SQL crudo (no generado por Prisma): sincroniza auth.users -> public."Usuario".
-- rol_id queda NULL; se asigna a mano desde Supabase Studio (no hay UI de administracion en este spec).
-- El nombre se toma de raw_user_meta_data->>'nombre' si se cargo al crear el usuario en Studio,
-- si no, se usa el email como fallback.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."Usuario" (id, nombre, email, rol_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    new.email,
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
