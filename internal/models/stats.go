package models

type DashboardStats struct {
	Total    int64 `json:"total"`
	Active   int64 `json:"active"`
	Offers   int64 `json:"offers"`
	Rejected int64 `json:"rejected"`
}

type StatusCount struct {
	Status Status `json:"status"`
	Count  int64  `json:"count"`
}

type TimeSeriesPoint struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}
