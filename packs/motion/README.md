# Procedural motion template API

Select `motion` for the new schematic experience and the advanced procedural graphics library. `motion.boot` runs only the schematic; the advanced roots are also admitted into the emitted `motion-runtime.js` model and can be bound by the consumer's process source.

- `motion.scroll.*`: chapter observation, accessible contents navigation, keyboard escape, call-to-action and expanded marker captions.
- `motion.flood.*`: deterministic seeded scatter, wave paths, drifter poses, scroll progression and frame rendering. `motion.flood.wave` takes `{baseY,amp,len,phase,time}` and returns an SVG path. A consumer supplies its own SVG `#drifter` symbol and `#flood-drifters` layer.
- `motion.chapter.*`: chapter reveal, reading progress, follow navigation and reduced-motion mode.
- `motion.sky.*`: seeded stars/motes, twinkle, parallax, respawn, resize and frame scheduling. `motion.sky.plan` takes `{size,stars,motes,time,scroll,still}` and returns drawing commands plus updated motes. Canvas hook: `#sky`.
- `motion.constellation.*`: configurable state-to-drawing projection, sparks/rings, visibility scheduling and resize. `motion.constellation.plan` takes `{size,sparks,rings,nextSpark,time,still}`. Canvas hook: `#constellation`; `.marker` draws a generic marker glyph.
- `motion.autoplay.*`: visibility-aware native video playback and user toggle.

These are reusable algebra/query templates, including their DOM hook contracts. Consumers can supply new markup and change selectors in source. No predecessor art, film, story text or project demonstrations are included. The accompanying tests cover deterministic wave projection and both reduced-motion canvas roots refusing frame/timer scheduling. Browser layout and visual taste are separate checks.
