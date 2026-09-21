Você é um desenvolvedor full-stack experiente em Java, Spring Boot, React, TypeScript e PostgreSQL.

Crie uma aplicação web completa chamada **Finance Control**, destinada ao gerenciamento de finanças pessoais.

O projeto será usado posteriormente como alvo de um projeto separado de testes de QA. Portanto, a aplicação deve possuir uma API REST real, regras de negócio consistentes, banco PostgreSQL acessível e uma interface web funcional.

IMPORTANTE: implemente somente o projeto da aplicação. Não crie Selenium, Rest Assured, Cypress, Playwright ou qualquer projeto externo de automação.

---

# 1. Objetivo

O Finance Control é uma aplicação de controle financeiro pessoal.

O usuário deve conseguir:

* cadastrar e gerenciar contas;
* registrar receitas;
* registrar despesas;
* transferir dinheiro entre contas;
* criar categorias;
* cadastrar cartões de crédito;
* registrar compras no cartão;
* registrar compras parceladas;
* acompanhar faturas;
* fechar faturas;
* pagar faturas;
* criar orçamentos mensais;
* visualizar um dashboard financeiro.

A aplicação NÃO é um banco e NÃO realiza operações financeiras reais.

---

# 2. Stack obrigatória

## Backend

* Java 21 ou versão LTS compatível;
* Spring Boot;
* Spring Web;
* Spring Data JPA;
* Hibernate;
* Spring Security;
* JWT;
* Bean Validation;
* PostgreSQL;
* Flyway;
* Maven;
* OpenAPI/Swagger.

## Frontend

* React;
* TypeScript;
* Vite.

## Infraestrutura

* Docker;
* Docker Compose.

Não adicionar tecnologias de infraestrutura desnecessárias.

Não usar:

* microservices;
* Kafka;
* RabbitMQ;
* Redis;
* Kubernetes;
* Elasticsearch;
* AWS;
* mensageria;
* event sourcing.

A aplicação deve ser um monólito modular simples.

---

# 3. Estrutura do projeto

Use uma estrutura simples e organizada.

Backend:

```text
backend/
└── src/
    └── main/
        ├── java/
        │   └── ...
        │       ├── controller/
        │       ├── service/
        │       ├── repository/
        │       ├── entity/
        │       ├── dto/
        │       ├── mapper/
        │       ├── exception/
        │       └── config/
        └── resources/
            └── db/
                └── migration/
```

Frontend:

```text
frontend/
└── src/
    ├── components/
    ├── pages/
    ├── services/
    ├── hooks/
    ├── types/
    └── routes/
```

Não crie abstrações ou camadas que não tenham uma finalidade real.

---

# 4. Autenticação

Implementar:

```http
POST /auth/register
POST /auth/login
```

Usar JWT.

Senhas devem ser armazenadas somente com hash seguro, como BCrypt.

O usuário autenticado só pode acessar seus próprios dados.

Não implementar no MVP:

* OAuth;
* Google Login;
* recuperação de senha;
* confirmação de e-mail;
* MFA;
* refresh token.

---

# 5. Entidades

Criar as seguintes entidades:

```text
User
Account
Category
Transaction
Transfer
CreditCard
Invoice
Purchase
Installment
Budget
```

---

# 6. User

Campos:

```text
id UUID PK
name VARCHAR(100) NOT NULL
email VARCHAR(150) NOT NULL UNIQUE
password_hash VARCHAR NOT NULL
created_at TIMESTAMP NOT NULL
```

---

# 7. Account

Campos:

```text
id UUID PK
user_id UUID FK
name VARCHAR(100) NOT NULL
type VARCHAR(20) NOT NULL
initial_balance DECIMAL(15,2) NOT NULL
balance DECIMAL(15,2) NOT NULL
status VARCHAR(20) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP
```

Tipos:

```text
CHECKING
SAVINGS
CASH
```

Status:

```text
ACTIVE
INACTIVE
```

Regras:

* initial_balance >= 0;
* balance pode ficar negativo;
* somente contas ACTIVE podem receber novos lançamentos;
* somente contas ACTIVE podem participar de transferências;
* somente contas ACTIVE podem pagar faturas;
* contas com histórico não podem ser excluídas;
* desativação deve ser lógica.

---

# 8. Category

Campos:

```text
id UUID PK
user_id UUID FK
name VARCHAR(100) NOT NULL
type VARCHAR(20) NOT NULL
status VARCHAR(20) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP
```

