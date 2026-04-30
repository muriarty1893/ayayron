package repository

import (
	"fmt"
	"time"

	"gorm.io/gorm"

	"ayayron/internal/models"
)

type ListFilter struct {
	Search   string          `json:"search"`
	Statuses []models.Status `json:"statuses"`
	SortBy   string          `json:"sortBy"`
	SortDir  string          `json:"sortDir"`
}

type ApplicationInput struct {
	Company       string        `json:"company"`
	Position      string        `json:"position"`
	Location      string        `json:"location"`
	JobURL        string        `json:"jobUrl"`
	Status        models.Status `json:"status"`
	AppliedDate   time.Time     `json:"appliedDate"`
	Notes         string        `json:"notes"`
	ContactPerson string        `json:"contactPerson"`
	SalaryMin     *int          `json:"salaryMin"`
	SalaryMax     *int          `json:"salaryMax"`
}

type ApplicationRepo struct {
	db *gorm.DB
}

func NewApplicationRepo(db *gorm.DB) *ApplicationRepo {
	return &ApplicationRepo{db: db}
}

func (r *ApplicationRepo) List(filter ListFilter) ([]models.JobApplication, error) {
	query := r.db.Model(&models.JobApplication{})

	if filter.Search != "" {
		like := "%" + filter.Search + "%"
		query = query.Where("company LIKE ? OR position LIKE ? OR location LIKE ?", like, like, like)
	}

	if len(filter.Statuses) > 0 {
		query = query.Where("status IN ?", filter.Statuses)
	}

	sortBy := "applied_date"
	switch filter.SortBy {
	case "company":
		sortBy = "company"
	case "status":
		sortBy = "status"
	case "appliedDate":
		sortBy = "applied_date"
	}

	sortDir := "DESC"
	if filter.SortDir == "asc" {
		sortDir = "ASC"
	}

	query = query.Order(fmt.Sprintf("%s %s", sortBy, sortDir))

	var apps []models.JobApplication
	return apps, query.Find(&apps).Error
}

func (r *ApplicationRepo) Get(id uint) (*models.JobApplication, error) {
	var app models.JobApplication
	err := r.db.First(&app, id).Error
	return &app, err
}

func (r *ApplicationRepo) Create(input ApplicationInput) (*models.JobApplication, error) {
	app := models.JobApplication{
		Company:       input.Company,
		Position:      input.Position,
		Location:      input.Location,
		JobURL:        input.JobURL,
		Status:        input.Status,
		AppliedDate:   input.AppliedDate,
		Notes:         input.Notes,
		ContactPerson: input.ContactPerson,
		SalaryMin:     input.SalaryMin,
		SalaryMax:     input.SalaryMax,
	}
	return &app, r.db.Create(&app).Error
}

func (r *ApplicationRepo) Update(id uint, input ApplicationInput) (*models.JobApplication, error) {
	app, err := r.Get(id)
	if err != nil {
		return nil, err
	}

	app.Company = input.Company
	app.Position = input.Position
	app.Location = input.Location
	app.JobURL = input.JobURL
	app.Status = input.Status
	app.AppliedDate = input.AppliedDate
	app.Notes = input.Notes
	app.ContactPerson = input.ContactPerson
	app.SalaryMin = input.SalaryMin
	app.SalaryMax = input.SalaryMax

	return app, r.db.Save(app).Error
}

func (r *ApplicationRepo) Delete(id uint) error {
	return r.db.Delete(&models.JobApplication{}, id).Error
}

func (r *ApplicationRepo) UpdateStatus(id uint, status models.Status) (*models.JobApplication, error) {
	app, err := r.Get(id)
	if err != nil {
		return nil, err
	}
	app.Status = status
	return app, r.db.Save(app).Error
}

func (r *ApplicationRepo) Stats() (*models.DashboardStats, error) {
	var stats models.DashboardStats

	r.db.Model(&models.JobApplication{}).Count(&stats.Total)

	activeStatuses := []models.Status{
		models.StatusApplied,
		models.StatusPhoneScreen,
		models.StatusTechnicalInterview,
		models.StatusFinalInterview,
	}
	r.db.Model(&models.JobApplication{}).Where("status IN ?", activeStatuses).Count(&stats.Active)
	r.db.Model(&models.JobApplication{}).Where("status = ?", models.StatusOffer).Count(&stats.Offers)
	r.db.Model(&models.JobApplication{}).Where("status = ?", models.StatusRejected).Count(&stats.Rejected)

	return &stats, nil
}

func (r *ApplicationRepo) StatusDistribution() ([]models.StatusCount, error) {
	var results []struct {
		Status models.Status
		Count  int64
	}
	err := r.db.Model(&models.JobApplication{}).
		Select("status, count(*) as count").
		Group("status").
		Find(&results).Error

	counts := make([]models.StatusCount, len(results))
	for i, res := range results {
		counts[i] = models.StatusCount{Status: res.Status, Count: res.Count}
	}
	return counts, err
}

func (r *ApplicationRepo) ApplicationsOverTime(days int) ([]models.TimeSeriesPoint, error) {
	since := time.Now().AddDate(0, 0, -days)

	var results []struct {
		Date  string
		Count int64
	}
	err := r.db.Model(&models.JobApplication{}).
		Select("date(applied_date) as date, count(*) as count").
		Where("applied_date >= ?", since).
		Group("date(applied_date)").
		Order("date ASC").
		Find(&results).Error

	points := make([]models.TimeSeriesPoint, len(results))
	for i, res := range results {
		points[i] = models.TimeSeriesPoint{Date: res.Date, Count: res.Count}
	}
	return points, err
}

func (r *ApplicationRepo) Recent(limit int) ([]models.JobApplication, error) {
	var apps []models.JobApplication
	return apps, r.db.Order("created_at DESC").Limit(limit).Find(&apps).Error
}
