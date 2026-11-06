# Tidepool Commons repository onboarding trial

A fresh CLI world from the final supplied repository, with only six source-owned content overlays and a checked source edit, built and passed the supported suite and observed browser journeys. The initial repository-only attempt exposed reusable defects and did not succeed unaided. Shared repairs and all failures remain explicit; this is one same-model onboarding/transfer trial, not an independent evidence family.

## Intent and inputs

Seven invented coastal learning places for a fictional collective, with three regions, three gateway doors, three homepage entrances, seven source notes and seven owned notebook exercises. No real measurements, organization, research result or safety advice is asserted. Canonical source origin: https://worldwright.io/examples/tidepool/.

- `repository/snapshot.json`: SHA256 `f5960c75244da67c392156f8e2fce489672e2b0bf977099894242f3a61ce547c`, 443 manifest entries.
- `repository-corrected/snapshot.json`: SHA256 `de9c7127c1a58dfa1b37e8238302f6e631fe90a6a5a38676a7da0b168bd5913b`, 447 manifest entries.
- `repository-final/snapshot.json`: SHA256 `fbc0ec3035d19db17aa145f71cd8190d5799cc0a874e06e2a4067c8f9b44a08e`, 447 manifest entries.

## Final execution

node tooling/create-world.mjs ../tidepool-world --template expedition (cwd repository-final)

Overlay: `node reapply-authored-content.mjs`, `node adapt-feature-links.mjs`. No framework process or native changes in the final world.

Build: `node tidepool-world/build.mjs > build-complete.log 2>&1`. Supported suite: `node --test template.test.mjs authoring-native.test.mjs > ../tests-complete.log 2>&1` — 60/60 passed, 0 failed. Direct accepted-world CLI: `node checked-edit-trial.mjs` wrote and ran preview/apply/stale/invalid proposals through `node tooling/author.mjs`; accepted source preserved after both refusals. Post-edit build: `node tidepool-world/build.mjs > build-after-edit.log 2>&1`. Logs and receipts remain alongside this report.

Execution 6050897/20000000 steps; 23 admission passes. All 14 declared native mechanism hashes match the initial snapshot. Final framework process files match the final template byte for byte.

## Browser observations

- **Visible identity**: Final fresh CLI world displays Tidepool Commons, monogram T, authored headline and description, fictional collective footer, planned source repository link and three authored entrances. No inherited personal hero remains. Screenshots: completed-home.png
- **Seven places, atlas and visits**: Clicked Browse list to #foreshore, then traversed all seven primary routes through their declared choices. All display new readings and owned exercises, no READER-PLACE errors. Atlas reached7of7seen and Reset returned0of7. Final route observations saved in completed-routes.json. Screenshots: completed-atlas-reset.png, place-final.png
- **Reader search, links and source notes**: compare query returned1 result; clicking it stayed in reader.html#shell-table and displayed Compare two stories. Notes showed all seven fictional source notes, explicit authorship/scope, and cleared the old matching-places status. Workshop backlink reaches reader.html#home, now generic world framing. Skip click remained reader.html#wrack-line; focus movement was not established (immediate activeElement.id empty; AX web area focused), so only route preservation is confirmed. Screenshots: completed-reader-notes.png
- **Encounter checked session edit**: Coastal record title accepted in story and row while menu retained The story; empty input refused EC-T007 preserving accepted title; Reset restored What happened. Footer says within Tidepool Commons and explicitly credits Original demonstration Aaron Alderman. Screenshots: completed-encounter.png
- **Claimipedia comparison and gateway**: Initial4of4 evidence outcomes Accepted/Conflicted/Undecided. Unchecking retracted North study yielded3of4 and Accepted/Accepted/Undecided. Reading paths link navigated declared gate.html with all three authored doors. Screenshots: completed-claim.png
- **Interactive programme**: Temple default steward Tend lamp proposal accepted, oil3to2, flame lit, sequence1, one accepted witness. Educational retained demonstration; no coastal measurement claim. Screenshots: completed-programme.png
- **Media play, seek and mute**: Clicked00:12 scene and Sound off toggle: currentTime12.418528, pausedfalse, mutedfalse, readyState4. Toggled Sound on back off: currentTime23.372492, pausedfalse, mutedtrue, readyState4. Playback visibly advanced; audio fidelity not assessed. Screenshots: completed-media.png
- **Motion page**: Temple star-field/line-art page rendered; sky canvas1920x1080 and constellation863x690. Initial attempt also retained two separated rendered frames. This observes the motion surface, not every animation state. Screenshots: completed-motion.png, temple-motion.png, temple-motion-later.png
- **Reader workshop**: Final styled workshop accepted title Notebook v2, updated story and row while menu stayed The story. Separate Coastal menu edit updated menu. Empty title refused EC-T007, Notebook v2 remained accepted. Backlink reached reader.html#home. Earlier attempt also observed reload reset changes0 and original title/menu. Screenshots: completed-workshop.png

