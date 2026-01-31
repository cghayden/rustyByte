# DigitalOcean Deployment Guide

Complete step-by-step guide to deploy your CTF platform to DigitalOcean.

**Deployment Strategy:**
1. First, deploy the core application without terminal features
2. Once stable, add Docker and terminal functionality

---

## Prerequisites

- [ ] DigitalOcean account
- [ ] Domain name (optional but recommended)
- [ ] GitHub repository with your code
- [ ] AWS credentials (for S3 file storage)
- [ ] Prisma database connection strings

**Required Environment Variables:**
- `DATABASE_URL` - Prisma Accelerate connection string
- `DIRECT_DATABASE_URL` - Direct PostgreSQL connection
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
- `JWT_SECRET` - For user authentication

---

## Part 1: Create DigitalOcean Droplet (10 minutes)

### 1.1 Create Droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Click **Create** → **Droplets**
3. Choose configuration:

```
Region: Choose closest to your users
  - New York (US East)
  - San Francisco (US West)
  - London (Europe)

Image: Ubuntu 24.04 LTS x64
  (Plain Ubuntu - we'll install what we need)

Droplet Size: Basic
  - $12/month - 2GB RAM / 1 CPU / 50GB SSD
  (Recommended for start)
  
  - For terminals: $24/month - 4GB RAM / 2 CPU / 80GB SSD
  (Upgrade later when adding Docker)

Authentication: SSH Key (recommended)
  - Or use password (less secure)

Hostname: rusty-byte-ctf (or your preferred name)
```

4. Click **Create Droplet**
5. Wait 1-2 minutes for droplet to be ready
6. Note the **IP address** (e.g., 159.65.123.45)

### 1.2 Initial Connection

```bash
# Connect via SSH (replace with your IP)
ssh root@159.65.123.45

# You should see:
# Welcome to Ubuntu 24.04 LTS
```

### 1.3 Initial Server Setup

```bash
# Update system packages
apt update && apt upgrade -y

# Install basic utilities
apt install -y curl wget git build-essential
```

---

## Part 2: Install Node.js and Dependencies (10 minutes)

### 2.1 Install Node.js 20

```bash
# Add NodeSource repository for Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js
apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x or higher
```

### 2.2 Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Verify
pm2 --version
```

### 2.3 Install Git (if not already installed)

```bash
apt-get install -y git

git --version
```

---

## Part 3: Deploy Your Application (20 minutes)

### 3.1 Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Or if private repo, use SSH or personal access token
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git
```

### 3.2 Set Up Environment Variables

```bash
# Create .env file
nano .env
```

Paste your environment variables (use your actual values):

```env
# Database (Prisma Accelerate + Direct Connection)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
DIRECT_DATABASE_URL="postgres://user:password@db.prisma.io:5432/postgres?sslmode=require"

# AWS S3 for file storage
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_REGION=us-east-2
S3_BUCKET_NAME=rusty-byte

# JWT Secret for user authentication (use a strong random string)
JWT_SECRET=your-very-secure-random-secret-here
```

**Security Note:** Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save and exit (Ctrl+X, then Y, then Enter)

### 3.3 Install Dependencies and Build

```bash
# Install Node.js dependencies
npSync database schema (creates tables)
npm run db:push

# Build Next.js application
npm run build

# This will take 2-3 minutes
```

### 3.4y image was created
docker images | grep rusty-byte
# Should show: rusty-byte-test-terminal   latest   ...
```

### 3.5 Start Application with PM2

```bash
# Start Next.js with PM2
pm2 start npm --name "ctf-app" -- start

# Check status
pm2 statusrustyByte" -- start

# Check status
pm2 status
# Should show: rustyByte | online

# View logs (check for any errors)
pm2 logs rustyByte --lines 50

# Save PM2 configuration (auto-restart on reboot)
pm2 save
pm2 startup
# Copy and run the command it outputs
```

### 3.5 Test Application Locally
curl http://localhost:3000
# Should return HTML

# Or visit in browser (replace with your IP)
http://159.65.123.45:3000
```

---

## Part 4: Configure Firewall (5 minutes)

### 4.1 Set Up UFW Firewall

```bash
# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Allow your app (temporary, we'll use nginx later)
ufw allow 3000/tcp

# Enable firewall
ufw enable

# Verify status
ufw status
```

---

