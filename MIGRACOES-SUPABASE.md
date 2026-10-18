# Migrações automatizadas: site-financa

Este repositório utiliza Supabase CLI via GitHub Actions, com execução **manual** para evitar alterações acidentais no banco de produção. O código é público; **nunca** adicione a senha do banco ou seu access token a arquivos do repositório ou ao chat.

## Configuração única

1. Em [Supabase Access Tokens](https://supabase.com/dashboard/account/tokens), crie um Personal Access Token com as menores permissões disponíveis para o projeto (se houver token com escopo restrito, prefira-o).
2. Use a senha **do banco de dados do projeto** (a senha definida na criação do projeto, ou redefinida no painel, se necessário). Não é a senha de login do site.
3. Em [GitHub Repository Settings](https://github.com/pedrohlimadev/site-financa/settings/environments), crie o ambiente `supabase-production`. Configure a proteção de implantação conforme seu plano e as opções disponíveis.
4. Cadastre nele os **environment secrets**:
   - `SUPABASE_ACCESS_TOKEN`: o token do painel Supabase.
   - `SUPABASE_DB_PASSWORD`: a senha do banco Supabase.
5. Abra [Actions → Supabase Database Migrations](https://github.com/pedrohlimadev/site-financa/actions/workflows/supabase-migrations.yml), clique **Run workflow**, escolha `preview` e confira a saída.
6. Se a prévia estiver correta, rode novamente escolhendo `apply` para aplicar migrações.

## Primeira migração e banco já existente

O arquivo `supabase/migrations/20261018000100_initial_finance_documents.sql` corresponde ao SQL que já foi executado manualmente no Supabase. Ele é idempotente: `create table if not exists`, políticas recriadas. Não apaga a tabela nem seus registros. Na primeira execução, a CLI irá registrar a versão no histórico. **Antes de aplicar, verifique que o banco possui somente o esquema esperado e revise a prévia**. Caso o schema existente tenha sido alterado depois, faça primeiro um `supabase db pull` para gerar baseline a partir do banco real.

## Como criar novas migrações

Crie um arquivo SQL adicional em `supabase/migrations` com versão temporal crescente (ex.: `20261019090000_create_cards.sql`). Rode em `preview`, revise e, depois, `apply`.

Nunca use `db reset --linked` neste projeto: pode apagar dados de produção. O workflow não realiza reset, nem importa compras/dados pessoais.

## Custo

GitHub Actions em repositório público e Supabase Free podem ser usados dentro das condições e cotas vigentes. Este fluxo não requer um serviço pago. Evite ativar upgrades, recursos cobrados ou runners pagos.

## Limitações

A preparação do fluxo não significa que os secrets foram configurados nem que o banco foi modificado. Sem os secrets, o GitHub Actions falhará antes de conectar. Uma integração direta do assistente com a conta administrativa Supabase não está configurada.
