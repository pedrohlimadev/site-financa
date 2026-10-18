# Visão de produto — site-financa

Objetivo: transformar a planilha pessoal **Gastos Pessoais — Pedro** em um aplicativo web gratuito, hospedado no GitHub Pages, com Supabase Free posteriormente. **Não copiar os dados financeiros pessoais da planilha para o repositório público.**

## Navegação principal
1. Dashboard (página inicial): mês selecionado, receita prevista/realizada, despesas previstas/realizadas, saldo, contas pendentes, fatura do cartão, gráficos dos últimos 6/12 meses e distribuição por categoria.
2. Controle mensal: tabela editável diretamente por linha, filtros por mês, categoria, forma de pagamento e status; receitas, despesas, pagamentos, recorrências e lançamentos pontuais.
3. Cartões: cartões configuráveis; compras à vista, parceladas e assinaturas; primeira fatura, fechamento, vencimento, previsão de faturas e pagamentos. Registrar pagamento da fatura como transferência/baixa de obrigação, sem duplicar despesas.
4. Planejamento: linha do tempo para 12–36 meses, salários e rendas variáveis, despesas recorrentes, término de parcelas, metas e cenários.
5. Investimentos: registros de aportes, resgates, saldos, categorias de ativos, sem cotação paga.
6. Configurações: categorias, contas, recorrências, preferências, exportação/importação JSON, login/segurança.

## Referência funcional da planilha
Google Sheets: `Gastos Pessoais — Pedro`, com abas Configurações, Cartões, Planejamento, Investimentos e meses individuais.
A planilha contém categorias, meios de pagamento, contas/cartões, entradas e saídas mensais, compras parceladas e recorrentes.
Não modificar a planilha original, apenas consultá-la como referência.

## Regras essenciais
- Competência mensal separada de data de transação, vencimento e data de pagamento.
- Recorrência com data de início, fim opcional e exceção por mês (alterar somente este mês / todos os futuros).
- Parcelas com arredondamento em centavos e ajuste da última parcela.
- Compra no cartão gera obrigação por fatura, não uma segunda saída ao pagar a fatura.
- Não contar automaticamente transferências entre contas como receita/despesa.
- Valores financeiros em centavos inteiros; exibição em BRL e datas pt-BR.
- Estado previsto vs realizado: pagamento individual sem apagar previsão.
- Backup JSON disponível mesmo após migrar banco.
- Projeto deve continuar 100% Free, sem cartão de crédito obrigatório e sem serviços pagos.
- O repositório GitHub é público: nunca armazenar movimentações reais, segredos ou tokens nele.
- Supabase: autenticação e Row Level Security por usuário; não usar service_role no front-end.
- Manter interface responsiva para celular e desktop.

## Próximas etapas
1. Criar telas e navegação, com dados demonstrativos claramente identificados e sem migrar dados privados.
2. Modelar cartão e lançamentos unificados, com testes de dupla contagem e parcelamentos.
3. Configurar Supabase pela conta do titular, migrar dados privados e validar RLS.
4. Desativar gravação de dados financeiros nos JSON públicos, depois de confirmar a migração.
