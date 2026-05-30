package models

type Category string

const (
	CategoryCore      Category = "core"
	CategoryLanguages Category = "languages"
	CategoryDatabases Category = "databases"
	CategoryCloud     Category = "cloud"
	CategoryEditors   Category = "editors"
	CategoryTerminal  Category = "terminal"
	CategoryDotfiles  Category = "dotfiles"
	CategoryApps      Category = "apps"
)

type PermissionLevel string

const (
	PermissionUser  PermissionLevel = "user"
	PermissionAdmin PermissionLevel = "admin"
)

// Tool is a parsed registry entry. IsInstalled and Version are populated at runtime.
type Tool struct {
	ID              string          `json:"id"`
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	Category        Category        `json:"category"`
	Section         string          `json:"section"`
	PermissionLevel PermissionLevel `json:"permissionLevel"`
	DefaultEnabled  bool            `json:"defaultEnabled"`
	RequiresSudo    bool            `json:"requiresSudo"`
	IsInstalled     bool            `json:"isInstalled"`
	Version         string          `json:"version,omitempty"`
}

// Profile is a preset bundle of tools.
type Profile struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Icon    string   `json:"icon"`
	ToolIDs []string `json:"toolIds"`
}

type InstallStatus string

const (
	StatusInstalled InstallStatus = "installed"
	StatusFailed    InstallStatus = "failed"
	StatusSkipped   InstallStatus = "skipped"
)
