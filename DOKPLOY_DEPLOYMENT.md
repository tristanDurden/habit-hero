# Dokploy Deployment Guide for Habit Hero

This guide will walk you through deploying your Habit Hero Next.js application to a Hetzner server using Dokploy.

## What is Dokploy?

Dokploy is an open-source deployment platform that simplifies Docker-based deployments. It provides a web interface for managing applications, databases, and SSL certificates.

---

## Prerequisites

- A Hetzner Cloud account
- A domain name (optional but recommended for HTTPS)
- GitHub OAuth app credentials
- Your application code in a Git repository (GitHub, GitLab, etc.)

---

## Step 1: Create a Hetzner Server

1. **Log in to Hetzner Cloud Console**
   - Go to https://console.hetzner.cloud/
   - Sign in or create an account

2. **Create a New Project**
   - Click "New Project"
   - Give it a name (e.g., "Habit Hero")

3. **Create a Server**
   - Click "Add Server"
   - **Recommended configuration:**
     - **Location:** Choose closest to your users
     - **Image:** Ubuntu 22.04 or 24.04 LTS
     - **Type:** CPX11 (2 vCPU, 4 GB RAM) minimum, CPX21 (3 vCPU, 8 GB RAM) recommended
     - **SSH Key:** Add your SSH public key (recommended)
   - Click "Create & Buy Now"

4. **Note Your Server IP:** `YOUR_SERVER_IP`

---

## Step 2: Install Dokploy on Your Server

### 2.1 Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
# Or if using SSH key:
ssh root@YOUR_SERVER_IP -i ~/.ssh/your_key
```

### 2.2 Update System

```bash
apt update && apt upgrade -y
```

### 2.3 Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl start docker
systemctl enable docker
rm get-docker.sh
```

### 2.4 Install Docker Compose

```bash
apt install -y docker-compose-plugin
```

### 2.5 Configure Firewall

```bash
apt install -y ufw
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Dokploy UI (temporary, can close after setup)
ufw --force enable
```

### 2.6 Install Dokploy

```bash
curl -fsSL https://dokploy.com/install.sh | bash
```

This script will:
- Install Dokploy and dependencies
- Set up the Dokploy service
- Start Dokploy on port 3000

### 2.7 Access Dokploy Dashboard

1. Open your browser and go to: `http://YOUR_SERVER_IP:3000`
2. **Default credentials:**
   - Username: `admin`
   - Password: `admin`
3. **⚠️ IMPORTANT:** Change the default password immediately!

---

## Step 3: Configure Dokploy

### 3.1 Change Default Password

1. In Dokploy dashboard, go to Settings → Profile
2. Change your password to a strong, unique password

### 3.2 Set Up Your Domain (Optional but Recommended)

1. Point your domain's A record to your server IP
2. Wait for DNS propagation (can take a few minutes to hours)

---

## Step 4: Prepare Your Application for Deployment

### 4.1 Ensure Your Repository is Ready


Make sure your code is pushed to GitHub/GitLab with:
- ✅ `Dockerfile` (already created)
- ✅ `docker-compose.prod.yml` (already created)
- ✅ Updated `next.config.ts` with `output: 'standalone'` (already updated)

### 4.2 Create GitHub OAuth App (If Not Done)

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Habit Hero
   - **Homepage URL:** `https://yourdomain.com` (or `http://YOUR_SERVER_IP` for testing)
   - **Authorization callback URL:** `https://yourdomain.com/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**
6. Save these for later

---

## Step 5: Deploy Application with Dokploy

### 5.1 Create a New Application

1. In Dokploy dashboard, click **"Applications"** → **"New Application"**

2. **Basic Information:**
   - **Name:** `habit-hero`
   - **Description:** (optional) Habit tracking application

3. **Source Code:**
   - **Repository URL:** `https://github.com/YOUR_USERNAME/habit-hero.git`
   - **Branch:** `main` (or your default branch)
   - **Build Path:** `/` (root of repository)

4. **Docker Configuration:**
   - **Dockerfile Path:** `Dockerfile`
   - **Docker Context:** `.` (root directory)

### 5.2 Configure Environment Variables

In the Dokploy application settings, add these environment variables:

