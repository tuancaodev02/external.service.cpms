# 🚀 Vercel Deployment - Quick Reference

## ⚡ Quick Commands

```bash
# 🔧 Development
bun run dev                    # Local dev với hot reload
bun run vercel:dev            # Local dev với Vercel environment

# 🏗️ Build
bun run vercel:build          # Build + Generate Prisma

# 🚢 Deploy
bun run vercel:deploy         # Deploy Preview (test)
bun run vercel:deploy:prod    # Deploy Production

# 📊 Monitoring
bun run vercel:logs           # View logs
vercel logs --prod --follow   # Follow production logs

# 🔐 Environment
bun run vercel:env:pull       # Pull env vars từ Vercel
```

## 📋 Deployment Checklist

### Before Deploy

- [ ] Code đã commit và push lên GitHub
- [ ] Build local thành công: `bun run vercel:build`
- [ ] Test local: `bun run dev`
- [ ] Environment variables đã cấu hình trên Vercel

### Deploy Preview

```bash
bun run vercel:deploy
```

- [ ] Test preview URL
- [ ] Check logs: `vercel logs <preview-url>`
- [ ] Verify tất cả endpoints hoạt động

### Deploy Production

```bash
bun run vercel:deploy:prod
```

- [ ] Monitor logs: `vercel logs --prod --follow`
- [ ] Test production URL
- [ ] Verify database connection

## 🐛 Common Issues

### Issue: Build fails với runtime error

**Fix:** Đã sửa trong `vercel.json` - remove runtime specification

### Issue: Database connection timeout

**Check:**

- DATABASE_URL đúng format
- SQL Server firewall cho phép Vercel IPs
- Connection string có `encrypt=true`

### Issue: Function timeout

**Fix:** Tăng `maxDuration` trong `vercel.json` (max 30s cho Hobby plan)

### Issue: Environment variables không load

**Fix:**

```bash
vercel env ls              # List all env vars
vercel env pull            # Pull to local
```

## 📚 Documentation

- [Vercel Local Testing Guide](/.gemini/antigravity/brain/ab9de9e2-2405-47e8-9d31-a4f6e4e4c701/vercel_local_testing.md)
- [Full Deployment Guide](/.gemini/antigravity/brain/ab9de9e2-2405-47e8-9d31-a4f6e4e4c701/vercel_deployment_guide.md)

## 🎯 Workflow

```
┌─────────────┐
│   Develop   │  bun run dev
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Build    │  bun run vercel:build
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Preview   │  bun run vercel:deploy
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Test     │  Test preview URL
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Production  │  bun run vercel:deploy:prod
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Monitor   │  vercel logs --prod --follow
└─────────────┘
```

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/[your-team]/[project-name]/settings
- Deployments: https://vercel.com/[your-team]/[project-name]/deployments
- Logs: https://vercel.com/[your-team]/[project-name]/logs
