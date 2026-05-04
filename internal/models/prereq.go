package models

// Prerequisite is a platform-level dependency the installer scripts need.
type Prerequisite struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsInstalled bool   `json:"isInstalled"`
	Required    bool   `json:"required"`
	// InstallNote is shown below the Install button to set expectations.
	InstallNote string `json:"installNote"`
}
