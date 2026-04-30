# Deployment Guide

## Quick Deploy to Render (Recommended for Free Tier)

### Backend + MongoDB Atlas Setup

1. **MongoDB Atlas**
   - Create cluster at https://cloud.mongodb.com
   - Copy connection URI: `mongodb+srv://user:pass@cluster.mongodb.net/falcone`
   - Add IP allowlist: 0.0.0.0/0 (or specific Render IP after first deploy)

2. **Deploy Backend**

   ```bash
   git push origin main  # Push to GitHub repo
   ```

   - Go to https://render.com/dashboard
   - Click "New" → "Web Service"
   - Connect GitHub repo (select `Falcon-Stellar`)
   - Set root directory: `backend`
   - Environment variables:
     ```
     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/falcone?retryWrites=true&w=majority
     ESCROW_PUBLIC_KEY=GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ
     NODE_ENV=production
     ```
   - Start command: `npm install && npm start`
   - Save and deploy

3. **Test Backend**
   - Once deployed, test health endpoint:
     ```
     https://your-backend.onrender.com/health
     ```
   - Should return JSON with status=ok, mongodb=connected

### Frontend on Vercel

1. Go to https://vercel.com/new
2. Import GitHub repo
3. Set framework: Vite
4. Environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```
5. Deploy

## Health Check Endpoints

- **Backend Health**: `GET /health` → Returns uptime, MongoDB status, version
- **API List**: `GET /api/list` → Returns all registered APIs
- **Stats**: `GET /api/stats` → Returns total APIs, calls, revenue

## MongoDB Atlas IP Allowlist

If backend can't connect to MongoDB after deploy:

1. Go to Atlas → Security → Network Access
2. Check current Render IP from deploy logs
3. Add that IP to allowlist, or use 0.0.0.0/0 for temporary testing
4. For production: restrict to specific backend host IPs only

## Environment Variables Checklist

**Backend (.env in backend folder)**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/falcone?retryWrites=true&w=majority
ESCROW_PUBLIC_KEY=GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ
```

**Frontend (Vercel)**

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

## Troubleshooting

| Error                       | Cause                       | Fix                                     |
| --------------------------- | --------------------------- | --------------------------------------- |
| MongoDB connection timeout  | IP allowlist missing        | Add Render IP to Atlas allowlist        |
| 404 on `/api/list`          | Backend not started         | Check backend deploy logs               |
| Frontend shows "Loading..." | API_BASE_URL wrong          | Verify VITE_API_BASE_URL in Vercel      |
| Escrow balance errors       | MongoDB collections missing | Run seed on backend startup (automatic) |

## Local Development

Start both services:

```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
npm run dev
```

Test the health endpoint locally:

```bash
curl http://localhost:3001/health
```

## Database

All data (APIs, escrow balances, used transactions) is persisted to MongoDB Atlas.

- **Collections**:
  - `apis` - Registered APIs in marketplace
  - `escrowbalances` - User prepaid balances
  - `pendingpayouts` - Unpaid API owner usage
  - `usedtransactions` - Replay protection

## Next Steps

1. Rotate MongoDB password (you posted it in chat earlier)
2. Enable 2FA on MongoDB Atlas account
3. Set up Render automatic deployments from GitHub
4. Configure custom domain on Vercel
