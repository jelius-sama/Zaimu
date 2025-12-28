package handler

type Metadata struct {
    Page        int  `json:"page"`
    TotalItems  int  `json:"totalItems"`
    HasNextPage bool `json:"hasNextPage"`
}