Tipos:

```text
INCOME
EXPENSE
```

Status:

```text
ACTIVE
INACTIVE
```

Regras:

* categoria INCOME somente para receitas;
* categoria EXPENSE somente para despesas;
* categoria inativa não pode ser usada em novos lançamentos;
* histórico permanece após desativação.

---

# 9. Transaction

Campos:

```text
id UUID PK
user_id UUID FK
account_id UUID FK
category_id UUID FK
type VARCHAR(20) NOT NULL
description VARCHAR(255)
amount DECIMAL(15,2) NOT NULL
transaction_date DATE NOT NULL
created_at TIMESTAMP NOT NULL
```

Tipos:

```text
INCOME
EXPENSE
```

Regras:

* amount > 0;
* account deve estar ACTIVE;
* category deve estar ACTIVE;
* category deve ser compatível com type;
* INCOME aumenta o balance;
* EXPENSE reduz o balance;
* saldo negativo é permitido;
* usuário não pode utilizar account/category de outro usuário.

Pagamento de fatura NÃO deve criar uma Transaction comum.

---

# 10. Transfer

Campos:

```text
id UUID PK
user_id UUID FK
source_account_id UUID FK
destination_account_id UUID FK
amount DECIMAL(15,2) NOT NULL
transfer_date DATE NOT NULL
description VARCHAR(255)
created_at TIMESTAMP NOT NULL
```

Regras:

* amount > 0;
* origem diferente do destino;
* ambas as contas ACTIVE;
* ambas pertencem ao usuário;
* origem é debitada;
* destino é creditado;
* transferência não é receita;
* transferência não é despesa.

A operação deve ser transacional.

---

# 11. CreditCard

Campos:

```text
id UUID PK
user_id UUID FK
name VARCHAR(100) NOT NULL
credit_limit DECIMAL(15,2) NOT NULL
closing_day INTEGER NOT NULL
due_day INTEGER NOT NULL
status VARCHAR(20) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP
```

Status:

```text
ACTIVE
INACTIVE
```

Regras:

```text
credit_limit > 0
closing_day BETWEEN 1 AND 31
due_day BETWEEN 1 AND 31
```

Somente cartões ACTIVE podem receber novas compras.

---

# 12. Invoice

Campos:

```text
id UUID PK
credit_card_id UUID FK
reference_month DATE NOT NULL
closing_date DATE NOT NULL
due_date DATE NOT NULL
status VARCHAR(20) NOT NULL
total_amount DECIMAL(15,2) NOT NULL
paid_at TIMESTAMP NULL
```

Status:

```text
OPEN
CLOSED
PAID
```

Transições permitidas:

```text
OPEN → CLOSED
CLOSED → PAID
```

Não permitir transições inválidas.

Criar constraint:

```text
UNIQUE(credit_card_id, reference_month)
```

`reference_month` deve representar o primeiro dia do mês.

As datas de fechamento e vencimento são determinadas quando a fatura é criada.

Alterações posteriores no cartão não devem alterar faturas já existentes.

---

# 13. Purchase

Campos:

```text
id UUID PK
credit_card_id UUID FK
category_id UUID FK
description VARCHAR(255)
total_amount DECIMAL(15,2) NOT NULL
installments_count INTEGER NOT NULL
purchase_date DATE NOT NULL
created_at TIMESTAMP NOT NULL
```

Regras:

* total_amount > 0;
* installments_count >= 1;
* cartão ACTIVE;
* categoria EXPENSE e ACTIVE;
* cartão e categoria pertencem ao mesmo usuário;
* compra deve possuir limite disponível suficiente.

---

# 14. Installment

Campos:

```text
id UUID PK
purchase_id UUID FK
invoice_id UUID FK
installment_number INTEGER NOT NULL
amount DECIMAL(15,2) NOT NULL
status VARCHAR(20) NOT NULL
```

Status:

```text
OPEN
PAID
```

Constraints:

```text
amount > 0
installment_number >= 1
UNIQUE(purchase_id, installment_number)
```

A soma das parcelas deve ser exatamente igual ao valor da compra.

Quando houver diferença de arredondamento, a última parcela deve absorver a diferença.

Exemplo:

```text
100 / 3

33.33
33.33
33.34
```

---

# 15. Regras de faturas e compras

O cartão possui um dia de fechamento.

Exemplo:

