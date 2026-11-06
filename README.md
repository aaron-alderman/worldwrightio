# Worldwright

Make a body of work into a world people can explore. Worldwright.io begins with
the introduction and continues as the documentation and agent context hub for
building your own. Aaron Alderman’s site is the initial personal implementation.

Give your agent this repository and [AGENTS.md](AGENTS.md). Read
[the guide](docs/start.md), [architecture](docs/architecture.md),
[lightning path](docs/lightning.md) and [feature catalogue](context/features.json).

```sh
git clone https://github.com/aaron-alderman/worldwrightio.git
cd worldwrightio
npm run new -- worlds/my-world
cd worlds/my-world
npm run build
npm test
npm run dev
```

Node 22 or later; no package installation. The created world is standalone and
contains facts, processes, Temple execution, admission, tests and preview.
Publish its generated dist to the host you choose, with your own domain.

The core demonstrates attributed readings, places, choices, ordered styles,
source disclosure and receipt-bearing execution. [templates/feature.json](templates/feature.json)
is the common extension contract. All 36 algebra modules and 327 queries from
the initial personal expedition are preserved under reference/algebra with
hashes, calls, ports and extraction status. Richer modules need their facts,
assets, dependencies and tests before they are portable.

For the hub: `npm run build`, `npm test`, `npm run dev`. The build retains the
marketing introduction and legacy explanatory URLs, generates documentation and
mounts the runnable starter at examples/first-world. Pages publishes only dist.

The hub renderer is an explicit native publisher; the starter executes Temple
algebra. Local checks form one evidence family. Independent onboarding, full
hub self-hosting and universal feature portability remain open.
