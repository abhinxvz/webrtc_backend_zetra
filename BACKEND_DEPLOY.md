# Backend Only Deployment to Render

## Quick Deploy (Manual Setup - Recommended)

### Step 1: Go to Render Dashboard
1. Visit https://render.com
2. Sign up or log in
3. Click "New +" → "Web Service"

### Step 2: Connect Repository
1. Connect your GitHub account
2. Select repository: `webrtc_backend_zetra`
3. Click "Connect"

### Step 3: Configure Service

**Basic Settings:**
- **Name:** `zetra-backend`
- **Region:** Oregon (US West)
- **Branch:** `master`
- **Root Directory:** Leave empty
- **Runtime:** Node
- **Build Command:** 
  ```
  npm install --production=false && npx tsc --project tsconfig.server.json
  ```
- **Start Command:** 
  ```
  node dist/server/index.js
  ```
- **Plan:** Free

### Step 4: Environment Variables

Click "Advanced" → Add Environment Variables:

```
NODE_ENV=production
PORT=4000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-random-secret-key-here
OPENAI_API_KEY=sk-or-v1-your-openrouter-key
TURN_SERVER_URL=turn:openrelay.metered.ca:80
TURN_SERVER_USERNAME=openrelayproject
TURN_SERVER_CREDENTIAL=openrelayproject
```

**Important:** 
- Replace `MONGO_URI` with your MongoDB Atlas connection string
- Replace `JWT_SECRET` with a random secure string
- Replace `OPENAI_API_KEY` with your OpenRouter API key

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Copy your backend URL (e.g., `https://zetra-backend.onrender.com`)

---

## Alternative: Using render.yaml (Auto Deploy)

If you want automatic deployments from GitHub:

1. Keep the `render.yaml` file in your repo
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will read `render.yaml` and configure automatically
6. Add environment variables in the Render dashboard

---

## Testing Your Backend

Once deployed, test these endpoints:

### Health Check:
```bash
curl https://your-backend-url.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected"
}
```

### API Test:
```bash
curl https://your-backend-url.onrender.com/api/auth/health
```

---

## Common Issues

### Build fails with "Cannot find module":
- Make sure `tsconfig.server.json` exists
- Check that all dependencies are in `package.json`

### "Module not found" at runtime:
- Ensure build command includes `--production=false`
- This installs devDependencies needed for TypeScript compilation

### Database connection fails:
- Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Verify connection string is correct
- Check MongoDB user has read/write permissions

### Port already in use:
- Render automatically sets PORT environment variable
- Your code should use `process.env.PORT` (already configured)

---

## After Backend Deployment

1. Copy your backend URL
2. Update frontend `.env`:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://zetra-backend.onrender.com
   ```
3. Deploy frontend to Vercel (see DEPLOYMENT_GUIDE.md)

---

## Monitoring

- **Logs:** Render Dashboard → Your Service → Logs
- **Metrics:** Render Dashboard → Your Service → Metrics
- **Restart:** Render Dashboard → Your Service → Manual Deploy → "Clear build cache & deploy"

---

## Free Tier Limitations

⚠️ **Important:** Render free tier spins down after 15 minutes of inactivity
- First request takes 30-50 seconds to wake up
- 750 hours/month free
- Good for development, not production

**Solution:** Use UptimeRobot to ping every 10 minutes, or upgrade to $7/month for always-on.