```text
closing_day = 10
```

Então:

```text
compra em 09/09 → fatura Setembro
compra em 10/09 → fatura Setembro
compra em 11/09 → fatura Outubro
```

O próprio dia do fechamento pertence à fatura que está sendo fechada.

Se a fatura necessária não existir, ela deve ser criada automaticamente como OPEN.

Compras parceladas distribuem uma parcela por mês.

Exemplo:

```text
R$ 1.200 em 6x

Setembro  → 200
Outubro   → 200
Novembro  → 200
Dezembro  → 200
Janeiro   → 200
Fevereiro → 200
```

Se uma compra histórica resultar em uma fatura CLOSED ou PAID, a operação deve ser rejeitada com HTTP 409.

Não alterar faturas já fechadas.

---

# 16. Limite do cartão

O limite utilizado deve ser calculado pela soma das parcelas OPEN:

```text
usedLimit = SUM(open installments)
```

Então:

```text
availableLimit = creditLimit - usedLimit
```

Uma compra parcelada de R$ 1.200 em 6x compromete R$ 1.200 do limite imediatamente.

Quando uma parcela passa de OPEN para PAID, aquele valor deixa de comprometer o limite.

---

# 17. Criação de compra deve ser transacional

O fluxo deve ser:

```text
validar cartão
validar categoria
validar limite
determinar primeira fatura
determinar faturas seguintes
criar Purchase
criar Installments
criar/atualizar Invoices
```

Se qualquer etapa falhar, executar rollback completo.

Não permitir estados parciais.

---

# 18. Pagamento de fatura

Endpoint:

```http
POST /invoices/{id}/pay
```

Body:

```json
{
  "accountId": "uuid"
}
```

Regras:

* invoice deve estar CLOSED;
* account deve estar ACTIVE;
* account deve pertencer ao usuário;
* invoice deve pertencer ao usuário;
* invoice não pode estar PAID.

Ao pagar:

```text
Invoice CLOSED → PAID
```

```text
paid_at = current timestamp
```

Todas as installments daquela invoice:

```text
OPEN → PAID
```

E:

```text
account.balance -= invoice.total_amount
```

O pagamento deve ser transacional.

---

# 19. Budget

Campos:

```text
id UUID PK
user_id UUID FK
category_id UUID FK
month INTEGER NOT NULL
year INTEGER NOT NULL
amount DECIMAL(15,2) NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP
```

Constraints:

```text
month BETWEEN 1 AND 12
amount > 0
```

Unique:

```text
UNIQUE(user_id, category_id, month, year)
```

Somente categorias EXPENSE podem possuir orçamento.

O orçamento não bloqueia despesas.

Pode ficar negativo.

---

# 20. Cálculo do orçamento

Despesas normais usam:

```text
transaction_date
```

Compras no cartão usam suas parcelas/faturas.

Exemplo:

```text
R$ 1.200 em 6x

Setembro → 200
Outubro  → 200
Novembro → 200
...
```

Portanto uma compra parcelada de R$ 1.200 não deve consumir R$ 1.200 do orçamento no mês da compra.

---

# 21. Dashboard

Criar:

```http
GET /dashboard?month=9&year=2026
```

Retornar:

* saldo total;
* receitas do mês;
* despesas do mês;
* limite total dos cartões;
* limite utilizado;
* limite disponível;
* gastos por categoria;
* resumo de orçamentos;
* fatura atual/próxima fatura.

O dashboard deve apenas agregar dados existentes e não criar regras independentes.

Saldo total:

```text
SUM(balance das contas ACTIVE)
```

Receitas:

```text
SUM(INCOME transactions do período)
```

Despesas:

```text
EXPENSE transactions do período
+
installments de cartão referentes ao período
```

O pagamento da fatura não deve ser contabilizado novamente como despesa.

---

# 22. API

Implementar:

## Auth

```http
POST /auth/register
POST /auth/login
```

## Accounts

```http
POST   /accounts
GET    /accounts
GET    /accounts/{id}
PUT    /accounts/{id}
PATCH  /accounts/{id}/deactivate
```

## Categories

```http
POST   /categories
GET    /categories
GET    /categories/{id}
GET    /categories?type=EXPENSE
PUT    /categories/{id}
PATCH  /categories/{id}/deactivate
```

## Transactions

```http
POST /transactions
GET  /transactions
GET  /transactions/{id}
```

Filtros:

