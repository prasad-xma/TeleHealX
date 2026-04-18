Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$envFile = Join-Path $repoRoot ".env"
$namespace = "telehealx"
$secretName = "telehealx-secrets"

if (-not (Test-Path $envFile)) {
    throw "Missing .env at repository root. Create it first (copy .env.example to .env and fill real values)."
}

Write-Host "Ensuring namespace $namespace exists..."
kubectl get namespace $namespace *> $null
if ($LASTEXITCODE -ne 0) {
    kubectl create namespace $namespace | Out-Null
}

Write-Host "Creating/updating Kubernetes Secret from .env..."
kubectl create secret generic $secretName `
    --namespace $namespace `
    --from-env-file $envFile `
    --dry-run=client -o yaml | kubectl apply -f - | Out-Null

Write-Host "Applying manifests..."
kubectl apply -f (Join-Path $scriptDir "deployment.yaml") | Out-Null

Write-Host "Restarting deployments to pick up updated secret values..."
kubectl -n $namespace rollout restart deployment | Out-Null

Write-Host "Done. Deployment applied with secrets loaded from .env."