```env
# Database (will connect to MySQL service)
DATABASE_URL=mysql://habituser:YOUR_MYSQL_PASSWORD@db:3306/habit_app_db

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://yourdomain.com

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# Node Environment
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5.3 Set Up MySQL Database

1. In Dokploy dashboard, go to **"Databases"** → **"New Database"**

2. **Database Configuration:**
   - **Name:** `habit-hero-mysql`
   - **Type:** MySQL
   - **Version:** 8.0
   - **Database Name:** `habit_app_db`
   - **Username:** `habituser`
   - **Password:** (set a strong password - save this!)
   - **Root Password:** (set a strong password - save this!)

3. **Note the connection details** - you'll need them for the `DATABASE_URL`

4. **Update your application's `DATABASE_URL`** environment variable:
   ```
   DATABASE_URL=mysql://habituser:YOUR_PASSWORD@habit-hero-mysql:3306/habit_app_db
   ```
   
   In Dokploy, database services are accessible by their service name as hostname.

### 5.4 Configure Ports and Networking

1. In your application settings:
   - **Port:** `3000`
   - **Expose Port:** Enable (so Dokploy can route traffic)

### 5.5 Set Up Build Commands (Optional)

If Dokploy supports build commands, you might need:
- **Pre-build:** `npx prisma generate`
- **Build:** (handled by Dockerfile)

### 5.6 Deploy the Application

1. Click **"Deploy"** or **"Save & Deploy"**
2. Monitor the deployment logs
3. Wait for the build to complete

---

## Step 6: Run Database Migrations

After the application is deployed, you need to run Prisma migrations:

### Option A: Using Dokploy Terminal/Exec

1. In Dokploy, find your application
2. Open the container terminal/exec feature
3. Run:
   ```bash
   npx prisma migrate deploy
   ```

### Option B: Using Docker Exec (SSH into server)

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Find your app container
docker ps

# Execute migration command
docker exec -it habit-hero-app npx prisma migrate deploy
```

---

## Step 7: Configure Domain and SSL

**⚠️ Important:** To get a trusted SSL certificate (not the default Traefik certificate), you **must** have a domain name. You cannot get a trusted certificate for an IP address.

### 7.1 Configure DNS First

Before adding the domain in Dokploy:

1. **Point your domain to your server:**
   - In your domain registrar's DNS settings, add an A record:
     - **Name:** `@` (or leave blank for root domain)
     - **Type:** `A`
     - **Value:** `YOUR_SERVER_IP`
     - **TTL:** `3600` (or default)
   
2. **Optional - Add www subdomain:**
   - Add another A record:
     - **Name:** `www`
     - **Type:** `A`
     - **Value:** `YOUR_SERVER_IP`

3. **Wait for DNS propagation:**
   - Can take 5 minutes to 48 hours
   - Verify with: `dig yourdomain.com` or online DNS checker
   - Must show your server IP before proceeding

### 7.2 Add Domain in Dokploy

1. In your application settings, go to **"Domains"**
2. Add your domain: `yourdomain.com`
3. Add www subdomain: `www.yourdomain.com` (optional)

### 7.3 Enable SSL

1. In Dokploy, enable **"SSL"** or **"HTTPS"**
2. Dokploy will automatically:
   - Request Let's Encrypt certificate
   - Configure SSL
   - Set up auto-renewal

3. **Update NEXTAUTH_URL** environment variable to use HTTPS:
   ```
   NEXTAUTH_URL=https://yourdomain.com
   ```

4. **Restart the application** after updating the environment variable

### 7.4 Verify SSL

- Visit `https://yourdomain.com`
- Check that the padlock icon appears in your browser

---

## Step 8: Alternative Deployment Method - Docker Compose

If you prefer to use Docker Compose directly (Dokploy also supports this):

### 8.1 Create Production Environment File

On your server, create `.env` file:

```bash
mkdir -p ~/habit-hero
cd ~/habit-hero

cat > .env << EOF
# MySQL
MYSQL_ROOT_PASSWORD=your_strong_root_password
MYSQL_PASSWORD=your_strong_db_password

# NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://yourdomain.com

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
EOF
```

### 8.2 Clone Repository

```bash
cd ~/habit-hero
git clone https://github.com/YOUR_USERNAME/habit-hero.git app
cd app
```

### 8.3 Deploy with Docker Compose

```bash
# Use the production compose file
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec -it habit-hero-app npx prisma migrate deploy
```

### 8.4 Set Up Reverse Proxy in Dokploy

1. In Dokploy, create a new **"Reverse Proxy"** or use the built-in proxy
2. Point it to your application container on port 3000
3. Configure SSL for your domain

---

## Step 9: Verify Deployment

### 9.1 Check Application Status

1. In Dokploy dashboard, verify:
   - ✅ Application is running
   - ✅ Database is running
   - ✅ No errors in logs

### 9.2 Test Your Application

1. **Open in browser:** `https://yourdomain.com`
2. **Test authentication:** Try logging in with GitHub
3. **Test database:** Create a habit and verify it persists
4. **Check logs:** Monitor for any errors

