# Golden Pearl Trading & Contracting — website

Static marketing site for **Golden Pearl Trading & Contracting Co. WLL.**, a construction and
contracting company in the Kingdom of Bahrain. Civil construction, industrial maintenance, MEP,
interior fit-out, joinery, landscaping and design.

No build step, no npm, no framework. Plain HTML, one shared stylesheet, one shared script.
Deployed on GitHub Pages straight from `main`.

---

## Running it locally

```bash
python3 -m http.server 8002
# then open http://localhost:8002
```

That's the whole toolchain. Editing a page means editing its `.html` file.

---

## Company facts used on the site

These come from the company's own printed brochure, which is mirrored into `images/` (see
[Imagery](#imagery)). Where the brochure and the previous version of this site disagreed, the
brochure won.

| | |
|---|---|
| Legal name | Golden Pearl Trading & Contracting Co. WLL. |
| Tagline | Building value |
| Established | **2016** |
| Address | Flat No. 2, Bldg. 137, Road 3402, Block 634, Ma'amer, Kingdom of Bahrain |
| Email | info@goldenpearlbh.com |
| Website (theirs) | www.goldenpearlbh.com |
| Telephone | Brochure prints `+973 693915` — **six digits, not the eight a Bahraini number needs.** See below. |

### Corrections made to the previous site

The previous version was a Google Stitch export and carried several errors:

- **Founding year** was given as "since 2012" on three pages and "EST. 2024" on a fourth. The
  brochure says 2016.
- **Company name** appeared three different ways ("Golden Pearl Construction & Trading",
  "Golden Pearl Architectural Trading", and just "Golden Pearl"). None matched the registered name.
- **The homepage mission statement was boilerplate from a joinery manufacturer** — it referred to
  "the latest automated machinery, thus reducing labour costs" and "large volume production run
  joinery". Replaced with the company's own mission text from the brochure.
- **The vision statement was near-verbatim Bechtel's** corporate vision. Replaced.
- **There was no contact information anywhere on the site** — no phone, email, address or contact
  page. The only lead path was a modal form.
- **Mobile navigation did not work.** The hamburger button had no click handler and no drawer
  existed, so below 768px there was no navigation and no call to action at all.
- **Project descriptions were invisible on touch devices** — every one was `opacity-0` until
  `:hover`, on the page whose entire purpose is proof.
- `services.html` shipped `*:focus { outline: none !important }`, removing every keyboard focus
  indicator on the page (WCAG 2.4.7 failure).
- The brand gold was two different values (`#d4af37` and `#f2ca50`) depending on which page you
  were on, because the Tailwind config was copy-pasted into all four files and had drifted.
- ~20 dead `href="#"` links and 4 buttons with no handler, including "Download Portfolio", for which
  no PDF existed.

### Outstanding TODOs

Grep for these markers:

```bash
grep -rn "TODO(" *.html assets/ inquiry-modal.js
```

- `TODO(phone)` — **the printed telephone number is incomplete.** It is displayed exactly as the
  brochure prints it, but deliberately *not* wrapped in a `tel:` or `wa.me` link, so that no
  visitor is connected to a wrong party. Supply the full eight-digit number and it becomes a live
  call button, a WhatsApp link, and the phone fallback in `inquiry-modal.js` (`FALLBACK_TEL`).
- `TODO(contact)` — the CR (commercial registration) number, shown in the footer of every page.
- `TODO(logos)` — the client trust band on the homepage uses styled wordmarks. Replace with real
  logo files once written permission to display each client's mark has been obtained.
- `TODO(handoff)` — leadership names, certifications, and confirmation of the automotive showroom
  client name.

---

## File layout

```
index.html          Home — hero, client band, stats, capabilities, featured work, mission
services.html       Six disciplines with #anchors, plus the enquiry→handover process
portfolio.html      24 delivered works, filterable by sector
about.html          Company story, operating principles, credentials
contact.html        Contact methods + the full enquiry form inline
privacy.html        Privacy policy
terms.html          Terms of service
404.html            Not-found page (absolute asset paths — see note below)

assets/
  tailwind-config.js   Design tokens. SINGLE SOURCE OF TRUTH.
  styles.css           Component layer + animations + reduced-motion rules
  site.js              Nav, mobile drawer, reveals, parallax, project filter

inquiry-modal.js    Enquiry capture for both the modal and the contact-page form
tools/
  mirror_images.py  Re-downloads and optimises the imagery (see below)
images/
  url_map.json      Upstream URL -> local filename, used by the mirror script
robots.txt  sitemap.xml  favicon.png
```

### Load order matters

Every page loads scripts in this order, and it is not arbitrary:

```html
<script src="https://cdn.tailwindcss.com?plugins=forms"></script>
<script src="assets/tailwind-config.js"></script>
```

The Tailwind Play CDN **replaces `window.tailwind` when it initialises**, so a config assigned
*before* the CDN script is silently discarded — every custom token (`px-margin-desktop`,
`text-display-xl`, `font-display`) stops working while the page still looks superficially fine.
The config must come after.

### Synchronized blocks

With no build step there are no partials, so the `<nav>` and `<footer>` are duplicated in each
page. They are marked:

```html
<!-- ============ NAV — SYNCHRONIZED BLOCK, see index.html ============ -->
```

Keep them byte-identical apart from `aria-current="page"`. Drift in these blocks is what produced
the two-different-golds and three-different-company-names problems in the first place.

The mobile drawer is *not* duplicated — `assets/site.js` builds it at runtime from the links in
`#nav-links`, so there is still only one list of links per page, and it stays in the HTML where
crawlers can see it.

### Progressive enhancement

An inline snippet in each `<head>` adds a `js` class to `<html>`. `assets/styles.css` only hides
`.reveal` elements under `.js`, so **with JavaScript disabled every page still renders all of its
content**, and the portfolio shows every project unfiltered. The previous version set
`.reveal { opacity: 0 }` unconditionally, so `portfolio.html` and `about.html` rendered completely
blank if a script failed.

### 404.html

GitHub Pages serves `404.html` for any missing path under the project, including deep ones like
`/construction-portfolio/a/b/c`. Relative asset paths would resolve against that path and 404 in
turn, so **every URL in `404.html` is absolute** (`/construction-portfolio/...`). If the repository
is renamed or moved to a custom domain, that prefix must be updated.

---

## Design system

Tokens live in `assets/tailwind-config.js`. `assets/styles.css` mirrors the values as literal hex
because it is a plain stylesheet, not a Tailwind build, so `theme()` is unavailable — **change both
together**.

| Token | Value | Notes |
|---|---|---|
| `obsidian` | `#0a0a0a` | page background |
| `surface` / `surface-2` | `#0f0f0f` / `#151515` | sections / cards |
| `gold` | `#d4af37` | the brand colour, 9.5:1 on obsidian |
| `gold-light` | `#f2ca50` | hover only, never a fill behind text |
| `ink` / `ink-muted` / `ink-subtle` | `#ffffff` / `#d6d3cd` / `#a8a29a` | 20.4:1 / 13.6:1 / 7.9:1 |

**Do not set text colour with an opacity modifier.** The previous design used `text-on-surface/5`
(≈1.2:1) and `text-primary/40` (≈4.1:1), both of which failed WCAG AA badly. Use `ink-subtle`.

Type is fluid (`clamp()`). The old scale was fixed pixels — a 64px display heading and a 96px
about-page `h1` overflowed a 375px phone, and the marquee was 120px.

Border radius is `0` by default, which is what the original design intent described.

---

## Imagery

Originally every image was hotlinked from Google Stitch's asset CDN
(`lh3.googleusercontent.com/aida-public/...`). Those URLs are ephemeral — one had already rotted,
which is what commit `8b826d0` was fixing. They are now all local.

```bash
python3 tools/mirror_images.py          # fetch anything missing
python3 tools/mirror_images.py --force  # re-fetch everything
```

Requires Pillow, nothing else. Two things the script handles that a plain download does not: the
bare URL serves a 435×512 thumbnail (appending `=w1920` gets the native original), and it converts
to WebP at q82, roughly a third of the bytes.

### Three kinds of image in `images/`

1. **Real project photography** (`real-*.webp`) — genuine photographs of completed work, extracted
   from the brochure pages: industrial scaffolding with site crew, an automotive showroom façade and
   interior, a completed boardroom, and the Godiva kiosk at Al A'ali Mall. Use these in preference
   to anything else.
2. **Brochure page scans** — `home-hero`, `home-scrolly-arch`, `about-craft`, `about-vision`,
   `about-showroom`, `services-hero`, `services-landscape`, `services-mep`. These are **document
   scans of the printed company brochure**, not photographs. They are kept because they are the
   source of record for the company's own copy, contact details and project list — but they must
   **not** be used as hero backgrounds or feature images. An earlier revision did exactly that, and
   pages rendered with pages-of-text as their background.
3. **Generated placeholder renders** — everything else. Illustrative of finish standard only.

`terms.html` states plainly that some imagery is illustrative rather than a photograph of the
specific project described, and `portfolio.html` repeats it above the grid. **Remove those
disclaimers once real photography replaces the renders** — and replacing them is the single highest
-value improvement available to this site.

Note that ten of the mirrored files are capped at 512×512 by the upstream source. `portfolio-hero`
and `about-hero` are therefore used as soft, low-opacity, slightly blurred textures behind type
rather than as sharp full-bleed photographs.

---

## Enquiry capture (`inquiry-modal.js`)

One code path serves two forms:

- `#contact-form` — the inline form on `contact.html`, plain HTML, always present
- `#inquiry-form` — the modal, opened by any element with class `.open-inquiry-modal`

Submissions insert one row into the Supabase `inquiries` table.

### Supabase schema

The live table has capitalised column names, which is why `buildRow()` sends `Name`, `Email`,
`Service`, `Message`.

There is **no `Phone` column**, and PostgREST rejects the whole row if you send a key that does not
exist. So while `HAS_PHONE_COLUMN` is `false`, the phone number is prepended to `Message`. To fix
that properly:

```sql
alter table inquiries add column "Phone" text;
```

then set `HAS_PHONE_COLUMN = true` at the top of `inquiry-modal.js`.

### Row Level Security — please verify this

The anon key in `inquiry-modal.js` is **designed to be public**, so committing it is not a leak.
But it means all protection comes from RLS. The table must allow `INSERT` for the `anon` role and
nothing else:

```sql
alter table inquiries enable row level security;

create policy "anon can submit enquiries"
  on inquiries for insert to anon with check (true);
```

Critically, **there must be no `SELECT` policy for `anon`**. If there is, anyone can read every
enquiry the company has ever received. This has not been verified from outside — please check it.

Spam protection is a honeypot field plus a three-second minimum fill time. That stops naive bots,
not a determined one. If the table starts filling with junk, add Cloudflare Turnstile or hCaptcha.

### Failure behaviour

The Supabase SDK is loaded asynchronously and the modal markup is injected immediately. If
`cdn.jsdelivr.net` is blocked, the form falls back to offering a prefilled `mailto:` link. In the
previous version all modal markup was created *inside* the SDK's `onload` callback, so a blocked
CDN request made every "Inquire Now" button silently do nothing.

---

## Before going live

1. Replace the incomplete telephone number (`TODO(phone)`).
2. Add the CR number (`TODO(contact)`).
3. Verify the Supabase RLS policy above.
4. Update the canonical/OG URLs and `sitemap.xml` if not deploying to
   `arjundineshmenon.github.io/construction-portfolio/`. The company already owns
   `goldenpearlbh.com`, which is the obvious home for this.
5. Have `privacy.html` and `terms.html` checked against Bahrain's Personal Data Protection Law
   (Law No. 30 of 2018). They are written to describe what the site actually does, but they have not
   been reviewed by a legal practitioner.
6. Get client permission before publishing client logos or naming them as references.

## Testing checklist

- **375px wide**: open and close the drawer, tab through it, press Escape. Every nav link and the
  quote CTA must be reachable.
- **Portfolio on a touch device**: every project's client, scope and year must be readable without
  hovering.
- **Keyboard only**: a visible gold focus ring on every interactive element.
- **JavaScript disabled**: every page renders, all 19 project cards visible.
- **Reduced motion enabled**: parallax, marquee and particles all stop.
- **Offline/throttled**: no request to `lh3.googleusercontent.com`.
- Block `cdn.jsdelivr.net` and submit the form — the `mailto:` fallback should appear rather than a
  silent no-op.
