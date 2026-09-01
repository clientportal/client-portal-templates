# Writing template content

`README.md` covers the mechanics — export, `author.mjs`, the CDN, testing. This
covers what goes *in* a template, and why. Conventions here were set while building
the Onboarding template; read that one (`templates/onboarding/onboarding.json`, or
apply it locally) before writing a new one.

## The one rule everything else follows from

A customer browses the inspiration portal, likes it, applies the template — and must
not get an empty shell. Before this convention existed, the Onboarding template's
pages read `[One line on how a project runs, start to finish.]`. That is the
experience to avoid.

So: **real content, as close to a finished portal as possible — but nothing that
follows the customer home.** Every template is imported onto someone else's site. If
it can't work there, it doesn't ship.

Two halves, and both matter:

- **Inspiring.** Real copy, real structure, something they'd be happy to send a
  client with light editing.
- **Weightless.** Nothing they have to hunt down and delete. No images in their
  media library, no embeds pointing at your accounts, no links to your site.

## Images: none

A shipped template has **zero attachments**. Check the export before authoring:

```
attachments: 0
```

Not decorative headers, not screenshots, not mocked-up video thumbnails. Images have
to be downloaded into the repo, served from the CDN, and then land in the customer's
media library on import — for a picture they'll almost certainly replace.

The one exception is the **gallery card thumbnail**, which is repo-level, not
template content. See the README (~800×366, converted to WebP).

If a section only makes sense with an image, write a setup note telling them what to
put there instead.

## Embeds: none

No form embeds, no Trello, no Google Sheets, no video. They point at *your* accounts,
break on their site, and often need a plugin they don't have.

### Forms become their questions

This is the useful move, not a compromise. The Onboarding questionnaire embedded a
Tally form; nine questions were locked inside an iframe nobody else could use. Now
the page lists them:

> **Your business**
> - In a sentence or two, what does your business do?
> - How did it start, and what problem were you setting out to solve?
> - What are your main products or services?

With a setup note above:

> **Setup note:** Use your preferred form tool (Gravity Forms, Typeform, Google
> Forms, etc.) to build a form from the questions below, then paste the embed code or
> shortcode here.

The customer gets something better than an embed they can't use: the actual thinking,
ready to rebuild in whatever tool they own. Keep the section headings the form used —
they carry the structure.

## Links

**Module links use placeholder tokens, not URLs.** `contact-link`, `slack-link`,
`invoice-link`, `figma-link`. The customer replaces them. Never a real URL that
belongs to you.

**Never link to the site you authored on.** A `wordpress.test` link was authored into
the Onboarding Welcome page and would have shipped as a dead link. `author.mjs` now
refuses any host outside the allowlist:

```
client-portal.io, www.client-portal.io, clientportalportals.com, cdn.jsdelivr.net
```

`--allow-host` exists but prefer fixing the link. Every allowed host is a URL that has
to keep working on every customer's site indefinitely.

**External links open in a new tab** — `target="_blank" rel="noopener noreferrer"`.
A client clicking a link should not lose the portal they were reading.

## Setup notes

Notes addressed to the customer, not their client. They render in the portal until
deleted, so they must be genuinely useful and obviously removable.

**Every module setup note ends with the same six words, linked:**

