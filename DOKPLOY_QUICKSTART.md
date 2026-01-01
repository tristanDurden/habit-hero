# Dokploy Quick Start Guide

This is a condensed version of the full deployment guide. Use this for a quick reference.

## Prerequisites Checklist

- [ ] Hetzner server created (Ubuntu 22.04+, CPX11 or higher)
- [ ] Domain name configured (optional)
- [ ] GitHub OAuth app created
- [ ] Code pushed to Git repository

## Step 1: Install Dokploy (5 minutes)

```bash
# SSH into your Hetzner server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh && rm get-docker.sh

# Install Docker Compose
apt install -y docker-compose-plugin

# Configure firewall
apt install -y ufw
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 3000/tcp
ufw --force enable

# Install Dokploy
curl -fsSL https://dokploy.com/install.sh | bash
```

## Step 2: Access Dokploy (2 minutes)

1. Open browser: `http://YOUR_SERVER_IP:3000`
2. Login: `admin` / `admin`
3. **⚠️ Change password immediately!**

## Step 3: Set Up Database (3 minutes)

1. Dokploy Dashboard → **Databases** → **New Database**
2. Configure:
   - Type: MySQL 8.0
   - Name: `habit-hero-mysql`
   - Database: `habit_app_db`
   - User: `habituser`
   - Password: (save this!)
3. Note the service name (e.g., `habit-hero-mysql`)

## Step 4: Deploy Application (5 minutes)

1. Dokploy Dashboard → **Applications** → **New Application**

2. **Basic Info:**
   - Name: `habit-hero`
   - Repository: `https://github.com/YOUR_USERNAME/habit-hero.git`
   - Branch: `main`
   - Dockerfile: `Dockerfile`

3. **Environment Variables:**
   ```
   DATABASE_URL=mysql://habituser:YOUR_PASSWORD@habit-hero-mysql:3306/habit_app_db
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   NEXTAUTH_URL=https://yourdomain.com
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   NODE_ENV=production
   ```

4. **Port:** `3000` (expose enabled)

5. Click **Deploy**

## Step 5: Run Migrations (2 minutes)

After deployment, run migrations:

```bash
# Option 1: Via Dokploy terminal/exec
npx prisma migrate deploy

# Option 2: Via SSH
ssh root@YOUR_SERVER_IP
docker exec -it habit-hero-app npx prisma migrate deploy
```

## Step 6: Configure Domain & SSL (3 minutes)

1. In application settings → **Domains**
2. Add: `yourdomain.com`
3. Enable **SSL** (auto-configured by Dokploy)
4. Update `NEXTAUTH_URL` to HTTPS
5. Restart application

## Step 7: Verify (2 minutes)

- ✅ Visit `https://yourdomain.com`
- ✅ Test GitHub login
- ✅ Create a habit
- ✅ Check logs for errors

## Total Time: ~20 minutes

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| App won't start | Check logs in Dokploy → Application → Logs |
| Database error | Verify DATABASE_URL uses correct service name |
| Build fails | Check Dockerfile exists in repo root |
| SSL fails | Verify DNS A record points to server IP |

## Useful Commands

```bash
# View logs
docker logs habit-hero-app -f

# Restart app
docker restart habit-hero-app

# Run migrations
docker exec -it habit-hero-app npx prisma migrate deploy

# Access database
docker exec -it habit-hero-mysql mysql -u habituser -p habit_app_db
```

---

For detailed instructions, see `DOKPLOY_DEPLOYMENT.md`

