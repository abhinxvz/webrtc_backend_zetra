# Frontend Deployment to Vercel (Recommended - FREE)

## Why Vercel?
- Built specifically for Next.js
- 100% free for personal projects
- Automatic deployments from GitHub
- Global CDN
- Zero configuration needed

---

## Step-by-Step Deployment

### Step 1: Go to Vercel
1. Visit https://vercel.com
2. Click "Sign Up" or "Login"
3. Sign up with your GitHub account

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Click "Import" next to your repository: `webrtc_backend_zetra`
3. Vercel will auto-detect it's a Next.js project

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** 
```
npm run build
```
(auto-detected, no need to change)

**Output Directory:** 
```
.next
```
(auto-detected, no need to change)

**Install Command:**
```
npm install
```
(auto-detected, no need to change)

### Step 4: Add Environment Variable

Click "Environment Variables" section and add:

**Key:**
```
NEXT_PUBLIC_API_BASE_URL
```

**Value:**
```
https://zetra-backend.onrender.com
```
⚠️ **IMPORTANT:** Replace with YOUR actual backend URL from Render!

**Environment:** Select "Production, Preview, and Development"

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-5 minutes
3. Done! 🎉

Your app will be live at: `https://your-project-name.vercel.app`

---

## After Deployment

### Get Your Frontend URL:
After deployment completes, Vercel will show your URL like:
```
https://webrtc-backend-zetra.vercel.app
```

### Test Your App:
1. Visit your Vercel URL
2. Sign up for an account
3. Create a room
4. Test video calling

---

## Updating Your App

Every time you push to GitHub:
```bash
git add .
git commit -m "Update frontend"
git push origin master
```

Vercel automatically deploys the changes! No manual steps needed.

---

## Custom Domain (Optional)

Want your own domain like `zetra.com`?

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records (Vercel provides instructions)
4. Done!

---

## Troubleshooting

### Build fails:
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Verify no TypeScript errors locally

### Can't connect to backend:
1. Check environment variable `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. Make sure backend URL is correct (from Render)
3. Verify backend is running (visit backend-url/health)

### "Network Error" in browser:
1. Open browser console (F12)
2. Check if backend URL is correct
3. Verify CORS is enabled on backend (already configured)

---

## Environment Variables Reference

Only one environment variable needed:

```
NEXT_PUBLIC_API_BASE_URL=https://zetra-backend.onrender.com
```

Replace with your actual backend URL!

---

## Cost

**FREE** ✅
- Unlimited bandwidth
- Automatic HTTPS
- Global CDN
- 100GB bandwidth/month
- Perfect for personal projects

---

## Success Checklist

- [ ] Signed up for Vercel
- [ ] Connected GitHub account
- [ ] Imported repository
- [ ] Added `NEXT_PUBLIC_API_BASE_URL` environment variable
- [ ] Deployed successfully
- [ ] Tested the app
- [ ] Video calling works

🎉 Your app is live!
