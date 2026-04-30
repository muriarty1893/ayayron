package main

import (
	"context"
	"fmt"

	"ayayron/internal/database"
	"ayayron/internal/models"
	"ayayron/internal/repository"
)

type App struct {
	ctx  context.Context
	repo *repository.ApplicationRepo
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	db, err := database.Init()
	if err != nil {
		panic(fmt.Sprintf("failed to init database: %v", err))
	}
	a.repo = repository.NewApplicationRepo(db)
}

func (a *App) ListApplications(filter repository.ListFilter) ([]models.JobApplication, error) {
	return a.repo.List(filter)
}

func (a *App) GetApplication(id uint) (*models.JobApplication, error) {
	return a.repo.Get(id)
}

func (a *App) CreateApplication(input repository.ApplicationInput) (*models.JobApplication, error) {
	return a.repo.Create(input)
}

func (a *App) UpdateApplication(id uint, input repository.ApplicationInput) (*models.JobApplication, error) {
	return a.repo.Update(id, input)
}

func (a *App) DeleteApplication(id uint) error {
	return a.repo.Delete(id)
}

func (a *App) UpdateStatus(id uint, status models.Status) (*models.JobApplication, error) {
	return a.repo.UpdateStatus(id, status)
}

func (a *App) GetDashboardStats() (*models.DashboardStats, error) {
	return a.repo.Stats()
}

func (a *App) GetStatusDistribution() ([]models.StatusCount, error) {
	return a.repo.StatusDistribution()
}

func (a *App) GetApplicationsOverTime(days int) ([]models.TimeSeriesPoint, error) {
	return a.repo.ApplicationsOverTime(days)
}

func (a *App) GetRecentApplications(limit int) ([]models.JobApplication, error) {
	return a.repo.Recent(limit)
}
