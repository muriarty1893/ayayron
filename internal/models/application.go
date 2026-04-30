package models

import "time"

type Status string

const (
	StatusApplied            Status = "applied"
	StatusPhoneScreen        Status = "phone_screen"
	StatusTechnicalInterview Status = "technical_interview"
	StatusFinalInterview     Status = "final_interview"
	StatusOffer              Status = "offer"
	StatusRejected           Status = "rejected"
	StatusWithdrawn          Status = "withdrawn"
)

var StatusOrder = []Status{
	StatusApplied,
	StatusPhoneScreen,
	StatusTechnicalInterview,
	StatusFinalInterview,
	StatusOffer,
	StatusRejected,
	StatusWithdrawn,
}

type JobApplication struct {
	ID            uint      `gorm:"primaryKey"       json:"id"`
	Company       string    `gorm:"not null;index"   json:"company"`
	Position      string    `gorm:"not null"         json:"position"`
	Location      string    `json:"location"`
	JobURL        string    `json:"jobUrl"`
	Status        Status    `gorm:"not null;index"   json:"status"`
	AppliedDate   time.Time `gorm:"not null;index"   json:"appliedDate"`
	Notes         string    `json:"notes"`
	ContactPerson string    `json:"contactPerson"`
	SalaryMin     *int      `json:"salaryMin"`
	SalaryMax     *int      `json:"salaryMax"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
