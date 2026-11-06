# Independent agent composition trial

The QA agent was asked to build a different small world from the repository, selecting only reader, source attribution and evidence review. It authored this fictional night seed library, its two scenes, two source records, contrasting review records and a new vector cabinet illustration. It selected `reader,sources,claims`; no atlas, workshop, media, motion or programme was requested.

Reproduce from the repository root:

```sh
node tooling/compose-world.mjs .build/composition-qa/seed-library --profile examples/seed-library/profile.json
cd .build/composition-qa/seed-library
node build.mjs
node ../../../tooling/verify-composition.mjs . --creation-hashes
```

The trial uses the local source checkout and the published composition contract. It is a separate implementation/audit agent in the same session and model family, not an externally recruited independent evaluator. Headless runtime actions and filesystem/resource audits are separate from browser visual verification. The generated result and exact hashes are recorded under `evidence/composition/` when qualification runs.
