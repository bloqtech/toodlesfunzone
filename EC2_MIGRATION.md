# Step-by-Step EC2 Hosting Guide — toodlesfunzone.com

Host toodlesfunzone on AWS EC2. Domain: toodlesfunzone.com (Hostinger).  
Instance: **t2.micro** (1 vCPU, 1 GB RAM).

---

## Prerequisites

- [ ] AWS account
- [ ] Domain on Hostinger (toodlesfunzone.com)
- [ ] GitHub repo URL for toodlesfunzone
- [ ] Environment variables from current Render deployment

---

# STEP 1: Launch EC2 Instance

### Step 1.1 — Open AWS Console

1. Go to [https://console.aws.amazon.com](https://console.aws.amazon.com)
2. Sign in to your AWS account
3. Search for **EC2** in the top search bar and open **EC2**

### Step 1.2 — Launch Instance

1. Click **Launch Instance**
2. Configure:
   - **Name:** `toodlesfunzone`
   - **Application and OS Images (AMI):** Ubuntu
   - **AMI:** Ubuntu Server 22.04 LTS
   - **Instance type:** t2.micro (Free tier eligible)
   - **Key pair (login):** Click **Create new key pair**
     - Name: `toodlesfunzone-key`
     - Type: RSA
     - Format: `.pem` (for Mac/Linux) or `.ppk` (for Windows PuTTY)
     - Download and save the key in a safe place
   - **Network settings:** Click **Edit**
     - Allow SSH from: **My IP** (recommended) or **Anywhere** (0.0.0.0/0)
     - Allow HTTPS from: **Anywhere** (0.0.0.0/0)
     - Allow HTTP from: **Anywhere** (0.0.0.0/0)
   - **Storage:** 20 GiB
3. Click **Launch instance**

### Step 1.3 — Get Public IP

1. In EC2 Dashboard, go to **Instances**
2. Select your instance
3. Copy the **Public IPv4 address** (e.g. `54.123.45.67`) — you'll use this everywhere.

---

# STEP 2: Connect to EC2 via SSH

### Step 2.1 — Set Key Permissions (Mac/Linux only)

```bash
chmod 400 ~/path/to/toodlesfunzone-key.pem
```

Replace `~/path/to/` with the actual path where you saved the `.pem` file.

### Step 2.2 — Connect

```bash
ssh -i ~/path/to/toodlesfunzone-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Example:

```bash
ssh -i ~/Downloads/toodlesfunzone-key.pem ubuntu@54.123.45.67
```

When prompted "Are you sure you want to continue connecting?" type `yes`.

You should now see a prompt like: `ubuntu@ip-xxx-xxx-xxx-xxx:~$`

---

# STEP 3: Install Required Software

Run these commands one by one on the EC2 instance.

### Step 3.1 — Update System

```bash
sudo apt update
```

```bash
sudo apt upgrade -y
```

### Step 3.2 — Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

```bash
sudo apt install -y nodejs
```

Verify:

```bash
node -v
npm -v
```

### Step 3.3 — Install Git

```bash
sudo apt install -y git
```

### Step 3.4 — Install PM2

```bash
sudo npm install -g pm2
```

### Step 3.5 — Install Nginx

```bash
sudo apt install -y nginx
```

### Step 3.6 — Install Certbot (for SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

# STEP 4: Clone and Build the App

### Step 4.1 — Create App Directory

```bash
sudo mkdir -p /var/www
```

```bash
sudo chown ubuntu:ubuntu /var/www
```

```bash
cd /var/www
```

### Step 4.2 — Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/toodlesfunzone.git
```

Replace `YOUR_USERNAME` with your GitHub username.  
If the repo is private, use:

```bash
git clone https://YOUR_GITHUB_TOKEN@github.com/YOUR_USERNAME/toodlesfunzone.git
```

### Step 4.3 — Enter Project and Install Dependencies

```bash
cd toodlesfunzone
```

```bash
npm install
```

### Step 4.4 — Build the App

```bash
npm run build
```

Wait until the build completes. You should see output like "Build completed" or similar.

---

# STEP 5: Configure Environment Variables

You can either **copy from your local .env** (recommended) or **create manually**.

### Option A — Copy from Your Local Machine (Recommended)

From your **local machine** (not EC2), run:

```bash
scp -i ~/path/to/toodlesfunzone-key.pem /path/to/toodlesfunzone/.env ubuntu@YOUR_EC2_PUBLIC_IP:/var/www/toodlesfunzone/.env
```

Then on EC2, update `GOOGLE_REDIRECT_URI` for production:

```bash
cd /var/www/toodlesfunzone
nano .env
```

Change:
- `GOOGLE_REDIRECT_URI` → `https://toodlesfunzone.com/api/auth/google/callback`
- `NODE_ENV` → `production` (if needed)
- Remove duplicate `DATABASE_URL` if present (keep only one)

### Option B — Create .env Manually

On EC2:

```bash
cd /var/www/toodlesfunzone
cp .env.example .env
nano .env
```

Fill in values (or copy from Render). See `.env.example` in the repo for the full list. Minimum required:

```bash
NODE_ENV=production
PORT=5000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Session
SESSION_SECRET=your_random_32_char_secret_here

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Email (project uses SMTP_* not EMAIL_*)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@toodlesfunzone.com
ADMIN_PHONE=+919901218980

# Cloudinary (optional)
CLOUDINARY_CLOUDNAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# WhatsApp (optional) — uses WHATSAPP_ACCESS_TOKEN
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Google OAuth, VITE_GA_MEASUREMENT_ID — optional
```

Save and exit: Press `Ctrl + X`, then `Y`, then `Enter`.

---

# STEP 6: Database Setup

```bash
cd /var/www/toodlesfunzone
```

### Step 6.1 — Push Schema

```bash
npm run db:push
```

### Step 6.2 — Create Time Slots

```bash
npm run db:create-slots
```

### Step 6.3 — Update Operating Hours

```bash
npm run db:update-hours
```

### Step 6.4 — Seed Data (Optional)

Only if you need initial/seed data:

```bash
npm run db:seed
```

---

# STEP 7: Start App with PM2

### Step 7.1 — Start the App

```bash
cd /var/www/toodlesfunzone
```

```bash
pm2 start dist/index.js --name toodlesfunzone
```

### Step 7.2 — Enable Auto-Start on Reboot

```bash
pm2 startup
```

Copy and run the command it outputs (it will look like `sudo env PATH=...`).

```bash
pm2 save
```

### Step 7.3 — Verify

```bash
pm2 status
```

You should see `toodlesfunzone` with status **online**.

```bash
curl http://localhost:5000
```

You should get HTML output. If yes, the app is running.

---

# STEP 8: Configure Nginx

### Step 8.1 — Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/toodlesfunzone.com
```

### Step 8.2 — Paste Config

```nginx
server {
    listen 80;
    server_name toodlesfunzone.com www.toodlesfunzone.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and exit: `Ctrl + X`, `Y`, `Enter`.

### Step 8.3 — Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/toodlesfunzone.com /etc/nginx/sites-enabled/
```

### Step 8.4 — Remove Default Site (Optional)

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Step 8.5 — Test and Reload Nginx

```bash
sudo nginx -t
```

Should say "syntax is ok" and "test is successful".

```bash
sudo systemctl reload nginx
```

---

# STEP 9: Update Hostinger DNS

### Step 9.1 — Log in to Hostinger

1. Go to [https://www.hostinger.com](https://www.hostinger.com) and sign in
2. Open **Domains** or **hPanel**
3. Select **toodlesfunzone.com**

### Step 9.2 — Open DNS Settings

1. Go to **DNS / Nameservers** or **Manage DNS**
2. Find the **A records** section

### Step 9.3 — Add or Edit A Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_EC2_PUBLIC_IP | 3600 |
| A | www | YOUR_EC2_PUBLIC_IP | 3600 |

Example: If EC2 IP is `54.123.45.67`, set both records to `54.123.45.67`.

### Step 9.4 — Remove Old Records

- Delete or update any A record pointing to Render
- Disable any redirect that sends traffic to Render

### Step 9.5 — Save and Wait

Save the DNS changes. Propagation can take **5–30 minutes** (sometimes up to 48 hours).

Check with:

```bash
ping toodlesfunzone.com
```

When the IP shown matches your EC2 IP, DNS is ready.

---

# STEP 10: Install SSL (HTTPS)

Do this only after the domain points to your EC2 IP (Step 9 done and propagated).

### Step 10.1 — Run Certbot

```bash
sudo certbot --nginx -d toodlesfunzone.com -d www.toodlesfunzone.com
```

### Step 10.2 — Follow Prompts

- Enter your email for renewal notices
- Agree to terms
- Choose whether to share email (optional)
- Certbot will obtain and install the certificate

### Step 10.3 — Test Renewal

```bash
sudo certbot renew --dry-run
```

Should complete without errors. Certificates renew automatically.

---

# STEP 11: Verify Everything

1. Open **https://toodlesfunzone.com** in a browser  
2. Open **https://www.toodlesfunzone.com**  
3. Test booking, login, payments if applicable  

---

# Quick Reference — Useful Commands

```bash
# App status
pm2 status

# App logs
pm2 logs toodlesfunzone

# Restart app
pm2 restart toodlesfunzone

# Deploy updates
cd /var/www/toodlesfunzone && git pull && npm install && npm run build && pm2 restart toodlesfunzone

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Test app locally on EC2
curl http://localhost:5000
```

---

# Checklist

- [ ] EC2 instance launched (t2.micro, Ubuntu 22.04)
- [ ] Connected via SSH
- [ ] Node.js 20, Git, PM2, Nginx, Certbot installed
- [ ] Repo cloned to `/var/www/toodlesfunzone`
- [ ] `npm install` and `npm run build` completed
- [ ] `.env` configured
- [ ] Database: `db:push`, `db:create-slots`, `db:update-hours` done
- [ ] PM2 running `toodlesfunzone` on port 5000
- [ ] Nginx config created and enabled
- [ ] Hostinger A records point to EC2 IP
- [ ] SSL installed via Certbot
- [ ] https://toodlesfunzone.com works

---

# Troubleshooting

| Issue | Check |
|-------|-------|
| Can't SSH | Security group allows SSH (22) from your IP; correct key file |
| App not loading | `pm2 status`; `pm2 logs toodlesfunzone` |
| 502 Bad Gateway | App running? `curl http://localhost:5000` |
| Domain not resolving | Wait for DNS propagation; verify A records in Hostinger |
| Certbot fails | Domain must point to EC2 IP first |
