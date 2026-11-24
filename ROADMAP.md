# Roadmap do Listry

O primeiro marco é uma versão hospedada em que os usuários possam confiar para guardar uma coleção pessoal. As fases seguintes ampliam os formatos e só depois introduzem o compartilhamento.

| Fase | Entregas planejadas | Critério de conclusão |
| --- | --- | --- |
| 1 · Fundação para produção | Separar desenvolvimento, homologação e produção. Automatizar lint, testes e build em CI. Publicar com HTTPS, segredos fora do repositório e armazenamento persistente. | Um ambiente limpo consegue publicar uma versão reproduzível. Coleções e críticas sobrevivem a uma nova implantação. |
| 2 · Contas e recuperação | Verificação de e-mail, redefinição de senha, revogação de sessões e gestão de conta. Implantar backups com retenção definida e documentar a restauração. | Uma pessoa recupera a conta sozinha. Um ensaio de restauração recupera a coleção e as críticas em homologação. |
| 3 · Privacidade e operação | Documentar os dados tratados e fornecedores de catálogo. Implementar exportação e exclusão da conta. Monitorar latência, falhas de catálogo e gravações sem registrar senhas, tokens ou textos das críticas. | O usuário exporta os próprios dados. A equipe recebe alertas acionáveis e consegue investigar uma busca indisponível. |
| 4 · Séries e animes | Selecionar provedores com cobertura em português, termos de uso e limites compatíveis. Modelar temporadas, episódios e especiais. Vincular críticas existentes à obra correta com confirmação do usuário. | É possível registrar o último episódio, retomar pelo painel e distinguir adaptações e temporadas de mesmo nome. |
| 5 · Compartilhamento | Oferecer cartões de crítica para stories, listas compartilháveis e controles de visibilidade. Prever denúncia e moderação antes de abrir conteúdo público. | A coleção começa privada. O usuário escolhe o conteúdo publicado e pode revogar um link compartilhado. |

## Decisões que dependem de uso real

- Medir buscas sem resultado, latência dos provedores e conflitos de gravação antes de alterar a arquitetura. Adotar PostgreSQL quando houver necessidade de várias instâncias gravando em paralelo ou de banco gerenciado.
- Validar os fluxos de cadastro, busca, coleção e crítica em celular, por teclado e com leitor de tela nos dois temas antes de cada lançamento público.
- Revisar prioridades depois de cada fase com feedback dos primeiros usuários e incidentes observados.
