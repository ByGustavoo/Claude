# Instruções globais

Valem para todos os projetos. Instruções de um `CLAUDE.md` de projeto são mais
específicas e prevalecem quando houver conflito direto.

## Interface web

Antes de criar ou alterar qualquer interface web, invoque a skill
`elite-web-experience` (ferramenta Skill, `skill: "elite-web-experience"`) e siga o que
ela define.

Isso vale para qualquer tamanho de pedido: páginas, componentes, formulários, modais,
navegação, CSS, layout, tipografia, cores, espaçamento, ícones, textos de interface,
estados e animações — inclusive ajustes pequenos como trocar a cor de um botão.

Vale também quando o pedido chega descrito como tarefa técnica mas termina em mudança
visual: corrigir um bug de layout, ajustar um gráfico, arrumar um alinhamento. O que
decide não é como o pedido foi escrito, e sim se o resultado muda o que a pessoa vê na
tela ou como ela interage.

Não é necessário invocá-la para trabalho que não chega à interface: configuração de
build, rotas de API, tipos, mocks de dados, scripts, testes e git.
