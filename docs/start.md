# Make a world of your own

Start with a person, a question and a body of work. Aaron Alderman’s expedition was the initial breakdown: places, reading paths, sources, choices and small encounters. Your world can have a different purpose and shape.

## Point your agent here

Give your agent this repository and the following instruction. The starter needs no access to the surrounding research checkout.

```text
Read AGENTS.md and docs/start.md in aaron-alderman/worldwrightio.
Ask me whose world this is, who it serves, what readers should be able
to do, and which content and sources I want to bring.
Create a standalone world from templates/world.
Keep meaning, composition, presentation and native effects explicit.
Use context/features.json and templates/feature.json for richer features.
Build and run the positive and refusal tests. Show me the result,
the editable source owners, remaining gaps and observed evidence.
```

## Build the smallest complete world

Use Node 22 or later. There are no package dependencies to install.

```sh
git clone https://github.com/aaron-alderman/worldwrightio.git
cd worldwrightio
npm run new -- worlds/my-world
cd worlds/my-world
npm run build
npm test
npm run dev
```

Open the localhost URL printed by the server. The created directory is standalone; move it into a repository of its own whenever you are ready. It contains no inherited domain, Site ID, Git history or deployment credential.

## Change meaning at its source

Edit source/world.rel to replace the identity, purpose, places, choices and source notes. A Place needs a title, question, reading and at least one declared Source. A Choice names a declared Place as its target. Place IDs are lowercase URL-safe slugs.

```text
("garden", "title", "Where your question begins")
("garden", "choice", "garden-to-lens")
("garden-to-lens", "target", "lens")
```

Rebuild after editing. Missing targets or sources refuse before page projection. The fictional notebook is illustrative content; replace its attribution and scope alongside the readings.

The build stages a fresh output before replacing dist. Failed builds keep the last accepted world; successful rebuilds remove pages for retired places.

## Give it its own expression

source/presentation.rel owns CSS rules and their order. algebra/world.process.json owns validation, composition, navigation and projection. Generated HTML, CSS and receipts live in dist. Open Sources in the example to inspect the exact source snapshots. This is source disclosure, not a live execution debugger or an inverse editor.

## Add a richer feature

Read the feature catalogue and complete a copy of templates/feature.json. The reference library preserves all 36 algebra modules from the initial personal expedition snapshot. Richer modules need their facts, assets, dependent queries, grants and tests extracted before reuse.

## Publish your world

Publish your generated dist directory to the static host you choose. Use your own repository, domain and host configuration. Creating or building a world does not deploy it. This repository’s Pages workflow publishes the project hub.
