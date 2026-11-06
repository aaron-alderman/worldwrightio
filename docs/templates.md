# Reusable compositions

Use the pack composer for a new world. Features are individually selected, their dependencies resolved and their views optionally mounted inside the world's pages. The default is reader and sources. Read [the composition guide](composition.html).

```sh
node tooling/compose-world.mjs worlds/guide --features reader,sources
node tooling/compose-world.mjs worlds/map --features reader,atlas
node tooling/compose-world.mjs worlds/lab --features workshop,inspector
node tooling/compose-world.mjs worlds/tidepool --profile examples/tidepool/profile.json
```

Tidepool selects all available packs. It supplies original fictional field notes, a coastal chart, a synthetic film and a paper-and-ink presentation. Its claims and programme scenarios concern observations and shared survey equipment. The examples do not reuse Aaron's personal corpus or expedition art.

Each pack descriptor declares owned modules, source files, assets, dependencies, permissions and outputs. A profile replaces canonical files by owner; selecting fewer features skips other owners. FeatureBlock facts assemble selected views in page order. Unknown features, dependency cycles, conflicting owners and invalid mounts refuse before publication.

The old small reader and full-expedition templates remain in Git for historical compatibility. The original 36 source-module recipes describe that earlier extraction. They are attributed references rather than independently installable packs.
