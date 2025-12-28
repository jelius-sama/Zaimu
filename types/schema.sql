CREATE TABLE transactions (
    id          TEXT PRIMARY KEY,         -- uuid.UUID (stored as string)
    date        INTEGER NOT NULL,          -- time.Time (Unix timestamp)
    merchant    TEXT NOT NULL,
    category    TEXT NOT NULL,
    description TEXT,
    amount      REAL NOT NULL,
    type        INTEGER NOT NULL,           -- TransactionType (enum)
    method      INTEGER NOT NULL            -- TransactionMethod (enum)
);

CREATE TABLE transaction_tags (
    transaction_id TEXT NOT NULL,
    tag             TEXT NOT NULL,

    PRIMARY KEY (transaction_id, tag),
    FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_transactions_date
    ON transactions(date);

CREATE INDEX idx_transactions_category
    ON transactions(date, category);

CREATE INDEX idx_transaction_tags_tag
    ON transaction_tags(tag);

WITH month_tx AS (
    SELECT amount, category
    FROM transactions
    WHERE date >= :month_start
      AND date <  :month_end
),
totals AS (
    SELECT SUM(amount) AS grand_total
    FROM month_tx
)
SELECT
    m.category        AS name,
    SUM(m.amount)     AS total,
    COUNT(*)          AS count,
    (SUM(m.amount) / t.grand_total) * 100.0 AS percentage
FROM month_tx m, totals t
GROUP BY m.category
ORDER BY total DESC;

CREATE TABLE monthly_data (
    id        TEXT PRIMARY KEY,
    year      INTEGER NOT NULL CHECK (year BETWEEN 0 AND 65535),
    month     TEXT NOT NULL CHECK (
        month IN ('jan','feb','mar','apr','may','jun',
                  'jul','aug','sep','oct','nov','dec')
    ),
    income    REAL NOT NULL DEFAULT 0,
    expenses  REAL NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX idx_monthly_year_month
    ON monthly_data(year, month);


CREATE TRIGGER trg_tx_after_insert
AFTER INSERT ON transactions
BEGIN
    INSERT INTO monthly_data (id, year, month, income, expenses)
    VALUES (
        CAST(strftime('%Y', NEW.date, 'unixepoch') AS INTEGER) || '-' ||
        lower(substr('janfebmaraprmayjunjulaugsepoctnovdec',
             (CAST(strftime('%m', NEW.date, 'unixepoch') AS INTEGER) - 1) * 3 + 1, 3)),
        CAST(strftime('%Y', NEW.date, 'unixepoch') AS INTEGER),
        lower(substr('janfebmaraprmayjunjulaugsepoctnovdec',
             (CAST(strftime('%m', NEW.date, 'unixepoch') AS INTEGER) - 1) * 3 + 1, 3)),
        -- income
        (
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE type = 1
              AND date >= strftime('%s', date(NEW.date, 'unixepoch', 'start of month'))
              AND date <  strftime('%s', date(NEW.date, 'unixepoch', 'start of month', '+1 month'))
        ),
        -- expenses
        (
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE type = 0
              AND date >= strftime('%s', date(NEW.date, 'unixepoch', 'start of month'))
              AND date <  strftime('%s', date(NEW.date, 'unixepoch', 'start of month', '+1 month'))
        )
    )
    ON CONFLICT(year, month)
    DO UPDATE SET
        income   = excluded.income,
        expenses = excluded.expenses;
END;

CREATE TRIGGER trg_tx_after_update
AFTER UPDATE ON transactions
BEGIN
    -- recompute OLD month
    UPDATE monthly_data
    SET
        income = (
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE type = 1
              AND date >= strftime('%s', date(OLD.date, 'unixepoch', 'start of month'))
              AND date <  strftime('%s', date(OLD.date, 'unixepoch', 'start of month', '+1 month'))
        ),
        expenses = (
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE type = 0
              AND date >= strftime('%s', date(OLD.date, 'unixepoch', 'start of month'))
              AND date <  strftime('%s', date(OLD.date, 'unixepoch', 'start of month', '+1 month'))
        )
    WHERE year = CAST(strftime('%Y', OLD.date, 'unixepoch') AS INTEGER)
      AND month = lower(substr('janfebmaraprmayjunjulaugsepoctnovdec',
           (CAST(strftime('%m', OLD.date, 'unixepoch') AS INTEGER) - 1) * 3 + 1, 3));

    -- recompute NEW month (insert if missing)
    INSERT INTO monthly_data (id, year, month, income, expenses)
    VALUES (
        CAST(strftime('%Y', NEW.date, 'unixepoch') AS INTEGER) || '-' ||
        lower(substr('janfebmaraprmayjunjulaugsepoctnovdec',
             (CAST(strftime('%m', NEW.date, 'unixepoch') AS INTEGER) - 1) * 3 + 1, 3)),
        CAST(strftime('%Y', NEW.date, 'unixepoch') AS INTEGER),
        lower(substr('janfebmaraprmayjunjulaugsepoctnovdec',
             (CAST(strftime('%m', NEW.date, 'unixepoch') AS INTEGER) - 1) * 3 + 1, 3)),
        (
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE type = 1
              AND date >= strftime('%s', date(NEW.date, 'unixepoch', 'start of month'))
              AND date <  strftime('%s', date(NEW.date, 'unixepoch', 'start of month', '+1 month'))
        ),
        (
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE type = 0
              AND date >= strftime('%s', date(NEW.date, 'unixepoch', 'start of month'))
              AND date <  strftime('%s', date(NEW.date, 'unixepoch', 'start of month', '+1 month'))
        )
    )
    ON CONFLICT(year, month)
    DO UPDATE SET
        income   = excluded.income,
        expenses = excluded.expenses;
END;
