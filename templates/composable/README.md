# Your composed world

This directory contains only selected feature packs and their declared dependency closure. It has no inherited research corpus or art collection.

Run `node build.mjs`, `node --test build.test.mjs`, then `node serve.mjs`. Node 22+; no installation required.

Edit source/world.rel for identity, places, choices, attributed sources and FeatureBlock mounts. Edit source/presentation.rel for ordered CSS rules. Per-pack facts and modules are listed in source/composition.json; composition-receipt.json records selected inputs and hashes.

Place IDs are lowercase URL-safe identities. A Place has title, question, reading and optional source/choice relations. Sources have title, attribution, scope; Choices have label, target. FeatureBlock has feature, placement (home or a Place ID), and order (a unique positive integer within that placement; gaps are allowed). A pack needs a declared view to mount. One instance of each pack per placement avoids duplicate DOM IDs.

Reader search, private notes and visited trails use the new world's facts. Atlas optionally gives each Place x/y positions in its schematic SVG viewbox (800 by 300); its own runtime remembers visits, supports reset and previews pins on small screens. These local browser records are personal convenience, separate from authored source and evidence.

Microsite facts have title, description, reading and a unique route such as field-guide.html. Optional place relations make links. For source-tree projection, markup points to a node whose description is a JSON markup description; stylesheet points to a JSON CSS node with stylesheetRoute as its output. The selected microsites pack exposes source.markup, source.css and source.metadata for these projections. Metadata requires an explicit origin and metadata facts; it supplies no inherited identity.

Use the repository CLI with --replace to recompose a different feature selection while preserving selected owned facts/assets. Removed pack code,assets,navigation and grants do not remain in this world. Build receipts are observations, not truth certification or inverse edits.
