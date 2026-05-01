package models

import "time"

// Installation records a single tool install attempt. Persisted in SQLite.
type Installation struct {
	ID          uint          `gorm:"primaryKey"     json:"id"`
	ToolID      string        `gorm:"not null;index" json:"toolId"`
	ToolName    string        `gorm:"not null"       json:"toolName"`
	Status      InstallStatus `gorm:"not null"       json:"status"`
	Output      string        `json:"output"`
	DurationMs  int64         `json:"durationMs"`
	InstalledAt *time.Time    `json:"installedAt"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}
