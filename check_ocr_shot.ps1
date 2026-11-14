. .\run_ocr.ps1
$regions = @("brand", "topnav", "hero", "stats", "rankings", "right")
foreach ($r in $regions) {
    $p = "rr-pressure-platform\reports\comp_${r}_shot.png"
    $t = Get-OcrText -FilePath $p
    Write-Host "=== SHOT $r ==="
    Write-Host $t
}

