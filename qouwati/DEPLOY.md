# 🚀 Qouwati — Production Deployment Guide

## What you need
- A free GitHub account → github.com
- A free Netlify account → netlify.com
- Your GoDaddy domain (for the final step)

---

## STEP 1 — Prepare your project folder

Your folder must look exactly like this:

```
qouwati/
├── index.html
├── sw.js
├── manifest.json
├── netlify.toml
├── package.json
├── .gitignore
├── assets/
│   └── img/
│       ├── bg.GIF
│       ├── about-me.jpg
│       ├── blog1.jpeg
│       └── ... (all your images)
└── netlify/
    └── functions/
        ├── db.js
        ├── posts.js
        ├── tips.js
        ├── faqs.js
        ├── testimonials.js
        ├── comments.js
        ├── reactions.js
        ├── newsletter.js
        ├── analytics.js
        └── sitemap.js
```

---

## STEP 2 — Push to GitHub

1. Go to **github.com** → New repository
2. Name it `qouwati` → Create repository
3. Upload all your files (drag and drop in the GitHub UI, or use Git)

---

## STEP 3 — Deploy on Netlify

1. Go to **netlify.com** → Sign up free
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → select your `qouwati` repository
4. Build settings — leave everything blank (no build command needed)
5. Click **"Deploy site"**

Netlify will deploy in about 60 seconds. You'll get a free URL like `qouwati-abc123.netlify.app`.

---

## STEP 4 — Add one environment variable

In Netlify → your site → **Site configuration** → **Environment variables** → Add variable:

| Key | Value |
|-----|-------|
| `SITE_URL` | `https://qouwati.com` (or your Netlify URL for now) |

Then go to **Deploys** → **Trigger deploy** → **Deploy site** to apply it.

---

## STEP 5 — Connect your GoDaddy domain

### In Netlify:
1. Go to your site → **Domain management** → **Add a domain**
2. Type your domain (e.g. `qouwati.com`) → Verify
3. Netlify will show you **two nameserver addresses** like:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`

### In GoDaddy:
1. Log in → **My Products** → find your domain → **DNS**
2. Scroll to **Nameservers** → click **Change**
3. Select **Custom** → paste the two Netlify nameservers
4. Save

DNS takes 10–48 hours to fully propagate. Your site will be live at your domain with a free SSL certificate automatically.

---

## STEP 6 — Access your Admin Panel

Once live, press **Ctrl + Shift + A** anywhere on the page.

Default password: `qouwati2025`

**Change your password immediately** after first login (Settings tab in admin).

---

## What's in your database

Your Netlify Blobs database is automatically created on first visit. It comes pre-loaded with:
- 6 blog posts
- 6 tips
- 5 FAQs
- 3 testimonials

All data is stored on Netlify's servers — free, persistent, no setup needed.

---

## Checklist before going live

- [ ] Replace `assets/img/about-me.jpg` with a real photo of Aya
- [ ] Replace `assets/img/bg.GIF` with your hero image
- [ ] Change admin password after first login
- [ ] Update contact info in index.html (phone, email, city)
- [ ] Update Instagram link (@qouwati)
- [ ] Add `SITE_URL` environment variable in Netlify

---

## Your site includes

✓ Full blog/diary with categories, search, reactions, comments  
✓ Breathing exercise widget (4-7-8, Box, Simple)  
✓ Daily affirmation rotator  
✓ Mood check-in + 14-day mood tracker  
✓ Gratitude journal (stored privately per visitor)  
✓ Tips & reminders  
✓ FAQ accordion  
✓ Resources section (books, apps, crisis lines)  
✓ Newsletter signup  
✓ Contact form  
✓ Testimonials  
✓ Dark mode toggle  
✓ PWA (installable on phone)  
✓ Offline mode  
✓ Auto sitemap at /sitemap.xml  
✓ Admin panel (Ctrl+Shift+A) with:  
  - Blog management (publish/draft)  
  - Tips, FAQs, Reviews management  
  - Comment moderation (approve/reject/spam)  
  - Analytics dashboard  
  - Subscriber list  
✓ Toast notifications  
✓ Skeleton loading screens  
✓ SEO optimized (meta tags, JSON-LD, sitemap)  
✓ Security headers  
✓ Free Netlify Blobs database  
