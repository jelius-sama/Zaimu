package handler

import (
    "encoding/json"
    "net/http"
    "time"

    "github.com/google/uuid"
    "zaimu/db"
    "zaimu/types"
)

type createTransactionReq struct {
    Date        time.Time               `json:"date"`
    Merchant    string                  `json:"merchant"`
    Category    string                  `json:"category"`
    Description string                  `json:"description"`
    Amount      float64                 `json:"amount"`
    Type        types.TransactionType   `json:"type"`
    Method      types.TransactionMethod `json:"method"`
    Tags        []string                `json:"tags"`
}

func CreateTransaction(w http.ResponseWriter, r *http.Request) {
    var req createTransactionReq
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid JSON body", http.StatusBadRequest)
        return
    }

    // Basic validation (intentionally minimal)
    if req.Merchant == "" {
        http.Error(w, "merchant and category are required", http.StatusBadRequest)
        return
    }

    if req.Category == "" {
        req.Category = "Miscellaneous"
    }

    if req.Amount <= 0 {
        http.Error(w, "amount must be > 0", http.StatusBadRequest)
        return
    }

    if req.Type != types.TTExpense && req.Type != types.TTIncome {
        http.Error(w, "invalid transaction type", http.StatusBadRequest)
        return
    }

    if req.Method < types.TMCard || req.Method > types.TMCash {
        http.Error(w, "invalid transaction method", http.StatusBadRequest)
        return
    }

    txID := uuid.New()
    ts := req.Date.UTC().Unix()

    // Use a DB transaction for atomicity
    tx, err := db.Conn.Begin()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer tx.Rollback()

    // Insert transaction
    _, err = tx.Exec(`
        INSERT INTO transactions
            (id, date, merchant, category, description, amount, type, method)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
    `,
        txID.String(),
        ts,
        req.Merchant,
        req.Category,
        req.Description,
        req.Amount,
        req.Type,
        req.Method,
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Insert tags (if any)
    if len(req.Tags) > 0 {
        stmt, err := tx.Prepare(`
            INSERT INTO transaction_tags (transaction_id, tag)
            VALUES (?, ?)
        `)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        defer stmt.Close()

        for _, tag := range req.Tags {
            if tag == "" {
                continue
            }
            if _, err := stmt.Exec(txID.String(), tag); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
        }
    }

    if err := tx.Commit(); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    resp := types.Transaction{
        ID:          txID,
        Date:        time.Unix(ts, 0).UTC(),
        Merchant:    req.Merchant,
        Category:    req.Category,
        Description: req.Description,
        Amount:      req.Amount,
        Type:        req.Type,
        Method:      req.Method,
        Tags:        req.Tags,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(resp)
}