## Failures, repairs and help

Attempt1 failed on undocumented mapTipAbove, visible inherited identity, missing optional exercises, reader hash navigation and workshop styling/backlink. Its first suite was also run prematurely without built dist; both failed attempts and operator errors are preserved. After mapTipAbove repair the old suite passed48/48 while actual browser testing still exposed those reusable defects.

Attempt2 freshly recreated from corrected snapshot but the stronger resource audit failed2of58 checks because retained capability links and Claimipedia gateway fragments depended on retired initial places/doors; own gateway.book also used an incorrect reader route. Source-owned capability links and book were corrected; parent repaired generic Claimipedia policy. Full attempt records, commands, source hashes, screenshots and assistance are embedded in JSON and retained in attempt1/attempt2 artifacts.

- Parent supplied corrected reusable repository snapshots after initial failures and generic framework repairs; source-only inputs remained bounded.
- Parent reported shared visible identity/monogram, configured atlas target, explicit optional activity, resource registry/schema, reader navigation and workshop resource/backlink fixes. Intermediate reader process/test transfer was superseded by final fresh CLI creation.
- Parent supplied deployment constraint that final Tidepool lives under same host as default world. Tidepool namespace keys had already been authored distinctly: tidepool.commons.atlas.v1 and tidepool.commons.reader.v1.
- Parent supplied planned source repository URL https://github.com/aaron-alderman/worldwrightio/tree/master/examples/tidepool; authored on final world source.
- Parent repaired generic Claimipedia reading-path links after the stronger resource audit exposed retired gateway fragment assumptions. Capability CTA adaptation and gateway.book correction were source-owned world content by the trial agent.

## Canonical changes

- `source/atlas.rel`: `3ba75edffb7ee4f3a61b50a576e74568717ba96f204812a09a1917cdd05eea13` → `f3af0730e2bb9b93d7fcb6e40d8ea87e29caf8dbb7b59d8cbc68f63023034ba9`
- `source/expedition.rel`: `fdbbebbc5b499a089d4b9cdd3c2fcf15e4988fc9d2fa7aaaacda970c447ac6ba` → `5d6982fe7677676904e835c380a114040ae56406a4e16632dd8c59c4250a8197`
- `source/front-doors.rel`: `308168ce46479dbc07f91a6808ab4c64d5323ee9a317bdb7283b77c81034f815` → `c2841b89838255243260f32f6e6a7bd14b3d7a64a24cdf1548b4c38c6d84b382`
- `source/gateway.rel`: `4cb83ce5b2c70acb5605913924d89594fe1a33c4ddf9b142cc04f4eeb4d4b01c` → `306c3d86bf7898e3cfe5c6bbd0674959f53e0f8727e9452436aeb78ab658f93d`
- `source/reader/activities.json`: `bff368d13fb955bfbdb70694527cb6f7479f58550d5e1e600896aaa25c4c9055` → `2d883e10fef09aa5f10d3589ec352e0d4277a812d86adb71e8a9b6bd55e121b5`
- `source/world.rel`: `7aad15927129700881aa54efcec49780d1fb98ad8c700a3433512449059e1deb` → `4f205e49bcb239c857610076cfa01a09324c32cf7fadbded1240713d2acdef31`

## Evidence boundary

Actual CUA browser observations are separate from headless algebra/effect fixtures. This separately assigned same-model agent trial is not independent human or scientific validation. Unobserved: Independent human usability study; Independent scientific validation; Every possible programme, input, browser and device; Audio fidelity or subjective sound quality.

Preview remains loopback only: http://127.0.0.1:4187/. No publication performed. Remaining defects: none observed within the exercised scope.
