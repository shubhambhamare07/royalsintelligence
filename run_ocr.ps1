Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' }

[Windows.Media.Ocr.OcrEngine,Windows.Foundation.UniversalApiContract,ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation.UniversalApiContract,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile,Windows.Foundation.UniversalApiContract,ContentType=WindowsRuntime] | Out-Null

function Await-Async($asyncOp, $type) {
    $method = $asTaskGeneric.MakeGenericMethod($type)
    $task = $method.Invoke($null, @($asyncOp))
    $task.Wait()
    return $task.Result
}

function Get-OcrText {
    param([string]$FilePath)
    $fullPath = (Resolve-Path $FilePath).Path
    $fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($fullPath)
    $file = Await-Async $fileOp ([Windows.Storage.StorageFile])
    
    $streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = Await-Async $streamOp ([Windows.Storage.Streams.IRandomAccessStream])
    
    $decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = Await-Async $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])
    
    $bitmapOp = $decoder.GetSoftwareBitmapAsync()
    $bitmap = Await-Async $bitmapOp ([Windows.Graphics.Imaging.SoftwareBitmap])
    
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    $resultOp = $engine.RecognizeAsync($bitmap)
    $result = Await-Async $resultOp ([Windows.Media.Ocr.OcrResult])
    
    return $result.Text
}

$files = @(
    "rr-pressure-platform\site\public\assets\brand\crop_brand.png",
    "rr-pressure-platform\site\public\assets\brand\crop_sidebar_items.png",
    "rr-pressure-platform\site\public\assets\brand\crop_topnav.png",
    "rr-pressure-platform\site\public\assets\brand\crop_hero.png",
    "rr-pressure-platform\site\public\assets\brand\crop_stats.png",
    "rr-pressure-platform\site\public\assets\brand\crop_rankings.png",
    "rr-pressure-platform\site\public\assets\brand\model_performance_full_card.png",
    "rr-pressure-platform\site\public\assets\brand\key_insights_full_card.png"
)

foreach ($f in $files) {
    Write-Host "=============================="
    Write-Host "FILE: $f"
    try {
        $txt = Get-OcrText -FilePath $f
        Write-Host $txt
    } catch {
        Write-Host "Error: $_"
    }
}