## Part 5: Set Up Domain and SSL (20 minutes)

### 5.1 Point Domain to Droplet

In your domain registrar (Namecheap, GoDaddy, etc.):

```
Add A Record:
Type: A
Name: @ (or subdomain like ctf)
Value: 159.65.123.45 (your droplet IP)
TTL: 300
```

Wait 5-10 minutes for DNS to propagate.

Test:
```bash
# On your local machine
ping yourdomain.com
# Should resolve to your droplet IP
```

### 5.2 Install Nginx (Reverse Proxy)

```bash
# Install Nginx
apt-get install -y nginx

# Check status
systemctl status nginx
```

### 5.3 Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/ctf-app
```

Paste this configuration (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for terminal
    location /api/terminal/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

Save and exit.

```bash
# Enable the site
ln -s /etc/nginx/sites-available/ctf-app /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
# Should say: syntax is ok

# Restart Nginx
systemctl restart nginx
```

Test: Visit `http://yourdomain.com` in browser

### 5.4 Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (replace yourdomain.com)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)

# Test auto-renewal
certbot renew --dry-run
```

Your site is now live with HTTPS! 🎉

Visit: `https://yourdomain.com`

---

## Part 6: Database Setup (5 minutes)

### 6.1 Run Migrations (if needed)

```bash
# Navigate to your app directory
cd ~/YOUR_REPO

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 6.2 Seed Initial Data

```bash
# Add test terminal challenge
npx tsx scripts/add-terminal-challenge.ts

# Seed categories
npx tsx scripts/seed-categories.ts

# Add test users (optional)
npx tsx scripts/seed-users.ts

# Verify by logging into your application

## Part 7: Monitoring and Maintenance

### 7.1 View Logs

```bash
# Application logs
pm2 logs ctf-app

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# Docker logs for a specific container
docker logs <container-name>

# Docker running containers
docker ps
```

### 7.2 Restart Services

```bash
# Restart Next.js app
pm2 restart rustyByte

# Restart Nginx
systemctl restart nginx
```

### 7.3 Update Application

```bash
# Pull latest code
cd ~/YOUR_REPO
git pull

# Install new dependencies (if any)
npm irustyByte
git pull

# Install new dependencies (if any)
npm install

# Regenerate Prisma client (if schema changed)
npm run db:generate

# Push schema changes (if any)
npm run db:push

# Rebuild application
npm run build

# Restart app
pm2 restart rustyByte

# Check logs for errors
pm2 logs rustyByte --lines 20
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop
# (Install with: apt-get install htop)

# PM2 monitoring
pm2 monit
```
 dashboard
pm2 monit

# Check CPU and memory per process
pm2 status

## Part 8: Backups

### 8.1 Set Up Automated Backups

```bash
# Create backup script
nano /root/backup.sh
```

Paste:

```bash
#!/bin/bash
# Backup script

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application code and environment
tar -czf $BACKUP_DIR/app-$DATE.tar.gz ~/rustyByte --exclude=node_modules --exclude=.next

# Keep only last 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable:

```bash
chmod +x /root/backup.sh
```

Add to cron (daily at 2 AM):

```bash
crontab -e

# Add this line:
0 2 * * * /root/backup.sh >> /var/log/backup.log 2>&1
```

**Database Backups:** Your database is managed by Prisma (cloud-hosted), which handles backups automatically.

### 8.2 DigitalOcean Snapshots

Enable weekly snapshots in DigitalOcean dashboard:
- Droplet → Snapshots → Enable Automatic Backups ($2.40/month)

---

## Part 9: Security Hardening

### 9.1 Disable Root Login

```bash
# Create a non-root user
adduser ctfadmin
usermod -aG sudo ctfadmin
usermod -aG docker ctfadmin

# Test sudo access
su - ctfadmin
sudo ls /root
exit

# Disable root SSH login
nano /etc/ssh/sshd_config

# Change these lines:
PermitRootLogin no
PasswordAuthentication no  # Force SSH key authentication

# Restart SSH
systemctl restart sshd

# Note: Make sure you can login as ctfadmin before logging out as root!

### 9.2 Install Fail2Ban

```bash
# Install fail2ban (blocks brute force attempts)
apt-get install -y fail2ban

# Start and enable
systemctl start fail2ban
systemctl enable fail2ban

# Check status
fail2ban-client status
```

### 9.3 Keep System Updated

