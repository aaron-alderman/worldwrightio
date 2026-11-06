# A different world, built from the repository

Tidepool Commons is now a working seven-place world, created by a separately assigned agent from the final repository snapshot. Its six canonical content files differ from the full expedition template. Its process modules and native mechanisms match the template exactly.

[Explore Tidepool Commons](../examples/tidepool/index.html) · [Read the full trial report](../evidence/onboarding/trial-report.json) · [Inspect the source overlay](../example-sources/tidepool/example.json)

![The completed Tidepool Commons homepage](../evidence/onboarding/screenshots/completed-home.png)

The onboarding trial asks a separately assigned agent to create Tidepool Commons: a fictional coastal learning world for curious newcomers. It must have six to eight primary places, a different identity and purpose, new readings, regions, gateways, atlas positions and source notes.

The agent receives a source-only repository snapshot and the brief, with no parent conversation or access to the original personal implementation as an input. The template's attributed educational subsystems may remain; Aaron's personal accounts must not become the fictional author's history.

## Acceptance fixed before the build

context/agent-trial-protocol.json records the brief, isolation rule and acceptance criteria. They include source authoring, a standalone build, the template suite, accepted and refused edits, stable native mechanisms and browser journeys through the main feature families.

## Evidence boundaries

Compilation and admission show that the declared programmes and effects can be materialized. Headless behavioral suites exercise finite inputs and refusal boundaries. Browser observations cover actual rendered journeys. The separate agent's source edits test transfer through the repository handoff.

These are distinct observations within this software task. A separate same-model agent does not supply independent human usability evidence or scientific validation. The trial record must retain failed attempts, repository fixes, unobserved behaviors and the narrow conclusions supported.

## What actually passed

| Surface | Observed result |
| --- | --- |
| Repository handoff | Final snapshot verified 447 of 447 source files; a fresh CLI creation reused the template without process or native edits. |
| Authored world | Seven original coastal readings, three territories and gateways, explicit exercises, fictional source notes and world-specific storage namespaces. |
| Supported suite | 60 tests passed, zero failed, including copied-world native authoring. |
| Accepted-world source edit | Direct CLI preview and apply each ran a real build and 59 portable checks. Stale and invalid proposals refused while preserving accepted source. |
| Reading and map | All seven routes and exercises opened; atlas reached 7/7 visits and reset to 0/7; configured Browse target worked. |
| Reader | Search stayed in reader.html, notes retained fictional attribution and cleared old search status, workshop return reached the reader home. |
| Encounter and workshop | Title and local-label edits behaved separately; empty input refused; reset preserved the declared source boundary. Workshop presentation loaded. |
| Claim review and programme | Removing retracted evidence changed the review outcome; the lamp programme accepted a proposal and produced its witness. |
| Media and motion | Video decoded and advanced, seeking and mute changed actual media state, and the procedural canvases rendered. Audible quality was not assessed. |
| Preservation | Native mechanisms, authoring host and 20-million-step execution limit remained unchanged through the trial. |

Skip-link route preservation was observed; the final agent did not confirm focus transfer. Console observer errors lacked a source attribution and are retained in the report without assigning them to the application. These observations are not silently converted into passes.

## The failures improved the shared template

The trial and its follow-up checks exposed an undocumented tooltip field, fixed personal hero text and monograms, an original-territory anchor, unconditional missing activity frames, resource declarations coupled to the replaceable graph, base-sensitive reader links, context/original-author attribution, and original gateway fragments. The shared template was repaired. Source-owned capability links and a mistaken reader URL were adapted as world content.

The final recreation used the repaired repository through the same CLI and reapplied content only. Earlier reports, source manifests and the exact framework repair chain remain available. The early archived-resource alarm was a checker error from ignoring an HTML base; that correction is also recorded separately from the genuine reader navigation defect.

[Initial failed attempt](../evidence/onboarding/attempt-1.json) · [Final source snapshot](../evidence/onboarding/snapshot-final.json) · [Framework repair hashes](../evidence/framework/post-snapshot-repair.json) · [Reversible repair diff](../evidence/framework/extraction-repairs.patch) · [Final world build receipt](../evidence/onboarding/final-world-build-receipt.json)

## Reproduce it from this repository

```sh
node tooling/create-example.mjs tidepool worlds/tidepool
cd worlds/tidepool
node build.mjs
node --test template.test.mjs authoring-native.test.mjs
node serve.mjs
```

The example recipe verifies each template predecessor hash before applying six source replacements. It supplies no native or process patch. The project build uses this same path to produce the hosted example; it does not publish a manually edited dist directory.
