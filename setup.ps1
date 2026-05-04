# Setup script for Ayayron (Windows) — installs all build dependencies.
# Usage: powershell -ExecutionPolicy Bypass -File setup.ps1
#Requires -Version 5.1

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n-> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "v $msg"   -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "! $msg"   -ForegroundColor Yellow }

function Refresh-Path {
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

function Ensure-Winget {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Host "winget not found. Install App Installer from the Microsoft Store, then re-run this script." -ForegroundColor Red
        exit 1
    }
    Write-Ok "winget available"
}

function Ensure-Go {
    Refresh-Path
    if (Get-Command go -ErrorAction SilentlyContinue) {
        $ver = (go version) -replace '.*go(\d+\.\d+).*', '$1'
        $major, $minor = $ver.Split('.')
        if ([int]$major -ge 1 -and [int]$minor -ge 21) {
            Write-Ok "Go $ver already installed"; return
        }
        Write-Warn "Go version too old — upgrading"
    }
    Write-Step "Installing Go"
    winget install --id GoLang.Go --accept-source-agreements --accept-package-agreements --silent
    Refresh-Path
    Write-Ok "Go installed"
}

function Ensure-Node {
    Refresh-Path
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $major = (node --version).TrimStart('v').Split('.')[0]
        if ([int]$major -ge 18) {
            Write-Ok "Node.js $(node --version) already installed"; return
        }
        Write-Warn "Node.js version too old — upgrading"
    }
    Write-Step "Installing Node.js 20 LTS"
    winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
    Refresh-Path
    Write-Ok "Node.js $(node --version) installed"
}

function Ensure-Wails {
    Refresh-Path
    if (Get-Command wails -ErrorAction SilentlyContinue) {
        Write-Ok "Wails already installed"; return
    }
    Write-Step "Installing Wails CLI"
    go install github.com/wailsapp/wails/v2/cmd/wails@latest
    Refresh-Path
    Write-Ok "Wails CLI installed"
}

function Check-WebView2 {
    $key = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
    if (Test-Path $key) {
        Write-Ok "WebView2 runtime already installed"
    } else {
        Write-Warn "WebView2 runtime not found — downloading installer"
        $installer = "$env:TEMP\MicrosoftEdgeWebview2Setup.exe"
        Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile $installer
        Start-Process -FilePath $installer -ArgumentList "/silent /install" -Wait
        Write-Ok "WebView2 runtime installed"
    }
}

Write-Host "=== Ayayron - Build Setup ===" -ForegroundColor Magenta

Ensure-Winget
Ensure-Go
Ensure-Node
Ensure-Wails
Check-WebView2

Write-Host "`n=== Setup complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Run the app:"
Write-Host "  wails dev        # development (hot reload)"
Write-Host "  wails build      # production binary -> build\bin\ayayron.exe"
