# Coastal model bench

Select with --features models. Dependencies are resolved from pack.json; unselected packs are not copied. source/models.rel owns the configuration JSON. models.view is a reusable HTML projection; add a FeatureBlock with feature models and placement home or a Place identity. One mount per feature per page. models.boot installs the admitted runtime only when that mount exists. Runtime and build retain the 20,000,000 step ceiling.

The configuration contains `scope`, `cellPattern` (sixteen numerical cells) and `scenarios: [{id, title, input}]`. Scenario inputs are ordinary JSON arrays/objects. The select control fills the selected source-owned recipe before evaluation.

`models.evaluate` takes `{id, input}`. The eight retained mechanisms are `calibration` (`angle`), `pairs` (`value`, `mode`), `inflate` (`step`), `decode` (`bits`), `weights` (`percent`), `memory` (`coupled`), `line` (`samples`, `coordinate`) and `coarse` (`block`). The source pack labels these as mathematical coastal training scenarios. They are not field measurements or validated environmental models. Unknown model IDs refuse before invoking a query.

Validation: `node --test tooling/interactive-packs.test.mjs` executes all eight source recipes and checks known calibration/decoder results and unknown-model refusal. The optional `activities` pack composes these same mechanisms with finite controls and observable state.
