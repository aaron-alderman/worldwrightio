# Media template API

Select `media` to obtain the source-owned player and the advanced streaming library. The main experience boots `media.boot`; advanced entry points are admitted into the same `media-runtime.js` model without automatically running them.

`media.stream.seek.click` takes `{video: {handle}, matched: {attributes: {"data-seek": "18.8"}}}`. Bind `loadedmetadata` to `media.stream.seek.loaded` with the same video reference. Its state machine waits for metadata, tests inclusive seekable ranges, falls back to an object URL when necessary, then seeks and plays. `media.stream.seek.contains` takes `{ranges: [[start,end]], time}` and returns a boolean. `media.stream.seek.prepare` and `.finish` expose the individual stages. Native media/asset effects must come from the declared browser profile; this library does not fetch arbitrary code.

`media.stream.screens.init`, `.sync` and `.intersection` bind screen visibility and sound controls. `media.stream.sound.toggle` and `.sync` accept video/sound references. `media.stream.provenance` reads a sibling `manifest.json`; `.provenance.view` accepts `{manifest}` and returns escaped HTML. The manifest is supplied by the new world's author. No original film, screenshots or provenance records are included.

DOM hooks are template contracts: inspect each query's `browser.select`, `browser.relative` and event descriptors when composing a different player layout. These selectors and labels are ordinary source-editable process definitions. Headless tests in `tooling/composition.test.mjs` verify endpoint ranges and metadata/blob transitions; actual playback still requires browser verification.
