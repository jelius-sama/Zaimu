package handler

type Metadata struct {
    Page        int  `json:"page"`
    PageSize    int  `json:"pageSize"`
    TotalItems  int  `json:"totalItems"`
    TotalPages  int  `json:"totalPages"`
    HasNextPage bool `json:"hasNextPage"`
}

func calcMetadata(page, pageSize, total int) Metadata {
    totalPages := (total + pageSize - 1) / pageSize
    return Metadata{
        Page:        page,
        PageSize:    pageSize,
        TotalItems:  total,
        TotalPages:  totalPages,
        HasNextPage: page < totalPages,
    }
}

