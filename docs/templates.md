# Template recipes

Choose the composition that fits the work. Both templates are standalone directories with owned sources, a build, tests and a preview. Neither inherits the project hub's hosting configuration.

## A small reading world

```sh
node tooling/create-world.mjs worlds/my-reader --template world
```

The small world demonstrates places, choices, attributed sources, ordered presentation, source snapshots and build receipts. Edit source/world.rel, source/presentation.rel and algebra/world.process.json. It is useful when the work needs a clear reading path without the larger interactive environment.

## A full expedition

```sh
node tooling/create-world.mjs worlds/my-expedition --template expedition
```

The full expedition includes the current reader and workshop, atlas and remembered visits, microsite composition, media and motion, claim review, source presentation, Encounter contracts and checked edits, and repository source authoring. Read its README and the concrete feature contracts before changing its source facts.

The initial world was a forty-place personal expedition. Its place count and personal framing are not universal requirements. A new author supplies their own identity, purpose, regions, places, routes, readings, source notes and atlas positions. Required resources live in source/assets.rel rather than the replaceable world graph. An explicit optional Place.activity reference selects a declared exercise. Reused demonstration content stays attributed and separate from the new author's claims.

## A feature recipe is more than its module

Each recipe identifies the actual implementation, required facts, call closure, dynamic dispatch, granted effects, output surfaces, correction ownership and checks. The complete expedition is the runnable installation unit; the recipe explains a feature within that composition. It does not suggest that copying an isolated process file supplies its host or dependencies.

## Verify your changes

Run the created world's build and template suite. Use its source-proposal workflow for coordinated canonical edits. Test both an accepted change and a refusal, then check that unrelated content and native mechanisms remain stable. Browser behavior requires browser observation in addition to a successful build or headless effect fixture.

The project-level extraction verifier checks the recipe and dependency correspondence. The separate-agent trial exercises whether the repository instructions are sufficient to create a different world.
