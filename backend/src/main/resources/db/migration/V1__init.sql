-- V1: schema inicial do Finance Control

CREATE TABLE app_user (
    id            UUID         PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    NOT NULL
);

CREATE TABLE account (
    id             UUID         PRIMARY KEY,
    user_id        UUID         NOT NULL REFERENCES app_user (id),
    name           VARCHAR(100) NOT NULL,
    type           VARCHAR(20)  NOT NULL CHECK (type IN ('CHECKING', 'SAVINGS', 'CASH')),
    initial_balance DECIMAL(15,2) NOT NULL CHECK (initial_balance >= 0),
    balance        DECIMAL(15,2) NOT NULL,
    status         VARCHAR(20)  NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at     TIMESTAMP    NOT NULL,
    updated_at     TIMESTAMP
);

CREATE INDEX idx_account_user ON account (user_id);

CREATE TABLE category (
    id         UUID         PRIMARY KEY,
    user_id    UUID         NOT NULL REFERENCES app_user (id),
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(20)  NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    status     VARCHAR(20)  NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP
);

CREATE INDEX idx_category_user ON category (user_id);

CREATE TABLE transaction (
    id               UUID          PRIMARY KEY,
    user_id          UUID          NOT NULL REFERENCES app_user (id),
    account_id       UUID          NOT NULL REFERENCES account (id),
    category_id      UUID          NOT NULL REFERENCES category (id),
    type             VARCHAR(20)   NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    description      VARCHAR(255),
    amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_date DATE          NOT NULL,
    created_at       TIMESTAMP     NOT NULL
);

CREATE INDEX idx_transaction_user_date ON transaction (user_id, transaction_date DESC);
CREATE INDEX idx_transaction_account ON transaction (account_id);
CREATE INDEX idx_transaction_category ON transaction (category_id);

CREATE TABLE transfer (
    id                   UUID          PRIMARY KEY,
    user_id              UUID          NOT NULL REFERENCES app_user (id),
    source_account_id    UUID          NOT NULL REFERENCES account (id),
    destination_account_id UUID        NOT NULL REFERENCES account (id),
    amount               DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transfer_date        DATE          NOT NULL,
    description          VARCHAR(255),
    created_at           TIMESTAMP     NOT NULL
);

CREATE INDEX idx_transfer_user_date ON transfer (user_id, transfer_date DESC);
CREATE INDEX idx_transfer_source ON transfer (source_account_id);
CREATE INDEX idx_transfer_destination ON transfer (destination_account_id);

CREATE TABLE credit_card (
    id            UUID          PRIMARY KEY,
    user_id       UUID          NOT NULL REFERENCES app_user (id),
    name          VARCHAR(100)  NOT NULL,
    credit_limit  DECIMAL(15,2) NOT NULL CHECK (credit_limit > 0),
    closing_day   INTEGER       NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
    due_day       INTEGER       NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    status        VARCHAR(20)   NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at    TIMESTAMP     NOT NULL,
    updated_at    TIMESTAMP
);

CREATE INDEX idx_credit_card_user ON credit_card (user_id);

CREATE TABLE invoice (
    id             UUID          PRIMARY KEY,
    credit_card_id UUID          NOT NULL REFERENCES credit_card (id),
    reference_month DATE         NOT NULL,
    closing_date   DATE          NOT NULL,
    due_date       DATE          NOT NULL,
    status         VARCHAR(20)   NOT NULL CHECK (status IN ('OPEN', 'CLOSED', 'PAID')),
    total_amount   DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    paid_at        TIMESTAMP,
    created_at     TIMESTAMP     NOT NULL,
    CONSTRAINT uq_invoice_card_month UNIQUE (credit_card_id, reference_month),
    CONSTRAINT chk_invoice_reference_month_first_day
        CHECK (reference_month = date_trunc('month', reference_month)::date)
);

CREATE INDEX idx_invoice_card ON invoice (credit_card_id, reference_month DESC);

CREATE TABLE purchase (
    id                 UUID          PRIMARY KEY,
    credit_card_id     UUID          NOT NULL REFERENCES credit_card (id),
    category_id        UUID          NOT NULL REFERENCES category (id),
    description        VARCHAR(255),
    total_amount       DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
    installments_count INTEGER       NOT NULL CHECK (installments_count >= 1),
    purchase_date      DATE          NOT NULL,
    created_at         TIMESTAMP     NOT NULL
);

CREATE INDEX idx_purchase_card_date ON purchase (credit_card_id, purchase_date DESC);
CREATE INDEX idx_purchase_category ON purchase (category_id);

CREATE TABLE installment (
    id                 UUID          PRIMARY KEY,
    purchase_id        UUID          NOT NULL REFERENCES purchase (id),
    invoice_id         UUID          NOT NULL REFERENCES invoice (id),
    installment_number INTEGER       NOT NULL CHECK (installment_number >= 1),
    amount             DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    status             VARCHAR(20)   NOT NULL CHECK (status IN ('OPEN', 'PAID')),
    created_at         TIMESTAMP     NOT NULL,
    CONSTRAINT uq_installment_purchase_number UNIQUE (purchase_id, installment_number)
);

CREATE INDEX idx_installment_invoice ON installment (invoice_id);
CREATE INDEX idx_installment_purchase ON installment (purchase_id);

CREATE TABLE budget (
    id         UUID          PRIMARY KEY,
    user_id    UUID          NOT NULL REFERENCES app_user (id),
    category_id UUID         NOT NULL REFERENCES category (id),
    month      INTEGER       NOT NULL CHECK (month BETWEEN 1 AND 12),
    year       INTEGER       NOT NULL,
    amount     DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP     NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT uq_budget_user_category_month_year UNIQUE (user_id, category_id, month, year)
);

CREATE INDEX idx_budget_user ON budget (user_id, year, month);