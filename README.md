# External Service CPMS

Backend service for CPMS, built with **Bun**, **Express**, **Prisma**, and **SQL Server**.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.x)
- Node.js (for some Prisma compatibilities preferred)
- SQL Server

### Installation

```bash
# Install dependencies
bun install

# Setup Environment
# Create .env file based on example or provided credentials
# Ensure DB_URL is set for SQL Server
```

### Database Setup

```bash
# Generate Prisma Client
bun run prisma:generate

# Migration (Development)
bun run prisma:migrate:dev

# Seed Database
bun run prisma:db:seed

# Full DB Setup (Generate + Migrate + Seed)
bun run db:setup
```

## 🛠 Scripts

| Command | Description |
|Args| |
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build the project for production (ESM) |
| `bun run deploy` | Build and deploy to Vercel (Production) |
| `bun run deploy:preview` | Build and deploy to Vercel (Preview) |
| `bun run prisma:studio` | Open Prisma Studio to view/edit data |
| `bun run format` | Format code with Prettier |

## 📦 Project Structure

- `src/index.ts`: Entry point.
- `src/routes`: API Routes definitions.
- `src/controllers`: Request handlers.
- `src/services`: Business logic layer.
- `src/repositories`: Data access layer (Prisma).
- `src/database`: Database connection and entities.
- `prisma/schema.prisma`: Database schema definition.

## 🔗 API Information

- **Base Path**: `/api`
- **Health Check**: `/health-check` (returns service status)

## ☁️ Deployment

### Deploy to Production (Vercel)

```bash
bun run deploy
```

Deployment flow:
`Code → Build (Bun) → Prisma Generate → Deploy (Vercel CLI) → Live!`

### Links

- **Production:** https://external-service-cpms.vercel.app
- **Full Guide:** [DEPLOY.md](./DEPLOY.md)
