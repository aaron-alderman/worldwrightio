# Tidepool: the common field station

An original fictional field notebook and kitchen sink for Worldwright's feature packs. Its seven readings, coastal chart, synthetic waterline film and paper-and-ink design are new example material, not a copy of Aaron Alderman's corpus or expedition art. The text and diagrams are CC0. The observations and mathematical scenarios are illustrations, not ecological findings.

```sh
node tooling/compose-world.mjs worlds/tidepool --profile examples/tidepool/profile.json
cd worlds/tidepool
npm run build
npm test
npm run dev
```

The profile selects every pack. It supplies identity, content and styles as core-owned files, and each interactive configuration and FeatureBlock mount under its selected pack owner. Media and motion share the signals reading; the workshop and inspector share the notebook; evidence review, programmes, models and activities sit beside the readings they help explain. Features also have their own routes.

Try a smaller version with `--features reader,sources,claims` after the profile argument. The composer skips unselected owners and their mounts. Use `--replace` only for a previously composed directory; selected authored source and custom assets are retained, and removed feature code, assets and permissions are dropped.

The media pack includes the original MP4 and chart poster. The maintainer-only `tooling/render-tide-study.py` can regenerate the schematic with Pillow and ffmpeg; generated worlds require neither dependency.

Read the selected pack README for advanced query APIs and DOM hook contracts. A kitchen sink demonstrates feature families; it does not claim every possible input or visual configuration has been tested.