```bash
# Enable automatic security updates
apt-get install -y unattended-upgrades

dpkg-reconfigure --priority=low unattended-upgrades
# Select "Yes"
```

---

## Part 10: Troubleshooting

### Common Issues

#### Application won't start
```bash
# Check PrustyByte --lines 100

# Check if port 3000 is in use
lsof -i :3000

# Kill process on port 3000 if needed
kill -9 $(lsof -t -i:3000)

# Restart application
pm2 restart rustyByte

# Delete and restart from scratch
pm2 delete rustyByte
pm2 start npm --name "rustyByte" -- start
pm2 save
```

#### Environment variable issues
```bash
# Verify .env file exists
cat ~/rustyByte/.env

# Check if PM2 is loading environment variables
pm2 env rustyByte

# Restart with explicit env file
cd ~/rustyByte
pm2 restart rustyByte --update-env
systemctl restart docker
```

#### Nginx errors
```bash
# Test configuration
nginx -t

# Check error logs
tail -n 50 /var/log/nginx/error.log

# Rheck what's using space
du -sh /* 2>/dev/null | sort -hr | head -10

# Clean up old logs
journalctl --vacuum-time=7d

# Remove old PM2 logs
pm2 flush

# Clean up npm cache
npm cache clean --force

# Reart 11: Adding Docker & Terminal Features (Optional)

**Complete this section after your base application is stable.**

### 11.1 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
docker ps

# Add ctfadmin user to docker group (if using non-root)
usermod -aG docker ctfadmin
```

### 11.2 Build Terminal Docker Image

```bash
cd ~/rustyByte

# Build the terminal image
docker build -f Dockerfile.alpine-ttyd -t ctf-alpine-terminal:latest .

# Verify image exists
docker images | grep ctf-alpine
```

### 11.3 Update Database for Terminal Challenges

```bash
# Update challenge docker images
npx tsx scripts/fix-terminal-docker-image.ts

# Add terminal challenges
npx tsx scripts/add-terminal-challenge.ts
```

### 11.4 Configure Nginx for Terminal Proxying

Edit your Nginx config to add WebSocket support:

```bash
nano /etc/nginx/sites-available/ctf-app
### Phase 1: Base Application
- [ ] DigitalOcean droplet created (Ubuntu 24.04)
- [ ] System updated (apt update && upgrade)
- [ ] Node.js 20 and PM2 installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] .env file configured with all secrets
- [ ] Dependencies installed (npm install)
- [ ] Prisma client generated
- [ ] Database schema synced (db:push)
- [ ] Application built (npm run build)
- [ ] PM2 running application
- [ ] Firewall configured (UFW)
- [ ] Domain pointed to droplet (A record)
- [ ] Nginx installed and configured
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Categories seeded
- [ ] Application accessible via HTTPS
- [ ] User registration/login working
- [ ] Backups configured
- [ ] Security hardening complete

### Phase 2: Terminal Features (Optional)
- [ ] Docker installed
- [ ] Terminal Docker image built# Check app status
pm2 restart rustyByte             # Restart app
pm2 logs rustyByte                # View logs
pm2 logs rustyByte --lines 100    # View last 100 log lines
pm2 monit                         # Monitor resources
pm2 save                          # Save PM2 process list

# Docker Management (if using terminals)
docker ps                         # List running containers
docker ps -a                      # List all containers
docker images                     # List images
docker logs <container-name>      # View container logs
docker stop $(docker ps -q)       # Stop all containers
docker system prune -a            # Clean up everything

# Nginx Management
systemctl status nginx            # Check status
systemctl restart nginx           # Restart
systemctl reload nginx            # Reload config
nginx -t                          # Test config
tail -f /var/log/nginx/error.log  # View errors
tail -f /var/log/nginx/access.log # View access logs

# System Management
df -h                             # Disk usage
du -sh /var/log/*                 # Log directory sizes
free -h                           # Memory usage
htop                              # Process monitor (apt install htop)
ufw status                        # Firewall status
netstat -tlnp                     # Show listening ports

# Updates
cd ~/rustyByte && git pull        # Pull latest code
npm install                       # Install dependencies
npm run db:generate               # Regenerate Prisma client
npm run build                     # Build app
pm2 restart rustyByte             # Restart

# Database
npm run db:push                   # Sync schema changes
npx tsx scripts/seed-categories.ts # Seed categories

# SSL (Base Application):
- DigitalOcean Droplet (2GB):     $12.00
- AWS S3 (file storage):          ~$1.00
- Prisma Database (included):     FREE (in Accelerate tier)
- SSL Certificate:                FREE (Let's Encrypt)
- Backups (optional):             $2.40
──────────────────────────────────────────
TOTAL (Base):                     $13-15/month

With Terminal Features:
- DigitalOcean Droplet (4GB):     $24.00
- AWS S3:                         ~$1.00
- SSL Certificate:                FREE
- Backups:                        $4.80
──────────────────────────────────────────
TOTAL (With Terminals):           $28-30ow only errors
journalctl -u nginx -n 50        # Nginx system logs
lsof -i :3000                    # Check what's using port 3000
ps aux | grep node               # Find Node processe
crontab -e
0 */6 * * * /root/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1
```

