# CryptoSignal Pro

BTC/ETH Trading Decision System berbasis AI (Gemini 2.5 Flash) dengan metodologi SMC + Bandarmologi.

## Fitur

- Live price BTC/ETH dari Binance Public API (gratis, no key)
- Fear & Greed Index dari alternative.me (gratis, no key)
- AI Signal Engine via Google Gemini 2.5 Flash (pay-per-use)
- Signal: Entry Zone, SL, TP1/TP2/TP3, Confidence Score, R:R Ratio
- Multi-timeframe analysis: Daily, 4H, 1H, 15m
- TradingView chart embed
- Histori sinyal di localStorage (no database)
- Export CSV
- Zero backend, zero database

## Setup Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`, masukkan Gemini API key langsung di aplikasi.

## Dapatkan Gemini API Key

1. Buka https://aistudio.google.com/apikey
2. Klik "Create API key"
3. Copy key, paste di form yang muncul di dashboard aplikasi

## Deploy ke Vercel

### Cara 1 — Via GitHub (Recommended)

1. Push project ke GitHub:
   ```bash
   git add .
   git commit -m "Initial CryptoSignal Pro"
   git remote add origin https://github.com/username/cryptosignal-pro.git
   git push -u origin main
   ```
2. Buka https://vercel.com/new
3. Import repository dari GitHub
4. Environment Variables (opsional):
   - Key: `GEMINI_API_KEY` | Value: API key Gemini Anda
5. Klik **Deploy**

### Cara 2 — Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Catatan

- `GEMINI_API_KEY` di Vercel **opsional** — user dapat input langsung di UI (disimpan di localStorage browser)
- Jangan commit `.env.local` ke GitHub (sudah ada di .gitignore)

## Tech Stack

| Layer | Teknologi | Biaya |
|---|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind | Gratis |
| State | Zustand + localStorage | Gratis |
| AI Engine | Google Gemini 2.5 Flash | Pay-per-use |
| Market Data | Binance Public REST API | Gratis |
| Sentiment | Fear & Greed Index (alternative.me) | Gratis |
| Chart | TradingView Widget | Gratis |
| Hosting | Vercel Free Tier | Gratis |

## Disclaimer

CryptoSignal Pro adalah platform analisis teknikal yang bersifat **edukatif**. Seluruh sinyal **BUKAN nasihat investasi**. Keputusan trading sepenuhnya tanggung jawab pengguna.
