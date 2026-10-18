# Meu Horizonte — Finanças do Pedro

Painel estático de despesas, antecipações do Fastback e planejamento para 2029. Sem dependências de terceiros. O arquivo `dados.json` é a fonte persistente dos dados. O botão **Salvar no GitHub** atualiza o arquivo pela API do GitHub; cada salvamento cria uma versão no histórico do repositório.

## Publicar no GitHub Pages

1. Acesse **Settings → Pages** deste repositório.
2. Em **Build and deployment**, escolha **Deploy from a branch**.
3. Selecione **main** e **/(root)** e clique em **Save**.
4. Aguarde o GitHub informar o endereço publicado.

Endereço esperado após ativação: https://pedrohlimadev.github.io/site-financa/

O repositório foi encontrado privado. GitHub Pages em repositórios privados depende do plano da conta. Se a opção estiver bloqueada, será necessário um plano compatível ou tornar este repositório público nas configurações. Não alteramos sua visibilidade automaticamente. Em Pages comum, os arquivos publicados, inclusive os valores do JSON, podem ser acessados por visitantes.

## Conectar e salvar

1. Crie um **fine-grained personal access token** em https://github.com/settings/personal-access-tokens/new.
2. Selecione apenas `site-financa`, configure uma expiração e permita **Repository permissions → Contents → Read and write**.
3. Na página, abra **Conectar ao GitHub para salvar**, cole o token e clique em **Conectar e carregar**.
4. Edite os valores e clique em **Salvar no GitHub**. Espere a mensagem de sucesso antes de fechar.

O token só fica em memória na página e é enviado exclusivamente a `https://api.github.com`. Não é salvo no JSON, código, localStorage ou backup. Reabrir/recarregar a página exige reconectar. Não envie o token pelo chat nem o inclua no repositório. O token permite modificar conteúdo deste repositório; não conceda acesso a outros projetos.

Se o arquivo tiver sido alterado em outro dispositivo, o salvamento com a versão antiga será recusado. Baixe seu backup, recarregue os dados e reaplique suas alterações. Uma falha de rede preserva o painel aberto, mas não garante gravação remota: confira o status. A versão publicada do JSON pode atrasar durante uma publicação; conectar carrega a versão atual pela API.

## Backup

**Baixar backup** exporta o estado atual, inclusive alterações ainda não salvas. **Restaurar backup** valida e carrega o arquivo no painel; para persistir essa restauração, clique em **Salvar no GitHub**. O backup não é necessário para o uso cotidiano.

## Dados e cálculos

- Despesas iniciais: R$ 3.629,90/mês, incluindo R$ 90 estimados para Wispr Flow.
- Uma assinatura ChatGPT de R$ 99,90; Cursor de R$ 360 informado pelo usuário.
- Prestação normal do carro: R$ 2.923 pagos pela mãe, fora dos gastos pessoais.
- A responsabilidade pelas antecipações pode ser simulada no painel.
- Antecipações estimadas de novembro/2026 a outubro/2027: parcela 45 até 34, pela taxa de 1,77997719767% ao mês. O banco determina os valores efetivos.
- A reserva futura é uma simulação sem rendimentos; não representa sobra de renda confirmada.

## Verificação

Execute `node --check app.js`, `node --check sync.js` e `node test-sync.cjs`. Os testes usam respostas simuladas e não alteram o GitHub. A gravação autenticada pelo navegador deve ser conferida após ativar o Pages e conectar sua credencial.
