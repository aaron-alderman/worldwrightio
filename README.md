# Worldwright

Make a body of work into a world people can explore. Worldwright.io begins with
the introduction and continues as the documentation and agent context hub for
building your own. Aaron Alderman’s site is the initial personal implementation.

Give your agent this repository and [AGENTS.md](AGENTS.md). Read
[the guide](docs/start.md), [template recipes](docs/templates.md), [architecture](docs/architecture.md),
[lightning path](docs/lightning.md) and [feature catalogue](context/features.json).

```sh
git clone https://github.com/aaron-alderman/worldwrightio.git
cd worldwrightio
npm run new -- worlds/my-world --template expedition
cd worlds/my-world
npm run build
npm test
npm run dev
```

Node 22 or later; no package installation. Without npm use
`node tooling/create-world.mjs worlds/my-world --template expedition`, then the
Node commands in the created README. The directory is standalone and contains
facts, processes, assets, Temple execution, native effects, admission, tests and preview.
Publish its generated dist to the host you choose, with your own domain.

Choose `expedition` for the full reader/workshop, atlas and visits, microsites,
motion/media, claim review, Encounter, source inspection and checked filesystem
authoring. Omit the template flag for the small reading world. The full expedition
is the supported composition unit; isolated process modules are not packages.

All 36 initial feature modules have [concrete recipes](templates/features) binding
their actual implementation, input schemas, dependencies, grants, outputs,
correction paths and tests. [context/extraction.json](context/extraction.json)
records the complete source/runtime closure and successors. The initial 36-module,
327-query snapshot remains immutable in reference/algebra. The common contract
for new features is [templates/feature.json](templates/feature.json).

The [agent trial protocol](context/agent-trial-protocol.json) fixes the different-world
brief and acceptance criteria. [The trial](docs/trial.md) records the resulting
source changes, observed checks and browser journeys, with its evidence boundary.

For the hub: `npm run build`, `npm test`, `npm run dev`. Node equivalents are
`node tooling/build.mjs`, `node tooling/qualify.mjs`,
and `node tooling/serve.mjs`. The build retains the marketing introduction and
legacy URLs, generates documentation and runnable examples. Pages publishes dist.

The hub renderer is an explicit native publisher; the world templates execute
Temple algebra. The separate-agent trial tests transfer within this task/model
family. Human usability, full hub self-hosting and capabilities beyond the
bounded initial feature set remain separate questions.
