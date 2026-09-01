# Client Portal — Featured Templates

Curated templates served to the Client Portal plugin's Featured Templates gallery via jsDelivr.

**Base URL:** `https://cdn.jsdelivr.net/gh/clientportal/client-portal-templates@main/`

The plugin fetches `manifest.json` from this URL, reads the template list, and displays it in the portal chooser. Adding a template never requires a plugin release.

## Writing the content

This file covers the mechanics. **[CONTENT-GUIDE.md](CONTENT-GUIDE.md)** covers what
goes in a template: real demo content with no images or embeds, forms rewritten as
their questions, setup notes and quick tips, callout colours, and why each template
ships exactly one synced pattern.

## Repo structure

```
manifest.json                   Gallery index — the plugin reads this
templates/<id>/<id>.json        Template JSON (rewritten export with CDN URLs)
images/<id>/<filename>          Images referenced by template source_urls
tools/author.mjs                Add a new template (Node, zero dependencies)
tools/card.mjs                  Update an existing template's gallery card
package.json                    ESM module declaration
```

## Prerequisites

- **Node 18+**
- **Plugin repo as a sibling directory.** The script parses the block allowlist from `../leco-client-portal/includes/admin/class-leco-cp-import.php`. If the plugin is elsewhere, pass `--plugin-dir`.

## Authoring workflow

### 1. Build the template

Design and build the portal in your local WordPress site. **Use the regular Media Library for all images.** Images uploaded via the private client uploader land in `uploads/leco-cp/`, which is 403-blocked — customers cannot download them, and the script refuses exports that reference them.

### 2. Export

Export the portal/template via the plugin's export UI. This produces a `.json` file.

### 3. Run the script

```
node tools/author.mjs <export.json> --id <slug> [--title "Gallery Title"] [--preview-url "https://..."]
```

The script:
- Reads the block allowlist from the plugin source (never duplicated)
- Validates format, version, type, and blocks
- Refuses any attachment from `uploads/leco-cp/`
- Refuses content linking to a host outside the allowlist
- Downloads images to `images/<id>/`
- Rewrites `attachments[].source_url` to `@main` CDN URLs
- Writes `templates/<id>/<id>.json`
- Upserts the manifest entry, preserving the card's `title`, `description`,
  `thumbnail` and `preview_url` when you don't pass their flags — so a plain
  re-export updates the template body and leaves the card alone

### 4. Push images to main

```
git add images/<id>/
git commit -m "Add images for <id>"
git push origin main
```

Images with no manifest entry referencing them are inert — the plugin reads `manifest.json`, sees no entry, shows nothing to customers. This is what lets the template JSON carry `@main` image URLs from the start: the file you test is byte-identical to the file that ships.

### 5. Push manifest + template to a throwaway test branch

```
git checkout -b test/<id>-<timestamp>
git add manifest.json templates/<id>/
git commit -m "Add template <id>"
git push -u origin HEAD
```

**Use a fresh branch name every round.** jsDelivr caches branch refs for ~24 hours. Reusing a name serves stale content and produces false passes. Delete the branch after merging.

### 6. Override the base URL and test

In `wp-config.php` (or via the `leco_cp_featured_templates_base_url` filter):

```php
define( 'LECO_CP_FEATURED_TEMPLATES_BASE_URL', 'https://cdn.jsdelivr.net/gh/clientportal/client-portal-templates@test/<id>-<timestamp>/' );
```

Browse the Featured Templates gallery in the plugin, click "Use this template", and verify the imported portal.

**Test as a non-admin role** (e.g. Editor). The import runs `wp_kses_post()` on all content — admins with `unfiltered_html` capability won't see content that kses strips. An Editor import surfaces any stripping that would affect customers.

### 7. Merge to main

When the test passes, merge the branch to main and delete the remote branch:

```
git checkout main
git merge test/<id>-<timestamp>
git push origin main
git push origin --delete test/<id>-<timestamp>
```

Remove the `LECO_CP_FEATURED_TEMPLATES_BASE_URL` override from `wp-config.php`.

## Updating a card (no re-export)

A gallery card is four things — **title**, **description**, **thumbnail**, and
the **preview link**. None of them touch the template's content, so changing one
does not mean re-exporting the portal.

