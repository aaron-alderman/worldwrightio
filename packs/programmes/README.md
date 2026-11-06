# Instrument lending

Select with --features programmes. Dependencies are resolved from pack.json; unselected packs are not copied. source/programmes.rel owns the configuration JSON. programmes.view is a reusable HTML projection; add a FeatureBlock with feature programmes and placement home or a Place identity. One mount per feature per page. programmes.boot installs the admitted runtime only when that mount exists. Runtime and build retain the 20,000,000 step ceiling.

The configuration contains `title`, `scope`, `initial: {available, revision}`, `member`, `cellConfiguration` and `draftConfiguration`. The initial availability is also the lending capacity. Identity choices, cell presets, predicates and drafting templates come from that configuration. All examples are fictional; no real booking, message or deployment occurs.

`programmes.propose` accepts `{current, proposal: {actor, action, requestId, basis}}`. Only the configured member may `lend` or `return`; stale roots, duplicate requests and capacity violations refuse before changing accepted state. `programmes.witness` replays receipts and checks the accepted state, requests, root and ordered Merkle commitment.

The independent cell-world API is `programmes.cellInitial`, `programmes.cellPreview`, `programmes.cellPropose`, `programmes.cellReplay` and `programmes.cellForge`. It retains the extracted bounded predicate evaluator, canonical cell addresses, read/consume/create context, Merkle roots, witness chain, replay and forged-history verification. Preview does not commit. `programmes.admissionView` projects the six admission stages; `ui.cells.tree/treeY` supplies the reusable Merkle layout.

`programmes.draft` uses source-owned pattern/template rules. The `draft.decide`, `draft.verify` and `draft.tamper` library queries preserve explicit human verdicts and independently recomputed witness links. The default view exposes these as a separate training workflow.

Pure engines are derived from the initial Worldwright extraction; the equipment-cell policy, lending workflow and drafting examples are independently authored or adapted with neutral inputs. Native adapters provide JSON, hashing, arithmetic and DOM effects; source processes own admission, decisions, state updates and projection. A source hash identifies bytes; it does not verify a claim. Session edits are local and resettable. This pack groups related programme mechanisms; it is not a transaction service or durable multi-user ledger.

Validation: `node --test tooling/interactive-packs.test.mjs` from the repository project checks positive proposals, source preservation on refusal, noncommitting preview, replay, original cell-engine forgery rejection and witness tamper boundaries through the unchanged kernel.
