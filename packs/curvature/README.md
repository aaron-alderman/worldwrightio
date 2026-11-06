# Experiential curvature

An optional, source-defined composition of colours, shapes, mood, chrome, illustrative imagery, motion and invitations. It requires only `core`; it does not import the expedition, its corpus, artwork, identity switch or personal roles.

Compose with `node tooling/compose-world.mjs DEST --features reader,curvature`. Open `curvature.html`, or mount its `curvature.view` through an ordinary FeatureBlock on any page. The runtime applies selected presentation tokens throughout the world and keeps browser choices across navigation. Page controls are bound only when mounted. Without JavaScript the authored scene, links, sources and reading remain available.

Edit `source/curvature.rel`. Its JSON configuration declares `dimensions`, `presets`, `defaultPreset` and a world-specific `storageKey`. Each dimension has a unique `id`, a `label`, a `kind`, and named `options`. Every option declares `tokens: [{name,value}]`. Tokens use the `--ww-` namespace and have exactly one dimension owner. Preset selections are `{dimension,option}` pairs with exactly one choice for every included dimension. A custom change replaces one pair; validation completes before state or DOM effects change.

The kinds are small independent mechanisms:

- `tokens`: palette, geometry and framing through authored CSS variables.
- `mood`: tokens plus `heading` and `description` for the scene’s invitation.
- `image`: `src`, `alt`, `caption`; use a composition-owned `assets/` image or the empty string for an explicit image-free option. Only the selected image loads. Image ownership is checked at build time.
- `motion`: tokens controlling the decorative tidal layers plus a boolean `moving` declaration. The scene has a pause control, stops while hidden, and respects changes to reduced-motion preferences. It runs no frame loop or network requests. This is independent of the optional motion instrument pack.
- `action`: `href` and `description`; the option label becomes a real local navigation link, usable without JavaScript. Provide actual routes belonging to the selected packs.

Use any subset: remove unwanted dimensions and their selection pairs from every preset. No other pack is required. Omitted imagery downloads nothing; omitted mood or action uses the generic title/introduction or the composition-details link. The supplied stylesheet has independent fallback values. Add your own namespaced tokens and CSS in source to extend the vocabulary. Different dimensions may not overwrite each other’s tokens. Keep at most one of each specialised kind (`mood`, `image`, `motion`, `action`) per composition.

Artwork belongs to the world profile, not this pack. Declare extra asset files with owner `curvature`; removing this pack also removes its owned assets, runtime, stylesheet, grants and scene. Tidepool demonstrates two original HD illustrations with prompt/provenance receipts, independent layer controls and three composed approaches. Its illustrations are not scientific evidence.

Put optional mount facts in `source/curvature.rel` when they should disappear with this pack. A mount written into a retained core source remains that source owner's responsibility and will correctly refuse if its feature is removed. Tidepool's home mount is curvature-owned, so its kitchen-sink-to-small-reader recomposition needs no manual core edits.

Scope: this is concrete visual and journey composition, not a universal curvature calculus, an authoring GUI or a claim of complete equivalence with Aaron’s initial world. Existing media, procedural motion and stateful activity packs remain separately selectable.
