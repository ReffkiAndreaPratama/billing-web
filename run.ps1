param(
  [ValidateSet("dev","prod")]
  [string]$Mode = "dev"
)

if ($Mode -eq "dev") {
  Write-Host "=== Billing Pro — Dev Mode ===" -ForegroundColor Cyan
  docker compose -f docker-compose.yml up -d
  Start-Process powershell -ArgumentList "-NoExit cd backend; npm run start:dev"
  Start-Process powershell -ArgumentList "-NoExit cd frontend; npm run dev"
} else {
  Write-Host "=== Billing Pro — Production Deploy ===" -ForegroundColor Green
  docker compose -f docker-compose.prod.yml build
  docker compose -f docker-compose.prod.yml up -d
  Write-Host "Deployed! Run 'docker compose -f docker-compose.prod.yml logs -f' to watch." -ForegroundColor Cyan
}
