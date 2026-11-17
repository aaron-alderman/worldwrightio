# One Worldwright application

Encounter is Worldwright's live explanation/authoring view. Do not create a
second application, independent navigation, session, inspector or renderer.

- Edit `source/` and `algebra/`. Never edit `dist/` or import it as build input.
- `source/application.encounter` owns navigation, routes, journey, views, session and
  compatibility destinations. `algebra/application.encounter` composes them.
  The build generates the application definition JSON and retains Encounter
  source spans. Keep the ordered JSON compatibility projections of build
  and inspection definitions in sync with their Encounter authorities.
- Edit page trees in `source/pages/**/*.page.encounter`. The typed node graphs
  and their derivation maps are generated.
- Edit styles in `source/styles/**/*.style.encounter`. Generated graphs preserve
  CSS rule and declaration order.
- Edit browser programme trees and fragments in `source/programs/`. The build
  generates their typed graphs.
- Typed programme/composition/style definitions are a backend IR, not the final
  humane Encounter language or complete domain decomposition of reader templates.
- The Temple seed is unchanged. Keep its 20-million execution budget. Native
  ports supply mechanisms; selection and presentation policy belong to algebra.
- Build: `node bootstrap/build.cjs`. Verify: `node bootstrap/check.cjs`.
  `package.json` lists supported tests. No build reads a verification reference.
- The build refuses output drift. `--repair-output` is explicit recovery and
  retains the prior output under `.build-history/`. Diagnose before using it.
- Legacy URLs enter the same root application. They must not regain independent
  startup scripts. Session edits reset on reload and never rewrite the repository.
- Source inspection is read-only. A static source definition is distinct from a
  live candidate or execution trace. Do not claim agreement between them.
- Preserve all reader material, the Site ID, owner-only audience and newer remote
  changes. Retired sources remain in Git history. `.retired/` is local recovery.
- Local guards are not protected CI or independent verification.
- Each output must be planned by `provenance.plan` before acceptance. Never
  assign an unexpected emitted file to a generic inspection owner.
- `presentation/style.css` comes solely from the source-presentation policy and
  `sp.stylePlan`; no authored stylesheet IR may compete with that producer.
- Provenance selection, rendering attribution, source-pointer validation and
  inspector links belong in `algebra/provenance.encounter`. Native code may
  observe bytes/JSON coordinates and invoke/store the returned records.
- Do not infer inverse edits from provenance. Keep character maps, byte copies
  and declared-dependency/native boundaries distinct in the index and receipts.