### 9.3 Useful Dokploy Features

- **Logs:** View real-time application logs
- **Terminal:** Access container shell
- **Restart:** Restart application with one click
- **Environment Variables:** Manage secrets easily
- **Backups:** Set up automatic backups (if available)

---

## Step 10: Maintenance & Updates

### 10.1 Updating Your Application

1. **Push changes to your repository:**
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```

2. **In Dokploy:**
   - Go to your application
   - Click **"Redeploy"** or **"Deploy"**
   - Dokploy will pull latest code and rebuild

3. **If database migrations are needed:**
   - Run migrations via Dokploy terminal or Docker exec

### 10.2 Database Backups

Set up regular backups:

```bash
# Create backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec habit-hero-mysql mysqldump -u habituser -pYOUR_PASSWORD habit_app_db > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $HOME/backup-db.sh") | crontab -
```

---

## Troubleshooting

### Application Won't Start

1. **Check logs in Dokploy:**
   - Go to application → Logs
   - Look for error messages

2. **Common issues:**
   - Missing environment variables
   - Database connection errors
   - Build failures

### Database Connection Issues

1. **Verify database is running:**
   - Check Dokploy dashboard → Databases

2. **Check DATABASE_URL:**
   - Ensure it uses the correct database service name
   - Verify password matches

3. **Test connection:**
   ```bash
   docker exec -it habit-hero-mysql mysql -u habituser -p habit_app_db
   ```

### Build Failures

1. **Check Dockerfile:**
   - Ensure it's in the repository root
   - Verify all paths are correct

2. **Check build logs:**
   - Look for specific error messages
   - Common: missing dependencies, Prisma issues

### SSL Certificate Issues

**If you see "TRAEFIK DEFAULT CERT" or browser security warnings:**

This means you're using Traefik's self-signed certificate. To fix this:

1. **You need a domain name:**
   - Let's Encrypt (free SSL) requires a valid domain name
   - You cannot get a trusted certificate for an IP address
   - Purchase a domain from a registrar (Namecheap, Cloudflare, etc.)

2. **Configure DNS:**
   - Point your domain's A record to your server IP
   - Example: `yourdomain.com` → `YOUR_SERVER_IP`
   - Wait for DNS propagation (can take 5 minutes to 48 hours)
   - Verify DNS: `dig yourdomain.com` or use online DNS checker

3. **Add domain in Dokploy:**
   - Go to your application in Dokploy dashboard
   - Navigate to **"Domains"** section
   - Add your domain: `yourdomain.com`
   - (Optional) Add `www.yourdomain.com` if you want www support

4. **Enable SSL in Dokploy:**
   - In the same Domains section, enable **"SSL"** or **"HTTPS"**
   - Dokploy will automatically:
     - Request Let's Encrypt certificate
     - Configure SSL/TLS
     - Set up automatic renewal
   - Wait 1-2 minutes for certificate provisioning

5. **Update environment variables:**
   - Update `NEXTAUTH_URL` to use HTTPS: `https://yourdomain.com`
   - Restart the application after updating

6. **Verify:**
   - Visit `https://yourdomain.com` (not the IP address!)
   - You should see a valid certificate from "Let's Encrypt"
   - Browser should show a padlock icon

**Note:** If you're accessing via IP address (`http://YOUR_SERVER_IP`), you'll always see the default Traefik certificate. You must use your domain name to get a trusted certificate.

---

## Security Best Practices

- [ ] Changed Dokploy default password
- [ ] Used strong passwords for MySQL
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Enabled HTTPS/SSL
- [ ] Restricted database access (only from app container)
- [ ] Regular backups configured
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication (not password)

---

## Quick Reference

### Dokploy Dashboard URLs

- **Main Dashboard:** `http://YOUR_SERVER_IP:3000`
- **Application:** `https://yourdomain.com`

### Important Commands

```bash
# View application logs
docker logs habit-hero-app -f

# View database logs
docker logs habit-hero-mysql -f

# Restart application
docker restart habit-hero-app

# Access application shell
docker exec -it habit-hero-app sh

# Access database
docker exec -it habit-hero-mysql mysql -u habituser -p habit_app_db

# Run migrations
docker exec -it habit-hero-app npx prisma migrate deploy
```

---

## Additional Resources

- **Dokploy Documentation:** https://docs.dokploy.com/
- **Dokploy GitHub:** https://github.com/dokploy/dokploy
- **Next.js Docker Deployment:** https://nextjs.org/docs/deployment#docker-image
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment

---

**Congratulations!** Your Habit Hero app should now be live on Hetzner using Dokploy! 🎉

