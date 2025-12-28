package unixsocket

import (
    "fmt"
    "zaimu/types"
)

// TODO: Implement email parsing
func parseEmail(data []byte) (*types.Transaction, error) {
    // t, _ := time.Parse(time.RFC3339, "2024-12-02T09:00:00Z")

    // TODO: real parsing later
    // test := types.Transaction{
    //     ID:          uuid.New(),
    //     Date:        t,
    //     Merchant:    "Salary",
    //     Category:    "Income",
    //     Description: "December salary",
    //     Amount:      7000,
    //     Type:        1,
    //     Method:      1,
    //     Tags:        []string{"salary", "income"},
    // }

    return nil /* nil */, fmt.Errorf("email processing not implemented")
}

