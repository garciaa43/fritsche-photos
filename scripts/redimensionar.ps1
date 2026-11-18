param([string]$Lista)
# Usado por scripts/fotos.mjs. Cada linha de $Lista: origem|destinoGrande|destinoMiniatura
# Gera a versão grande (2200 px) e a miniatura (800 px) de cada foto.
# Saída, uma linha por foto:  ok|n|largura|altura   ou   erro|n|mensagem
# (n = número da linha na lista; evita problemas de acentuação no terminal)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

function Salvar($img, [int]$lado, [long]$qualidade, [string]$destino) {
  $escala = [Math]::Min(1.0, $lado / [Math]::Max($img.Width, $img.Height))
  $w = [Math]::Max(1, [int][Math]::Round($img.Width * $escala))
  $h = [Math]::Max(1, [int][Math]::Round($img.Height * $escala))
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h); $g.Dispose()
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $qualidade
  New-Item -ItemType Directory -Force -Path (Split-Path $destino) | Out-Null
  $bmp.Save($destino, $codec, $params); $bmp.Dispose()
  return @($w, $h)
}

$linhas = [System.IO.File]::ReadAllLines($Lista, [System.Text.Encoding]::UTF8)
for ($n = 0; $n -lt $linhas.Count; $n++) {
  $linha = $linhas[$n]
  if (-not $linha) { continue }
  $origem, $grande, $mini = $linha.Split('|')
  try {
    $img = [System.Drawing.Image]::FromFile($origem)
    try {
      # Respeita a orientação EXIF (fotos tiradas com a câmera de lado)
      if ($img.PropertyIdList -contains 0x0112) {
        switch ([BitConverter]::ToUInt16($img.GetPropertyItem(0x0112).Value, 0)) {
          3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
          6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
          8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
        }
      }
      $dim = Salvar $img 2200 82 $grande
      Salvar $img 800 78 $mini | Out-Null
      [Console]::Out.WriteLine("ok|$n|$($dim[0])|$($dim[1])")
    } finally { $img.Dispose() }
  } catch {
    [Console]::Out.WriteLine("erro|$n|$($_.Exception.Message)")
  }
}
