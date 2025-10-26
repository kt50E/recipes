# Custom Domain Setup Guide - tldr-kitchen.com 🌐

Complete guide to setting up your custom domain with Cloudflare and GitHub Pages.

## Overview

**Your Domain:** `tldr-kitchen.com`
**Setup Type:** Both apex and www with redirect
**DNS Provider:** Cloudflare
**Hosting:** GitHub Pages

---

## Step 1: Purchase Domain in Cloudflare

1. Go to [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
2. Search for: `tldr-kitchen.com`
3. Complete purchase
4. Domain should appear in your Cloudflare dashboard

⏱️ **Time:** ~5 minutes

---

## Step 2: Configure DNS Records in Cloudflare

### Go to DNS Settings

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on your domain: `tldr-kitchen.com`
3. Go to **DNS** → **Records**

### Add These 4 Records:

#### Record 1: A Record (Apex Domain)
```
Type: A
Name: @
IPv4 Address: 185.199.108.153
Proxy status: DNS only (gray cloud)
TTL: Auto
```

#### Record 2: A Record (Apex Domain - Backup 1)
```
Type: A
Name: @
IPv4 Address: 185.199.109.153
Proxy status: DNS only (gray cloud)
TTL: Auto
```

#### Record 3: A Record (Apex Domain - Backup 2)
```
Type: A
Name: @
IPv4 Address: 185.199.110.153
Proxy status: DNS only (gray cloud)
TTL: Auto
```

#### Record 4: A Record (Apex Domain - Backup 3)
```
Type: A
Name: @
IPv4 Address: 185.199.111.153
Proxy status: DNS only (gray cloud)
TTL: Auto
```

#### Record 5: CNAME Record (www subdomain)
```
Type: CNAME
Name: www
Target: kt50e.github.io
Proxy status: DNS only (gray cloud)
TTL: Auto
```

### ⚠️ Important Settings:

- **Proxy Status:** Set to **DNS only** (gray cloud icon)
  - Click the orange cloud to turn it gray
  - This is required for GitHub Pages to work
- **SSL/TLS Mode:** Set to **Full** (not Flexible)
  - Go to SSL/TLS tab → Overview → Set to "Full"

⏱️ **Time:** ~3 minutes
⏱️ **DNS Propagation:** 5 minutes - 24 hours (usually ~15 mins)

---

## Step 3: Verify GitHub Settings

The CNAME file has already been added to your repository! ✅

### Check GitHub Pages Settings:

1. Go to: https://github.com/kt50E/recipes/settings/pages
2. Under **Custom domain**, you should see: `tldr-kitchen.com`
3. Wait for the **DNS check** to pass (green checkmark)
4. Once DNS check passes, check **Enforce HTTPS**

⏱️ **Time:** Wait 15-30 minutes for DNS to propagate

---

## Step 4: Test Your Setup

### After DNS Propagates (~15-30 minutes):

1. **Test apex domain:**
   - Visit: http://tldr-kitchen.com
   - Should load your site!

2. **Test www subdomain:**
   - Visit: http://www.tldr-kitchen.com
   - Should redirect to tldr-kitchen.com

3. **Test HTTPS:**
   - Visit: https://tldr-kitchen.com
   - Should show secure padlock 🔒

### Troubleshooting:

**"DNS check is failing" in GitHub:**
- Wait longer (DNS can take up to 24 hours)
- Verify A records are correct
- Make sure proxy is disabled (gray cloud)

**"Not secure" warning:**
- Wait for GitHub to provision SSL certificate (~15 mins)
- Make sure "Enforce HTTPS" is checked in GitHub Pages settings

**Site not loading:**
- Check DNS records are correct
- Verify CNAME file exists in repository root
- Wait for DNS propagation

---

## Step 5: Enable Cloudflare Features (Optional)

After everything works, you can optionally enable Cloudflare proxy for benefits:

### Benefits:
- DDoS protection
- CDN caching (faster load times)
- Analytics
- Free SSL certificate from Cloudflare

### To Enable (After Site Works):

1. Go back to DNS records in Cloudflare
2. Click the gray cloud icon to turn it **orange**
3. Do this for ALL records (A and CNAME)
4. Go to **SSL/TLS** → **Overview**
5. Set mode to **Full (strict)**

**Note:** Some users prefer keeping it gray (DNS only) for simplicity. Both work fine!

---

## Timeline Summary

| Step | Time Required | Wait Time |
|------|--------------|-----------|
| 1. Purchase domain | 5 mins | Instant |
| 2. Configure DNS | 3 mins | 5-30 mins propagation |
| 3. GitHub verification | 1 min | Wait for DNS |
| 4. SSL certificate | Auto | 15 mins |
| **Total** | **~10 mins work** | **~30 mins wait** |

---

## Quick Reference

### Your Settings:
- **Domain:** tldr-kitchen.com
- **Repository:** kt50E/recipes
- **GitHub Pages URL:** kt50e.github.io/recipes

### GitHub Pages IP Addresses:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### CNAME Target:
```
kt50e.github.io
```

---

## After Setup

Once your domain is working:

1. **Update social links** - Use new domain everywhere
2. **Update README** - Change links to new domain
3. **Set up analytics** (optional) - Cloudflare has built-in analytics
4. **Enjoy your custom domain!** 🎉

---

## Support

**Cloudflare Help:**
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)

**GitHub Pages Help:**
- [GitHub Custom Domain Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

**DNS Propagation Checker:**
- https://www.whatsmydns.net/#A/tldr-kitchen.com

---

**Your domain `tldr-kitchen.com` is ready to go!** 🚀

After you complete the Cloudflare DNS setup, your site will be live on your custom domain!
