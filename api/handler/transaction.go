package handler

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "time"

    "github.com/google/uuid"
    "zaimu/db"
    "zaimu/types"
)

func GetTransactions(w http.ResponseWriter, r *http.Request) {
    rows, err := db.Conn.Query(`
        SELECT
            t.id,
            t.date,
            t.merchant,
            t.category,
            t.description,
            t.amount,
            t.type,
            t.method,
            tt.tag
        FROM transactions t
        LEFT JOIN transaction_tags tt
            ON tt.transaction_id = t.id
        ORDER BY t.date DESC
    `)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    type agg struct {
        tx   types.Transaction
        tags []string
    }

    m := make(map[string]*agg)

    for rows.Next() {
        var (
            idStr string
            date  int64
            tag   sql.NullString
        )

        var tx types.Transaction

        if err := rows.Scan(
            &idStr,
            &date,
            &tx.Merchant,
            &tx.Category,
            &tx.Description,
            &tx.Amount,
            &tx.Type,
            &tx.Method,
            &tag,
        ); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        id, err := uuid.Parse(idStr)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        tx.ID = id
        tx.Date = time.Unix(date, 0)

        entry, ok := m[idStr]
        if !ok {
            entry = &agg{tx: tx}
            m[idStr] = entry
        }

        if tag.Valid {
            entry.tags = append(entry.tags, tag.String)
        }
    }

    out := make([]types.Transaction, 0, len(m))
    for _, v := range m {
        v.tx.Tags = v.tags
        out = append(out, v.tx)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(out)
}

