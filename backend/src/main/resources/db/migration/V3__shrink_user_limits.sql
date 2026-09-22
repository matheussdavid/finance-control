-- V3: reduz limites dos campos de cadastro (name/username 50, email 100)

ALTER TABLE app_user ALTER COLUMN name TYPE VARCHAR(50);
ALTER TABLE app_user ALTER COLUMN email TYPE VARCHAR(100);
ALTER TABLE app_user ALTER COLUMN username TYPE VARCHAR(50);