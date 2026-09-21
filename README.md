# Controle Financeiro

Aplicação full stack de controle financeiro pessoal: contas, lançamentos, transferências, cartões de crédito, faturas, compras parceladas e orçamentos.

## Objetivo

Permitir que um usuário gerencie sua vida financeira em um único lugar, com autenticação, isolamento de dados por usuário e regras de negócio consistentes para cartão de crédito, faturas e orçamentos.

## Funcionalidades

- Cadastro e login de usuários com autenticação JWT.
- Contas (corrente, poupança, dinheiro) com saldo calculado a partir do saldo inicial e dos lançamentos.
- Categorias de receita e despesa.
- Lançamentos de receita/despesa com filtros e paginação.
- Transferências entre contas.
- Cartões de crédito com limite, limite utilizado e limite disponível.
- Compras parceladas com divisão automática das parcelas.
- Faturas por cartão/mês com fechamento e pagamento.
- Orçamento mensal por categoria com acompanhamento de gastos.
- Dashboard com totais, gastos por categoria, orçamentos e próxima fatura.
- Documentação interativa da API via Swagger/OpenAPI.

## Stack

- **Backend:** Java 21, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security, JWT (jjwt), Flyway, Bean Validation, springdoc-openapi.
- **Banco de dados:** PostgreSQL 16 (Flyway para migrações).
- **Frontend:** React 18, TypeScript, Vite, React Router.
- **Infraestrutura:** Docker e Docker Compose.
- **Testes:** JUnit 5, Spring Boot Test, MockMvc, H2 (modo PostgreSQL).

## Arquitetura

Backend em camadas:

```text
controller  -> recebe requisições HTTP, valida DTOs e delega
service     -> regras de negócio e transações
repository  -> acesso a dados (Spring Data JPA)
entity      -> mapeamento do banco
dto         -> contratos de entrada/saída da API
mapper      -> conversão entity <-> DTO
security    -> JWT, filtro de autenticação e configuração
exception   -> exceções de domínio e handler global
```

Frontend:

```text
pages       -> telas da aplicação
components  -> componentes reutilizáveis
routes      -> rotas e proteção de autenticação
hooks       -> contexto de autenticação
services    -> cliente HTTP e serviços por recurso
types       -> tipos TypeScript compartilhados
utils       -> formatação de moeda e data
```

## Como executar com Docker

Pré-requisito: Docker e Docker Compose.

```bash
cp .env.example .env
# edite o .env e defina um JWT_SECRET com pelo menos 32 caracteres
docker compose up --build
```

A aplicação ficará disponível em:

- Frontend: http://localhost:5173
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

O PostgreSQL usa o volume persistente `postgres_data`.

Para limpar o ambiente (remove também os dados do banco):

```bash
docker compose down -v
```

## Como executar localmente

### Backend

Pré-requisitos: JDK 21, Maven e PostgreSQL em execução.

```bash
cd backend
export DB_URL=jdbc:postgresql://localhost:5432/finance_control
export DB_USERNAME=finance
export DB_PASSWORD=finance_pass
export JWT_SECRET=uma-chave-com-pelo-menos-32-caracteres
mvn spring-boot:run
```

O Flyway cria o schema automaticamente na inicialização.

### Frontend

Pré-requisito: Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

Por padrão o frontend em desenvolvimento chama a API em `http://localhost:8080`. Para apontar para outro endereço, crie um `.env` em `frontend/`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Configuração das variáveis de ambiente

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `POSTGRES_DB` | Nome do banco | `finance_control` |
| `POSTGRES_USER` | Usuário do banco | `finance` |
| `POSTGRES_PASSWORD` | Senha do banco | `finance_pass` |
| `POSTGRES_PORT` | Porta exposta do banco | `5432` |
| `DB_URL` | URL JDBC de conexão | `jdbc:postgresql://localhost:5432/finance_control` |
| `DB_USERNAME` | Usuário JDBC | `finance` |
| `DB_PASSWORD` | Senha JDBC | `finance_pass` |
| `JWT_SECRET` | Chave de assinatura dos tokens (obrigatória) | — |
| `JWT_EXPIRATION_MS` | Validade do token em ms | `86400000` |
| `SERVER_PORT` | Porta do backend | `8080` |
| `CORS_ALLOWED_ORIGINS` | Origens liberadas para CORS | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Base da API usada pelo frontend | `/api` (Docker) |
| `BACKEND_PORT` | Porta exposta do backend | `8080` |
| `FRONTEND_PORT` | Porta exposta do frontend | `5173` |

