# Notebook workshop

Select with --features workshop. Dependencies are resolved from pack.json; unselected packs are not copied. source/workshop.rel owns the configuration JSON. workshop.view is a reusable HTML projection; add a FeatureBlock with feature workshop and placement home or a Place identity. One mount per feature per page. workshop.boot installs the admitted runtime only when that mount exists. Runtime and build retain the 20,000,000 step ceiling.

The configuration contains `inputs: {codeText, factText, contractText, definitions, primitives, profile}` and the inspector's `presentation` policy. The default `ShoreNote` is a fictional inlet notebook. The actual extracted `ec.prepare`, `ec.run`, `ec.patch` compiler/type/runtime engines remain executable; the input text, contracts, labels and notebook views are new.

`session.snapshot` accepts `{candidate, revision, receipt}`. `session.change` accepts `{snapshot, request: {revision, kind, value}}`; `kind` is `title` for the shared source owner or `web-label` for the field-menu overlay. Undeclared routes, incorrect types, empty constrained fields and stale revisions refuse. A shared edit changes the fact owner; an overlay edit changes its declaration and preserves the source fact. `workshop.dispatch` runs a representation action from the checked typed module and validates its output tree and declared events.

The live view offers the simple source-title edit, the explicit source/overlay editor, stale-request exercise, typed notebook action, and inspection of current declarations/facts/contracts/process definitions. Inspection preserves exact text and digests and is not an execution trace. Edits remain in the current browser session and can be reset. No general inverse is claimed beyond the declared routes.

Validation: `node --test tooling/interactive-packs.test.mjs` checks actual compilation, source/overlay separation, output actions, type refusals and stale-candidate preservation through the unchanged kernel.
