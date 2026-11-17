# Worldwright

One application: the reader, guided journey, live Encounter example, lightning
explanation, printable diagrams and source inspector share a shell, route model
and source-presentation service. One editing session survives navigation.
Reloading starts a fresh candidate.

## Owners and build

`source/application.encounter` declares purpose, navigation, journey, scene/view routes,
service lifetime and compatibility destinations. `algebra/application.encounter`
derives their runtime composition and selects view cross-sections. Reader and
workspace output are regenerated from typed programme, composition and style
definitions through the same projection algebra. No build reads dist, verification
references, external repositories, node_modules or an authored MJS module tree.

The application, projection, ownership and provenance programmes are authored
in `algebra/*.encounter`. Their checked JSON projections retain inspector
coordinates. The build executes the compiled Encounter source and rejects a
projection that disagrees. It uses the pinned Worldwright compiler adapter in
the sibling `encounter-libraries` directory. For a relocated checkout, set
`WORLDWRIGHT_ENCOUNTER_LIBRARY` to that adapter's absolute path.

The application definition is authored in Encounter. The build emits its
typed model as `application/definition.json` and links navigation, routes and
views to the exact authored Encounter spans.

Pages are authored in `source/pages/**/*.page.encounter` as trees of typed
page operations, ordered children, and named attributes. The build generates
their node graphs under `ownership/intermediates/pages/`. Inspector records
for rendered values link back to the authored Encounter spans.

Stylesheets use ordered rules and declarations in
`source/styles/**/*.style.encounter`. Their generated graphs live under
`ownership/intermediates/styles/`. The inspector links selectors and
declaration values back to Encounter.

Browser programmes are authored as typed Encounter trees in
`source/programs/`. Large trees have bounded Encounter fragments, and named
shared nodes preserve repeated references. The build generates the programme
graphs before projecting JavaScript.

Build manifests, projection grammars and the live workshop and inspection
definitions also load from Encounter. Their checked JSON compatibility
projections preserve the published snapshots and inspector coordinates.

Run node bootstrap/build.cjs, then node bootstrap/check.cjs. The test command is
listed in package.json. node serve.mjs opens the local preview server.

The guard compares declared input and output hashes, rejects unexpected files
and refuses to conceal output edits. Explicit --repair-output rebuilds retain
the previous output locally. Builds stage before replacing the accepted directory.

## Truthful ownership

Each artifact has one declared producer, with its source owners, algebra rules
and mapping coverage in `dist/ownership/index.json`. The process algebra refuses
duplicate producers, missing outputs, undeclared outputs and byte copies that
disagree with their canonical owner. Files found after generation are no longer
automatically admitted as inspection output.

`algebra/provenance.process.json` interprets the rendering grammar and derives
UTF-16 maps through child composition. Equal text from different source nodes
retains different origins. The maps identify exact source-node fields, grammar
expressions, composed slots and semantic generator rules. Every mapped JSON
coordinate is checked against its source. Maps are generated evidence, not new
editable authorities or inferred inverse edit routes.

The existing inspector links generated definitions to exact canonical source
fragments and derivation rules. Canonical snapshots are byte-identical copies
under `ownership/sources/`. Maps remain separate from the inspector catalogue
to avoid loading their entire graphs when inspecting a source fragment.

For a local exact-coordinate lookup, run:

```
node bootstrap/provenance.cjs app.js 100
```

Coordinates address the complete generated file, including its generated header.
The command checks the accepted ownership basis before following the map.

`presentation/style.css` has one semantic producer: the source-presentation
policy, `sp.stylePlan`, the generated style document and the style grammar.
Its output must equal the existing `css.renderPlan` result. The former authored
style IR copy is retired. The intermediate style document is generated only.

Mapping coverage is explicit. Typed projections have character maps; copied
assets and sources have byte identity. Native assemblies, compiled model
snapshots and inspection capture have declared source/rule dependencies rather
than invented character-level mappings. These remain visible native boundaries.

## Boundaries

The seed and native invocation bodies are unchanged. Projection stays within
20 million ticks. Native mechanisms supply filesystem, DOM lifetime, events,
imports and print transport. Existing algebra owns presentation, typing, language
lowering, patching, debugger instrumentation and application view decisions.

The build generates typed graphs for programme, page and style definitions.
The reader retains ECMAScript-style template expressions in that IR. Richer domain
decomposition remains future work. The live example is an explanatory fixture,
not a complete mainframe or authoring bootstrap. Read-only source inspection is
distinct from debugging execution and from editing a session candidate.

The former side-by-side publisher and nested application are retired. Old URLs
redirect into this application. Historical sources remain in Git history.
Local tests form one evidence family; they are not independent verification or
protected CI. The published Site remains owner-only.

Repository care: [licensing](LICENSE.md), [Christian stewardship covenant](CHRISTIAN_STEWARDSHIP_COVENANT.md), and [source/evidence hygiene](STEWARDSHIP.md).

The legacy preview launcher runs `encounter check-package` before starting
the app. Set `ENCOUNTER` to the approved platform executable. Packages
containing JSON, MJS, Python or Rust files fail this check and require
migration before installation or boot.

## Encounter release

Run `node bootstrap/build.cjs <new-release-directory> --rel-release`. The build
runs the existing ownership and provenance checks before writing the release.
It packages the verified datasets as compressed typed REL under `assets/` and
pins them in `publication.rel`. The native publisher checks the package and
reconstructs the workshop and inspector's byte-identical response representations
from the pinned REL data.

```sh
pin=$(sha256sum "$release/publication.rel" | cut -d' ' -f1)
"$encounter" check-package "$release"
"$encounter" publication --pinned "$release/assets" "$release/publication.rel" "$pin" 24192
```
