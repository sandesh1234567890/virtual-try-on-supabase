$port = 3005
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($connections) {
    Write-Host "Found connections on port $port. Terminating processes..."
    foreach ($conn in $connections) {
        try {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Terminated process $($conn.OwningProcess)"
        }
        catch {
            Write-Host "Failed to terminate process $($conn.OwningProcess)"
        }
    }
}
else {
    Write-Host "No connections found on port $port."
}

Write-Host "Starting development server on port $port..."
npm run dev -- -p $port