Nenhuma credencial ou segredo fica hardcoded no código; tudo vem de variáveis de ambiente (`.env`, ignorado pelo Git).

## Acesso ao frontend

http://localhost:5173 — crie um usuário na tela de cadastro e faça login.

## Acesso à API

http://localhost:8080

Principais rotas:

```text
POST   /auth/register
POST   /auth/login

GET    /accounts
POST   /accounts
GET    /accounts/{id}
PUT    /accounts/{id}
PATCH  /accounts/{id}/deactivate

GET    /categories
POST   /categories
GET    /categories/{id}
PUT    /categories/{id}
PATCH  /categories/{id}/deactivate

GET    /transactions
POST   /transactions
GET    /transactions/{id}

GET    /transfers
POST   /transfers
GET    /transfers/{id}

GET    /credit-cards
POST   /credit-cards
GET    /credit-cards/{id}
PUT    /credit-cards/{id}
PATCH  /credit-cards/{id}/deactivate

GET    /purchases
POST   /purchases
GET    /purchases/{id}

GET    /invoices
GET    /invoices/{id}
POST   /invoices/{id}/close
POST   /invoices/{id}/pay

GET    /budgets
POST   /budgets
PUT    /budgets/{id}

GET    /dashboard?month=MM&year=YYYY
```

Todas as rotas, exceto `/auth/**` e o Swagger, exigem o header `Authorization: Bearer <token>`.

## Acesso ao Swagger

http://localhost:8080/swagger-ui.html

Use o botão **Authorize** com o token JWT obtido em `/auth/login` para testar os endpoints protegidos.

## Estrutura do projeto

```text
finance-control/
├── backend/                 # API Spring Boot
│   ├── src/main/java/br/com/financecontrol/
│   │   ├── config/          # OpenAPI e configurações
│   │   ├── controller/      # endpoints REST
│   │   ├── dto/             # contratos de entrada/saída
│   │   ├── entity/          # entidades JPA e enums
│   │   ├── exception/       # exceções e handler global
│   │   ├── mapper/          # entity <-> DTO
│   │   ├── repository/      # Spring Data JPA
│   │   ├── security/        # JWT, filtro e SecurityConfig
│   │   └── service/         # regras de negócio
│   ├── src/main/resources/
│   │   ├── db/migration/    # migrações Flyway
│   │   └── application.yml
│   └── Dockerfile
├── frontend/                # SPA React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

## Principais regras de negócio

- **Ownership:** cada recurso pertence ao usuário autenticado; acessar dados de outro usuário retorna 404.
- **Saldo da conta:** `saldo inicial + receitas - despesas - transferências enviadas + transferências recebidas - pagamentos de fatura`.
- **Fatura de referência:** compras com dia até o `closingDay` entram na fatura do mês corrente; após o fechamento, na fatura do mês seguinte.
- **Parcelamento:** o valor total é dividido em partes iguais com arredondamento para baixo e a diferença aplicada na última parcela (ex.: 100 em 3x = 33,33 / 33,33 / 33,34).
- **Limite do cartão:** o valor total da compra compromete o limite no momento da compra; parcelas pagas liberam limite.
- **Fatura:** transições permitidas apenas `OPEN -> CLOSED -> PAID`. Não é possível adicionar compras a uma fatura fechada.
- **Pagamento da fatura:** marca as parcelas como pagas, debita o valor total da conta escolhida e registra a data de pagamento.
- **Despesas do dashboard:** despesas diretas do período mais as parcelas de fatura cujo mês de referência pertence ao período.
- **Orçamento:** o gasto considera lançamentos da categoria e as parcelas da categoria no período, sem contar o pagamento da fatura duas vezes.

## Testes

```bash
cd backend
mvn test
```

Os testes cobrem criação de lançamento, transferência, compra parcelada, cálculo de limite, fechamento e pagamento de fatura, orçamento e ownership.
