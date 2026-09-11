# Apresentação do Projeto

## 1. Sobre o projeto

Este projeto é um aplicativo mobile chamado **Indigo Finance** ou **Dashboard Financeiro**. Ele ajuda uma pessoa a acompanhar a própria vida financeira pelo celular.

Com o aplicativo, o usuário pode:

- criar uma conta e entrar com e-mail e senha;
- consultar saldo, receitas, despesas e transações recentes;
- cadastrar, editar e excluir transações;
- separar transações por categorias;
- cadastrar cartões de crédito;
- acompanhar limite disponível e fatura;
- pagar uma fatura de cartão;
- consultar e encerrar a própria sessão.

O aplicativo não guarda o cadastro financeiro em um banco dentro do celular. Ele conversa com uma API, que é um serviço remoto responsável por guardar e processar os dados. O aplicativo mostra esses dados e envia para a API as ações feitas pelo usuário.

## 2. Tecnologias utilizadas

### Tecnologias principais

| Tecnologia ou biblioteca | Para que serve neste projeto |
| --- | --- |
| React Native `0.81` | Permite criar telas para Android, iOS e Web usando componentes React. |
| React `19` | Biblioteca usada para montar a interface com componentes, estados e efeitos. |
| Expo `54` | Facilita executar e configurar o aplicativo React Native. |
| Expo Router `6` | Organiza a navegação a partir dos nomes e pastas dos arquivos. |
| TypeScript `5.9` | Adiciona tipos aos dados e ajuda a encontrar erros antes da execução. |
| Axios | Faz chamadas HTTP para a API, como `GET`, `POST`, `PUT` e `DELETE`. |
| `expo-secure-store` | Guarda informações sensíveis localmente, como o token de login. |
| `react-native-safe-area-context` | Evita que conteúdos fiquem atrás do recorte ou da barra do aparelho. |
| `lucide-react-native` | Fornece os ícones usados nos botões e nas telas. |
| `react-native-gifted-charts` | Desenha o gráfico de despesas por categoria no dashboard. |
| React Navigation Bottom Tabs | É utilizado por baixo do Expo Router para as abas inferiores. |
| ESLint e `eslint-config-expo` | Verificam problemas de estilo e possíveis erros no código. |