```
node tools/card.mjs --id onboarding \
  --description "Give new clients a branded first step before the project kicks off." \
  --thumbnail ~/Desktop/onboarding-card.png \
  --preview-url "https://clientportalportals.com/client/onboarding-inspiration/" \
  --publish
```

Only the fields you pass are touched; everything else is left alone. Pass as
many or as few as you like.

`--publish` commits the changed files, pushes to `main`, and purges the CDN so
the change is live straight away instead of within 24 hours. Leave it off and
the script prints the git commands for you to run yourself.

Other flags:

| Flag | What it does |
|------|--------------|
| `--title "..."` | Rename the card in the gallery |
| `--clear-preview` | Remove the preview link (the button disappears) |
| `--purge` | Refresh the CDN and change nothing else |
| `--no-webp` | Keep the thumbnail's original format |

The script refuses a preview URL that is not `https`, and a thumbnail that is
not `.png`, `.jpg`, `.jpeg`, `.webp` or `.gif` — both mirror what the plugin
accepts, so a card can never be published with a field the plugin will drop.

**Thumbnails** are ~800×366 (roughly 2.2:1). Anything else works, but that
ratio matches the set on the inspiration page and is what the card reserves
space for.

### Thumbnails are converted to WebP

Drop in a PNG or JPEG and the script re-encodes it to WebP at quality 90. The
onboarding card went **104 KB → 15 KB, 85% smaller**, with no visible
difference — these are screenshots, which WebP handles far better than PNG.
Every browser that runs wp-admin supports it.

At 50 gallery entries that is the difference between ~5 MB of thumbnails and
~800 KB.

Conversion needs `cwebp` (`brew install webp`). Without it the script warns and
publishes the original rather than failing — you get a heavier card, not a
broken one. Pass `--no-webp` to keep the original deliberately.

Because the extension changes, the CDN URL changes too, so a converted
thumbnail busts its own cache.

**To add a brand new template**, use `author.mjs` (above) — `card.mjs` only
edits templates that are already in the manifest.

## Why links to your own site are refused

A template is imported onto someone else's site. A link to the site you authored
it on — `https://your-agency.com/contact`, or a local `wordpress.test` URL —
still points there after the import, so it resolves to your site or to nothing.
Nothing downstream catches this: the export carries the URL verbatim, and the
plugin's importer has no way to tell an accidental self-link from a deliberate
external one.

So the script refuses any absolute URL in template content whose host is not on
the allowlist:

```
client-portal.io, www.client-portal.io, clientportalportals.com, cdn.jsdelivr.net
```

It scans portal content, content pages, navigations and synced patterns.
Attachment `source_url`s are skipped — they legitimately point at the authoring
site at that stage and are rewritten to CDN URLs further down.

For links that belong to the customer rather than to you, use a placeholder
token instead of a URL — `contact-link`, `slack-link`, `invoice-link` — which is
what the shipped templates do. The customer replaces it with their own.

To allow a host deliberately:

```
node tools/author.mjs export.json --id onboarding --allow-host calendly.com
```

Repeatable. Prefer fixing the link over allowing the host: every allowed host is
a URL that has to keep working on every customer's site indefinitely.

## Why images must be renamed when replaced

The script refuses same-filename-different-content: if `hero.jpg` already exists in `images/<id>/` with different bytes, it errors and tells you to rename (e.g. `hero-v2.jpg`).

The `@main` URL doesn't change when you overwrite a file. jsDelivr would serve the old cached file to customers for up to 24 hours. A new filename means a new URL, which busts the cache immediately.

## Propagation time

Two cases, driven by the plugin's transient TTLs (manifest: 12h, individual template: 24h):

- **New template** (not yet in any customer's cached manifest): ~36h worst case. 24h for jsDelivr to refresh the `@main` branch cache + 12h for the plugin's manifest transient to expire.
- **Updated template** (already cached individually by a customer): ~48h worst case. 24h CDN + 24h for the plugin's per-template transient to expire.

## What stays manual

| Step | Why |
|------|-----|
| Build the template in WordPress | Creative work |
| Export via the plugin UI | Plugin interaction |
| Run `node tools/author.mjs` | One command |
| Push images to main, create test branch, push, test | Git + QA |
| Override `LECO_CP_FEATURED_TEMPLATES_BASE_URL` for testing | wp-config.php |
| Test import as a non-admin role | Manual QA |
| Merge test branch to main, clean up | Git |
| Rename images when replacing (prompted by the script) | Decision |
