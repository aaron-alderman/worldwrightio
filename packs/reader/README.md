# Reader

Requires core. A Place has isa Place, title, question, reading, optional source/choice relations. world.entry references a declared Place. IDs match lower-case URL-safe names. Choice has isa Choice, label and target referencing another Place. Referenced Source subjects must be declared.

reader.html supplies search over the new world's titles/questions. places/<id>.html supplies individual URL routes, normal browser back/forward, accessible page focus, private per-page notes and a visited trail with reset. Storage is local to this browser and keyed by the world's title. Personal notes and visits never become authored facts or evidence.

reader.view returns an initial HTML tree suitable for a FeatureBlock. reader.boot guards absent reader controls. All navigation and memory decisions live in reader.process.json; native adapters supply DOM/storage observations.
