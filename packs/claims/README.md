# Evidence review

Select with --features claims. Dependencies are resolved from pack.json; unselected packs are not copied. source/claims.rel owns the configuration JSON. claims.view is a reusable HTML projection; add a FeatureBlock with feature claims and placement home or a Place identity. One mount per feature per page. claims.boot installs the admitted runtime only when that mount exists. Runtime and build retain the 20,000,000 step ceiling.

The configuration contains `claim`, `scope`, `evidence` and `methods`. Evidence has `id`, `name`, `direction` (`Supports` or `Challenges`), `sourceActor`, `sourceIndependent` (`"true"` or `"false"`) and the fields named by method conditions. A method has `id`, `name`, `minimum`, `thresholdUnits` and an ordered `rules` list. Each rule has `conditions: [{field, expected}]`, `weight`, `units` and `reason`.

`claims.evaluate` takes `{selected: [evidenceId, ...]}` and executes the extracted finite review algebra. First matching rules govern admission, distinct independent sources govern the minimum, and support/challenge thresholds produce Accepted, Rejected, Conflicted or Undecided. This is a declared review policy, not scientific verification. The default claim and observations are fictional training inputs. The view projects readable method outcomes, per-observation admission reasons and an optional exact receipt.

Validation: `node --test tooling/interactive-packs.test.mjs` checks conflict, threshold differences, source independence and the real browser controller projection.
