# Build a world with Worldwright

Read README.md, docs/start.md, docs/templates.md, docs/architecture.md and context/features.json.
Start with the person's purpose and content. Aaron's expedition is the initial
implementation, not another person's identity, evidence or required subject matter.

- Create the full template: `npm run new -- worlds/my-world --template expedition`.
  Omit --template expedition for the small reader. Node-only equivalent:
  `node tooling/create-world.mjs worlds/my-world --template expedition`.
- In that directory: `npm run build`, `npm test`, `npm run dev`.
- Read the selected template's README and AGENTS for its canonical source schema.
  The full expedition owns identity in source/world.rel, places/readings in
  source/expedition.rel, atlas in source/atlas.rel and doors in source/gateway.rel.
- Read templates/feature.json before adding a feature. Name its types, owners,
  dependencies, effects, projection, correction path and decisive refusal test.
- The unchanged Temple seed supplies execution. Native adapters supply mechanisms;
  semantic and presentation policy belongs in process modules and facts.
- Never edit generated dist or turn output into a second authoring source.
- Keep the existing 20,000,000-step execution limit and admission checks.
- reference/algebra is the immutable initial snapshot. Runnable implementations
  and their complete input/native closure are in templates/expedition. Concrete
  recipes in templates/features map each initial feature to its actual owners,
  types, dependencies, grants, outputs and tests. The full expedition is the
  supported composition unit; individual JSON modules require their closure.
- No universal inverse editing is promised. A readable source copy is not an
  execution trace. A successful build is not scientific or independent validation.
- Keep claims, examples, personal accounts and evidence separate. Preserve source
  attribution and alternatives when a lightning link fails.
- Before publishing a fork, choose its own origin, identity and host configuration.
  The generated starter contains no CNAME, hosting ID, Git history or credentials.

The hub is built by `npm run build`; `npm test` checks reproducibility, refusals,
standalone creation, source fidelity and the bounded lightning contract.
The extraction verifier and a separately assigned agent trial supply additional
feature and onboarding evidence, with exact scope recorded in context/.
GitHub Pages publishes only dist after those checks pass.
