-- V2: adiciona username único em app_user

ALTER TABLE app_user ADD COLUMN username VARCHAR(100);

UPDATE app_user SET username = LEFT(email, 100) WHERE username IS NULL;

ALTER TABLE app_user ALTER COLUMN username SET NOT NULL;

ALTER TABLE app_user ADD CONSTRAINT uk_app_user_username UNIQUE (username);