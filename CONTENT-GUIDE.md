# Writing template content

`README.md` covers the mechanics — export, `author.mjs`, the CDN, testing. This
covers what goes *in* a template, and why. Conventions here were set while building
the Onboarding template and revised while building Web Design; read one of them
(`templates/onboarding/onboarding.json`, `templates/web-design/web-design.json`, or
apply either locally) before writing a new one.

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

**Give a links module two links, not one.** Either works — a single link is a perfectly
valid way to build a module, and the plugin sends the client straight to it rather than
opening the popup. But a template is a demo, and the popup is the thing worth showing:
it's where the module's text above and below appears. Two links shows what the module
can do. (It also means a `#` placeholder isn't the module's only destination.)

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

## Only ship what Client Portal can build

A template is a portal, so everything in it has to be something a customer could have
built themselves in Client Portal: phases, modules, content pages, and the blocks the
importer allows.

The temptation is to reach for a marketing-page layout — a three-column pricing grid,
a feature comparison table, a hero band. Those may render, but they teach the wrong
thing. Someone who applies the template and then tries to recreate that section in
their next portal will not find it, and the template has made the product look like
something it isn't.

Web Design originally shipped a three-tier pricing grid for care plans on the portal
home page. It was cut for exactly this reason, and the same content now lives where it
belongs — a content page, written as prose and a list.

Ask of any section: **could a customer have made this in the portal editor?** If not,
it does not ship.

## Voice and length

- Plain and warm, British spelling. Contractions fine.
- **Straight apostrophes** (`'`), not curly — matches existing content.
- FAQ answers: two or three sentences. Six or seven questions is plenty.
- Module descriptions: one line.
- **Keep the invented world to a minimum.** Write as a real studio talking to a real
  client, but don't build a cast. Prefer copy that needs no name at all — "your project
  lead", "the design team", "we" — over a named persona. Onboarding predates this
  decision and still uses Jamie, Sam and Priya; don't add to it.

  The distinction that matters: write copy that **doesn't need a name**, not copy with
  a blank where a name goes. "Your main point of contact is your project lead" ships
  fine. `[Your Name]` scattered through a page is the empty-shell problem this guide
  exists to prevent, wearing a different hat.

  Company names go the same way. Web Design was built from an inspiration portal for a
  fictional brand called Polymark, and nothing of that name survives in the template.

## A structure that works

Onboarding's shape, which generalises:

1. **Getting Started** — Welcome, How we work. Orientation, no tasks.
2. **Your Tasks** — the things you need from the client. Contract, questionnaire,
   assets, kickoff.
3. **Useful Resources** — contact channels, FAQ, tools. *The synced pattern.*
4. **Add-Ons** — optional extras. Your upsells.

Not every template needs four sections, but the progression — orient, act, reference,
sell — holds for most client work.

Web Design uses a three-phase variant of the same idea, mapped to project stages
rather than content types:

1. **Discovery** — getting started, questionnaire, brand assets, kickoff.
2. **Design and development** — the work itself, and the client's feedback on it.
3. **Launch and handoff** — the site is live; what happens now. *The synced pattern
   lives here, in a "What happens next" content page carrying the care-plan offer.*

Both shapes end on the upsell. That placement is deliberate: the client is happiest
with the work at handover, which is when a maintenance offer reads as care rather than
a sales pitch.

**Every portal ends with a call to action.** The `leco-cp/call-to-action` pattern — a
full-width band with one line of copy and a button — sits between the phases and the
footer. Client portals ship with one; a template without it looks unfinished.

## The template and its inspiration portal are not the same thing

Every template's gallery card links to a live inspiration portal on
`clientportalportals.com`. They are close relatives, not copies, and this is the
easiest thing in the whole process to get wrong.

**The inspiration portal keeps its images.** It is a real portal on a real site, and
the images are most of what makes it worth looking at. The zero-attachment rule governs
the *template*, not the example. Onboarding has worked this way from the start.

So the template is the same structure with the weight taken out:

| | Inspiration portal | Template |
|---|---|---|
| Images, embeds, video | Yes — that's the point | None |
| Real deliverables (a full brand doc, a finished mockup) | Yes | A setup note where it would go |
| Client and studio names | Fictional is fine | Generic |
| Setup notes and quick tips | No | Yes |

Keep the phases and the module names lined up, so someone moving from the example to
their own copy recognises what they're looking at. Everything else can differ, and a
template does not need a rebuilt inspiration portal just because it drops a module or
rewrites a page.

A module that only works with an image — a moodboard, a design inspiration slider —
stays in the template as an **empty module with a setup note**. Deleting it breaks the
structural parity; leaving it empty teaches what belongs there.

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
- [ ] No invented brand, company or person names carried over from the source portal
- [ ] Links modules ship two links, so the popup and its text are on show
- [ ] Nothing in the template that a customer could not build in Client Portal
- [ ] The portal ends with a call-to-action band
- [ ] Any content page relying on comments carries a setup note linking the
      [enable-comments doc](https://client-portal.io/support/enable-comments-in-your-portals-y8q7z)
      — comments are off by default, so the thread simply will not appear

Any `core/*` block is allowed by the importer, plus the `leco-cp/*` allowlist — so
accordions, tables and pullquotes are all available. Onboarding's How We Work uses a
five-item accordion and two tables.

## Things worth deciding before the next template

1. **Which templates next.** Sections that generalise across many businesses make
   better templates than tightly niche ones.
2. **A broader upsell doc.** The Add-Ons tip links the WooCommerce article, which only
   covers selling portal access — not landing pages or content pages. A doc covering
   all three ways would be a better target.
3. **Whether one inspiration portal can serve two templates.** Web Design points at the
   Polymark portal, which existed long before the template did. It works, but the fit
   is loose in places — the portal carries a Brand Guidelines module the template drops.

Two questions that used to live here are now settled: templates do **not** each need a
purpose-built inspiration portal (see the section above — an existing portal is fine,
and it keeps its images), and personas are **out** rather than reused (see Voice and
length).

## The mechanical bit

Full detail in `README.md`. In short: build the portal locally → export → run
`node tools/author.mjs <export.json> --id <slug>` → commit → push. The card's title,
description, thumbnail and preview URL are preserved on re-export, so a plain rebuild
updates the template body and leaves the card alone.

The gallery is **not live to customers yet**, so `main` is effectively staging.
