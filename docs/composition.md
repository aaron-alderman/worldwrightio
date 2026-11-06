# Choose features. Compose a world.

Worldwright packs are independently selected bundles of process algebra, source facts, assets and explicit permissions. A world does not need to copy the historical expedition. Dependencies are resolved before files are written; an unselected pack contributes no modules, assets, runtime or effect grants.

```sh
node tooling/compose-world.mjs worlds/my-world --features reader,sources,atlas
cd worlds/my-world
npm run build
npm run dev
```

The default selection is reader and sources. Core supplies the shell and source validation. Add only the features your purpose requires. The generated directory is standalone and has its own build, source files, engine and composition receipt. No repository checkout or parent template is needed at runtime.

| Pack | Purpose |
| --- | --- |
| core | World identity, page shell, ordered presentation, source validation |
| reader | Places, readings, choices and source references |
| sources | Attributed source catalogue and inspection |
| atlas | Spatial navigation through the selected world |
| microsites | Focused subworlds from owned source facts |
| authoring | Checked local source correction with revision and authority boundaries |
| inspector | Source lexing, presentation, exact text and digest inspection |
| workshop | Typed rule compilation, execution and patching |
| claims | Method-specific evidence review and refusal boundaries |
| programmes | Proposal, authority, revision, receipt, replay and tamper checks |
| models | Eight selectable numerical activity mechanisms |
| activities | Stateful choices, revisions, decks, rules, memory and code exercises |
| media | Playback, seek, fallback and source provenance mechanisms |
| motion | Canvas rendering, animation control and reduced motion policy |

## Compose inside a page

FeatureBlock facts choose a selected pack's view and its placement. The shell assembles the views through algebra; there is no feature-specific JavaScript page assembler.

```text
("signal-player", "isa", "FeatureBlock")
("signal-player", "feature", "media")
("signal-player", "placement", "signals")
("signal-player", "order", "1")
```

Use `home` for the world introduction or a Place identifier for its reading. Each placement has unique positive numeric order values; gaps let features be removed without renumbering the others. Unselected or non-renderable features, unknown places and duplicate mounts refuse. A selected feature can also have its own route. Pack runtime boot queries ignore pages without their mount.

## Content, configuration and presentation

Author the world in `source/world.rel`, styles in `source/presentation.rel`, and optional pack configuration in its source file. The examples use a profile to replace those files while retaining the reusable implementations. A profile file declares its owning pack, input path, output path and kind; files belonging to unselected owners are skipped.

```sh
node tooling/compose-world.mjs worlds/tidepool --profile examples/tidepool/profile.json
```

Read each selected `packs/PACK/README.md` and `pack.json` before using advanced queries. The composition receipt lists requested and resolved features, exact file digests, modules, assets, permissions and output owners. The Temple seed and 20-million-step execution budget remain explicit. Semantic and presentation policy stays in facts and process algebra; native adapters supply filesystem, browser, media and cryptographic mechanisms.

The original 36-module snapshot and whole-expedition recipes remain attributed historical references. They are not the files copied by the pack composer. The current coverage record distinguishes retained operations, new presentations and boundaries; a new demo alone is not proof of full behavioral equivalence.
