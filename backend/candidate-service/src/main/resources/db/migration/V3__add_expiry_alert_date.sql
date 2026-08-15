ALTER TABLE candidates ADD COLUMN expiry_alert_date DATE;
CREATE INDEX idx_candidates_expiry_alert_date ON candidates (expiry_alert_date);
