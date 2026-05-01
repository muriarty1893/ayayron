package repository

import (
	"time"

	"gorm.io/gorm"

	"ayayron/internal/models"
)

type InstallationRepo struct {
	db *gorm.DB
}

func NewInstallationRepo(db *gorm.DB) *InstallationRepo {
	return &InstallationRepo{db: db}
}

func (r *InstallationRepo) Create(toolID, toolName string, status models.InstallStatus, output string, durationMs int64) (*models.Installation, error) {
	rec := models.Installation{
		ToolID:     toolID,
		ToolName:   toolName,
		Status:     status,
		Output:     output,
		DurationMs: durationMs,
	}
	if status == models.StatusInstalled {
		now := time.Now()
		rec.InstalledAt = &now
	}
	return &rec, r.db.Create(&rec).Error
}

func (r *InstallationRepo) List(limit int) ([]models.Installation, error) {
	var recs []models.Installation
	q := r.db.Order("created_at DESC")
	if limit > 0 {
		q = q.Limit(limit)
	}
	return recs, q.Find(&recs).Error
}