> **Setup note:** Link your scheduling tool (Calendly, SavvyCal) so clients book
> without the back-and-forth. [How to edit or delete this note](https://client-portal.io/support/add-text-above-or-below-a-module-l0gcs)

Identical every time. Repetition is the point — you can't predict which note someone
is looking at when they think *how do I get rid of this?*, and nothing on the front
end tells them that text lives in a module's "text above/below" field.

**This applies to module notes only.** Notes in a content page are ordinary blocks —
deleting one is normal block editing, and that doc would misdirect. Keep those notes,
drop the link.

## Quick tips — the part worth the most

Setup notes say *what to put here*. Quick tips teach a **better way of working**, and
they're what makes a template feel like it came from someone who has done this.

The exemplar, from the questionnaire page:

> ⚡️ **Quick tip:** Instead of embedding a form, consider using a shared Google Doc.
> It stays open, so clients can revisit it, leave comments, and add detail as the
> project takes shape, rather than answering once and losing access. The questionnaire
> becomes something you both keep using, not a dead end after submit.

That works because it argues against the obvious approach and says why. Compare the
Add-Ons tip, which teaches the three ways to sell from a module — link to a landing
page, build the pitch as a content page, or sell portal access via WooCommerce.

Aim for **one or two per template**, where you genuinely know something. A tip that
just restates the feature is filler.

## Callout boxes

Registered as `core/group` variations (`src/callout-variations/index.js` in the
plugin). Use the class, not the variation name:

| In the editor | Class to write | Use for |
|---|---|---|
| Callout — Info | `callout-blue` | Setup notes, instructions to the customer |
| Callout — Warning | `callout-yellow` | Quick tips |
| Callout — Success | `callout-green` | Confirmations, "you're all set" |
| Callout — Error | `callout-red` | Genuine warnings only |
| Callout — Neutral | `callout` | Asides — note the class has **no** suffix |

Onboarding uses blue for setup notes and yellow for tips. Keep that consistent across
templates so customers learn what the colours mean.

## Synced patterns: exactly one

Ship **one** synced pattern per template. Not zero, not four.

- **One** is enough to demonstrate the feature. The concept transfers immediately.
- **Each one becomes a permanent `wp_block` post** in the customer's Patterns list.
  Ten templates × four patterns = forty posts nobody asked for.
- **Confusion scales with count.** Four mysterious synced sections is four times the
  "why can't I edit this normally?"

**Choose a section that is genuinely identical across every client** — Useful
Resources (tools, contact channels, FAQ) or Add-Ons (your offers and prices).
Updating those everywhere at once is the real benefit.

**Never sync Getting Started or How We Work.** Those vary per client, so the customer
tailors one and is ambushed when it changes for all of them. First contact with a
feature shouldn't be a nasty surprise.

No in-content note is needed: the plugin links the docs from the block toolbar and
the block card whenever a synced pattern is selected.

## Voice and length

- Plain and warm, British spelling. Contractions fine.
- **Straight apostrophes** (`'`), not curly — matches existing content.
- FAQ answers: two or three sentences. Six or seven questions is plenty.
- Module descriptions: one line.
- Write as a real studio talking to a real client. Onboarding uses a consistent
  fictional team (Jamie as point of contact, Sam design, Priya development) — pick a
  persona per template and stay in it. Whether new templates reuse those names or get
  their own is an open question; consistency *within* a template matters more.

## A structure that works

Onboarding's shape, which generalises:

1. **Getting Started** — Welcome, How we work. Orientation, no tasks.
2. **Your Tasks** — the things you need from the client. Contract, questionnaire,
   assets, kickoff.
3. **Useful Resources** — contact channels, FAQ, tools. *The synced pattern.*
4. **Add-Ons** — optional extras. Your upsells.

Not every template needs four sections, but the progression — orient, act, reference,
sell — holds for most client work.

## Before you ship

- [ ] Export shows **`attachments: 0`**
- [ ] No `<iframe>`, `wp:html`, `<script>`, or `wp:image` anywhere
- [ ] No link to the authoring site (`author.mjs` refuses these)
- [ ] Module links are placeholder tokens
- [ ] Every module setup note ends with the linked six words
- [ ] Exactly one synced pattern, on a section identical across clients
- [ ] At least one quick tip that teaches something
- [ ] Content survives `wp_kses_post()` — admins have `unfiltered_html` and won't see
      stripping, so test-import as an **Editor**
- [ ] Import round-trip tested locally: refs resolve, no `{{placeholders}}` left
- [ ] `--title` matches the card name, not the portal's internal title

Any `core/*` block is allowed by the importer, plus the `leco-cp/*` allowlist — so
accordions, tables and pullquotes are all available. Onboarding's How We Work uses a
five-item accordion and two tables.

## Things worth deciding before the next template

1. **Each template needs its own inspiration portal.** The gallery card's
   `preview_url` and the "See the full example portal here" links inside the content
   both point at a live portal on `clientportalportals.com`. A new template means
   building that too, or those links have nowhere to go.
2. **Personas** — reuse Onboarding's studio and cast across templates, or give each
   its own? Reuse builds familiarity; separate feels more like a real varied business.
3. **Which templates next.** Sections that generalise across many businesses make
   better templates than tightly niche ones.
4. **A broader upsell doc.** The Add-Ons tip links the WooCommerce article, which only
   covers selling portal access — not landing pages or content pages. A doc covering
   all three ways would be a better target.

## The mechanical bit

Full detail in `README.md`. In short: build the portal locally → export → run
`node tools/author.mjs <export.json> --id <slug>` → commit → push. The card's title,
description, thumbnail and preview URL are preserved on re-export, so a plain rebuild
updates the template body and leaves the card alone.

The gallery is **not live to customers yet**, so `main` is effectively staging.
