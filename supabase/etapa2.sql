-- Photos Cozatti — ETAPA 2: fotos, link público do álbum e WhatsApp do fotógrafo
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo inteiro → Run.

-- Novos campos
alter table public.photos add column if not exists file_name text;
alter table public.profiles add column if not exists whatsapp text;

-- ============ ARMAZENAMENTO DAS FOTOS ============
-- "previews": versão com marca d'água, pública (é o que o cliente vê).
-- "originais": arquivo sem marca, privado (entregue só depois da compra).
insert into storage.buckets (id, name, public)
values ('previews', 'previews', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('originais', 'originais', false, 52428800)
on conflict (id) do nothing;

-- Cada fotógrafo só mexe na própria pasta: <id do usuário>/<id do álbum>/arquivo.jpg
drop policy if exists "fotos: dono envia" on storage.objects;
drop policy if exists "fotos: dono lê" on storage.objects;
drop policy if exists "fotos: dono apaga" on storage.objects;

create policy "fotos: dono envia" on storage.objects for insert to authenticated
  with check (bucket_id in ('previews', 'originais') and (storage.foldername(name))[1] = auth.uid()::text);

create policy "fotos: dono lê" on storage.objects for select to authenticated
  using (bucket_id in ('previews', 'originais') and (storage.foldername(name))[1] = auth.uid()::text);

create policy "fotos: dono apaga" on storage.objects for delete to authenticated
  using (bucket_id in ('previews', 'originais') and (storage.foldername(name))[1] = auth.uid()::text);

-- ============ PÁGINA PÚBLICA DO ÁLBUM ============
-- Devolve o álbum, o fotógrafo e as fotos (só a versão com marca d'água)
-- para quem tem o link. Álbuns "não listados" continuam escondidos da busca.
create or replace function public.get_public_album(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  resultado json;
begin
  update albums set views = views + 1
  where id = p_id and status = 'active' and visibility in ('listed', 'unlisted');

  select json_build_object(
    'id', a.id,
    'title', a.title,
    'city', a.city,
    'category', a.category,
    'album_date', a.album_date,
    'price_per_photo', a.price_per_photo,
    'photographer', json_build_object('name', p.full_name, 'whatsapp', p.whatsapp, 'instagram', p.instagram),
    'photos', coalesce((
      select json_agg(json_build_object(
        'id', ph.id, 'preview_path', ph.preview_path, 'width', ph.width, 'height', ph.height
      ) order by ph.created_at)
      from photos ph where ph.album_id = a.id
    ), '[]'::json)
  )
  into resultado
  from albums a
  join profiles p on p.id = a.owner_id
  where a.id = p_id and a.status = 'active' and a.visibility in ('listed', 'unlisted');

  return resultado;
end;
$$;

grant execute on function public.get_public_album(uuid) to anon, authenticated;
