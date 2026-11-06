# Worldwright

Build a world from your own meaning and content. The introduction lives at [worldwright.io](https://worldwright.io); the repository is the documentation and agent context hub.

Select individually reusable packs instead of copying the historical expedition:

```sh
node tooling/compose-world.mjs worlds/my-world --features reader,sources,atlas
cd worlds/my-world
npm run build
npm run dev
```

Start with [the composition guide](docs/composition.md). Each pack owns its process algebra, configuration, assets, dependencies, output paths and explicit effect grants. FeatureBlock facts mount selected views inside readings or on the introduction. The composer resolves dependencies, refuses conflicts and produces a source receipt. Generated worlds are standalone.

[Explore Tidepool](https://worldwright.io/examples/tidepool/index.html): an original fictional field-station notebook exercising all packs, with original diagrams and observations. [Explore the pocket example](https://worldwright.io/examples/pocket/index.html) for reader and sources alone.

```sh
node tooling/compose-world.mjs worlds/tidepool --profile examples/tidepool/profile.json
```

Canonical world content is in source/world.rel, presentation in source/presentation.rel and selected pack configuration in its owned source files. Never edit dist. Meaning, rules and presentation remain in facts and process algebra; native adapters provide mechanisms. The original Temple seed and bounded execution remain explicit.

The immutable reference/algebra and templates/expedition preserve the original extraction and its attribution. New composed worlds do not copy its corpus, media or personal identity. See context/composition-coverage.json for current capabilities and evidence boundaries. Earlier trial receipts describe earlier whole-template trials, not the new pack trial.

Maintainers: npm run build builds the documentation hub and examples; npm test qualifies the generated output. GitHub Pages publishes dist after checks pass.

Repository care: [licensing](LICENSE.md), [Christian stewardship covenant](CHRISTIAN_STEWARDSHIP_COVENANT.md), and [source/evidence hygiene](STEWARDSHIP.md).
