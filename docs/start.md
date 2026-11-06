# Make your world

Tell your agent the purpose, audience, material and the few experiences that will help a reader. Point it at this repository and AGENTS.md. Choose packs from the composition guide.

```sh
node tooling/compose-world.mjs worlds/my-world --features reader,sources,atlas
cd worlds/my-world
npm run build
npm run dev
```

Edit source/world.rel for your title, purpose, places, choices and attributed sources. Edit source/presentation.rel for ordered style rules. Read selected pack READMEs before changing their source configuration.

The generated world is standalone. Inspect composition-receipt.json for exact selected inputs and permissions and dist/build-receipt.json for its build. Check both a successful interaction and a meaningful refusal for each selected feature.

Use [the composition guide](composition.html) for feature selection, page mounts and profiles. Use [Tidepool](../examples/tidepool/index.html) as an original kitchen sink, or [the pocket world](../examples/pocket/index.html) as a small starting point.
