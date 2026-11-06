# Source inspector

Select with --features inspector. Dependencies are resolved from pack.json; unselected packs are not copied. source/inspector.rel owns the configuration JSON. inspector.view is a reusable HTML projection; add a FeatureBlock with feature inspector and placement home or a Place identity. One mount per feature per page. inspector.boot installs the admitted runtime only when that mount exists. Runtime and build retain the 20,000,000 step ceiling.

The configuration contains `text`, `file`, `language` and `presentation: {spPolicy, spGrammar, lexPolicy, lexGrammar}`. `inspector.present` takes `{text, file, language}` and returns the real extracted highlighter's tree/metadata plus the SHA-256 digest. The default sample is a new fictional notebook record. File aliases point to notebook sources, not the initial corpus.

The pack also owns the reusable source lexer/REL encoding/patch helpers consumed by the workshop. `inspector.change` renders the current editor value through the same highlighter, exact source fidelity, origin metadata and digest policy. The view is a source projection, not a runtime trace; a digest identifies bytes and does not establish that a claim is true.

Validation: `node --test tooling/interactive-packs.test.mjs` checks the real boot/change path, escaped highlighted output, exact reconstructed text and the digest.
