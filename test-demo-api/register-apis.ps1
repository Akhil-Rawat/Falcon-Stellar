# Register Demo APIs on Falcone Marketplace

Write-Host "`n🦅 Registering Demo APIs on Falcone Marketplace...`n" -ForegroundColor Cyan

# Wait for backend to be ready
Write-Host "⏳ Checking backend availability..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Register Weather API (Pay-per-user)
Write-Host "`n📡 Registering Weather API (Pay-per-user mode)..." -ForegroundColor Green
npx @anshu007/falcone-sdk register `
  --name "Live Weather Data" `
  --description "Real-time weather information with 3-day forecasts for any location" `
  --endpoint "http://localhost:4000/api/weather" `
  --price 5 `
  --wallet "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ" `
  --category "Data" `
  --owner "WeatherPro Labs"

Write-Host "`n" -ForegroundColor White

# Register Crypto API (Pay-per-user)
Write-Host "📡 Registering Crypto Prices API (Pay-per-user mode)..." -ForegroundColor Green
npx @anshu007/falcone-sdk register `
  --name "Live Crypto Prices" `
  --description "Real-time cryptocurrency prices for BTC, ETH, XLM and more with market data" `
  --endpoint "http://localhost:4000/api/crypto-live" `
  --price 3 `
  --wallet "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ" `
  --category "Finance" `
  --owner "CryptoData Inc"

Write-Host "`n" -ForegroundColor White

# Register AI Summary API (Pay-per-user)
Write-Host "📡 Registering AI Summary API (Pay-per-user mode)..." -ForegroundColor Green
npx @anshu007/falcone-sdk register `
  --name "AI Text Summarizer" `
  --description "Advanced AI-powered text summarization with key insights extraction" `
  --endpoint "http://localhost:4000/api/ai-summary" `
  --price 8 `
  --wallet "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ" `
  --category "AI & ML" `
  --owner "AI Innovations"

Write-Host "`n✅ All APIs registered successfully!" -ForegroundColor Green
Write-Host "🌐 Visit http://localhost:3000/marketplace to see them live!`n" -ForegroundColor Cyan
