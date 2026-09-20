import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateStructureDocumentation } from '../scripts/structure.mjs';

const tree = `agent-kit/
├── README.md                  Overview and documentation links
├── .gitignore                 Generated file exclusions
├── .agents/
│   └── skills/
│       └── example/
│           └── SKILL.md       Task instructions
├── docs/
│   └── structure.md           Canonical structure documentation
├── src/
│   └── index.mjs              Implementation
└── .git/                      Local metadata`;
const markdown = (value = tree) => [
  '# Example', '', '<!-- repository-structure:start -->', '```text', value,
  '```', '<!-- repository-structure:end -->', '',
].join('\n');

function write(root, relative, content = '') {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-kit-structure-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  write(root, 'README.md', '# Overview\n\nSee docs/structure.md.');
  write(root, 'docs/structure.md', markdown());
  write(root, '.gitignore');
  write(root, '.agents/skills/example/SKILL.md');
  write(root, 'src/index.mjs');
  return root;
}

test('structure document tree covers source files, hidden files and nested directories', (t) => {
  assert.deepEqual(validateStructureDocumentation(fixture(t)), { files: 5 });
});

test('new source files and empty directories must be documented', (t) => {
  const root = fixture(t);
  write(root, 'src/new.mjs');
  fs.mkdirSync(path.join(root, 'new-folder'));
  assert.throws(() => validateStructureDocumentation(root), /Undocumented paths: new-folder, src\/new.mjs/);
  const updated = tree
    .replace('├── src/', '├── new-folder/                New source directory\n├── src/')
    .replace('│   └── index.mjs              Implementation', '│   ├── index.mjs              Implementation\n│   └── new.mjs                New implementation');
  write(root, 'docs/structure.md', markdown(updated));
  assert.equal(validateStructureDocumentation(root).files, 6);
});

test('renamed and deleted paths must be removed from the structure document tree', (t) => {
  const root = fixture(t);
  fs.renameSync(path.join(root, 'src/index.mjs'), path.join(root, 'src/renamed.mjs'));
  assert.throws(() => validateStructureDocumentation(root), /Undocumented paths: src\/renamed.mjs\nStale paths: src\/index.mjs/);
  fs.unlinkSync(path.join(root, 'src/renamed.mjs'));
  assert.throws(() => validateStructureDocumentation(root), /Stale paths: src\/index.mjs/);
});

test('generated artifacts and private env files are excluded, env examples are not', (t) => {
  const root = fixture(t);
  for (const relative of ['.git/HEAD', 'node_modules/example/index.js', '.agent-kit/reports/run.json', 'coverage/report.html', '.DS_Store', '.env', '.env.local']) {
    write(root, relative);
  }
  assert.equal(validateStructureDocumentation(root).files, 5);
  write(root, '.env.example');
  assert.throws(() => validateStructureDocumentation(root), /Undocumented paths: .env.example/);
});

test('structure documentation requires one marked source tree, ignoring unrelated example trees', (t) => {
  const root = fixture(t);
  write(root, 'docs/structure.md', [markdown(), '```text', 'other-project/', '└── example.md', '```', ''].join('\n'));
  assert.equal(validateStructureDocumentation(root).files, 5);
  for (const invalid of ['# No tree', markdown() + markdown(), markdown().replace('repository-structure:end', 'missing:end'), markdown().replace('```text', '```json')]) {
    write(root, 'docs/structure.md', invalid);
    assert.throws(() => validateStructureDocumentation(root), /exactly one|fenced text tree/);
  }
});

test('duplicate paths, skipped levels and files without descriptions are rejected', (t) => {
  const root = fixture(t);
  for (const invalid of [
    tree.replace('├── .gitignore', '├── README.md'),
    tree.replace('├── src/', '│   ├── src/').replace('│   └── index.mjs', '│       │   └── index.mjs'),
    tree.replace('              Implementation', ''),
  ]) {
    write(root, 'docs/structure.md', markdown(invalid));
    assert.throws(() => validateStructureDocumentation(root), /Duplicate|hierarchy|Missing file description/);
  }
});

test('incorrect file types and symbolic links are rejected', (t) => {
  const root = fixture(t);
  write(root, 'docs/structure.md', markdown(tree.replace('index.mjs ', 'index.mjs/ ')));
  assert.throws(() => validateStructureDocumentation(root), /File\/directory mismatches: src\/index.mjs/);
  fs.symlinkSync('index.mjs', path.join(root, 'src/linked.mjs'));
  assert.throws(() => validateStructureDocumentation(root), /must not contain symlinks/);
});

test('only docs/structure.md is authoritative, not a tree left in README', (t) => {
  const root = fixture(t);
  write(root, 'README.md', markdown());
  write(root, 'docs/structure.md', '# Structure\nNo maintained tree here.');
  assert.throws(() => validateStructureDocumentation(root), /exactly one/);
  write(root, 'docs/structure.md', markdown());
  assert.equal(validateStructureDocumentation(root).files, 5);
});
