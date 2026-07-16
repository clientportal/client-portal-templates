# Client Portal — Featured Templates

Curated templates served to the Client Portal plugin's Featured Templates gallery via jsDelivr.

**Base URL:** `https://cdn.jsdelivr.net/gh/clientportal/client-portal-templates@main/`

The plugin fetches `manifest.json` from this URL, reads the template list, and displays it in the portal chooser. Adding a template never requires a plugin release.

## Repo structure

```
manifest.json                   Gallery index — the plugin reads this
templates/<id>/<id>.json        Template JSON (rewritten export with CDN URLs)
images/<id>/<filename>          Images referenced by template source_urls
tools/author.mjs                Authoring script (Node, zero dependencies)
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
- Downloads images to `images/<id>/`
- Rewrites `attachments[].source_url` to `@main` CDN URLs
- Writes `templates/<id>/<id>.json`
- Upserts the manifest entry (preserves `preview_url` on re-run)

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
