# Atlas

Requires reader, which requires core. It uses the same Place IDs/title/question and optional x/y layout coordinates in an 800 by 300 schematic SVG viewbox. These are editorial coordinates, not geographic claims.

atlas.view returns an initial HTML tree. The actual reusable atlas-journey library supplies cleaned browser-local visit storage, progress/reset, keyboard/pointer preview, small-screen pin preview and history resume. Runtime data is derived from the new world's Place facts; no inherited place identities or storage key is used.

The atlas runtime runs on selected world pages to mark visits, with its own atlasBrowser grant profile. Without the atlas pack there are no atlas modules, output, assets or browser grants.
