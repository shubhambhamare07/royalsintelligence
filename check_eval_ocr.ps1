. .\run_ocr.ps1

Write-Host "=== OCR RIGHT COLUMN ==="
Get-OcrText -FilePath "rr-pressure-platform\reports\eval_right_new.png"

Write-Host "`n=== OCR CARD 1 ==="
Get-OcrText -FilePath "rr-pressure-platform\reports\eval_card1_new.png"

