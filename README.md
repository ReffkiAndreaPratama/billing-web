# 🧾 Billing Web - Sistem Manajemen Warnet

Aplikasi full-stack untuk manajemen warnet (warung internet) dengan fitur billing, monitoring, dan desktop agent.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Struktur Project](#struktur-project)
- [Instalasi Lengkap](#instalasi-lengkap)
- [Development](#development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Kontribusi](#kontribusi)

---

## ✨ Fitur

### Dashboard Admin
- 📊 Real-time analytics dan monitoring
- 💰 Manajemen billing dan pembayaran
- 👥 Manajemen member/customer
- 🖥️ Monitoring PC/workstation
- 📈 Laporan penjualan dan transaksi
- ⚙️ Konfigurasi sistem

### Desktop Agent
- 🎮 Monitoring status PC
- ⏱️ Timer dan session management
- 🚀 Auto-start dan control aplikasi
- 📡 Real-time sync dengan server
- 🔒 Security dan authentication

### Mobile App (Optional)
- 📱 Akses dashboard dari smartphone
- 💳 Cek saldo member
- 📲 Notifikasi real-time

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                 │
│              Vercel Deployment Platform             │
└──────────────────────┬──────────────────────────────┘
                       │ (REST API)
                       ↓
┌─────────────────────────────────────────────────────┐
│              Backend (NestJS + SQLite)              │
│         Railway / Fly.io / VPS Deployment           │
│                                                     │
│  ├─ Authentication & Authorization                 │
│  ├─ Billing Management                             │
│  ├─ PC/Workstation Monitoring                      │
│  ├─ WebSocket for Real-time Updates                │
│  └─ Database & Business Logic                      │
└─────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   SQLite DB      Redis Cache    Desktop Agent
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org) - React framework
- **UI Components**: [Radix UI](https://radix-ui.com) - Headless components
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS
- **State Management**: [Zustand](https://zustand-demo.vercel.app) - Lightweight state
- **Charts**: [Recharts](https://recharts.org) - React visualization library
- **Icons**: [Lucide React](https://lucide.dev) - Beautiful icon library
- **Real-time**: [Socket.io Client](https://socket.io) - WebSocket connection
- **Utilities**: 
  - `date-fns` - Date manipulation
  - `clsx` - Conditional classNames
  - `tailwind-merge` - Merge Tailwind classes

### Backend
- **Framework**: [NestJS](https://nestjs.com) - Progressive Node.js framework
- **Language**: [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- **ORM**: [Prisma](https://www.prisma.io) - Next-generation ORM
- **Database**: SQLite (development) / PostgreSQL (production optional)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: [Socket.io](https://socket.io) - WebSocket server

### DevOps & CI/CD
- **Version Control**: [GitHub](https://github.com)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)
- **Frontend Hosting**: [Vercel](https://vercel.com)
- **Backend Hosting**: [Railway](https://railway.app) / [Fly.io](https://fly.io)
- **Container**: [Docker](https://www.docker.com)
- **Container Registry**: [GitHub Container Registry (GHCR)](https://ghcr.io)

---

## 🚀 Quick Start

### Prasyarat
- Node.js 18+ dan npm/yarn
- Docker & Docker Compose (optional, untuk development)
- Git

### Clone Repository
```bash
git clone https://github.com/ReffkiAndreaPratama/billing-web.git
cd billing-web
```

### Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

### Setup Backend
```bash
cd ../backend
npm install
npm run start:dev
```
Backend berjalan di [http://localhost:4000](http://localhost:4000)

### Dengan Docker Compose
```bash
# Setup database dan cache
docker-compose up -d

# Jika ada database migrations
npm run prisma:migrate
```

---

## 📁 Struktur Project

```
billing-web/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App router (Next.js 13+)
│   │   ├── components/         # Reusable React components
│   │   ├── lib/                # Utility functions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state management
│   │   └── styles/             # Global styles
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── backend/                     # NestJS Backend
│   ├── src/
│   │   ├── app.module.ts       # Root module
│   │   ├── main.ts             # Entry point
│   │   ├── auth/               # Authentication module
│   │   ├── billing/            # Billing module
│   │   ├── devices/            # Device monitoring
│   │   ├── websocket/          # WebSocket gateway
│   │   └── database/           # Prisma setup
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # DB migrations
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── desktop-agent/              # Desktop Application (Electron/NW.js)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── mobile/                      # Mobile App (React Native/Flutter)
│   └── ...
│
├── monitoring/                  # Monitoring & Logging
│   └── docker-compose.monitor.yml
│
├── nginx/                       # Reverse Proxy Configuration
│   └── nginx.conf
│
├── prisma/                      # Shared Prisma config
│   └── schema.prisma
│
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── frontend-ci.yml
│       └── backend-ci.yml
│
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production setup
├── DEPLOYMENT.md               # Deployment guide
└── README.md                   # This file
```

---

## 📥 Instalasi Lengkap

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/ReffkiAndreaPratama/billing-web.git
cd billing-web

# Setup frontend
cd frontend
npm install
cd ..

# Setup backend
cd backend
npm install
cd ..
```

### 2. Setup Environment Variables

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_TELEMETRY_DISABLED=1
```

**Backend** (`backend/.env`):
```env
DATABASE_URL="file:./billing.db"
JWT_SECRET=your-secret-key-here-64-chars
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
```

Generate JWT_SECRET yang aman:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Database Setup

```bash
cd backend

# Run migrations
npm run prisma:migrate:dev

# (Optional) Seed database dengan data dummy
npm run prisma:seed

cd ..
```

### 4. Jalankan Development Server

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
# Backend berjalan di http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend berjalan di http://localhost:3000
```

**Terminal 3 (Optional) - Database & Cache:**
```bash
docker-compose up -d
```

---

## 💻 Development

### Frontend Development

```bash
cd frontend

# Start dev server dengan hot reload
npm run dev

# Build untuk production
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Format code dengan Prettier
npm run format
```

### Backend Development

```bash
cd backend

# Development dengan hot reload
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Database
npm run prisma:migrate:dev   # Create migration
npm run prisma:migrate:reset # Reset database
npm run prisma:studio       # Open Prisma Studio
npm run prisma:seed         # Seed database
```

### Testing

```bash
# Frontend
cd frontend
npm run test
npm run test:e2e

# Backend
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

### Code Quality

```bash
# ESLint
npm run lint

# TypeScript
npm run type-check

# Format dengan Prettier
npm run format:check
npm run format:write
```

---

## 🚀 Deployment

### Deployment Frontend ke Vercel

1. **Automatic (Recommended)**
   - Push ke branch `main`
   - GitHub Actions otomatis trigger
   - Vercel auto-deploy

2. **Manual**
   ```bash
   npm install -g vercel
   vercel deploy
   ```

Lihat detail di [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deployment Backend

**Option A: Railway (Paling mudah)**
```bash
npm i -g railway
railway link
railway up
```

**Option B: Fly.io**
```bash
npm i -g flyctl
fly launch
fly deploy
```

**Option C: VPS dengan Docker**
```bash
docker build -t billing-backend .
docker run -d -p 4000:4000 billing-backend
```

Lihat panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔐 Environment Variables

### Frontend Environment

| Variable | Required | Contoh | Keterangan |
|----------|----------|--------|-----------|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:4000` | URL backend API |
| `NEXT_TELEMETRY_DISABLED` | ❌ | `1` | Disable Vercel telemetry |

### Backend Environment

| Variable | Required | Default | Keterangan |
|----------|----------|---------|-----------|
| `DATABASE_URL` | ✅ | - | SQLite: `file:./billing.db` |
| `JWT_SECRET` | ✅ | - | Random 64+ characters |
| `JWT_EXPIRES_IN` | ❌ | `7d` | Token expiration |
| `PORT` | ❌ | `3000` | Server port |
| `NODE_ENV` | ❌ | `development` | `development` atau `production` |
| `LOG_LEVEL` | ❌ | `info` | `debug`, `info`, `warn`, `error` |

---

## 📊 CI/CD Pipeline

### GitHub Actions Workflows

**Frontend CI** (`.github/workflows/frontend-ci.yml`):
- ✅ Lint check
- ✅ Build Next.js
- ✅ Type checking
- ✅ Auto-deploy to Vercel (on main)

**Backend CI** (`.github/workflows/backend-ci.yml`):
- ✅ Lint check
- ✅ Type checking
- ✅ Build NestJS
- ✅ Build Docker image
- ✅ Push ke GHCR (on main)

---

## 🐳 Docker

### Build Dari Source

```bash
# Frontend
docker build -f frontend/Dockerfile -t billing-frontend .

# Backend
docker build -f backend/Dockerfile -t billing-backend .
```

### Docker Compose

**Development:**
```bash
docker-compose up -d
```

**Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 API Documentation

Backend API docs tersedia di:
- **Swagger/OpenAPI**: `http://localhost:4000/api/docs`
- **ReDoc**: `http://localhost:4000/api/redoc`

### Main Endpoints

```
POST   /auth/register           - Register user
POST   /auth/login              - Login
POST   /auth/refresh            - Refresh token
GET    /api/billing             - Get billing data
POST   /api/billing             - Create billing
GET    /api/devices             - Get devices status
GET    /api/reports             - Get reports
```

---

## 🤝 Kontribusi

Kami menerima kontribusi dari siapa saja! Untuk berkontribusi:

1. **Fork** repository ini
2. **Create** branch feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** ke branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

### Coding Standards

- Gunakan TypeScript
- Follow ESLint rules
- Format code dengan Prettier
- Write meaningful commit messages
- Add tests untuk fitur baru

---

## 📝 Lisensi

Tidak ada lisensi khusus. Silakan gunakan untuk keperluan pribadi atau komersial.

---

## 📧 Support

Butuh bantuan? Hubungi:
- 📌 Issues: [GitHub Issues](https://github.com/ReffkiAndreaPratama/billing-web/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ReffkiAndreaPratama/billing-web/discussions)

---

## 📈 Roadmap

- [x] Setup project structure
- [x] Frontend dashboard setup
- [x] Backend API setup
- [x] Authentication system
- [ ] Payment gateway integration
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Desktop agent improvements
- [ ] Multi-tenant support

---

**Created with ❤️ by [ReffkiAndreaPratama](https://github.com/ReffkiAndreaPratama)**

Last Updated: June 2026
