import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { projectSource } from './module-source.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const packRoot = path.join(root, 'packs');
const profiles = ['seed-library', 'tidepool'].map(name => path.join(root, 'examples', name, 'profile.json'));
const ownerOf = file => file.replace(/\.json$/, '.encounter');

function isOwned(file) {
  return profiles.includes(file) ||
    (path.basename(file) === 'pack.json' && path.dirname(path.dirname(file)) === packRoot);
}

export function packIds(registry) {
  return fs.readdirSync(registry, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(id => {
      const file = path.join(registry, id, 'pack.json');
      return fs.existsSync(file) || (isOwned(file) && fs.existsSync(ownerOf(file)));
    })
    .sort((a, b) => a.localeCompare(b));
}

function project(file) {
  const owner = ownerOf(file);
  return Buffer.from(projectSource(path.relative(root, owner), fs.readFileSync(owner, 'utf8'), file));
}

export function readManifest(file) {
  const bytes = fs.readFileSync(file);
  if (isOwned(file) && !bytes.equals(project(file))) {
    throw Error('WORLD-MANIFEST: Generated JSON differs from Encounter: ' + path.relative(root, file));
  }
  return bytes;
}

function synchronize(write) {
  const files = [...packIds(packRoot).map(id => path.join(packRoot, id, 'pack.json')), ...profiles];
  if (!write) {
    files.forEach(readManifest);
  } else {
    // Compile every owner before writing any projection.
    const projections = files.map(file => ({ file, bytes: project(file) }));
    for (const { file, bytes } of projections) {
      if (fs.existsSync(file) && fs.readFileSync(file).equals(bytes)) continue;
      const stage = file + '.' + randomUUID() + '.tmp';
      try {
        fs.writeFileSync(stage, bytes, { flag: 'wx' });
        fs.renameSync(stage, file);
      } finally {
        fs.rmSync(stage, { force: true });
      }
    }
  }
  console.log((write ? 'Generated ' : 'Verified ') + files.length + ' composition manifests.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, ...rest] = process.argv.slice(2);
  if (!['--write', '--check'].includes(mode) || rest.length) {
    throw Error('Usage: node tooling/composition-manifests.mjs --write|--check');
  }
  synchronize(mode === '--write');
}
