# EC2 Deployment Guide — toodlesfunzone.com

Deploy toodlesfunzone on AWS EC2 with Nginx, PM2, and Let's Encrypt SSL.

**Target:** t2.micro · Ubuntu 22.04 · Hostinger domain

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Launch EC2](#1-launch-ec2)
3. [Connect via SSH](#2-connect-via-ssh)
4. [Install Software](#3-install-software)
5. [Clone & Build](#4-clone--build)
6. [Environment Variables](#5-environment-variables)
7. [Database Setup](#6-database-setup)
8. [Start with PM2](#7-start-with-pm2)
9. [Configure Nginx](#8-configure-nginx)
10. [DNS (Hostinger)](#9-dns-hostinger)
11. [SSL (HTTPS)](#10-ssl-https)
12. [Verify & Maintain](#11-verify--maintain)

---

## Prerequisites

| Item | Description |
|------|-------------|
| AWS account | [console.aws.amazon.com](https://console.aws.amazon.com) |
| Domain | toodlesfunzone.com on Hostinger |
| GitHub | Repo URL + [Personal Access Token (PAT)](https://github.com/settings/tokens) for private repos |
| Env vars | From Render or local `.env` |

---

## 1. Launch EC2

1. **AWS Console** → Search **EC2** → **Launch Instance**
2. **Settings:**
   - Name: `toodlesfunzone`
   - AMI: **Ubuntu Server 22.04 LTS**
   - Instance type: **t2.micro**
   - Key pair: **Create new** → Name: `toodlesfunzone-key` → Download `.pem`
   - Network: Edit → Allow **SSH (22)**, **HTTP (80)**, **HTTPS (443)**
   - Storage: **20 GiB**
3. **Launch** → Note the **Public IPv4 address**

---

## 2. Connect via SSH

**Local machine:**

```bash
chmod 400 ~/path/to/toodlesfunzone-key.pem
ssh -i ~/path/to/toodlesfunzone-key.pem ubuntu@YOUR_EC2_IP
```

Type `yes` when prompted. You should see `ubuntu@ip-xxx:~$`.

---

## 3. Install Software

**All commands below run on EC2.**

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

Verify: `node -v` and `npm -v`.

---

## 4. Clone & Build

### 4.1 Create directory

```bash
sudo mkdir -p /var/www && sudo chown ubuntu:ubuntu /var/www
cd /var/www
```

### 4.2 Clone with PAT (private repo)

Replace `GITHUB_PAT` and `YOUR_USERNAME`:

```bash
git clone https://GITHUB_PAT@github.com/YOUR_USERNAME/toodlesfunzone.git
cd toodlesfunzone
```

**Public repo:**

```bash
git clone https://github.com/YOUR_USERNAME/toodlesfunzone.git
cd toodlesfunzone
```

### 4.3 Build

```bash
npm install
npm run build
```

---

## 5. Environment Variables

### Option A — Copy from local (recommended)

**From your local machine:**

```bash
scp -i ~/path/to/toodlesfunzone-key.pem \
  /path/to/toodlesfunzone/.env \
  ubuntu@YOUR_EC2_IP:/var/www/toodlesfunzone/.env
```

**On EC2**, edit if needed:

```bash
cd /var/www/toodlesfunzone
nano .env
```

- Set `NODE_ENV=production`
- Set `GOOGLE_REDIRECT_URI=https://toodlesfunzone.com/api/auth/google/callback`
- Keep only one `DATABASE_URL` line

### Option B — Create manually

```bash
cd /var/www/toodlesfunzone
cp .env.example .env
nano .env
```

Fill values. Minimum required:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `SESSION_SECRET` | Random 32+ char string |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |

See `.env.example` for optional vars (SMTP, Cloudinary, WhatsApp, etc.).

---

## 6. Database Setup

```bash
cd /var/www/toodlesfunzone

npm run db:push
npm run db:create-slots
npm run db:update-hours
npm run db:seed   # optional
```

---

## 7. Start with PM2

```bash
cd /var/www/toodlesfunzone

pm2 start dist/index.js --name toodlesfunzone
pm2 startup    # run the command it outputs
pm2 save
```

Verify: `pm2 status` and `curl http://localhost:5000`.

---

## 8. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/toodlesfunzone.com
```

Paste:

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

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/toodlesfunzone.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 9. DNS (Hostinger)

1. Hostinger → **Domains** → **toodlesfunzone.com** → **Manage DNS**
2. Add/update A records:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | @ | `YOUR_EC2_IP` | 3600 |
   | A | www | `YOUR_EC2_IP` | 3600 |

3. Remove any A record or redirect pointing to Render.
4. Wait 5–30 min. Check: `ping toodlesfunzone.com` (should show EC2 IP).

---

## 10. SSL (HTTPS)

**Run only after DNS points to EC2.**

```bash
sudo certbot --nginx -d toodlesfunzone.com -d www.toodlesfunzone.com
```

Follow prompts. Test renewal: `sudo certbot renew --dry-run`

### If Certbot fails (IPv6 / 500 error)

Let's Encrypt may hit Hostinger via AAAA (IPv6) instead of your EC2. Use **DNS challenge**:

**Step 1** — On EC2:

```bash
sudo certbot certonly --manual --preferred-challenges dns -d toodlesfunzone.com -d www.toodlesfunzone.com
```

**Step 2** — Certbot will prompt: "Please deploy a DNS TXT record..."

- **Name:** `_acme-challenge` (or `_acme-challenge.toodlesfunzone.com` / `_acme-challenge.www` as shown)
- **Value:** the long string Certbot prints
- Add TXT records in Hostinger for both domains if asked
- Wait 1–2 min for DNS propagation, then press Enter in the terminal

**Step 3** — Install cert into Nginx:

```bash
sudo certbot install --cert-name toodlesfunzone.com
```

**Step 4** — Reload Nginx:

```bash
sudo systemctl reload nginx
```

**Tip:** Delete AAAA records in Hostinger so future renewals can use HTTP challenge.

---

## 11. Verify & Maintain

### Verify

- [ ] https://toodlesfunzone.com loads
- [ ] https://www.toodlesfunzone.com loads
- [ ] Booking and payment flow work

### Common commands

```bash
# Status & logs
pm2 status
pm2 logs toodlesfunzone

# Restart
pm2 restart toodlesfunzone

# Deploy update
cd /var/www/toodlesfunzone && git pull && npm install && npm run build && pm2 restart toodlesfunzone

# Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Troubleshooting

| Problem | Action |
|---------|--------|
| Can't SSH | Security group: allow port 22 from your IP |
| `drizzle-kit: not found` or `tsx: not found` | Run `npm install` (not `--production`). If NODE_ENV=production, use: `NODE_ENV=development npm install` |
| 502 Bad Gateway | `pm2 status`; `curl http://localhost:5000` |
| Domain not resolving | Check A records; wait for DNS propagation |
| Certbot fails (HTTP) | Domain must resolve to EC2 IPv4. Delete AAAA records in Hostinger. |
| Certbot fails (IPv6/500) | Use DNS challenge: `sudo certbot certonly --manual --preferred-challenges dns -d toodlesfunzone.com -d www.toodlesfunzone.com` then `sudo certbot install --cert-name toodlesfunzone.com` |
