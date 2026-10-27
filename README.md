# Photos Cozatti

Plataforma para fotógrafos venderem fotos de eventos. O cliente encontra as próprias fotos por selfie e o fotógrafo recebe por Pix.

**Tecnologias:** Next.js 15 (React) · Tailwind CSS · Supabase (banco, login e arquivos) · Netlify (hospedagem)

## O que já funciona (etapa 1)
- Página inicial pública e login/cadastro de fotógrafo
- Painel: Início (ganhos, gráfico, carteira, simulador de taxa, eventos)
- Álbuns: criar, listar e buscar
- Eventos: criar, filtrar por cidade, inscrever-se para fotografar
- Financeiro: saldo, vendas, gráfico de 30 dias e pedido de saque via Pix
- Sem Supabase configurado, o site abre em **modo demonstração** com dados de exemplo

## Próximas etapas
2. Upload de fotos com marca d'água automática
3. Página pública do álbum para o cliente + busca por selfie (reconhecimento facial)
4. Carrinho e pagamento (Pix/cartão) com repasse ao fotógrafo

## Como configurar

### 1. Banco de dados (Supabase)
1. Crie um projeto em https://supabase.com (plano grátis).
2. Abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.

### 2. Hospedagem (Netlify)
1. Na Netlify, abra o site ligado a este repositório (ou **Add new site → Import from GitHub**).
2. Em **Site configuration → Environment variables**, crie:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = chave anon public
3. Faça um novo deploy (**Deploys → Trigger deploy**). A Netlify detecta o Next.js sozinha.
4. No Supabase, em **Authentication → URL Configuration**, coloque o endereço do seu site em **Site URL**.

### 3. Rodar no computador (opcional)
```bash
npm install
cp .env.example .env.local   # e preencha as duas chaves
npm run dev                  # abre em http://localhost:3000
```
