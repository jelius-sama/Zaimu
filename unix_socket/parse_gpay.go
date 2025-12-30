package unixsocket

import (
    "fmt"
    "zaimu/types"
)

// TODO: Implement email parsing
func parseGPayEmail(rawEml []byte) (*types.Transaction, error) {
    // parse Google transaction / alert format
    return nil, fmt.Errorf("google email parsing not implemented")
}

