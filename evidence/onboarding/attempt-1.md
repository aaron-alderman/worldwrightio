# Tidepool Commons onboarding trial

Separately assigned same-model repository-only agent trial within one task; not independent human/scientific validation. Headless fixture tests and browser observations are distinct evidence surfaces.

Snapshot SHA256 `f5960c75244da67c392156f8e2fce489672e2b0bf977099894242f3a61ce547c`. Seven invented coastal learning places, three regions and three doors, source-owned in a standalone expedition. Preview http://127.0.0.1:4187/.

## Commands

- `node tooling/create-world.mjs ../tidepool-world --template expedition`: exit 0
- `node author-tidepool.mjs`: created four canonical sources, seven new places, three regions and doors
- `node tidepool-world/build.mjs > build.log 2>&1`: failed: Fact cardinality place.wrack-line.mapTipAbove
- `node --test template.test.mjs authoring-native.test.mjs > ../tests.log 2>&1`: premature suite before successful dist; 0 pass, 2 fail (missing atlas-runtime, author candidate failed)
- `Add mapTipAbove false for all seven places; node build.mjs > ../build-repair.log 2>&1`: exit 0, Built the world in dist.
- `node --test template.test.mjs authoring-native.test.mjs > ../tests-repair.log 2>&1`: exit 0; 48 tests passed; 0 failed; duration217871.6556ms; native copied-world authoring preview/apply/stale/invalid exercised with47 actual candidate checks
- `$env:WORLDWRIGHT_PORT='4187'; node serve.mjs`: loopback preview, exec session39543

## Browser observations

- **Home and atlas**: Actual CUA IAB: seven pins and 2/2/3 territory memberships; wrack-line reading displayed invented content; visit0→1, reset→0. Home inherited hero failure preserved. Screenshots: atlas-reset.png, home-identity-failure.png
- **Reader search and notes**: Actual CUA: compare query1 match, shell query0; selected match incorrectly navigates root/#shell-table. Notes show seven invented source titles and explicit fictional collective/source scope. Screenshots: reader-notes.png
- **Encounter**: Actual CUA: title The fictional notebook accepted in story/list row; menu The story stable; empty input refused EC-T007 preserving accepted content; Reset restored What happened. Screenshots: encounter-refusal.png
- **Claimipedia**: Actual CUA: initial Accepted/Conflicted/Undecided. Removing retracted North study changed Equal weight to Accepted (support1/challenge0.5), others unchanged. Screenshots: claim-comparison.png
- **Interactive programme**: Actual CUA Temple gate default steward Tend lamp accepted sequence1, oil3→2 flame lit, witness generated. Screenshots: programme-accepted.png
- **Media**: Actual CUA Temple films scene00:12 click and sound toggle yielded video currentTime12.434877 paused:false muted:false readyState4. Subsequent SOUND OFF muted:true currentTime21.499928, playback advanced. Audible quality not independently assessed. Screenshots: media-seek-muted.png
- **Workshop**: Actual CUA: title A shared notebook updates story/row, local menu Notebook menu separately accepted. Empty title refused EC-T007, last accepted state retained. Reload reset changes0/titleWhat happened/menuThe story. Page unstyled. Screenshots: workshop-refusal.png

## Failures and repairs

- Initial parent snapshot.json lookup wrong location. Read repository/snapshot.json without help.
- README lists mapX/mapY but omits required mapTipAbove. Authored false values after inspecting supplied atlas facts; parent informed before any framework edits.
- Suite launched after failed build lacked dist. Reran after successful build; initial failed log retained.
- Homepage visible hero/footer retain personal framing despite canonical world identity. Reported to parent. Brief one-off source policy substitutions were reverted to supplied snapshot; awaiting reusable repair.
- Atlas Browse places target #unseen invalid for authored regions. Reported to parent; awaiting reusable repair.
- New places unconditionally embed missing activity and display READER-PLACE. Added seven owned fictional notebook exercise records; awaiting reusable explicit optional-activity policy.
- Reader map/search result #shell-table navigates homepage due root base. Reported to parent; awaiting reusable repair.
- Workshop unstyled, ./style.css not present; back link retired #workshop. Reported to parent; awaiting reusable repair.
- CUA visible option unsupported in subagent; pre-server URL connection refused; error-page binding blocked data URL. Created fresh IAB tab omitting visibility options; browser QA functional.
- Guessed /motion.html gave404. No such route documented/generated; procedural motion examined through Temple page.

## Source changes

- `source/atlas.rel`: `3ba75edffb7ee4f3a61b50a576e74568717ba96f204812a09a1917cdd05eea13` → `0e0672477092007c1c3e983758a2ac0b352dd2e77ec724cad04c1a2b1d2f1e75`
- `source/expedition.rel`: `9e3b82afebd91951a9c74446649fbf6c92df3b3839359489c4be7e5b08730df1` → `b94dffda3da692418aa4a44d93838eee5317a75eccb6a908cfe4658fac4f446f`
- `source/gateway.rel`: `4cb83ce5b2c70acb5605913924d89594fe1a33c4ddf9b142cc04f4eeb4d4b01c` → `d53c237f80bd54972978b5f1d4a1099cabb0cbd56102c51a1f22d4bbceb14eca`
- `source/reader/activities.json`: `bff368d13fb955bfbdb70694527cb6f7479f58550d5e1e600896aaa25c4c9055` → `2d883e10fef09aa5f10d3589ec352e0d4277a812d86adb71e8a9b6bd55e121b5`
- `source/world.rel`: `a7ba0c21b458baa1120be2554231d7aca55ec08172d3c1c7cc773eee45aa77d2` → `2e8e65eaed617b8ba20f9327bc6f394ec74140d86defce5a3143d1b22fb00334`

Bootstrap mechanism bytes unchanged: true. Execution budget 20000000. Full hashes, acceptance criteria and exact input paths are in trial-report.json.

Conclusion pending reusable framework repairs and final repeat checks.
