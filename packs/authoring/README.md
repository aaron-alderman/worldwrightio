# Authoring

Requires sources. This pack supplies the actual bounded proposal/preview/apply process and generic local CLI: node tooling/author.mjs proposal.json. source/authoring-contract.json is generated from the selected ownership closure.

A request has protocol worldwright/authoring-proposal/1, explicit apply boolean, and changes [{file,beforeSha256,text}]. Compute beforeSha256 from the exact current source bytes. Preview stages owned inputs, runs an isolated admitted build and portable tests, and records a receipt without committing. Apply commits the exact checked owned source changes after validation.

Stale hashes, unowned/protected paths, empty/no-op changes and invalid candidate builds refuse. The seed/native authority and authoring policy are not editable through this contract. Publication is separate. Source corrections do not automatically establish scientific truth.
