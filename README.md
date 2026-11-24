# Listry

O Listry é um diário cultural para guardar o que você quer ler ou assistir e registrar o que achou de cada obra.

Explore o catálogo ou crie uma conta para montar sua coleção de livros e filmes. Você pode retomar uma leitura pela página em que parou, marcar um filme como assistido e escrever críticas com nota sobre livros, filmes, séries e animes.

[Abrir o Listry](https://listry.onrender.com)

## Executar

Requer Node.js 22.16 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. Para testar a versão de produção, execute `npm run build` e `npm start`. Os comandos `npm run lint` e `npm run typecheck` verificam o código.

## Testar com uma conta pronta

Depois de `npm ci`, execute `npm run demo:setup` e `npm run dev`. Em **Entrar**, use **demo@listry.test** e a senha **Listry-Demo-2026!**. A coleção começa vazia na primeira instalação. Repetir o preparo mantém as alterações feitas pela conta. As credenciais são públicas e destinadas ao ambiente local de demonstração; use uma base separada para a hospedagem pública.

### Roteiro de teste manual

| Fluxo | Ação | Resultado esperado |
| --- | --- | --- |
| Visitante | Em janela anônima, abra o catálogo e a ficha de um livro. | A ficha abre e convida a entrar para salvar. |
| Login | Entre com a conta demo. Na primeira utilização, abra o painel. | O menu mostra **Minha conta** e **Adicionar à coleção**. Uma coleção nova começa sem progresso. |
| Busca de livros | Envie uma consulta com **Enter** e outra pelo botão **Buscar livros**. Tente digitar enquanto aguarda cada resposta. | O campo fica bloqueado durante cada busca e volta a aceitar texto ao terminar. |
| Livros | Adicione um título, marque **Lendo**, registre a página e recarregue. | O livro aparece em **Continuar de onde parei**, com o progresso salvo. A coleção mostra a capa quando disponível. |
| Filmes | Busque **Harry Potter**, selecione um filme e marque **Assistindo**. | A busca retorna vários títulos da franquia, com ano e capa quando disponíveis. O filme salvo aparece no filtro de filmes com a situação escolhida. |
| Cadastro manual | Adicione um livro pelo formulário manual e tente repetir título e autoria. | A primeira inclusão funciona e a duplicata recebe uma mensagem. |
| Críticas | Experimente 249 caracteres e depois 250, com título, formato e nota. | O botão só permite salvar a partir de 250 caracteres válidos, e a crítica persiste após recarregar. |
| Persistência e saída | Ative o tema escuro, reinicie o servidor usando o mesmo diretório, abra a coleção e saia da conta. | O tema e os itens persistem. Após sair, o botão de adicionar volta a exigir login. |
| Privacidade entre contas | Salve um item na demo. Em uma janela anônima, entre com uma segunda conta recém-criada e abra a coleção. | A coleção da segunda conta começa vazia. O item continua salvo na demo. |

Para as verificações automáticas, execute `npm test`, `npm run lint`, `npm run typecheck` e `npm run build`.

## Estrutura do projeto

Desenvolvido com Next.js App Router, React e TypeScript estrito.

- `src/app` contém as rotas, metadados, estados de carregamento e erro e as Server Actions.
- `src/components` reúne o painel, a coleção, os formulários e a navegação.
- `src/lib/books.ts` define o catálogo editorial e os tipos de domínio.
- `src/lib/library.ts` lê a coleção e as críticas do visitante ou da conta autenticada. Ao criar uma conta, o SQLite transfere os registros do navegador em uma única transação.
- `src/lib/auth.ts` gerencia sessões de 30 dias com tokens aleatórios em cookies HttpOnly e hashes dos tokens no banco. O logout revoga a sessão atual. O login usa e-mail e senha e permite acessar os dados da conta em outro navegador.
- `public` contém as capas autorais e a gravura do painel. As contagens de páginas são referências das edições de exemplo.

O painel e as fichas de livros usam Server Components para ler a coleção da sessão. Filtros, diálogos e favoritos têm interatividade no cliente. As mutações são validadas no servidor e revalidam as páginas afetadas.

## Persistência

Cada instalação usa seu próprio SQLite. Ao executar o Listry, o primeiro acesso que precisa do banco cria `data/estante.sqlite`. Os dados sobrevivem a reinícios. Os comandos de desenvolvimento e produção escutam apenas em `127.0.0.1` por padrão. As buscas e imagens de catálogo usam serviços externos.

O banco fica na máquina que executa o servidor Next.js. Em uma hospedagem compartilhada, cada conta acessa sua coleção no banco do servidor. No navegador ficam os cookies de sessão e preferências.

Para escolher outro diretório, configure `ESTANTE_DATA_DIR` em `.env.local` com um caminho absoluto e privado, fora de `public/`. Para testes descartáveis, use um diretório temporário separado. A pasta padrão `data/` está excluída do Git. As senhas usam scrypt; o arquivo SQLite contém nomes, e-mails, coleção e críticas legíveis por quem tiver acesso ao disco. Proteja o diretório com as permissões da sua conta no sistema operacional.

Para copiar ou mover uma instalação, encerre o servidor antes de copiar o diretório de dados inteiro, incluindo eventuais arquivos WAL. Hospedagem com disco efêmero exige um volume persistente ou outro banco.

Consulte as próximas etapas no [roadmap do Listry](ROADMAP.md).

## Publicar na Vercel com Turso

Importe o repositório na Vercel, escolha o plano Hobby e mantenha o preset Next.js. Em **Environment Variables**, configure `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` no ambiente **Production** antes do deploy. Ao migrar uma instalação existente, use o mesmo banco Turso para preservar contas, coleções e críticas. Para testar alterações em Preview, use um banco separado.

## Publicar gratuitamente com Render e Turso

1. Crie um banco libSQL no plano **Free** do Turso. Copie a URL do banco e gere um token de leitura e escrita para esse banco.
2. Envie o projeto ao seu repositório GitHub com o arquivo `render.yaml` na raiz. A base local e os arquivos de ambiente ficam fora do Git.
3. No Render, abra **New → Blueprint**, conecte o repositório e confira o serviço **listry** no plano **Free**. Para manter custo zero, use um workspace gratuito sem forma de pagamento e o endereço fornecido pelo Render.
4. Preencha `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` nas variáveis privadas do serviço. Inicie o deploy. As tabelas são criadas no primeiro acesso ao banco.
5. Abra o endereço HTTPS gerado, cadastre uma conta, salve um item e faça um novo deploy. Entre novamente e confira o item na coleção.

O site público usa o banco remoto para contas, sessões, coleções e críticas. A instalação local continua usando o arquivo SQLite por padrão. A conta demo é exclusiva da instalação local. O serviço gratuito pode demorar a responder na primeira visita após um período de inatividade. Consulte os [limites do Render Free](https://render.com/docs/free) e o [plano gratuito do Turso](https://turso.tech/pricing).
