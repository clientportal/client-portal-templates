# Writing template content

`README.md` covers the mechanics: export, `author.mjs`, the CDN, testing. This file covers what goes in a template, how it should be written, and why. Conventions here were set while building the Onboarding template and revised while building Web Design. Read one of them (`templates/onboarding/onboarding.json`, `templates/web-design/web-design.json`, or apply either locally) before writing a new one.

## The one rule everything else follows from

A customer browses the inspiration portal, likes it, applies the template, and must not get an empty shell. Before this convention existed, the Onboarding template's pages read `[One line on how a project runs, start to finish.]`. That is the experience to avoid.

So: real content, as close to a finished portal as possible, but nothing that follows the customer home. Every template is imported onto someone else's site. If it can't work there, it doesn't ship.

Two halves, and both matter:

- Inspiring. Real copy, real structure, something they'd be happy to send a client with light editing.
- Weightless. Nothing they have to hunt down and delete. No images in their media library, no embeds pointing at your accounts, no links to your site.

## Two readers, two layers

Every template is read by two people who never meet.

The customer is the agency owner, freelancer, or coach who imported the template. They read the callouts.

The client is the customer's client. They read everything else.

So a template has two layers of text, and they follow different rules.

### Body copy (for the client)

Page text, module descriptions, FAQ answers, lists. This is what the customer sends to their client after light editing.

- Written as the studio or coach talking to the client. "We" and "you" are correct here because that is how a real professional writes to a client.
- Should read like a competent, slightly busy person wrote it. Not marketing. Not a robot.
- Must work without a name. See Names and placeholders below.
- Example from Onboarding, How we work: "We do things a little differently. Instead of just asking for your requirements, going away, and producing set deliverables, we work with you to create something that will have a real impact on your business."

### Callouts (for the customer)

Setup notes and quick tips. Guidance on how to use or adapt the section.

- Second person, addressed to the customer: "you", "your client".
- Never "I" or "we". Client Portal is not a character in the template, and the studio voice from the body copy does not carry into the callouts.
- Plain instructions. Say what to do. If the reason is useful, add it in one clause. Then stop.
- Obviously removable. The customer has to be able to tell at a glance that this is not for their client.

## Callout boxes

Registered as `core/group` variations (`src/callout-variations/index.js` in the plugin). Use the class, not the variation name:

| In the editor | Class to write | Use for |
|---|---|---|
| Callout — Info | `callout-blue` | Setup notes, instructions to the customer |
| Callout — Warning | `callout-yellow` | Quick tips |
| Callout — Success | `callout-green` | Confirmations, "you're all set" |
| Callout — Error | `callout-red` | Genuine warnings only |
| Callout — Neutral | `callout` | Asides. Note the class has no suffix |

Onboarding uses blue for setup notes and yellow for tips. Keep that consistent across templates so customers learn what the colours mean.

Callouts open with their label in bold, every time: `**Setup note:**` or `**Quick tip:**`. The label can carry a short title on a content page, as in "Setup note: introduce your portal". Do not vary the label ("Tip:", "Note:", "Pro tip:"). The point is recognition.

### Setup notes

Setup notes say what to put here. They render in the portal until deleted, so they must be useful and obviously removable.

Every module setup note ends with the same six words, linked:

> **Setup note:** Link your scheduling tool (Calendly, SavvyCal) so clients book without the back-and-forth. [How to edit or delete this note](https://client-portal.io/support/add-text-above-or-below-a-module-l0gcs)

Identical every time. Repetition is the point. You can't predict which note someone is looking at when they think "how do I get rid of this?", and nothing on the front end tells them that text lives in a module's "text above/below" field.

This applies to module notes only. Notes in a content page are ordinary blocks. Deleting one is normal block editing, and that doc would misdirect. Content page notes end with "Delete this note before sharing." and no link.

Length: one to three sentences before the closing line. If a setup note needs a paragraph, it is probably two notes or a quick tip.

### Quick tips

Setup notes say what to put here. Quick tips teach a better way of working, and they're what makes a template feel like it came from someone who has done this.

The exemplar, from the questionnaire page:

> ⚡️ **Quick tip:** Instead of embedding a form, consider using a shared Google Doc. It stays open, so clients can revisit it, leave comments, and add detail as the project takes shape, rather than answering once and losing access. The questionnaire becomes something you both keep using, not a dead end after submit.

That works because it argues against the obvious approach and says why. Compare the Add-Ons tip, which teaches the three ways to sell from a module: link to a landing page, build the pitch as a content page, or sell portal access via WooCommerce.

Aim for one or two per template, where you know something. A tip that just restates the feature is filler. A tip that invents a statistic to justify itself ("clients are far more likely to...") is worse than filler, because it teaches the customer to make things up too.

The lightning bolt is the existing convention for quick tips. Keep it there and nowhere else. No other emoji anywhere in a template.

## Voice

Neutral, plain, matter-of-fact. Closer to a good product manual than a blog post. The humor in the blog style guide does not carry over. A wry line in a template gets imported into hundreds of portals and stops being wry by the third one. A little dryness is fine. Peppy is not.

Nothing in a template is there to impress, persuade, or sell Client Portal. The customer already bought it and already imported the template. Body copy can sell the customer's services to their client, because that is what a real portal does, but it should do so the way a confident studio does: state what you do and stop.

### Spelling and punctuation

- American spelling. (Earlier templates shipped British. Bring them into line when they are next touched; do not add more British.)
- Contractions fine.
- Straight apostrophes (`'`), not curly, matching existing content.
- No em dashes or en dashes. Use a colon, a comma, a full stop, or brackets. A dash reads as machine-written to a lot of people now, and a template is the first writing a customer sees from us. Web Design shipped with 35 and they were all replaced; don't reintroduce them.
- No exclamation marks.
- Sentence case everywhere, including headings. Title case for module titles only.
- No colons in headings. "Onboarding: what to expect" becomes "What to expect during onboarding". (Callout labels are the exception; see above.)
- No rhetorical questions as headings unless it is a question the client would actually ask. FAQ pages are fine.

### Rhythm

- Vary sentence length. Some short. Some that run longer because the idea needs the room. Avoid a run of same-length sentences.
- Vary paragraph length too. A one-line paragraph next to a four-line one is fine.
- Do not default to three of anything. If there are three items, list three. If two, two. If five, five. Never pad or trim a list to hit three.
- Bullets for things that are lists: checklists, file requirements, steps, questions. Not for explanations.
- A bold lead-in on a list item ("**Senior team, start to finish**: we do the work ourselves") is fine. Bold mid-sentence for emphasis is not.

### Length

Shorter than feels complete. If a note can be one sentence, it is one sentence.

- Module descriptions: one line.
- FAQ answers: two or three sentences. Six or seven questions is plenty.
- Setup notes: one to three sentences plus the closing line.
- Body copy: long enough to show the shape of a real answer and no longer. Nobody reads a 400-word welcome before editing it.

### Words to avoid

seamless, effortless, streamline, leverage, ensure, elevate, empower, unlock, robust, delve, dive in, journey, navigate, landscape, foster, harness, curated, crafted, tailored, bespoke, holistic, transformative, game-changer, cutting-edge, world-class, at its core, the beauty of, the best part, think of it as, quietly (as in "quietly powerful"), simply, just (as a softener), truly, genuinely, absolutely, incredibly, let's, feel free to, don't hesitate to, it's worth noting, importantly, note that, whether you're X or Y, in today's

### Patterns to avoid

- "It's not about X, it's about Y." Say Y.
- A benefit stapled to every instruction ("...so your clients feel confident and informed"). Give the instruction. No pitch attached.
- Reassurance ("Don't worry", "You've got this", "This is easier than it sounds"). Assume the reader is competent.
- Praising the reader ("Great choice", "Smart move").
- Closing sentences that restate the paragraph. Delete them.
- Opening sentences that announce what is coming ("In this section you'll find..."). Start with the content.
- Stacked adjectives ("a clear, professional, branded experience"). Pick one or none.
- Every bullet starting with the same verb form. Every list the same length. Every paragraph the same shape.
- Metaphors and analogies. Templates do not need them.
- Invented specificity ("Most agencies find that...", "far more likely to..."). If it is not true and sourced, leave it out.
- Selling Client Portal inside the template.

### Examples

Setup note, bad:
> **Setup note:** This section is designed to help your clients feel confident and informed right from the start, ensuring a seamless onboarding experience.

Setup note, good:
> **Setup note:** Put anything the client needs before the kickoff call here. Contract, intake form, who to contact. Delete this note before sharing.

Body copy, bad:
> We're thrilled to be partnering with you on this exciting journey! Our team is committed to delivering a website that truly elevates your brand.

Body copy, good:
> Thanks for sending the brand files over. We have everything we need to start on the homepage. First designs should be with you by the 14th.

## Names and placeholders

Keep the invented world to a minimum. Write as a real studio talking to a real client, but don't build a cast. Prefer copy that needs no name at all ("your project lead", "the design team", "we") over a named persona. Onboarding predates this decision and still uses Jamie, Sam and Priya; don't add to it.

The distinction that matters: write copy that doesn't need a name, not copy with a blank where a name goes. "Your main point of contact is your project lead" ships fine. `[Your Name]` scattered through a page is the empty-shell problem this guide exists to prevent, wearing a different hat.

Company names go the same way. Web Design was built from an inspiration portal for a fictional brand called Polymark, and nothing of that name survives in the template.

So, in body copy: no square-bracket placeholders, no `{{tokens}}`, no fictional people or companies. If a section cannot be written without something the customer has to supply (a video, a team photo, a Calendly link), write the surrounding copy so it stands on its own and put the instruction in a setup note.

Module links are the exception. They use placeholder tokens, not URLs: `contact-link`, `slack-link`, `invoice-link`, `figma-link`. The customer replaces them.

Fictional names are fine in inspiration portals. See The template and its inspiration portal are not the same thing.

## Images: none

A shipped template has zero attachments. Check the export before authoring:

```
attachments: 0
```

Not decorative headers, not screenshots, not mocked-up video thumbnails. Images have to be downloaded into the repo, served from the CDN, and then land in the customer's media library on import, for a picture they'll almost certainly replace.

The one exception is the gallery card thumbnail, which is repo-level, not template content. See the README (~800×366, converted to WebP).

If a section only makes sense with an image, write a setup note telling them what to put there instead.

## Embeds: none

No form embeds, no Trello, no Google Sheets, no video. They point at your accounts, break on their site, and often need a plugin they don't have.

### Forms become their questions

This is the useful move, not a compromise. The Onboarding questionnaire embedded a Tally form; nine questions were locked inside an iframe nobody else could use. Now the page lists them:

> **Your business**
> - In a sentence or two, what does your business do?
> - How did it start, and what problem were you setting out to solve?
> - What are your main products or services?

With a setup note above:

> **Setup note:** Use your preferred form tool (Gravity Forms, Typeform, Google Forms, etc.) to build a form from the questions below, then paste the embed code or shortcode here. Delete this note before sharing.

The customer gets something better than an embed they can't use: the actual thinking, ready to rebuild in whatever tool they own. Keep the section headings the form used; they carry the structure.

## Links

Module links use placeholder tokens, not URLs. `contact-link`, `slack-link`, `invoice-link`, `figma-link`. The customer replaces them. Never a real URL that belongs to you.

Never link to the site you authored on. A `wordpress.test` link was authored into the Onboarding Welcome page and would have shipped as a dead link. `author.mjs` now refuses any host outside the allowlist:

```
client-portal.io, www.client-portal.io, clientportalportals.com, cdn.jsdelivr.net
```

`--allow-host` exists but prefer fixing the link. Every allowed host is a URL that has to keep working on every customer's site indefinitely.

External links open in a new tab: `target="_blank" rel="noopener noreferrer"`. A client clicking a link should not lose the portal they were reading.

Give a links module two links, not one. Either works: a single link is a valid way to build a module, and the plugin sends the client straight to it rather than opening the popup. But a template is a demo, and the popup is the thing worth showing, because it's where the module's text above and below appears. Two links shows what the module can do. (It also means a `#` placeholder isn't the module's only destination.)

## Synced patterns: exactly one

Ship one synced pattern per template. Not zero, not four.

- One is enough to demonstrate the feature. The concept transfers immediately.
- Each one becomes a permanent `wp_block` post in the customer's Patterns list. Ten templates × four patterns = forty posts nobody asked for.
- Confusion scales with count. Four mysterious synced sections is four times the "why can't I edit this normally?"

Choose a section that is identical across every client: Useful Resources (tools, contact channels, FAQ) or Add-Ons (your offers and prices). Updating those everywhere at once is the real benefit.

Never sync Getting Started or How We Work. Those vary per client, so the customer tailors one and is ambushed when it changes for all of them. First contact with a feature shouldn't be a nasty surprise.

No in-content note is needed: the plugin links the docs from the block toolbar and the block card whenever a synced pattern is selected.

## Only ship what Client Portal can build

A template is a portal, so everything in it has to be something a customer could have built themselves in Client Portal: phases, modules, content pages, and the blocks the importer allows.

The temptation is to reach for a marketing-page layout: a three-column pricing grid, a feature comparison table, a hero band. Those may render, but they teach the wrong thing. Someone who applies the template and then tries to recreate that section in their next portal will not find it, and the template has made the product look like something it isn't.

Web Design originally shipped a three-tier pricing grid for care plans on the portal home page. It was cut for exactly this reason, and the same content now lives where it belongs: a content page, written as prose and a list.

Ask of any section: could a customer have made this in the portal editor? If not, it does not ship.

## A structure that works

Onboarding's shape, which generalises:

1. Getting Started: Welcome, How we work. Orientation, no tasks.
2. Your Tasks: the things you need from the client. Contract, questionnaire, assets, kickoff.
3. Useful Resources: contact channels, FAQ, tools. The synced pattern.
4. Add-Ons: optional extras. Your upsells.

Not every template needs four sections, but the progression (orient, act, reference, sell) holds for most client work.

Web Design uses a three-phase variant of the same idea, mapped to project stages rather than content types:

1. Discovery: getting started, questionnaire, brand assets, kickoff.
2. Design and development: the work itself, and the client's feedback on it.
3. Launch and handoff: the site is live; what happens now. The synced pattern lives here, in a "What happens next" content page carrying the care-plan offer.

Both shapes end on the upsell. That placement is deliberate: the client is happiest with the work at handover, which is when a maintenance offer reads as care rather than a sales pitch.

Every portal ends with a call to action. The `leco-cp/call-to-action` pattern (a full-width band with one line of copy and a button) sits between the phases and the footer. Client portals ship with one; a template without it looks unfinished.

## The template and its inspiration portal are not the same thing

Every template's gallery card links to a live inspiration portal on `clientportalportals.com`. They are close relatives, not copies, and this is the easiest thing in the whole process to get wrong.

The inspiration portal keeps its images. It is a real portal on a real site, and the images are most of what makes it worth looking at. The zero-attachment rule governs the template, not the example. Onboarding has worked this way from the start.

So the template is the same structure with the weight taken out:

| | Inspiration portal | Template |
|---|---|---|
| Images, embeds, video | Yes, that's the point | None |
| Real deliverables (a full brand doc, a finished mockup) | Yes | A setup note where it would go |
| Client and studio names | Fictional is fine | Generic, no names |
| Setup notes and quick tips | No | Yes |
| Voice rules above | Apply | Apply |

Keep the phases and the module names lined up, so someone moving from the example to their own copy recognises what they're looking at. Everything else can differ, and a template does not need a rebuilt inspiration portal just because it drops a module or rewrites a page.

A module that only works with an image (a moodboard, a design inspiration slider) stays in the template as an empty module with a setup note. Deleting it breaks the structural parity; leaving it empty teaches what belongs there.

## Before you ship

Mechanical:

- [ ] Export shows `attachments: 0`
- [ ] No `<iframe>`, `wp:html`, `<script>`, or `wp:image` anywhere
- [ ] No link to the authoring site (`author.mjs` refuses these)
- [ ] Module links are placeholder tokens
- [ ] Every module setup note ends with the linked six words; content page notes end with "Delete this note before sharing."
- [ ] Exactly one synced pattern, on a section identical across clients
- [ ] At least one quick tip that teaches something
- [ ] Content survives `wp_kses_post()`. The importer runs it on every field regardless of who is importing, so an admin import is a fair test. Check the module count in the imported portal, not just that the import succeeded
- [ ] Import round-trip tested locally: refs resolve, no `{{placeholders}}` left
- [ ] `--title` matches the card name, not the portal's internal title
- [ ] No invented brand, company or person names carried over from the source portal
- [ ] Links modules ship two links, so the popup and its text are on show
- [ ] Nothing in the template that a customer could not build in Client Portal
- [ ] The portal ends with a call-to-action band
- [ ] Any content page relying on comments carries a setup note linking the [enable-comments doc](https://client-portal.io/support/enable-comments-in-your-portals-y8q7z). Comments are off by default, so the thread simply will not appear

Writing. Search the full export for:

- [ ] Em dashes and en dashes
- [ ] Exclamation marks
- [ ] Emoji other than the quick tip lightning bolt
- [ ] Every word in the avoid list
- [ ] "I" or "we" inside any callout
- [ ] Square-bracket placeholders in body copy
- [ ] The "not X, it's Y" pattern
- [ ] British spellings (colour, organise, realise, favourite, centre)

Then read it:

- [ ] First sentence of every paragraph. If it announces instead of says, cut it.
- [ ] Last sentence of every section. If it summarises, cut it.
- [ ] Not every list is three items long.
- [ ] Body copy sounds like a person writing to a client, not a brochure.
- [ ] Every callout is obviously for the customer and obviously removable.

Any `core/*` block is allowed by the importer, plus the `leco-cp/*` allowlist, so accordions, tables and pullquotes are all available. Onboarding's How We Work uses a five-item accordion and two tables.

## Things worth deciding before the next template

1. Which templates next. Sections that generalise across many businesses make better templates than tightly niche ones.
2. A broader upsell doc. The Add-Ons tip links the WooCommerce article, which only covers selling portal access, not landing pages or content pages. A doc covering all three ways would be a better target.
3. Whether one inspiration portal can serve two templates. Web Design points at the Polymark portal, which existed long before the template did. It works, but the fit is loose in places: the portal carries a Brand Guidelines module the template drops.

Settled: templates do not each need a purpose-built inspiration portal (an existing portal is fine, and it keeps its images), and personas are out rather than reused (see Names and placeholders).

## The mechanical bit

Full detail in `README.md`. In short: build the portal locally, export, run `node tools/author.mjs <export.json> --id <slug>`, commit, push. The card's title, description, thumbnail and preview URL are preserved on re-export, so a plain rebuild updates the template body and leaves the card alone.

The gallery is not live to customers yet, so `main` is effectively staging.

### Edit in the editor, not in the JSON

Build and change templates in the block editor, then export. Editing an exported
JSON by hand looks harmless and is not.

A block's attributes are JSON inside an HTML comment, and the editor escapes `<`,
`>` and `"` in them as `\u003c`, `\u003e` and `\u0022`. That matters because the
importer runs `wp_kses_post()` on every field, and kses reads the first `>` inside a
comment as the end of it. A setup note hand-written as
`"textBelow":"<p><strong>Setup note:</strong>...` turns the entire block comment into
escaped text, and the module is gone.

It fails in the worst possible way: the authoring site looks perfect, because nothing
there re-parses the comment. The damage only appears after import. Web Design shipped
this way and lost six of its twelve modules, every one of them a module carrying a
setup note.

`author.mjs` now normalises block attributes on the way through and says so when it
changes anything. If you see that line, something was hand-edited. Nothing is broken,
but go and check what else that edit touched.