### 11.6 Restart and Test

```bash
pm2 restart rustyByte
pm2 logs rustyByte

# Test by visiting a terminal challenge page
```

---

## Performance Optimization

### Enable Gzip Compression

Already enabled in Nginx config above, but verify:

```bash
nano /etc/nginx/nginx.conf

# Ensure these lines are uncommented:
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### PM2 Cluster Mode (Optional)

For better performance on multi-core servers:

```bash
pm2 delete rustyByte
pm2 start npm --name "rustyByte" -i max -- start
pm2 save
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 10.2 Set Up Container Cleanup

```bash
# Create cleanup script
nano /root/docker-cleanup.sh
```

```bash
#!/bin/bash
# Remove stopped containers older than 1 hour
docker container prune -f --filter "until=1h"

# Remove unused images
docker image prune -a -f --filter "until=24h"

echo "Docker cleanup completed: $(date)"
```

```bash
chmod +x /root/docker-cleanup.sh

# Run every 6 hours
crontab -e
0 */6 * * * /root/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1
```

---

## Deployment Checklist Summary

- [ ] DigitalOcean droplet created
- [ ] Node.js and PM2 installed
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Application built
- [ ] Docker images built
- [ ] PM2 running application
- [ ] Firewall configured
- [ ] Domain pointed to droplet
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Database migrations run
- [ ] Test challenges working
- [ ] Backups configured
- [ ] Security hardening complete
- [ ] Monitoring set up

---

## Quick Reference Commands

```bash
# Application Management
pm2 status                          # Check app status
pm2 restart ctf-app                # Restart app
pm2 logs ctf-app                   # View logs
pm2 monit                          # Monitor resources

# Docker Management
docker ps                          # List running containers
docker ps -a                       # List all containers
docker images                      # List images
docker logs <container-id>         # View container logs
docker stop <container-id>         # Stop container
docker rm <container-id>           # Remove container
docker system prune -a             # Clean up everything

# Nginx Management
systemctl status nginx             # Check status
systemctl restart nginx            # Restart
nginx -t                           # Test config
tail -f /var/log/nginx/error.log  # View errors

# System Management
df -h                              # Disk usage
free -h                            # Memory usage
htop                               # Process monitor
ufw status                         # Firewall status

# Updates
cd ~/YOUR_REPO && git pull         # Pull latest code
npm install                        # Install dependencies
npm run build                      # Build app
pm2 restart ctf-app                # Restart

# SSL
certbot renew                      # Renew certificates
certbot certificates               # Check cert status
```

---

## Cost Breakdown

```
Monthly Costs:
- DigitalOcean Droplet (2GB):  $12.00
- AWS S3 (file storage):       ~$1.00
- SSL Certificate:             FREE (Let's Encrypt)
- Backups (optional):          $2.40
─────────────────────────────────────
TOTAL:                         $13-15/month
```

---

## Next Steps

1. **Test everything thoroughly**
   - Create user accounts
   - Test terminal challenges
   - Download challenge files
   - Submit answers

2. **Monitor for first week**
   - Check logs daily
   - Monitor resource usage
   - Watch for errors

3. **Plan for scale**
   - Set up monitoring alerts
   - Plan resource upgrades if needed
   - Consider CDN for global users

4. **Build more challenges!** 🚀

---

## Support Resources

- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Docker Documentation](https://docs.docker.com/)

---

**Your CTF platform is now live!** 🎉

Visit: https://yourdomain.com
