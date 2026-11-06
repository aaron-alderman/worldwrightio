# Build a world with Worldwright

Read README.md, docs/operating-model.md, context/operating-model.json, docs/composition.md, docs/start.md and the selected packs' pack.json and README.md.

For user onboarding, read docs/bring-your-own-agent.md. Keep guidance tool-neutral, distinguish read-only access from coding permissions, explain canonical source and backup/recomposition boundaries, and use bounded tasks and real usage measurements to help users control costs. This is free documentation, not a managed-service or new-feature launch.

Worldwright's operating model is free software and content under the applicable licenses, paid hands-on setup/installation and in-person training, and voluntary fair contributions (including suggested tithing). Training material remains free. Help people learn to bring and manage their own agent and reduce their costs. Contributions are voluntary and separate from fees for agreed human work. This model does not authorize paywalls, subscriptions, compulsory tithing, unlimited subsidized compute, or a hosted-service launch. No new features are requested at this stage; preserve that boundary until a subsequent request.

- Start with the person's purpose and content. Do not inherit Aaron's corpus or identity.
- Use node tooling/compose-world.mjs DEST --features reader,sources,atlas. Omit --features for reader and sources. Use --profile examples/tidepool/profile.json to reproduce the kitchen sink.
- Compose views through FeatureBlock facts in source/world.rel. Dependencies, admission, ownership and explicit effects must remain checked.
- Source profiles declare owners; unselected owners contribute no files. Generated worlds include a composition receipt.
- Run npm run build in the generated world. Check the relevant substantive operations and refusal paths; a navigation card is not feature coverage.
- Semantic and presentation policy belongs in process algebra and facts. Native adapters supply mechanisms only. Keep the existing Temple seed and 20,000,000-step limit.
- Never edit generated dist or make it an authoring source. Preserve exact source/digest inspection and attribution.
- Historical whole-template code and reference snapshots are retained for provenance. They are not the default creation path.
- No universal inverse editing, human usability or scientific validation is implied by software checks. Record failures and evidence-family boundaries.
- Forks choose their own origin, identity and host configuration. The generated base contains no CNAME, Git history, hosting account or credentials.

The hub is built by npm run build and qualified by npm test. GitHub Pages publishes dist after checks pass.
