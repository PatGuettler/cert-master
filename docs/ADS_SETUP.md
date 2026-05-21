# Ad bar setup guide

AWS Cert Master includes a **small, optional ad slot** that:

- Shows on **home**, **results**, and **study plan** views
- **Hides completely** while a practice **exam is in progress** (no overlap with questions)
- Loads only after you enable it in `data/ads-config.json`
- Supports **Google AdSense** or a simple **custom text link**

---

## Quick start

1. Copy the example config:
   ```bash
   cp data/ads-config.example.json data/ads-config.json
   ```
   (`data/ads-config.json` already exists with ads **disabled**.)

2. Choose a provider and edit `data/ads-config.json` (see below).

3. Set `"enabled": true`.

4. Commit, push, and wait for GitHub Pages to redeploy.

5. Open your live site (not `file://`) and confirm the slot appears below the main content (or on the right on wide screens if using side placement).

---

## Configuration reference

File: **`data/ads-config.json`**

| Field | Description |
|--------|-------------|
| `enabled` | `true` to show ads; `false` to hide (default). |
| `placement` | `"bottom"` (default) or `"side"` (right column on screens ≥ 1024px). |
| `provider` | `"adsense"` or `"custom"`. |

### Google AdSense (`provider: "adsense"`)

```json
{
  "enabled": true,
  "placement": "bottom",
  "provider": "adsense",
  "adsense": {
    "client": "ca-pub-XXXXXXXXXXXXXXXX",
    "slot": "1234567890",
    "format": "auto",
    "fullWidthResponsive": true
  }
}
```

### Custom link (`provider: "custom"`)

No Google account required. Good for a single affiliate or training link.

```json
{
  "enabled": true,
  "placement": "bottom",
  "provider": "custom",
  "custom": {
    "label": "Sponsored link",
    "text": "AWS Cloud Practitioner Essentials on Skill Builder",
    "href": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/16434/cloud-practitioner-essentials"
  }
}
```

---

## Full Google AdSense setup

### 1. Create an AdSense account

1. Go to [https://www.google.com/adsense/](https://www.google.com/adsense/).
2. Sign in with Google and add your site URL: `https://practicecert.com/`.
3. Complete verification (DNS, HTML file, or meta tag — Google will guide you).

GitHub Pages tip: use the **HTML tag** or **ads.txt** method in repo root if offered.

### 2. Add `ads.txt` (recommended)

Create **`ads.txt`** in the **repository root** (same level as `index.html`):

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-XXXXXXXXXXXXXXXX` with your publisher ID (the part after `ca-pub-` in your client ID).

After deploy, check: `https://your-site/ads.txt`

### 3. Create an ad unit

1. In AdSense: **Ads** → **By ad unit** → **Display ads**.
2. Choose a **responsive** display unit with a modest size (e.g. horizontal banner).
3. Copy:
   - **Publisher ID** → `ca-pub-XXXXXXXXXXXXXXXX` → `adsense.client`
   - **Ad unit ID** (data-ad-slot) → `adsense.slot`

### 4. Update `data/ads-config.json`

```json
{
  "enabled": true,
  "placement": "bottom",
  "provider": "adsense",
  "adsense": {
    "client": "ca-pub-XXXXXXXXXXXXXXXX",
    "slot": "1234567890",
    "format": "auto",
    "fullWidthResponsive": true
  }
}
```

### 5. Deploy and wait

- New sites often show **blank ads** or **placeholder** for 24–48 hours while AdSense reviews traffic.
- Ad blockers in your browser will hide ads during testing — try a private window with extensions off.

### 6. Policy checklist

- Do **not** click your own ads.
- Site should have enough content (your question bank + README helps).
- Include a **privacy policy** if AdSense requests it (cookies, personalized ads).
- This app is unofficial; do not imply AWS endorsement in ad surrounding text.

---

## Placement options

### Bottom (default)

- Slim bar under `main`, above the footer.
- Max height ~90px so it stays unobtrusive.
- Works on all screen sizes.

### Side (`"placement": "side"`)

- On viewports **≥ 1024px**, ad moves to a **140px** column to the right of content.
- Sticky below the header while scrolling.
- On smaller screens, falls back to bottom layout behavior.

---

## Behavior during exams

`js/ads.js` + `js/app.js` call `updateAdVisibility(false)` when `view-exam` is active. The `#ad-slot` element gets `hidden` and `aria-hidden="true"`. Ads return when the user finishes, views results, or goes home.

No ad scripts are required for the exam view when `enabled` is false.

---

## Files involved

| File | Purpose |
|------|---------|
| `data/ads-config.json` | Your live settings (commit or keep private). |
| `data/ads-config.example.json` | Template without secrets. |
| `js/ads.js` | Loads config, injects AdSense or custom link. |
| `index.html` | `#ad-slot` markup inside `#page-shell`. |
| `css/styles.css` | `.ad-slot`, layout for bottom/side. |
| `docs/ADS_SETUP.md` | This guide. |

---

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| No ad bar at all | Set `"enabled": true`. Check browser console. Ensure you use `http://localhost` or HTTPS, not `file://`. |
| Blank box | AdSense still approving site; wrong slot ID; ad blocker enabled. |
| Ad shows during exam | Hard refresh; confirm latest `js/app.js` is deployed. |
| AdSense script error | Client ID must include `ca-pub-` prefix; site domain must match AdSense property. |
| Only want a text link | Use `"provider": "custom"` — no AdSense script loaded. |

---

## Disabling ads

Set `"enabled": false` in `data/ads-config.json` and redeploy. The slot stays in the DOM but never becomes visible.
