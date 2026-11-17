"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { isDeepStrictEqual } = require("node:util");

function compilerFile() {
  if (process.env.WORLDWRIGHT_ENCOUNTER_LIBRARY) return path.resolve(process.env.WORLDWRIGHT_ENCOUNTER_LIBRARY);
  // Reconstruction tests build from a child directory of the application.
  for (let dir = __dirname; ; dir = path.dirname(dir)) {
    const file = path.join(dir, "encounter-libraries", "worldwright-source.cjs");
    if (fs.existsSync(file)) return file;
    if (dir === path.dirname(dir)) throw Error("Worldwright requires the Encounter build library.");
  }
}

const { compileEncounter, compileEncounterWithOrigins } = require(compilerFile());
const cache = new Map();

function processSource(root, name) {
  const file = "algebra/" + name + ".encounter";
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const projection = fs.readFileSync(path.join(root, "algebra", name + ".process.json"), "utf8");
  const key = JSON.stringify([file, text, projection]);
  if (!cache.has(key)) {
    const model = compileEncounter(file, text);
    // These compatibility projections retain the inspector's old coordinates.
    // The seed and lowerer treat an empty array expression as list().
    const canonical = value => JSON.parse(JSON.stringify(value, (_, v) =>
      Array.isArray(v) && v.length === 0 ? ["list"] : v));
    assert.deepEqual(canonical(model), canonical(JSON.parse(projection)),
      "Encounter programme differs from its inspection projection: " + file);
    cache.set(key, model);
  }
  return cache.get(key);
}

const applicationFile = "source/application.encounter";

function staticSource(file, text, entry, diagnostic, allowReferences = false) {
  const {surface, origins} = compileEncounterWithOrigins(file, text);
  const [statement, ...rest] = surface.queries[entry] ?? [];
  assert(Object.keys(surface.queries).length === 1 && rest.length === 0 &&
    statement?.let === "result" && Object.keys(statement).length === 2 &&
    statement.value && typeof statement.value === "object" && !Array.isArray(statement.value), diagnostic);
  const expressions = new Map(origins.filter(origin => origin.kind === "expression").map(origin => [origin.pointer, origin]));
  const keys = new Map(origins.filter(origin => origin.kind === "key").map(origin => [origin.pointer, origin]));
  const spans = new Map(), keySpans = new Map();
  const escape = part => part.replaceAll("~", "~0").replaceAll("/", "~1");
  function project(value, pointer, compilerPointer) {
    const span = expressions.get(compilerPointer);
    assert(span && !span.synthetic, diagnostic + " · Missing exact Encounter source span for " + compilerPointer);
    const key = JSON.stringify(pointer);
    spans.set(key, span);
    if (keys.has(compilerPointer)) keySpans.set(key, keys.get(compilerPointer));
    if (Array.isArray(value)) {
      assert(value[0] === "list", diagnostic);
      return value.slice(1).map((item, index) => project(item, [...pointer, index], compilerPointer + "/" + (index + 1)));
    }
    if (value && typeof value === "object") {
      if (allowReferences && Object.keys(value).length === 1 && typeof value.dollarPrefix === "string")
        return "$" + value.dollarPrefix;
      return Object.fromEntries(Object.entries(value).map(([key, item]) =>
        [key, project(item, [...pointer, key], compilerPointer + "/" + escape(key))]));
    }
    assert(allowReferences || typeof value !== "string" || !value.startsWith("$"), diagnostic);
    return value;
  }
  return {definition: project(statement.value, [], "/queries/" + entry + "/0/value"), spans, keySpans};
}

function applicationSource(root, read = file => fs.readFileSync(path.join(root, file))) {
  return staticSource(applicationFile, read(applicationFile).toString("utf8"), "application.definition",
    "APP-DEFINITION: Expected one static application definition in " + applicationFile);
}

const definitions = new Map();

function definitionSource(root, projection, read = file => fs.readFileSync(path.join(root, file))) {
  const file = projection.replace(/\.json$/, ".encounter");
  const text = read(file).toString("utf8");
  let cached = definitions.get(file);
  if (cached?.text !== text) {
    const source = staticSource(file, text, "value.definition",
      "WORLDWRIGHT-DEFINITION: Expected one static definition in " + file, true);
    cached = {text, source};
    definitions.set(file, cached);
  }
  const {source} = cached;
  const observed = JSON.parse(read(projection).toString("utf8"));
  assert(isDeepStrictEqual(source.definition, observed) && JSON.stringify(source.definition) === JSON.stringify(observed),
    "WORLDWRIGHT-IR-PROJECTION: " + projection + " differs from " + file);
  return {file, ...source, definition: structuredClone(source.definition)};
}

function semanticSource(root, projection, read = file => fs.readFileSync(path.join(root, file))) {
  if (!projection.endsWith(".process.json")) return definitionSource(root, projection, read);
  const file = projection.replace(/\.process\.json$/, ".encounter");
  const text = read(file).toString("utf8");
  const observed = JSON.parse(read(projection).toString("utf8"));
  const {surface, origins} = compileEncounterWithOrigins(file, text);
  const canonical = value => JSON.parse(JSON.stringify(value, (_, v) =>
    Array.isArray(v) && v.length === 0 ? ["list"] : v));
  assert.deepEqual(canonical(surface.queries), canonical(observed.queries),
    "WORLDWRIGHT-IR-PROJECTION: " + projection + " differs from " + file);

  // Existing snapshot consumers rely on the field order and the legacy spelling
  // of the empty list. Values and operations still come from the compiler.
  function preserveSpelling(value, layout) {
    if (Array.isArray(layout)) return layout.map((part, i) => preserveSpelling(value[i], part));
    if (layout && typeof layout === "object")
      return Object.fromEntries(Object.keys(layout).map(key => [key, preserveSpelling(value[key], layout[key])]));
    return value;
  }

  const spans = new Map(), keySpans = new Map();
  for (const origin of origins) {
    const pointer = origin.pointer.slice(1).split("/").map(part => part.replaceAll("~1", "/").replaceAll("~0", "~"));
    let container = surface;
    const parts = pointer.map(part => {
      const key = Array.isArray(container) ? Number(part) : part;
      container = container?.[key];
      return key;
    });
    if (origin.kind === "key") keySpans.set(JSON.stringify(parts), origin);
    else if (!origin.synthetic) spans.set(JSON.stringify(parts), origin);
  }
  const queries = preserveSpelling(surface.queries, observed.queries);
  return {file, definition:{...observed, queries}, spans, keySpans};
}

module.exports = { processSource, applicationSource, applicationFile, staticSource, definitionSource, semanticSource };
