# Deployment Guide — Billing Pro

## Arsitektur

```
GitHub (push) → GitHub Actions CI
                    ↓
              Frontend → Vercel (otomatis)
              Backend  → GHCR (Docker image)
```

---

## 1. Setup GitHub Repository

### Buat repo baru
```bash
git init
git remote add origin https://github.com/<username>/<repo-name>.git
```

### Push pertama kali
```bash
git add .
git commit -m "chore: initial setup"
git push -u origin main
```

---

## 2. Deploy Frontend ke Vercel

### A. Via Vercel Dashboard (Recommended untuk pertama kali)

1. Buka [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo GitHub yang baru dibuat
3. **Root Directory** → set ke `frontend`
4. Framework akan otomatis terdeteksi sebagai **Next.js**
5. Tambahkan Environment Variable:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
6. Klik **Deploy**

### B. Setup GitHub Actions Auto-Deploy

Setelah project ada di Vercel, ambil credentials:

1. **VERCEL_TOKEN** → [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create token
2. **VERCEL_ORG_ID** → Settings → General → Team ID
3. **VERCEL_PROJECT_ID** → Project Settings → General → Project ID

Tambahkan ke **GitHub Secrets**:
- Buka repo → Settings → Secrets and variables → Actions
- Tambahkan:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID` *(optional, tapi disarankan)*
  - `VERCEL_PROJECT_ID` *(optional, tapi disarankan)*
  - `NEXT_PUBLIC_API_URL` → URL backend produksi

Setelah ini, setiap push ke `main` yang mengubah file di `frontend/` akan auto-deploy ke Vercel.

---

## 3. Deploy Backend

Backend adalah NestJS + SQLite. Opsi deployment:

### Opsi A: Railway (Paling mudah)
1. Buka [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Pilih repo, set root directory ke `backend`
3. Tambahkan env vars:
   ```
   DATABASE_URL=file:./billing.db
   JWT_SECRET=<generate random 64 chars>
   JWT_EXPIRES_IN=7d
   PORT=4000
   ```
4. Railway akan otomatis detect Dockerfile dan deploy

### Opsi B: Fly.io
```bash
# Install flyctl
# Di folder backend:
fly launch
fly secrets set JWT_SECRET="your-secret-here"
fly secrets set DATABASE_URL="file:./billing.db"
fly deploy
```

### Opsi C: VPS/Server via Docker
```bash
# Di server:
docker pull ghcr.io/<username>/<repo>/backend:latest
docker run -d \
  -p 4000:4000 \
  -e DATABASE_URL="file:./billing.db" \
  -e JWT_SECRET="your-secret-here" \
  -e JWT_EXPIRES_IN="7d" \
  -v /data/billing:/app/prisma \
  ghcr.io/<username>/<repo>/backend:latest
```

---

## 4. GitHub Secrets yang Dibutuhkan

| Secret | Dibutuhkan oleh | Keterangan |
|--------|----------------|------------|
| `VERCEL_TOKEN` | deploy-vercel.yml | Token Vercel untuk deploy |
| `NEXT_PUBLIC_API_URL` | deploy-vercel.yml, frontend-ci.yml | URL backend |
| `GITHUB_TOKEN` | backend-ci.yml | Otomatis tersedia, tidak perlu ditambahkan |

---

## 5. Alur CI/CD

### Push ke `develop` atau PR ke `main`:
- ✅ Frontend: build + lint check
- ✅ Backend: type check + NestJS build

### Push ke `main`:
- ✅ Frontend: deploy ke Vercel (otomatis)
- ✅ Backend: build Docker image → push ke GHCR

---

## 6. Environment Variables Produksi

### Backend (wajib diset di server/hosting):
```env
DATABASE_URL="file:./billing.db"
JWT_SECRET="<random 64 karakter>"
JWT_EXPIRES_IN="7d"
PORT=4000
```

Generate JWT_SECRET yang aman:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (set di Vercel dashboard):
```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

---

## 7. Checklist Sebelum Push

- [ ] File `.env` dan `backend/.env` ada di `.gitignore`
- [ ] Database file (`*.db`) tidak ikut commit
- [ ] `JWT_SECRET` sudah diganti dari nilai default
- [ ] `NEXT_PUBLIC_API_URL` sudah diset ke URL backend produksi
- [ ] GitHub Secrets sudah diisi