```text
type
accountId
categoryId
startDate
endDate
```

## Transfers

```http
POST /transfers
GET  /transfers
GET  /transfers/{id}
```

## Credit Cards

```http
POST   /credit-cards
GET    /credit-cards
GET    /credit-cards/{id}
PUT    /credit-cards/{id}
PATCH  /credit-cards/{id}/deactivate
```

## Purchases

```http
POST /purchases
GET  /purchases
GET  /purchases/{id}
```

## Invoices

```http
GET  /invoices
GET  /invoices/{id}
POST /invoices/{id}/close
POST /invoices/{id}/pay
```

## Budgets

```http
POST /budgets
GET  /budgets
GET  /budgets?month=9&year=2026
PUT  /budgets/{id}
```

## Dashboard

```http
GET /dashboard?month=9&year=2026
```

---

# 23. HTTP status codes

Use:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Use 409 para conflitos de regra de negócio, como:

* limite insuficiente;
* orçamento duplicado;
* fatura fechada;
* fatura já paga;
* conta inativa;
* cartão inativo;
* transição de estado inválida.

---

# 24. Error response

Padronizar erros.

Exemplo:

```json
{
  "timestamp": "2026-09-18T12:30:00Z",
  "status": 409,
  "error": "BUSINESS_RULE_VIOLATION",
  "message": "Insufficient credit limit",
  "path": "/purchases"
}
```

Erros de validação devem informar os campos inválidos de forma clara.

---

# 25. Paginação

Adicionar paginação às listagens que podem crescer, principalmente:

```text
transactions
transfers
purchases
invoices
```

Exemplo:

```http
GET /transactions?page=0&size=20
```

Ordenação padrão:

* transactions: transaction_date DESC;
* purchases: purchase_date DESC;
* invoices: reference_month DESC.

---

# 26. Banco de dados

Usar PostgreSQL.

Usar:

```text
UUID
DECIMAL(15,2)
DATE
TIMESTAMP/TIMESTAMPTZ
```

Nunca usar float/double para valores monetários.

Criar constraints de:

```text
PRIMARY KEY
FOREIGN KEY
NOT NULL
UNIQUE
CHECK
```

Criar índices somente para consultas relevantes.

Usar Flyway para versionamento do schema.

Não usar `spring.jpa.hibernate.ddl-auto=create` como mecanismo de criação do banco.

---

# 27. Segurança e propriedade dos recursos

Toda operação autenticada deve validar o ownership do recurso.

Por exemplo:

um usuário não pode executar:

```http
GET /accounts/{id}
```

para consultar uma conta pertencente a outro usuário.

O mesmo vale para:

* categories;
* transactions;
* transfers;
* credit cards;
* purchases;
* invoices;
* budgets.

Não confiar em IDs enviados pelo cliente.

---

# 28. Frontend

Criar uma SPA simples com React + TypeScript.

Páginas:

```text
/login
/dashboard
/accounts
/transactions
/categories
/credit-cards
/invoices
/budgets
```

Não criar páginas desnecessárias.

---

# 29. Dashboard UI

Mostrar:

* saldo total;
* receitas;
* despesas;
* cartões;
* limite utilizado/disponível;
* gastos por categoria;
* orçamentos.

---

# 30. Accounts UI

Permitir:

* listar contas;
* criar conta;
* editar;
* desativar.

Não mostrar opção de exclusão física.

---

# 31. Transactions UI

Permitir:

* listar;
* filtrar;
* criar receita;
* criar despesa.

Campos:

```text
type
description
amount
account
category
date
```

As categorias devem ser filtradas conforme o tipo selecionado.

---

# 32. Transfer UI

Disponibilizar operação de transferência na tela de lançamentos ou contas.

Campos:

```text
source account
destination account
amount
date
description
```

---

# 33. Credit Cards UI

Mostrar:

```text
name
credit limit
used limit
available limit
closing day
due day
status
```

Permitir:

* criar;
* editar;
* desativar;
* iniciar compra.

---

# 34. Purchase UI

Formulário:

```text
card
category
description
amount
date
installments
```

Ao selecionar parcelas, mostrar o valor aproximado de cada parcela.

Não permitir que o usuário edite manualmente as parcelas.

---

# 35. Invoice UI

Listar:

```text
card
reference month
due date
total
status
```

Permitir:

```text
OPEN → CLOSE
CLOSED → PAY
```

Mostrar as compras/parcelas da fatura.

