-- Alter passport_expiry column type to store encrypted VARCHAR value
ALTER TABLE candidates ALTER COLUMN passport_expiry TYPE VARCHAR(255);
