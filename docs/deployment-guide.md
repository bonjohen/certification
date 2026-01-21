# Deployment Guide: GitHub Pages with GoDaddy Custom Domain

This guide explains how to deploy the Certification Exam Study application to GitHub Pages and connect it to a custom domain from GoDaddy.

## Prerequisites

- A GitHub account
- A GoDaddy domain (e.g., `yourdomain.com`)
- Git installed locally

## Part 1: Push to GitHub

### 1. Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it (e.g., `certification-study`)
4. Choose **Public** (required for free GitHub Pages)
5. Do NOT initialize with README (you already have files)
6. Click **Create repository**

### 2. Push Your Local Repository

```bash
# Add the remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/certification-study.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Part 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (tab at the top)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

Your site will be available at: `https://YOUR_USERNAME.github.io/certification-study/`

## Part 3: Configure Custom Domain in GitHub

### 1. Add Custom Domain

1. In **Settings → Pages**, find the **Custom domain** section
2. Enter your domain: `www.yourdomain.com` or `yourdomain.com`
3. Click **Save**
4. Check **Enforce HTTPS** (may take a few minutes to become available)

### 2. Create CNAME File

GitHub creates this automatically, but you can also add it manually:

```bash
echo "www.yourdomain.com" > CNAME
git add CNAME
git commit -m "Add custom domain CNAME"
git push
```

## Part 4: Configure GoDaddy DNS

### Option A: Using a Subdomain (www.yourdomain.com) - Recommended

1. Log in to [GoDaddy](https://www.godaddy.com)
2. Go to **My Products** → find your domain → **DNS**
3. Add a **CNAME** record:

| Type  | Name | Value                              | TTL    |
|-------|------|------------------------------------|--------|
| CNAME | www  | YOUR_USERNAME.github.io           | 1 Hour |

### Option B: Using Apex Domain (yourdomain.com)

For the root domain without `www`, add **A records** pointing to GitHub's IP addresses:

1. In GoDaddy DNS, add these **A records**:

| Type | Name | Value           | TTL    |
|------|------|-----------------|--------|
| A    | @    | 185.199.108.153 | 1 Hour |
| A    | @    | 185.199.109.153 | 1 Hour |
| A    | @    | 185.199.110.153 | 1 Hour |
| A    | @    | 185.199.111.153 | 1 Hour |

2. Optionally add a CNAME for `www` to redirect:

| Type  | Name | Value                    | TTL    |
|-------|------|--------------------------|--------|
| CNAME | www  | YOUR_USERNAME.github.io  | 1 Hour |

### Option C: Both Apex and www (Best Practice)

1. Add all four **A records** from Option B
2. Add the **CNAME** record for `www` from Option A
3. In GitHub Pages settings, set custom domain to `www.yourdomain.com`

This allows both `yourdomain.com` and `www.yourdomain.com` to work.

## Part 5: Verify DNS Configuration

### Check DNS Propagation

DNS changes can take up to 48 hours, but usually complete within 1-2 hours.

```bash
# Check A records
dig yourdomain.com +short

# Check CNAME
dig www.yourdomain.com +short

# Or use online tools:
# https://www.whatsmydns.net/
```

### Verify GitHub Pages

1. Go to **Settings → Pages** in your repository
2. Look for the green checkmark next to your custom domain
3. If there's an error, GitHub will display troubleshooting info

## Part 6: Enable HTTPS

1. Wait for DNS to propagate (check the GitHub Pages settings)
2. Once the custom domain shows a green checkmark, check **Enforce HTTPS**
3. GitHub automatically provisions a Let's Encrypt SSL certificate

## Troubleshooting

### "Domain not properly configured"

- Wait for DNS propagation (up to 48 hours)
- Verify DNS records are correct using `dig` or whatsmydns.net
- Ensure CNAME file in repo matches your domain exactly

### "Certificate not yet generated"

- HTTPS certificates can take up to 24 hours
- Ensure DNS is fully propagated first
- Try removing and re-adding the custom domain in GitHub settings

### Site shows 404

- Ensure `index.html` exists in the root of your repository
- Check that GitHub Pages source is set to correct branch/folder
- Verify the repository is public

### Mixed Content Warnings

- Update any hardcoded `http://` URLs to `https://` or use `//` (protocol-relative)

## File Structure for GitHub Pages

```
certification-study/
├── index.html          ← Entry point (required)
├── quiz.html
├── CNAME               ← Custom domain file
├── css/
│   ├── styles.css
│   └── quiz.css
├── js/
│   ├── app.js
│   ├── quiz-engine.js
│   ├── progress-tracker.js
│   └── xml-parser.js
└── data/
    ├── az-104/
    │   └── exam.xml
    └── az-204/
        └── exam.xml
```

## Updating Your Site

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages automatically rebuilds within a few minutes.

## Summary

1. **GitHub**: Create repo → Push code → Enable Pages → Set custom domain
2. **GoDaddy**: Add CNAME record (for www) and/or A records (for apex)
3. **Wait**: DNS propagation (1-48 hours)
4. **HTTPS**: Enable once DNS is verified