Para pagamento:

```text
invoice
account
```

---

# 36. Budget UI

Mostrar:

```text
category
limit
spent
available
```

Permitir:

* criar;
* editar;
* filtrar por mês/ano.

---

# 37. Interface

Priorizar:

* simplicidade;
* legibilidade;
* formulários claros;
* tabelas;
* feedback de sucesso/erro;
* mensagens de validação.

Não criar um design excessivamente complexo.

A aplicação deve ser fácil de navegar e fácil de utilizar.

---

# 38. Docker

Criar Docker Compose para:

```text
postgres
backend
frontend
```

Deve ser possível iniciar a aplicação com:

```bash
docker compose up
```

O PostgreSQL deve utilizar volume persistente.

Deve ser possível limpar o ambiente com:

```bash
docker compose down -v
```

---

# 39. Swagger/OpenAPI

Disponibilizar documentação interativa da API.

Documentar:

* endpoints;
* parâmetros;
* request;
* response;
* códigos HTTP;
* autenticação Bearer;
* exemplos.

---

# 40. Configuração

Não deixar:

* senha do banco;
* JWT secret;
* credenciais;

hardcoded no código.

Utilizar variáveis de ambiente.

Fornecer `.env.example`.

---

# 41. README

Criar README contendo:

* objetivo;
* funcionalidades;
* stack;
* arquitetura;
* como executar localmente;
* como executar com Docker;
* configuração das variáveis de ambiente;
* acesso ao frontend;
* acesso à API;
* acesso ao Swagger;
* estrutura do projeto;
* principais regras de negócio.

---

# 42. Qualidade do código

Priorizar:

* código legível;
* nomes claros;
* responsabilidades bem definidas;
* baixo acoplamento;
* DTOs para API;
* validação;
* tratamento global de exceções;
* transações no service layer;
* repositories simples;
* evitar lógica de negócio em controllers;
* evitar lógica de negócio dentro de entities quando isso tornar o projeto desnecessariamente complexo.

Não criar padrões de projeto apenas para demonstrar padrões.

Não criar abstrações genéricas sem necessidade.

---

# 43. Testes internos

Criar testes básicos da aplicação, principalmente para regras críticas.

Priorizar:

* criação de lançamento;
* transferência;
* compra parcelada;
* cálculo de limite;
* fechamento de fatura;
* pagamento de fatura;
* orçamento;
* regras de ownership.

Não criar uma suíte gigantesca.

---

# 44. Critérios de aceitação principais

A aplicação estará funcional quando for possível executar:

### Fluxo 1

```text
Cadastrar usuário
→ login
→ criar conta
→ registrar receita
→ verificar saldo
```

### Fluxo 2

```text
Registrar despesa
→ verificar saldo
→ verificar categoria
```

### Fluxo 3

```text
Conta A
→ transferir R$ 200
→ verificar Conta A
→ verificar Conta B
```

### Fluxo 4

```text
Criar cartão
→ limite R$ 3.000
→ compra R$ 1.200 em 6x
→ verificar 6 parcelas
→ verificar limite utilizado R$ 1.200
```

### Fluxo 5

```text
Fechar primeira fatura
→ tentar adicionar compra
→ operação rejeitada
```

### Fluxo 6

```text
Fechar fatura
→ pagar com conta
→ verificar saldo
→ verificar invoice PAID
→ verificar parcelas PAID
→ verificar limite liberado
```

### Fluxo 7

```text
Criar orçamento
→ criar despesas
→ consultar orçamento
→ verificar spent
→ verificar available
```

### Fluxo 8

```text
Criar dados financeiros
→ abrir dashboard
→ verificar agregações
```

---

# 45. Restrições finais de escopo

Não implementar funcionalidades que não estejam descritas neste documento.

Não transformar o projeto em um ERP.

Não criar módulos de:

* investimentos;
* empréstimos;
* bancos;
* pagamentos reais;
* Open Finance;
* notificações;
* integrações externas.

Se uma decisão de implementação não estiver explicitamente definida, escolha a solução mais simples que preserve as regras de negócio descritas.

Antes de adicionar uma nova entidade, tabela, endpoint ou tecnologia, verificar se ela é realmente necessária para o escopo definido.

O objetivo é produzir uma aplicação pequena/média, funcional, coerente e com regras de negócio suficientes para servir posteriormente como alvo de um projeto independente de QA e automação.