O `package.json` também contém bibliotecas de suporte do Expo, como `expo-image`, `expo-linear-gradient`, `expo-haptics`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg` e `react-native-worklets`. A configuração geral está em [package.json](package.json) e [app.json](app.json).

### API utilizada

O cliente foi configurado em [src/services/api.ts](src/services/api.ts) para usar esta URL base:

```text
https://dashboard-financeiro-projeto-pi-bac.vercel.app/api
```

Essa API recebe requisições do aplicativo. Por exemplo, `api.get('/cartoes')` significa buscar os cartões no endereço completo formado pela URL base e pelo caminho `/cartoes`.

## 3. Estrutura do projeto

As partes principais do projeto são:

```text
.
├── src/
│   ├── app/                  # Telas e rotas do aplicativo principal
│   │   ├── _layout.tsx       # Layout raiz e proteção das rotas
│   │   ├── index.tsx         # Tela inicial de apresentação
│   │   ├── onboarding.tsx    # Outra tela de onboarding
│   │   ├── login.tsx         # Entrada do usuário
│   │   ├── cadastro.tsx      # Criação de conta
│   │   └── (tabs)/            # Grupo de telas com abas
│   │       ├── _layout.tsx   # Configuração das abas
│   │       ├── index.tsx     # Dashboard
│   │       ├── transacoes.tsx
│   │       ├── cartoes.tsx
│   │       └── perfil.tsx
│   ├── components/           # Componentes reutilizáveis e modais
│   │   ├── ModalTransacao.tsx
│   │   └── ModalNovoCartao.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx   # Estado compartilhado de autenticação
│   ├── services/
│   │   └── api.ts            # Cliente Axios e interceptadores
│   └── @types/
│       └── auth.ts           # Tipos de usuário e autenticação
├── assets/images/            # Ícones e imagens do Expo
├── app-example/              # Exemplo original gerado pelo template do Expo
├── app.json                  # Configuração do aplicativo Expo
├── package.json              # Dependências e comandos
├── tsconfig.json             # Configuração do TypeScript
├── eslint.config.js          # Configuração do ESLint
├── README.md                 # Instruções gerais do projeto
└── biblioteca.md             # Anotações de bibliotecas do projeto
```

A pasta `app-example/` contém uma estrutura de exemplo do template do Expo. As telas financeiras usadas pelo aplicativo estão em `src/app/`, `src/components/`, `src/contexts/` e `src/services/`.

O arquivo [tsconfig.json](tsconfig.json) também cria o atalho `@/*` para representar `src/*`. Por isso, por exemplo, `@/services/api` aponta para `src/services/api.ts`.

## 4. Como o projeto funciona

O funcionamento geral pode ser entendido assim:

1. O Expo inicia a aplicação usando `expo-router/entry`, conforme o campo `main` de [package.json](package.json).
2. O Expo Router encontra as telas dentro de `src/app/`.
3. [src/app/_layout.tsx](src/app/_layout.tsx) cria o `AuthProvider`, que disponibiliza o estado de login para as telas.
4. O contexto tenta recuperar o token e o usuário salvos no `expo-secure-store`.
5. Enquanto isso, aparece um indicador de carregamento.
6. Se existir um usuário salvo, a área `(tabs)` é liberada. Se não existir usuário e alguém tentar entrar nas abas, a aplicação redireciona para `/login`.
7. Depois do login, o dashboard busca transações e o resumo financeiro na API.
8. O usuário pode mudar o mês, atualizar os dados, abrir modais e realizar operações de cadastro, edição, exclusão e pagamento.
9. Depois de uma alteração bem-sucedida, a tela chama uma função de recarregamento para mostrar os dados atualizados.

Há duas telas com aparência de apresentação inicial: [src/app/index.tsx](src/app/index.tsx) e [src/app/onboarding.tsx](src/app/onboarding.tsx). A segunda grava `@IndigoFinance:onboarding_visto`, mas o layout raiz atual não consulta essa chave para decidir a rota. Portanto, não é possível afirmar pelo código que o onboarding seja exibido automaticamente apenas na primeira abertura.

## 5. Principais telas

### Apresentação inicial

**Arquivo:** [src/app/index.tsx](src/app/index.tsx)

É a rota `/`. Mostra três passos com os temas “Controle Total”, “Gráficos Inteligentes” e “Cartões & Limites”. O botão **Pular** vai para o login, e o botão **Próximo** avança pelos passos.

### Onboarding com armazenamento da conclusão

**Arquivo:** [src/app/onboarding.tsx](src/app/onboarding.tsx)

É a rota `/onboarding`. Também apresenta três passos, mas ao concluir ou pular grava no `expo-secure-store` que o onboarding foi visto e usa `router.replace('/login')`.

### Login

**Arquivo:** [src/app/login.tsx](src/app/login.tsx)

Recebe e-mail e senha. Valida se os dois campos foram preenchidos, chama `login` do contexto e encaminha para as abas quando a autenticação dá certo. Em caso de erro, mostra uma mensagem retornada pela API ou uma mensagem padrão.

### Cadastro

**Arquivo:** [src/app/cadastro.tsx](src/app/cadastro.tsx)

Permite informar nome, e-mail, senha e confirmação da senha. Faz validações básicas no próprio celular e envia os dados para `POST /auth/register`. Depois do cadastro, oferece um botão para voltar ao login.

### Dashboard ou Início

**Arquivo:** [src/app/(tabs)/index.tsx](src/app/(tabs)/index.tsx)

Mostra o nome do usuário, um seletor de mês, saldo acumulado, receitas, despesas, gráfico de despesas por categoria e até dez transações recentes. Também possui um botão flutuante para abrir o modal de nova transação.

### Transações

**Arquivo:** [src/app/(tabs)/transacoes.tsx](src/app/(tabs)/transacoes.tsx)

Mostra o extrato. Permite navegar entre meses, pesquisar, filtrar por todas/receitas/despesas, editar uma transação, excluí-la e criar uma nova.

### Cartões

**Arquivo:** [src/app/(tabs)/cartoes.tsx](src/app/(tabs)/cartoes.tsx)

Lista cartões, limite total, limite disponível, fatura atual e datas de fechamento e vencimento. Permite cadastrar cartão, pagar fatura e excluir cartão.

### Perfil

**Arquivo:** [src/app/(tabs)/perfil.tsx](src/app/(tabs)/perfil.tsx)

Exibe nome, e-mail e status da conta. O botão **Sair da Conta** executa o logout e retorna ao login.

## 6. Principais componentes

### `RootLayout` e `RootNavigation`

**Arquivo:** [src/app/_layout.tsx](src/app/_layout.tsx)

`RootLayout` envolve todo o aplicativo com `AuthProvider`. `RootNavigation` observa o usuário, o carregamento e o grupo de rota atual para impedir que uma pessoa não autenticada entre nas abas.

### `TabsLayout`

**Arquivo:** [src/app/(tabs)/_layout.tsx](src/app/(tabs)/_layout.tsx)

Configura a barra inferior com quatro opções: Início, Transações, Cartões e Perfil. Cada opção aponta para um arquivo de tela dentro da mesma pasta.

### `ModalTransacao`

**Arquivo:** [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx)

É um formulário reutilizável para criar ou editar transações. Recebe as propriedades `visivel`, `aoFechar`, `aoSalvarSucesso` e, opcionalmente, `transacaoParaEditar`. Busca categorias e cartões, permite escolher receita ou despesa, criar categoria e alterar ou excluir uma categoria por meio de toque prolongado.

É usado pelo dashboard e pela tela de transações. No dashboard, serve para criar uma transação; na tela de transações, também recebe uma transação selecionada para edição.

### `ModalNovoCartao`

**Arquivo:** [src/components/ModalNovoCartao.tsx](src/components/ModalNovoCartao.tsx)

É o formulário de cadastro de cartão. Recebe `visivel`, `aoFechar` e `aoSalvarSucesso`. Após criar o cartão, chama o callback de sucesso para a tela buscar a lista novamente.

## 7. Principais funções

### `useAuth()`

**Arquivo:** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)

**Objetivo:** permitir que qualquer tela leia o usuário atual, o token, o estado de carregamento e as funções de login e logout.

**Parâmetros:** nenhum.

**Retorno:** o valor do `AuthContext`, com `usuario`, `token`, `carregando`, `login` e `logout`.

**Como funciona:** usa `useContext` para acessar o `AuthContext` criado pelo `AuthProvider`.

**Onde é utilizada:** em [src/app/login.tsx](src/app/login.tsx), [src/app/(tabs)/index.tsx](src/app/(tabs)/index.tsx), [src/app/(tabs)/perfil.tsx](src/app/(tabs)/perfil.tsx) e no próprio layout raiz.

**Por que é importante:** evita passar informações de autenticação manualmente por várias telas.

### `AuthProvider`

**Arquivo:** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)

**Objetivo:** manter e fornecer o estado de autenticação da aplicação.

**Parâmetros:** recebe `children`, que são os componentes colocados dentro do provedor.

**Retorno:** renderiza um `AuthContext.Provider` com os dados e funções de autenticação.

**Como funciona:** ao iniciar, executa `carregarDadosSalvos` dentro de um `useEffect`. Essa função lê `indigo_finance_token` e `indigo_finance_usuario` do armazenamento seguro. Se encontrar os dois, configura o cabeçalho `Authorization` do Axios e restaura o usuário.

**Onde é utilizada:** no `RootLayout`.

**Por que é importante:** mantém a sessão mesmo quando o aplicativo é fechado e aberto novamente.

### `login(email, senha)`

**Arquivo:** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)

**Objetivo:** autenticar uma pessoa na API.

**Parâmetros:** recebe o e-mail e a senha digitados na tela de login.

**Retorno:** retorna uma `Promise<void>`. Ela termina com sucesso quando a API responde corretamente ou lança um erro quando a autenticação falha.

**Como funciona:** normaliza e-mail e senha, envia `POST /auth/login`, pega o token e os dados do usuário da resposta, configura o cabeçalho Bearer, salva token e usuário no `SecureStore` e atualiza os estados do contexto.

**Onde é utilizada:** em `handleLogin`, de [src/app/login.tsx](src/app/login.tsx).

**Por que é importante:** é o ponto que transforma as credenciais digitadas em uma sessão autenticada.

### `logout()`

**Arquivo:** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)

**Objetivo:** encerrar a sessão atual.

**Parâmetros:** nenhum.

**Retorno:** uma operação assíncrona que remove os dados salvos e limpa o estado em memória.

**Como funciona:** apaga token e usuário do `SecureStore`, remove o cabeçalho `Authorization` do Axios e define `token` e `usuario` como `null`.

**Onde é utilizada:** na função `handleLogout` de [src/app/(tabs)/perfil.tsx](src/app/(tabs)/perfil.tsx).

**Por que é importante:** impede que a próxima pessoa usando o aparelho continue com a sessão anterior.

### `RootNavigation()`

**Arquivo:** [src/app/_layout.tsx](src/app/_layout.tsx)

**Objetivo:** proteger a área de abas e redirecionar usuários conforme o estado de autenticação.

**Parâmetros:** nenhum.

**Retorno:** mostra um carregamento enquanto a sessão é recuperada ou renderiza o `Slot` do Expo Router.

**Como funciona:** usa `useSegments()` para descobrir se a rota atual pertence a `(tabs)`. Sem usuário, uma rota de abas leva a `/login`. Com usuário, uma rota fora das abas leva a `/(tabs)`.

**Onde é utilizada:** pelo `RootLayout`.

**Por que é importante:** centraliza a regra que impede o acesso acidental à área protegida.

### `interceptor de requisição`

**Arquivo:** [src/services/api.ts](src/services/api.ts)

**Objetivo:** anexar automaticamente o token às chamadas da API.

**Parâmetros:** recebe a configuração interna de cada requisição Axios.

**Retorno:** devolve a configuração, possivelmente com `Authorization: Bearer <token>`.

**Como funciona:** antes de cada chamada, lê `indigo_finance_token` do `SecureStore`. Se houver token, coloca-o no cabeçalho.

**Onde é utilizada:** automaticamente por todas as requisições feitas com `api`.

**Por que é importante:** as telas não precisam repetir manualmente o código de autenticação.

### `interceptor de resposta`

**Arquivo:** [src/services/api.ts](src/services/api.ts)

**Objetivo:** tratar uma resposta HTTP `401`, que normalmente significa token inválido ou expirado.

**Parâmetros:** recebe a resposta ou o erro retornado pelo Axios.

**Retorno:** devolve respostas válidas ou rejeita o erro depois do tratamento.

**Como funciona:** ao receber `401`, remove o token do armazenamento e usa `router.replace('/login')`.

**Por que é importante:** evita que o usuário continue em uma sessão que o servidor já não aceita.

### `handleLogin()`

**Arquivo:** [src/app/login.tsx](src/app/login.tsx)

**Objetivo:** coordenar o clique no botão de entrada.

**Parâmetros:** nenhum; lê os estados `email` e `senha`.

**Retorno:** não retorna valor útil. Executa uma operação assíncrona.

**Como funciona:** verifica campos vazios, liga o carregamento, chama `login(email, senha)`, troca a rota para `/(tabs)` e mostra alerta em caso de erro. O bloco `finally` desliga o carregamento.

**Por que é importante:** conecta o formulário visual à regra de autenticação.

### `handleCadastro()`

**Arquivo:** [src/app/cadastro.tsx](src/app/cadastro.tsx)

**Objetivo:** validar e enviar um novo cadastro.

**Parâmetros:** nenhum; utiliza os estados `nome`, `email`, `senha` e `confirmarSenha`.

**Retorno:** uma `Promise<void>`.

**Como funciona:** limpa nome e e-mail, verifica campos obrigatórios, formato simples de e-mail, tamanho mínimo da senha e igualdade entre as senhas. Depois envia `POST /auth/register`. O resultado é comunicado por alerta.

**Por que é importante:** impede dados obviamente inválidos antes de chamar o servidor e inicia a criação da conta.

### `carregarDados()`

**Arquivo:** [src/app/(tabs)/index.tsx](src/app/(tabs)/index.tsx)

**Objetivo:** carregar os dados do dashboard para o mês selecionado.

**Parâmetros:** nenhum; usa `dataSelecionada` do estado.

**Retorno:** uma função assíncrona criada com `useCallback`.

**Como funciona:** calcula primeiro e último dia do mês, busca `/transacoes`, ordena os registros e guarda até dez itens. Soma receitas e despesas. Depois tenta buscar `/dashboard/resumo`; se essa segunda chamada falhar, usa as somas calculadas localmente como alternativa. Por fim, desliga os indicadores de carregamento.

**Onde é utilizada:** quando a tela ganha foco, ao puxar para atualizar e após salvar uma transação no `ModalTransacao`.

**Por que é importante:** concentra a atualização do painel principal.

### `obterIntervaloMes(data)`

**Arquivo:** [src/app/(tabs)/index.tsx](src/app/(tabs)/index.tsx) e [src/app/(tabs)/transacoes.tsx](src/app/(tabs)/transacoes.tsx)

**Objetivo:** transformar um mês em datas que a API entende.

**Parâmetros:** recebe um objeto `Date`.

**Retorno:** um objeto com `primeiroDia` e `ultimoDia`, no formato `AAAA-MM-DD`.

**Como funciona:** pega ano e mês da data e calcula o último dia usando `new Date(ano, mes + 1, 0)`.

**Por que é importante:** permite filtrar o dashboard e o extrato pelo mês escolhido.

### `carregarTransacoes()`

**Arquivo:** [src/app/(tabs)/transacoes.tsx](src/app/(tabs)/transacoes.tsx)

**Objetivo:** buscar a lista do extrato.

**Parâmetros:** nenhum; utiliza mês e texto da busca nos estados.

**Retorno:** operação assíncrona criada com `useCallback`.

**Como funciona:** sem busca, envia `data_inicio` e `data_fim`. Com busca, envia `busca`. Chama `GET /transacoes`, ordena por data mais recente e usa o ID como desempate.

**Onde é utilizada:** ao focar a tela, ao atualizar a lista e depois de salvar uma transação.

**Por que é importante:** mantém o extrato sincronizado com o servidor.

### `handleSalvar()` do modal de transação

**Arquivo:** [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx)

**Objetivo:** criar ou atualizar uma receita ou despesa.

**Parâmetros:** nenhum; utiliza os estados do formulário.

**Retorno:** uma `Promise<void>`.

**Como funciona:** valida descrição, valor e categoria. Monta um objeto com descrição, valor, tipo, categoria, data e, quando for uma despesa, o cartão escolhido. Se existe ID de transação, usa `PUT /transacoes/:id`; caso contrário, usa `POST /transacoes`. Ao terminar, limpa o formulário, chama `aoSalvarSucesso` e fecha o modal.

**Por que é importante:** reúne a regra de inclusão e edição de transações em um componente reutilizável.

### `handleExcluir(item)` da tela de transações

**Arquivo:** [src/app/(tabs)/transacoes.tsx](src/app/(tabs)/transacoes.tsx)

**Objetivo:** excluir uma transação depois de confirmação.

**Parâmetros:** recebe a transação selecionada.

**Retorno:** não retorna valor útil; a exclusão ocorre dentro do callback do alerta.

**Como funciona:** mostra uma confirmação, chama `DELETE /transacoes/:id` e remove o item do estado local quando a API responde com sucesso.

**Por que é importante:** implementa a parte de exclusão do CRUD de transações.

### `handleAdicionarCategoria()`

**Arquivo:** [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx)

**Objetivo:** criar uma categoria diretamente no formulário de transação.

**Parâmetros:** nenhum; usa `nomeNovaCategoria` e o tipo atual.

**Retorno:** uma `Promise<void>`.

**Como funciona:** remove espaços do nome, chama `POST /categorias`, adiciona a categoria recebida à lista local e já a seleciona. Se a chamada falhar, tenta recarregar as categorias.

**Por que é importante:** permite cadastrar uma categoria sem abandonar o formulário da transação.

### `handleSalvarEdicaoCategoria()` e `handleExcluirCategoria()`

**Arquivo:** [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx)

**Objetivo:** renomear ou remover uma categoria.

**Parâmetros:** usam a categoria guardada em `categoriaEmEdicao` e, no caso da edição, o novo nome digitado.

**Retorno:** operações assíncronas para chamar a API.

**Como funciona:** `handleSalvarEdicaoCategoria` chama `PUT /categorias/:id` e atualiza a lista local. `handleExcluirCategoria` pede confirmação, chama `DELETE /categorias/:id` e remove a categoria da lista e da seleção atual. Essas ações são abertas por toque prolongado em uma categoria.

**Por que são importantes:** completam o CRUD das categorias usado pelo formulário.

### `handleSalvar()` do modal de cartão

**Arquivo:** [src/components/ModalNovoCartao.tsx](src/components/ModalNovoCartao.tsx)

**Objetivo:** cadastrar um cartão de crédito.

**Parâmetros:** nenhum; utiliza nome, bandeira, limite e datas do formulário.

**Retorno:** uma `Promise<void>`.

**Como funciona:** verifica nome, limite e se os dias estão entre 1 e 31. Envia `POST /cartoes`, limpa o formulário e chama `aoSalvarSucesso` para atualizar a lista de cartões.

**Por que é importante:** conecta o formulário de novo cartão à API.

### `handlePagarFatura(cartao)`

**Arquivo:** [src/app/(tabs)/cartoes.tsx](src/app/(tabs)/cartoes.tsx)

**Objetivo:** pagar a fatura aberta de um cartão.

**Parâmetros:** recebe um cartão com limite total, limite disponível e ID.

**Retorno:** inicia uma operação assíncrona depois da confirmação do usuário.

**Como funciona:** calcula a fatura como `limite_total - limite_disponivel`. Se houver valor, pede confirmação e chama `POST /cartoes/:id/pagar-fatura`. Depois recarrega os cartões.

**Por que é importante:** representa no aplicativo a operação financeira de pagar a fatura e restaurar o limite.

### `handleLogout()`

**Arquivo:** [src/app/(tabs)/perfil.tsx](src/app/(tabs)/perfil.tsx)

**Objetivo:** pedir confirmação e encerrar a sessão.

**Parâmetros:** nenhum.

**Retorno:** não retorna valor útil; chama o logout após o alerta.

**Como funciona:** pergunta se a pessoa realmente quer sair, executa `logout` do contexto e navega para `/login`.

**Por que é importante:** oferece uma saída clara e segura da conta.

## 8. Banco de dados

O projeto não contém o código do banco de dados. Não há arquivos de migração, modelos de banco, comandos SQL ou configuração de conexão local dentro do aplicativo.

O armazenamento dos dados financeiros é responsabilidade da API remota. Pelo que o aplicativo envia e recebe, é possível identificar estas estruturas de dados:

- **Usuário:** `id_usuario`, `nome` e `email`.
- **Transação:** ID, descrição, valor, tipo, data, categoria e, opcionalmente, cartão.
- **Categoria:** ID, nome e tipo, que pode representar receita ou despesa.
- **Cartão:** `id_cartao`, nome, bandeira, limite total, limite disponível, dia de fechamento e dia de vencimento.
- **Resumo:** saldo, entradas e saídas do período.

Esses nomes são campos usados pelo cliente; o código disponível não permite afirmar os nomes das tabelas no banco do servidor.

### Operações de dados identificadas

| Operação | Chamada no aplicativo | Local principal |
| --- | --- | --- |
| Criar usuário | `POST /auth/register` | [src/app/cadastro.tsx](src/app/cadastro.tsx) |
| Entrar | `POST /auth/login` | [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) |
| Consultar resumo | `GET /dashboard/resumo` | [src/app/(tabs)/index.tsx](src/app/(tabs)/index.tsx) |
| Consultar transações | `GET /transacoes` | Dashboard e [src/app/(tabs)/transacoes.tsx](src/app/(tabs)/transacoes.tsx) |
| Criar transação | `POST /transacoes` | [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx) |
| Atualizar transação | `PUT /transacoes/:id` | [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx) |
| Excluir transação | `DELETE /transacoes/:id` | [src/app/(tabs)/transacoes.tsx](src/app/(tabs)/transacoes.tsx) |
| Consultar categorias | `GET /categorias` | [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx) |
| Criar categoria | `POST /categorias` | [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx) |
| Atualizar categoria | `PUT /categorias/:id` | [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx) |
| Excluir categoria | `DELETE /categorias/:id` | [src/components/ModalTransacao.tsx](src/components/ModalTransacao.tsx) |
| Consultar cartões | `GET /cartoes` | Tela de cartões e modal de transação |
| Criar cartão | `POST /cartoes` | [src/components/ModalNovoCartao.tsx](src/components/ModalNovoCartao.tsx) |
| Pagar fatura | `POST /cartoes/:id/pagar-fatura` | [src/app/(tabs)/cartoes.tsx](src/app/(tabs)/cartoes.tsx) |
| Excluir cartão | `DELETE /cartoes/:id` | [src/app/(tabs)/cartoes.tsx](src/app/(tabs)/cartoes.tsx) |

O `SecureStore` é um armazenamento local seguro, mas não é o banco financeiro do projeto. Ele guarda somente token, dados do usuário e, no onboarding, a chave `@IndigoFinance:onboarding_visto`.

## 9. Navegação

### Biblioteca utilizada

A navegação usa o **Expo Router**, que aproveita a estrutura de arquivos. Um arquivo `index.tsx` representa a rota principal de uma pasta; `_layout.tsx` define regras comuns; e a pasta `(tabs)` é um grupo de rotas com abas.

### Organização das rotas

| Caminho do arquivo | Rota ou papel |
| --- | --- |
| `src/app/index.tsx` | `/` |
| `src/app/onboarding.tsx` | `/onboarding` |
| `src/app/login.tsx` | `/login` |
| `src/app/cadastro.tsx` | `/cadastro` |
| `src/app/(tabs)/index.tsx` | Aba `/` dentro do grupo, exibida como Início |
| `src/app/(tabs)/transacoes.tsx` | Aba Transações |
| `src/app/(tabs)/cartoes.tsx` | Aba Cartões |
| `src/app/(tabs)/perfil.tsx` | Aba Perfil |

Os parênteses em `(tabs)` significam um grupo de organização e não aparecem como parte do endereço visível da tela.

### Como o usuário troca de tela

- `router.push('/cadastro')` abre o cadastro preservando a tela anterior na pilha.
- `router.replace('/login')` troca a tela atual pelo login, sem deixar a volta para a tela anterior.
- `router.replace('/(tabs)')` leva o usuário autenticado para a área principal.
- `router.back()` volta para a tela anterior, usado no cadastro.
- O componente `Tabs` de [src/app/(tabs)/_layout.tsx](src/app/(tabs)/_layout.tsx) cria a barra de abas.

As telas não enviam parâmetros de rota complexos. Para editar uma transação, a tela de transações guarda o objeto em `transacaoSelecionada` e passa esse objeto como propriedade para o `ModalTransacao`.

## 10. Conceitos importantes para iniciantes

### Componentes

Um componente é uma parte reutilizável da interface. Por exemplo, `ModalTransacao` é um componente que desenha um formulário completo dentro de uma janela modal. As telas usam componentes nativos como `View`, `Text`, `TextInput` e `TouchableOpacity`.

### Props

Props são informações enviadas de um componente pai para um componente filho. Em `ModalNovoCartao`, por exemplo, `visivel`, `aoFechar` e `aoSalvarSucesso` são props. A tela de cartões decide quando o modal aparece e o que fazer depois do cadastro.

### Estado e `useState`

Estado é uma informação que pode mudar durante o uso da tela. Em `Login`, `const [email, setEmail] = useState('')` guarda o texto digitado. Quando `setEmail` é chamado, o React atualiza a tela com o novo valor.

### `useEffect`

`useEffect` executa uma ação relacionada ao ciclo de vida do componente. Em `AuthProvider`, ele carrega a sessão salva quando o provedor é criado. Em `ModalTransacao`, ele busca categorias e cartões quando o modal fica visível.

### Outros hooks

- `useContext`, em `useAuth`, acessa dados compartilhados.
- `useCallback`, usado nas funções de carregamento, mantém uma referência de função adequada para os efeitos de foco.
- `useMemo`, usado em `dadosGrafico` no dashboard, evita recalcular o agrupamento enquanto as transações não mudarem.
- `useFocusEffect`, do Expo Router, executa carregamentos quando uma tela volta a ficar visível.

### Funções assíncronas e `async/await`

Uma chamada de rede pode demorar. Por isso funções como `login`, `carregarDados` e `handleSalvar` são `async`. O comando `await api.get(...)` espera a resposta sem bloquear a lógica da tela. `try/catch/finally` permite tratar erro e desligar o indicador de carregamento mesmo quando algo dá errado.

### API e métodos HTTP

Uma API é um serviço com endereços que recebem pedidos. Neste projeto:

- `GET` consulta dados;
- `POST` cria dados ou executa uma ação, como pagar fatura;
- `PUT` atualiza dados existentes;
- `DELETE` remove dados.

O objeto `api` de [src/services/api.ts](src/services/api.ts) é a forma padronizada de fazer esses pedidos.

### Token e autenticação Bearer

Depois do login, o servidor envia um token. O aplicativo salva esse token e envia `Authorization: Bearer <token>` nas requisições. Assim a API consegue saber qual usuário está fazendo cada operação.

### Tipagem com TypeScript

TypeScript permite declarar o formato esperado dos dados. `Usuario` em [src/@types/auth.ts](src/@types/auth.ts) informa que um usuário tem `id_usuario`, `nome` e `email`. Interfaces como `TransacaoItem` e `CartaoItem` fazem algo parecido nas telas financeiras.

Alguns campos estão opcionais, marcados com `?`, porque a API pode retornar nomes diferentes ou não enviar aquele campo em todas as situações. Por exemplo, uma transação pode ter `data`, `data_transacao` ou `created_at`.

### Estado local versus dados do servidor

`useState` mantém uma cópia dos dados enquanto a tela está aberta. A fonte principal das informações financeiras é a API. Por isso, depois de cadastrar ou excluir algo, as telas atualizam o estado local e também chamam novamente a API quando necessário.

### Modal e callback

Um modal é uma janela sobre a tela atual. `ModalTransacao` recebe `aoSalvarSucesso`, que é uma função callback. Depois de salvar, o modal chama essa função para que o componente pai recarregue seus dados.

## 11. Fluxo completo da aplicação

Um fluxo de login e consulta pode ser resumido assim:

```text
Usuário abre o app
  -> RootLayout
  -> AuthProvider lê o SecureStore
  -> RootNavigation decide a rota
  -> Login, se não houver sessão
  -> handleLogin()
  -> AuthContext.login()
  -> api.post('/auth/login')
  -> token é salvo no SecureStore
  -> usuário vai para /(tabs)
  -> Dashboard chama carregarDados()
  -> api.get('/transacoes') e api.get('/dashboard/resumo')
  -> estado da tela é atualizado
  -> usuário vê saldo, gráfico e transações
```

Um fluxo de criação de transação é:

```text
Usuário toca no botão +
  -> Dashboard ou TransacoesScreen abre ModalTransacao
  -> usuário escolhe tipo, valor e categoria
  -> handleSalvar()
  -> api.post('/transacoes')
  -> aoSalvarSucesso()
  -> carregarDados() ou carregarTransacoes()
  -> lista e resumo aparecem atualizados
```

Um fluxo de cartão é:

```text
Usuário abre Cartões
  -> carregarCartoes()
  -> api.get('/cartoes')
  -> tela calcula fatura e percentual usado
  -> ModalNovoCartao pode criar cartão
  -> handlePagarFatura() pode pagar a fatura
  -> api.post('/cartoes/:id/pagar-fatura')
  -> lista é carregada novamente
```

## 12. Resumo final

O projeto é um aplicativo React Native feito com Expo, TypeScript e Expo Router. A interface é dividida em telas e componentes; os estados controlam o que o usuário está digitando ou vendo; o `AuthContext` centraliza a sessão; e o Axios conversa com uma API REST.

O fluxo principal é: o usuário se autentica, o token é guardado com segurança, as telas consultam os dados do servidor e as ações de criação, alteração e exclusão são enviadas para os endpoints correspondentes. O dashboard resume as informações, a tela de transações organiza o extrato, a tela de cartões acompanha limites e faturas e o perfil controla a saída da conta.

O banco de dados e suas tabelas não fazem parte deste repositório. Portanto, a documentação consegue explicar como o aplicativo acessa os dados, mas não pode afirmar detalhes internos do banco usado pelo backend.