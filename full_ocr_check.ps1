. .\run_ocr.ps1

Write-Host "=== OCR SIDEBAR ==="
$sideCrop = "rr-pressure-platform\reports\ocr_sidebar.png"
[System.Drawing.Bitmap]::FromFile("rr-pressure-platform\reports\browser_home_screen_1672x941.png").Clone([System.Drawing.Rectangle]::new(0, 0, 225, 941), [System.Drawing.Imaging.PixelFormat]::Format24bppRgb).Save($sideCrop)
Get-OcrText -FilePath $sideCrop

Write-Host "`n=== OCR STATS ==="
$statsCrop = "rr-pressure-platform\reports\ocr_stats.png"
[System.Drawing.Bitmap]::FromFile("rr-pressure-platform\reports\browser_home_screen_1672x941.png").Clone([System.Drawing.Rectangle]::new(225, 190, 1447, 90), [System.Drawing.Imaging.PixelFormat]::Format24bppRgb).Save($statsCrop)
Get-OcrText -FilePath $statsCrop

Write-Host "`n=== OCR PLAYER CARDS ==="
$rankCrop = "rr-pressure-platform\reports\ocr_rankings.png"
[System.Drawing.Bitmap]::FromFile("rr-pressure-platform\reports\browser_home_screen_1672x941.png").Clone([System.Drawing.Rectangle]::new(235, 270, 940, 660), [System.Drawing.Imaging.PixelFormat]::Format24bppRgb).Save($rankCrop)
Get-OcrText -FilePath $rankCrop

Write-Host "`n=== OCR RIGHT COLUMN ==="
$rightCrop = "rr-pressure-platform\reports\ocr_right.png"
[System.Drawing.Bitmap]::FromFile("rr-pressure-platform\reports\browser_home_screen_1672x941.png").Clone([System.Drawing.Rectangle]::new(1160, 270, 500, 660), [System.Drawing.Imaging.PixelFormat]::Format24bppRgb).Save($rightCrop)
Get-OcrText -FilePath $rightCrop

