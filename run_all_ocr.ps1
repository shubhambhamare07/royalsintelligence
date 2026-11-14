. .\run_ocr.ps1

$testFiles = @(
    "rr-pressure-platform\reports\crop_sidebar_test.png",
    "rr-pressure-platform\reports\crop_header_test.png",
    "rr-pressure-platform\reports\crop_hero_test.png",
    "rr-pressure-platform\reports\crop_stats_test.png",
    "rr-pressure-platform\reports\crop_cards_test.png",
    "rr-pressure-platform\reports\crop_right_test.png"
)

foreach ($f in $testFiles) {
    Write-Host "=============================="
    Write-Host "FILE: $f"
    try {
        $txt = Get-OcrText -FilePath $f
        Write-Host $txt
    } catch {
        Write-Host "Error: $_"
    }
}

