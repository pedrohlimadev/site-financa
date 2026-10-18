# Preparação para Supabase Free — site-financa

O site atual permanece funcionando com os arquivos JSON do GitHub até a migração ser testada.

## Criar banco sem pagar
1. Crie um projeto no [Supabase](https://supabase.com/dashboard) e selecione **Free**. Não faça upgrade.
2. Abra **SQL Editor**, cole o conteúdo de `supabase-schema.sql` e execute.
3. Em **Authentication > Users**, crie o seu usuário ou habilite cadastro por e-mail. Ative confirmação de e-mail se disponibilizada.
4. Em **Project Settings / API Keys**, copie somente **Project URL** e **publishable key**. Nunca envie a chave **secret** ou **service_role** e nunca as inclua em commits.
5. A migração dos dados existentes será feita após conectar a conta: primeiro importar os JSONs antigos com verificação, depois trocar o armazenamento das páginas. Não torne o arquivo `dados.json` público contendo dados reais depois da migração.

## Segurança e custo
- A tabela usa RLS (cada conta só pode ler/escrever a própria linha).
- GitHub Pages continua gratuito. A chave publishable não é secreta, mas depende das políticas RLS.
- O projeto Free pode pausar por inatividade; Supabase não fornece backup automático nesse plano. Mantenha exportação JSON.
- Nunca cadastre tokens GitHub ou credenciais bancárias nos dados financeiros.
- Não inclua configurações de serviço privilegiadas no front-end.

## Estrutura
`finance_documents.monthly_data` representa os lançamentos de `mensal.json`.
`finance_documents.legacy_data` representa os dados do `dados.json`, preservando os dois módulos.
