Write-Host "Registering Demo APIs to Falcone Marketplace..." -ForegroundColor Cyan

# Register Weather API
Write-Host "`n📡 Registering Weather API..." -ForegroundColor Yellow
npx @anshu007/falcone-sdk register `
  --name "Live Weather Data" `
  --description "Real-time weather information with 3-day forecasts, temperature, humidity, and wind data" `
  --endpoint "http://localhost:4002/api/weather" `
  --price 5 `
  --wallet "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ" `
  --category "Data" `
  --owner "WeatherTech Labs"

Write-Host "`n---`n" -ForegroundColor Gray

# Register Crypto API
Write-Host "📡 Registering Crypto Prices API..." -ForegroundColor Yellow
npx @anshu007/falcone-sdk register `
  --name "Live Crypto Prices" `
  --description "Real-time cryptocurrency prices for BTC, ETH, XLM and more with 24h change percentages" `
  --endpoint "http://localhost:4002/api/crypto-live" `
  --price 3 `
  --wallet "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ" `
  --category "Finance" `
  --owner "CryptoData Pro"

Write-Host "`n---`n" -ForegroundColor Gray

# Register AI Text Analysis API
Write-Host "📡 Registering AI Text Analyzer..." -ForegroundColor Yellow
npx @anshu007/falcone-sdk register `
  --name "AI Text Analyzer" `
  --description "Advanced AI-powered text analysis with sentiment detection, keyword extraction, and language identification" `
  --endpoint "http://localhost:4002/api/analyze-text" `
  --price 8 `
  --wallet "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ" `
  --category "AI & ML" `
  --owner "Neural Labs"

Write-Host "`n✅ All APIs registered successfully!" -ForegroundColor Green
