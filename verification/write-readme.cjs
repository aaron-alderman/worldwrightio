require('node:fs').writeFileSync('README.md',`# Worldwright

One application: the reader, guided journey, live Encounter example, lightning
explanation, printable diagrams and source inspector share a shell, route model
and source-presentation service. One editing session survives navigation.
Reloading starts a fresh candidate.

## Owners and build

source/application.json declares purpose, navigation, journey, scene/view routes,
service lifetime and compatibility destinations. algebra/application.process.json
derives their runtime composition and selects view cross-sections. Reader and
workspace output are regenerated from typed programme, composition and style
definitions through the same projection algebra. No build reads dist, verification
references, external repositories, node_modules or an authored MJS module tree.

Run node bootstrap/build.cjs, then node bootstrap/check.cjs. The test command is
listed in package.json. node serve.mjs opens the local preview server.

The guard compares declared input and output hashes, rejects unexpected files
and refuses to conceal output edits. Explicit --repair-output rebuilds retain
the previous output locally. Builds stage before replacing the accepted directory.

## Boundaries

The seed and native invocation bodies are unchanged. Projection stays within
20 million ticks. Native mechanisms supply filesystem, DOM lifetime, events,
imports and print transport. Existing algebra owns presentation, typing, language
lowering, patching, debugger instrumentation and application view decisions.

Programme JSON is a typed backend IR, not the final humane Encounter language.
The reader retains ECMAScript-style template expressions in that IR. Richer domain
decomposition remains future work. The live example is an explanatory fixture,
not a complete mainframe or authoring bootstrap. Read-only source inspection is
distinct from debugging execution and from editing a session candidate.

The former side-by-side publisher and nested application are retired. Old URLs
redirect into this application. Historical sources remain in Git history.
Local tests form one evidence family; they are not independent verification or
protected CI. The published Site remains owner-only.
`);
