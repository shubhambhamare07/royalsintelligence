$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$reportsDir = "C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\reports"
$tempDir = [System.IO.Path]::Combine($env:TEMP, "chrome_dossier_test")

if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

$urls = @(
    @{ name = "verified_profile_6931.png"; url = "http://localhost:3000/player/6931" },
    @{ name = "verified_profile_8661.png"; url = "http://localhost:3000/player/8661" },
    @{ name = "verified_profile_4260.png"; url = "http://localhost:3000/player/4260" },
    @{ name = "verified_home_1672x941.png"; url = "http://localhost:3000/" }
)

foreach ($item in $urls) {
    $outPath = [System.IO.Path]::Combine($reportsDir, $item.name)
    Write-Host "Capturing $($item.url) to $outPath..."
    
    $args = @(
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--user-data-dir=$tempDir",
        "--screenshot=$outPath",
        "--window-size=1672,941",
        "--hide-scrollbars",
        "--virtual-time-budget=3000",
        $item.url
    )
    
    $process = Start-Process -FilePath $chrome -ArgumentList $args -NoNewWindow -Wait -PassThru
    Write-Host "Chrome exited with code $($process.ExitCode). File size: $((Get-Item $outPath).Length) bytes."
    Start-Sleep -Seconds 1
}

Write-Host "All captures complete!"

