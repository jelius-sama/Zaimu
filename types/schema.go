package types

import "time"

type TransactionType int
type TransactionMethod int

const (
    TTExpense TransactionType = iota
    TTIncome
)

const (
    TMCard TransactionMethod = iota
    TMTransfer
    TMCash
)

var ttName = map[TransactionType]string{
    TTExpense: "expense",
    TTIncome:  "income",
}

var tmName = map[TransactionMethod]string{
    TMCard:     "card",
    TMTransfer: "transfer",
    TMCash:     "cash",
}

func (tt TransactionType) String() string {
    return ttName[tt]
}

func (tm TransactionMethod) String() string {
    return tmName[tm]
}

type Transaction struct {
    ID          string            `json:"id"`
    Date        time.Time         `json:"date"`
    Merchant    string            `json:"merchant"`
    Category    string            `json:"category"`
    Description string            `json:"description"`
    Amount      int64             `json:"amount"`
    Type        TransactionType   `json:"type"`
    Method      TransactionMethod `json:"method"`
    Tags        []string          `json:"tags"`
}

type CategorySummary struct {
    Name       string `json:"name"`
    Total      int    `json:"total"`
    Count      int    `json:"count"`
    Percentage int    `json:"percentage"`
}

type DateRange struct {
    Start time.Time `json:"start"`
    End   time.Time `json:"end"`
}

type MonthlyData struct {
    Month    string `json:"month"`
    Income   int    `json:"income"`
    Expenses int    `json:"expenses"`
}

// TODO: Tommorow, implement client API (don't forget to fill the DB with mock datas) replacing all the functions in mock-data, then work on backend APIs.

