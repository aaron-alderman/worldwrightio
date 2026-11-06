# A full Worldwright expedition

This is a standalone, complete dependency closure for the initial Worldwright
feature set. It includes a reading world, atlas, remembered visits, search and
notes, finite interactive models, media and motion, project microsites,
Claimipedia review, Encounter contracts and session edits, source inspection,
checked filesystem authoring, admission and publication receipts.

Use Node 22 or later. No package installation or surrounding research checkout
is required. Run these commands in this directory:

```sh
node build.mjs
node --test template.test.mjs authoring-native.test.mjs
node serve.mjs
```

The equivalent npm commands are `npm run build`, `npm test`, `npm run dev`.
The build stages fresh output before replacing dist. A failed build preserves
the last accepted output; successful recomposition removes retired output.

## Make a different world

Edit **source/world.rel** for the sole world identity and framing: name,
purpose, headline, description, origin, about, repository and social link.
An optional monogram fact controls the visible brand and icon; otherwise the
first character of the world name is used.
Home social title, description, image and alt text use the same world facts.
Optional imageWidth, imageHeight and imageType facts are emitted only when
explicitly supplied; set them to match the selected image. Otherwise dimension
and MIME hints are omitted rather than inherited from the original share card.
The origin must be an absolute HTTP(S) base URL ending with `/`. Browser runtime
bundles receive the selected site facts; they do not inherit Aaron's identity.
The example origin worldwright.example is a placeholder, not a deployed site.

Edit **source/expedition.rel** for places, choices, source notes and territories.
The template accepts any positive number of places and gateway doors. Each Place
has a slug, route (`places/<slug>.html`), title, lead, region, chapter, source,
light, mapX, mapY and **mapTipAbove**. Coordinates are percentage strings;
mapTipAbove is the required string `"true"` or `"false"` for tooltip placement.
It may have paragraphs, fuller paragraphs, definitions and choices. Choices
need destination, label and kind; destinations name declared Place identities.
Territory membership must name declared places. source/world-schema.json lists
the required and conditional fields actually read by each selected projection.

An activity is optional and explicit: `("place.example", "activity", "example-id")`
selects an owned entry in source/reader/activities.json.activities. With no
activity fact, the place renders as a reading without an iframe. Do not assume
that a place slug names an exercise. Unknown selected exercise IDs refuse.

Edit **source/atlas.rel** for map presentation and coordinates, and
**source/gateway.rel** for reading-path doors. New territories need atlasSlug,
atlasNumber and atlasImage. Existing artwork is an imagined example geography,
not geographic evidence; keep attribution when reusing or replace it.

Keep **source/assets.rel** when replacing the world graph. It owns the template's
shared fonts, styles, artwork, retained reference files and compatibility assets;
it is separate from the person's places and source notes. Feature-specific
assets also stay with their feature source files. Change the registry explicitly
when replacing artwork, rather than deleting it while changing the story.

A SourceNote needs title, originalTitle, kind and note, with optional paragraphs
and a local-source href. A Territory needs name, question, note, light,
atlasSlug, atlasNumber and atlasImage, plus its place memberships. CorpusDoor
needs slug, readingName, title, description, question, light, kind, href, label,
secondaryHref and secondaryLabel. Entrances on the homepage separately declare
destination, number, name, symbol, question and note.

For example, a seven-place tools world could use Spool, Hinge, Wheel, Mirror,
Spring, Lever and Lamp across two named territories. Give each a source note,
explicit coordinates and mapTipAbove, join their choices to declared identities,
and update the homepage Entrances and gateway doors to that same set. This is
an authoring brief: the canonical REL facts remain the executable owners.

When replacing places or gateway doors, review **every source-owned content
link**, including `capability.*.links` in source/front-doors.rel, gateway book
and library destinations, project-card links and reading choices. Those links
belong to the author's content and must name routes/fragments in the new graph
or intentional external sources. Replacing a graph does not infer new editorial
destinations. The resource audit checks these links after rebuilding; no process
patch is required to change their authored values.

**source/presentation.rel** owns presentation and styles. Process modules under
**algebra/** own selection, validation, composition, projection and interaction
policy. The `template.validate` algebra checks graph edges, duplicate routes,
origins and core fields. Selected projections also enforce their required field
cardinality; missing-field refusals name the exact subject and predicate.

The richer software/physics examples remain clearly attributed demonstrations.
Their domains are not claims about the new author's life or research. Replace
the initial personal readings, source notes and contact content when building a
new world. The template is a complete feature closure, not a requirement to
adopt its forty illustrative readings or its original three-region layout.

## Reuse the feature families

- Atlas and remembered visits: `atlas*` processes, source/atlas.rel, and explicit
  atlasBrowser native grants.
- Reader search, notes and interactive models: `reader-*` processes and editable
  source/reader documents and activities. Numeric examples are finite fixtures,
  never experimental measurements or new scientific validation.
- Project microsites, motion and media: `microsite-*` processes,
  source/microsites documents, and bundled temple/sourcery media and artwork.
- Claim review: `claimipedia*` processes and source/claimipedia-example.rel.
- Encounter and source inspection: `encounter*`, `source`, lowering, types,
  source/encounter/example.json and source/encounter/presentation.json.
- Filesystem authoring: algebra/authoring.process.json,
  source/authoring-contract.json and the generic tooling/author.mjs adapter.

The entire closure is present, so every selected family can execute immediately.
Its editable facts and its subsystem example data remain explicit source owners.
Feature contract manifests in the parent repository map each original algebra
module to its implementation, inputs, grants, outputs and behavioral checks.

## Checked source edits

Use `node tooling/author.mjs proposal.json`. A proposal has protocol
`worldwright/authoring-proposal/1`, explicit boolean `apply`, and nonempty changes.
Each change names an allowed canonical file, its current `beforeSha256`, and its
complete replacement UTF-8 `text`. Preview (`apply:false`) runs the actual build
and portable suite in an isolated candidate without changing accepted sources.
Apply validates again, checks source versions and commits the accepted changes.
Stale sources, repeated targets, unknown owners and failed candidates refuse.

Authoring receipts and candidates stay under .build and are not published.
Generated source disclosure is read-only, distinct from execution traces and
from checked source edits. There is no universal inverse from HTML to meaning.

## Boundaries and provenance

The Temple seed and 20-million-step budget are unchanged. Browser and filesystem
native adapters are explicit mechanisms, with declared grants. The native
successor is the frozen current personal-implementation snapshot; its source
receipt records exact bytes. The original 36-module reference snapshot remains
separate from these generic, adapted implementations.

No CNAME, hosting identity, Git history or credentials are included. Publish
your dist directory using your own host configuration. Archival provenance
documents may mention the original publication; they grant no deployment access
and do not emit its domain into your fork.

The behavioral suite includes actual algebra execution, same-implementation
effect fixtures, finite oracle correspondence and source checks. A separate
agent's different-world build tests this handoff; it is not independent human
validation or a new scientific evidence family.
