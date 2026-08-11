# Rede de Lanchonetes — API Back-end

Projeto de uma API REST para uma rede de lanchonetes. A solução possui cadastro de usuários, autenticação, unidades, produtos, cardápio, estoque, pedidos, pagamento mock, fidelidade e consentimento LGPD.

Os pedidos aceitam os canais `APP`, `WEB` e `TOTEM`.

## Tecnologias utilizadas

- Node.js 20.19 ou superior
- TypeScript 7
- Express 5
- PostgreSQL
- Prisma ORM 7
- Zod
- JWT
- bcryptjs
- Swagger/OpenAPI
- Postman

## Funcionalidades

- Cadastro e login de usuários
- Access token e refresh token
- Logout e revogação da sessão
- Controle de acesso por perfis
- Gestão das unidades da rede
- Cadastro de produtos
- Cardápio e preços por unidade
- Controle e movimentação de estoque
- Criação e consulta de pedidos
- Filtro de pedidos por canal
- Atualização do status dos pedidos
- Cancelamento e estorno de estoque
- Pagamento externo simulado
- Consentimento LGPD
- Programa de fidelidade
- Logs de auditoria
- Erros padronizados

## Canais de pedido

O campo `canalPedido` é obrigatório e aceita:

- `APP`
- `WEB`
- `TOTEM`

## Fluxo principal

1. O cliente consulta o cardápio de uma unidade.
2. A API verifica os produtos e o estoque.
3. O estoque dos itens é reservado.
4. O pedido é criado.
5. O pagamento mock é solicitado.
6. Quando aprovado, o pedido segue para `EM_PREPARO`, `PRONTO` e `ENTREGUE`.
7. Quando recusado, o pedido é cancelado e o estoque é estornado.
8. Depois da entrega, o cliente recebe pontos se possuir consentimento ativo.

O pagamento mock aprova pedidos de até R$ 500,00 e recusa pedidos acima desse valor.

A fidelidade concede um ponto para cada real inteiro do pedido entregue.

## Requisitos

Antes de executar o projeto, instale:

- Node.js 20.19 ou superior
- npm
- PostgreSQL
- Git

O DBeaver é opcional e pode ser utilizado para visualizar o banco.

## Instalação

Clone o repositório:

```cmd
git clone https://github.com/BlueLCS/rede-lanchonetes-uninter.git
```

Entre na pasta:

```cmd
cd rede-lanchonetes-uninter
```

Instale as dependências:

```cmd
npm install
```

O Prisma Client é gerado automaticamente pelo script `postinstall`.

## Configuração das variáveis de ambiente

Copie o arquivo `.env.example`:

```cmd
copy .env.example .env
```

O arquivo criado possui este formato:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/rede_lanchonetes?schema=public"
JWT_SECRET="INFORME_UMA_CHAVE_SEGURA"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_DAYS="7"
```

No arquivo `.env`, substitua `SUA_SENHA` pela senha local do PostgreSQL e informe uma chave segura em `JWT_SECRET`.

O arquivo `.env` contém informações locais e não deve ser enviado ao GitHub.

## Banco de dados

Crie no PostgreSQL um banco chamado:

```text
rede_lanchonetes
```

Execute as migrations:

```cmd
npx prisma migrate deploy
```

Execute o seed inicial:

```cmd
npm run db:seed
```

O seed cria uma unidade, usuários de teste, produtos, cardápio e estoque.

## Executar a API

Para iniciar em desenvolvimento:

```cmd
npm run dev
```

A API fica disponível em:

```text
http://localhost:3000
```

Para conferir e compilar o TypeScript:

```cmd
npm run build
```

Para executar o código compilado:

```cmd
npm start
```

## Documentação Swagger

Com a API ligada, acesse:

```text
http://localhost:3000/docs
```

O documento OpenAPI em JSON fica disponível em:

```text
http://localhost:3000/openapi.json
```

O Swagger permite consultar contratos, parâmetros, exemplos, respostas e testar os endpoints.

## Usuários de teste

### Administrador

```text
E-mail: admin@lanchonete.local
Senha: Senha123!
```

### Cliente

```text
E-mail: cliente@exemplo.com
Senha: Senha123!
```

Esses usuários existem somente para demonstração local.

## Principais endpoints

| Método | Rota | Função |
|---|---|---|
| POST | `/auth/cadastro` | Cadastrar cliente |
| POST | `/auth/login` | Realizar login |
| POST | `/auth/refresh` | Renovar tokens |
| POST | `/auth/logout` | Encerrar sessão |
| GET | `/unidades` | Listar unidades |
| POST | `/unidades` | Cadastrar unidade |
| PATCH | `/unidades/{id}` | Atualizar unidade |
| POST | `/produtos` | Cadastrar produto |
| GET | `/unidades/{unidadeId}/cardapio` | Consultar cardápio |
| PUT | `/unidades/{unidadeId}/cardapio/{produtoId}` | Atualizar cardápio |
| GET | `/estoque` | Consultar estoque |
| POST | `/estoque/movimentacoes` | Movimentar estoque |
| POST | `/pedidos` | Criar pedido |
| GET | `/pedidos` | Listar e filtrar pedidos |
| PATCH | `/pedidos/{id}/status` | Atualizar status |
| POST | `/pedidos/{id}/cancelamento` | Cancelar pedido |
| GET | `/pedidos/{pedidoId}/pagamento` | Consultar pagamento |
| GET | `/fidelidade/saldo` | Consultar pontos |
| POST | `/fidelidade/resgates` | Resgatar pontos |
| POST | `/consentimentos` | Registrar consentimento |

## Testes pelo Postman

A coleção está disponível em:

```text
postman/rede-lanchonetes.postman_collection.json
```

Para executar:

1. Inicie o PostgreSQL.
2. Execute as migrations e o seed.
3. Inicie a API com `npm run dev`.
4. Importe o arquivo JSON no Postman.
5. Execute a coleção na ordem apresentada.

Os logins são executados primeiro. Os scripts salvam os tokens, produtos e pedidos nas variáveis da própria coleção.

A coleção possui seis cenários positivos e quatro negativos, cobrindo autenticação, autorização, validação, estoque, pedidos, pagamento mock e atualização de status.

## Estrutura principal

```text
src/
├── api
├── application
├── domain
├── infrastructure
├── main
├── docs
├── app.ts
└── server.ts

prisma/
├── migrations
├── schema.prisma
└── seed.ts

postman/
└── rede-lanchonetes.postman_collection.json
```

A separação segue uma arquitetura em camadas:

- `domain`: entidades, enums e contratos;
- `application`: casos de uso;
- `infrastructure`: banco, segurança e pagamento mock;
- `api`: controllers, rotas, validações e middlewares;
- `main`: criação e ligação das dependências;
- `docs`: documentação OpenAPI.

## Segurança e LGPD

As senhas são armazenadas com hash. A autenticação utiliza JWT e as rotas verificam o perfil do usuário.

As respostas não mostram senha, hash ou outros dados internos. O consentimento para fidelidade registra finalidade, versão do termo, data e IP.

As ações que alteram dados são registradas na auditoria sem armazenar senhas, tokens ou o conteúdo completo das requisições.

## Itens conceituais

O front-end não faz parte desta entrega. APP, WEB e TOTEM representam canais externos que consomem a API.

As promoções e campanhas foram mantidas como proposta documentada, sem um motor automático. As estratégias avançadas para horários de pico também foram apresentadas de forma conceitual.

## Repositório

https://github.com/BlueLCS/rede-lanchonetes-uninter