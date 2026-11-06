# Make a world of your own

Start with a person, a question and a body of work. Aaron Alderman’s expedition was the initial breakdown: places, reading paths, sources, choices and small encounters. Your world can have a different purpose and shape.

## Point your agent here

Give your agent this repository and the following instruction. The starter needs no access to the surrounding research checkout.

```text
Read AGENTS.md and docs/start.md in aaron-alderman/worldwrightio.
Ask me whose world this is, who it serves, what readers should be able
to do, and which content and sources I want to bring.
Choose templates/world for a small reader or templates/expedition for
the full feature set. Read that template's README and source contracts.
Keep meaning, composition, presentation and native effects explicit.
Use context/features.json and templates/features for the feature recipes.
Build and run the positive and refusal tests. Show me the result,
the editable source owners, remaining gaps and observed evidence.
```

## Choose a runnable template

Use Node 22 or later. There are no package dependencies to install.

```sh
git clone https://github.com/aaron-alderman/worldwrightio.git
cd worldwrightio
npm run new -- worlds/my-world --template expedition
cd worlds/my-world
npm run build
npm test
npm run dev
```

Open the localhost URL printed by the server. The created directory is standalone; move it into a repository of its own whenever you are ready. It contains no inherited domain, Site ID, Git history or deployment credential.

The expedition template includes the complete feature closure: the reader, atlas and remembered visits, project microsites, motion and media, claim review, source inspection, Encounter edits, browser workshop and checked repository authoring. Educational subsystem examples keep their attribution; your world's content and identity belong to you.

For the small two-place reader, omit --template expedition. It stays available as the minimal core. Node-only command equivalents and the exact source schema are in each created world's README. No surrounding grand-theory checkout is needed.

## Change meaning at its source

In the small reader, edit source/world.rel to replace the identity, purpose, places, choices and source notes. A Place needs a title, question, reading and at least one declared Source. A Choice names a declared Place as its target. Place IDs are lowercase URL-safe slugs.

```text
("garden", "title", "Where your question begins")
("garden", "choice", "garden-to-lens")
("garden-to-lens", "target", "lens")
```

Rebuild after editing. Missing targets or sources refuse before page projection. The fictional notebook is illustrative content; replace its attribution and scope alongside the readings.

The build stages a fresh output before replacing dist. Failed builds keep the last accepted world; successful rebuilds remove pages for retired places.

## Give it its own expression

source/presentation.rel owns CSS rules and their order. algebra/world.process.json owns validation, composition, navigation and projection. Generated HTML, CSS and receipts live in dist. Open Sources in the example to inspect the exact source snapshots. This is source disclosure, not a live execution debugger or an inverse editor.

In the expedition, identity belongs in source/world.rel; places and readings in source/expedition.rel; doors in source/gateway.rel; and map presentation in source/atlas.rel. source/world-schema.json and the template README list the actual required fields, including tooltip placement. Keep source/assets.rel and source/template-presentation.rel when replacing the story: required resources and shared presentation belong to the template, separately from the new world graph.

Activities are explicit and optional. A Place.activity fact selects an entry in source/reader/activities.json.activities. Omit it for a reading without an exercise. A slug is not an implicit activity definition. Its source proposal workflow stages and validates coordinated edits before applying them.

## Add a richer feature

Read the feature catalogue and the concrete recipe in templates/features for the selected capability. The full expedition is the supported composition unit: the recipes identify its actual modules, facts, effects, dependencies, outputs, correction paths and checks. The initial 36 module snapshots remain available for provenance. Copying a single JSON module without its dependencies is not a supported installation method.

For a new capability, complete templates/feature.json and supply both a successful behavior and a decisive refusal. The template gives the extension an explicit place in the ownership and admission chain.

## Publish your world

Publish your generated dist directory to the static host you choose. Use your own repository, domain and host configuration. Creating or building a world does not deploy it. This repository’s Pages workflow publishes the project hub.
