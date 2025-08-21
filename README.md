
# Blue Mountains Smart Homes — Static Site + Decap (Netlify) CMS

A clean, multi-page static site for **bluemountainssmarthomes.com** with a built-in CMS (Decap / Netlify CMS) and a **Netlify Forms**-based booking request flow.

## What’s included
- Landing page, About, Features, Gallery, Contact, Booking
- Property detail view (`properties.html?slug=...`)
- Decap CMS at `/admin/` for editing content (JSON-backed)
- Netlify Forms for booking requests (no server required)
- Stripe Payment Link placeholder on each property (optional)
- SEO essentials: meta tags, sitemap, robots.txt, favicon

## Quick Deploy (GitHub Desktop + Netlify)
1. **Create a new GitHub repo** and add these files.
2. Open **Netlify** → **Add new site** → **Import from Git** → select your repo.
   - Build command: none
   - Publish directory: `.`
3. After deploy, go to **Site settings → Identity**:
   - Click **Enable Identity**.
   - Click **Enable Git Gateway**.
4. Visit `https://YOUR-SITE.netlify.app/admin/` and **Sign up** with Netlify Identity.
5. In **Settings → Domain**, add your custom domain **bluemountainssmarthomes.com** and set it as primary.

## Using the CMS
- Go to `/admin/` and edit:
  - **Settings → Site Settings**
  - **Home Page**
  - **Properties Index** — ensure the list of slugs matches files in `content/properties/`
  - **Properties** — edit each property JSON file (e.g., `wollemi-smart-palace.json`)
- Image uploads go to `static/img/` and are served from `/img/...`

## Booking requests
- The booking form posts to Netlify Forms and stores submissions in **Netlify → Forms**.
- To enable **Instant Checkout**, create a Stripe **Payment Link** and paste it into the property’s **Booking → Stripe Payment Link** field in CMS.

## Edit the tabs/gallery
- `gallery.html` pulls the slugs from `content/properties/index.json` and renders tabs automatically.

## Notes
- BBQ voice commands are **indoors-only** due to weatherproofing.
- Wollemi pines are endangered. **Do not enter the garden beds; use paths only.**

## Developer notes
- Pure static site (no build step). Styling is in `assets/styles.css`; JS in `assets/app.js`.
- If you add a new property, add a new `content/properties/{{slug}}.json` and include its slug in `content/properties/index.json` via CMS.
- For local preview, use a simple static server (e.g., VS Code Live Server) due to fetch() of JSON files.
