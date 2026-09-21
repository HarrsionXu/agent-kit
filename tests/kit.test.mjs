import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { SOURCE, install, check, doctor, verify, safePath, targetRoot, loadCatalog, selectProfiles, hash } from '../src/kit.mjs';

// 生成的测试数据仅写入当前测试通过 mkdtemp 创建并管理的目录。
function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'agent-kit-test-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function write(root, rel, value) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`);
}
const readJson = (root, rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
function setup(t, profiles = ['angular']) {
  const root = fixture(t); install(root, profiles, { apply: true }); return root;
}
function configure(root, checks = [{ name: 'pass', command: [process.execPath, '-e', 'process.exit(0)'], cwd: '.', timeoutMs: 1000, required: true, risk: 'local' }]) {
  const config = readJson(root, '.agent-kit/project.json');
  config.configured = true; config.checks = checks;
  write(root, '.agent-kit/project.md', '# Fixture project\nSynthetic test only.');
  write(root, '.agent-kit/project.json', config); return config;
}

test('profile dependencies and unknown profiles', () => {
  assert.deepEqual(selectProfiles(loadCatalog(), ['angular']), ['angular', 'common', 'frontend']);
  assert.throws(() => selectProfiles(loadCatalog(), ['unknown']), /Unknown profile/);
});
test('dry run does not create any files', (t) => {
  const root = fixture(t); const result = install(root, ['vue']);
  assert.equal(result.applied, false); assert.ok(result.files.length > 8);
  assert.deepEqual(fs.readdirSync(root), []);
});
test('installation preserves original instructions, installs selected skills and locks all files', (t) => {
  const root = fixture(t); write(root, 'AGENTS.md', '# Original\nKeep these rules.');
  install(root, ['angular'], { apply: true });
  assert.ok(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8').startsWith('# Original\nKeep these rules.\n'));
  assert.ok(fs.existsSync(path.join(root, '.agents/skills/kit-ui-review/SKILL.md')));
  assert.ok(!fs.existsSync(path.join(root, '.agent-kit/rules/vue.md')));
  assert.equal(check(root).status, 'intact');
});
test('repeat install is idempotent and does not reset human project configuration', (t) => {
  const root = setup(t); const config = configure(root);
  const result = install(root, ['angular'], { apply: true });
  assert.deepEqual(result.files, []); assert.deepEqual(readJson(root, '.agent-kit/project.json'), config);
});
test('分发工具链规则时保留存量 npm 工程的依赖、锁文件、构建与 CI', (t) => {
  const root = fixture(t);
  const existing = {
    'package.json': { name: 'existing-app', private: true, packageManager: 'npm@10.8.2', scripts: { build: 'webpack' } },
    'package-lock.json': { name: 'existing-app', lockfileVersion: 3, packages: {} },
    'webpack.config.cjs': 'module.exports = { mode: "production" };\n',
    '.github/workflows/ci.yml': 'name: existing-ci\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm ci\n      - run: npm run build\n',
  };
  for (const [rel, value] of Object.entries(existing)) write(root, rel, value);
  const before = Object.fromEntries(Object.keys(existing).map((rel) => [rel, fs.readFileSync(path.join(root, rel), 'utf8')]));
  install(root, ['react'], { apply: true });
  const rule = '.agent-kit/rules/tooling.md';
  assert.equal(fs.readFileSync(path.join(root, rule), 'utf8'), fs.readFileSync(path.join(SOURCE, 'standards/tooling.md'), 'utf8'));
  assert.ok(readJson(root, '.agent-kit/lock.json').profileRules.common.includes('tooling'));
  assert.equal(check(root).status, 'intact');
  assert.deepEqual(install(root, ['react'], { apply: true }).files, []);
  for (const [rel, value] of Object.entries(before)) assert.equal(fs.readFileSync(path.join(root, rel), 'utf8'), value);
  assert.ok(!fs.existsSync(path.join(root, 'pnpm-lock.yaml')));
  assert.ok(!fs.existsSync(path.join(root, 'pnpm-workspace.yaml')));
  assert.ok(!fs.existsSync(path.join(root, 'vite.config.ts')));
});
test('edits outside the AGENTS block are retained', (t) => {
  const root = setup(t); fs.appendFileSync(path.join(root, 'AGENTS.md'), '\nCustom local rules.\n');
  assert.equal(check(root).status, 'intact');
  install(root, ['angular', 'backend'], { apply: true });
  assert.ok(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8').endsWith('Custom local rules.\n'));
});
test('managed rule drift blocks upgrade before writes', (t) => {
  const root = setup(t); write(root, '.agent-kit/rules/angular.md', 'custom change');
  assert.throws(() => install(root, ['angular', 'backend'], { apply: true }), /drift/);
  assert.ok(!fs.existsSync(path.join(root, '.agent-kit/rules/backend.md')));
});
test('managed AGENTS drift is detected', (t) => {
  const root = setup(t); const file = path.join(root, 'AGENTS.md');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('## Agent Kit', '## Changed'));
  assert.throws(() => check(root), /AGENTS block drift/);
});
test('colliding skill prevents all installation writes', (t) => {
  const root = fixture(t); write(root, '.agents/skills/kit-task/SKILL.md', 'my skill');
  assert.throws(() => install(root, [], { apply: true }), /Unowned file collision/);
  assert.ok(!fs.existsSync(path.join(root, '.agent-kit')));
  assert.equal(fs.readFileSync(path.join(root, '.agents/skills/kit-task/SKILL.md'), 'utf8'), 'my skill');
});
test('malformed, duplicate and unowned AGENTS blocks fail closed', (t) => {
  const root = fixture(t);
  for (const text of ['<!-- agent-kit:start -->', '<!-- agent-kit:end -->', '<!-- agent-kit:start --><!-- agent-kit:end -->', '<!-- agent-kit:start --><!-- agent-kit:start --><!-- agent-kit:end -->', '<!-- legacy-agent-kit:start --><!-- agent-kit:end -->', '<!-- agent-kit:end --><!-- agent-kit:start -->']) {
    write(root, 'AGENTS.md', text);
    assert.throws(() => install(root, [], { apply: true }), /markers|Unowned/);
  }
  assert.ok(!fs.existsSync(path.join(root, '.agent-kit')));
});
test('root override blocks installation', (t) => {
  const root = fixture(t); write(root, 'AGENTS.override.md', 'effective rules');
  assert.throws(() => install(root, [], { apply: true }), /override/);
});
test('symlinked target, parents and destination files are rejected', (t) => {
  const base = fixture(t); const outside = fixture(t);
  fs.symlinkSync(outside, path.join(base, 'linked'));
  assert.throws(() => targetRoot(path.join(base, 'linked')), /Symlink/);
  fs.symlinkSync(outside, path.join(base, '.agents'));
  assert.throws(() => install(base, [], { apply: true }), /Symlink/);
  assert.deepEqual(fs.readdirSync(outside), []);
});
test('dangling symlink and non-directory parent are rejected in preflight', (t) => {
  const root = fixture(t); fs.symlinkSync(path.join(root, 'missing'), path.join(root, 'AGENTS.md'));
  assert.throws(() => install(root, [], { apply: true }), /Symlink/);
  fs.unlinkSync(path.join(root, 'AGENTS.md')); write(root, '.agents', 'not a directory');
  assert.throws(() => install(root, [], { apply: true }), /not a directory/);
  assert.ok(!fs.existsSync(path.join(root, '.agent-kit')));
});
test('path traversal, absolute paths and broad targets are rejected', (t) => {
  const root = fixture(t);
  for (const rel of ['../outside', '/outside', 'safe/../../outside', 'a\\b']) assert.throws(() => safePath(root, rel), /Unsafe/);
  assert.throws(() => targetRoot('/'), /broad/); assert.throws(() => targetRoot(os.homedir()), /broad/);
});
test('tampered lock path cannot read outside managed directories', (t) => {
  const root = setup(t); const lock = readJson(root, '.agent-kit/lock.json');
  lock.files['.agent-kit/rules/../../../secret'] = 'a'.repeat(64); write(root, '.agent-kit/lock.json', lock);
  assert.throws(() => check(root), /Unsafe/);
});
test('invalid JSON lock is reported', (t) => {
  const root = setup(t); write(root, '.agent-kit/lock.json', '{bad');
  assert.throws(() => check(root), /Cannot read/);
});
test('new project cannot report ready or run empty verification', (t) => {
  const root = setup(t); assert.throws(() => doctor(root), /not configured/);
  configure(root, []); assert.throws(() => verify(root, { execute: true }), /No verification/);
});
test('doctor accepts a configured project but not nonexistent scopes or documents', (t) => {
  const root = setup(t); const config = configure(root);
  assert.equal(doctor(root).status, 'configured');
  config.scopes[0].path = 'missing'; write(root, '.agent-kit/project.json', config);
  assert.throws(() => doctor(root), /Scope directory/);
  config.scopes[0].path = '.'; config.documents = []; write(root, '.agent-kit/project.json', config);
  assert.throws(() => doctor(root), /documents/);
});
test('multi-framework configuration uses separate non-overlapping scopes', (t) => {
  const root = setup(t, ['angular', 'vue']); const config = configure(root);
  assert.throws(() => doctor(root), /Conflicting frameworks/);
  fs.mkdirSync(path.join(root, 'angular-app')); fs.mkdirSync(path.join(root, 'vue-app'));
  config.scopes = [{ path: 'angular-app', profiles: ['angular'] }, { path: 'vue-app', profiles: ['vue'] }];
  write(root, '.agent-kit/project.json', config); assert.equal(doctor(root).status, 'configured');
  config.scopes[0].path = '.'; write(root, '.agent-kit/project.json', config);
  assert.throws(() => doctor(root), /Overlapping/);
});
test('scope override requires explicit instruction reconciliation', (t) => {
  const root = setup(t); const config = configure(root); fs.mkdirSync(path.join(root, 'app'));
  config.scopes[0].path = 'app'; write(root, '.agent-kit/project.json', config); write(root, 'app/AGENTS.override.md', 'override');
  assert.throws(() => doctor(root), /override/);
});
test('unsafe cwd and invalid gate definitions block all execution', (t) => {
  const root = setup(t); const config = configure(root);
  for (const update of [{ cwd: '..' }, { risk: 'deploy' }, { command: 'npm test' }, { timeoutMs: 1 }, { required: false }]) {
    write(root, '.agent-kit/project.json', { ...config, checks: [{ ...config.checks[0], ...update }] });
    assert.throws(() => verify(root, { execute: true }));
  }
  assert.ok(!fs.existsSync(path.join(root, '.agent-kit/reports')));
});
test('verify defaults to preview and never executes the command', (t) => {
  const root = setup(t); const config = configure(root);
  config.checks[0].command = [process.execPath, '-e', "require('node:fs').writeFileSync('sentinel', 'ran')"];
  write(root, '.agent-kit/project.json', config);
  assert.equal(verify(root).executed, false); assert.ok(!fs.existsSync(path.join(root, 'sentinel')));
});
test('actual verification writes a successful evidence report', (t) => {
  const root = setup(t); configure(root); const result = verify(root, { execute: true });
  assert.equal(result.passed, true); assert.equal(result.results[0].exitCode, 0);
  assert.equal(JSON.parse(fs.readFileSync(result.reportPath, 'utf8')).bundleDigest, check(root).lock.bundleDigest);
  assert.ok(!Object.hasOwn(result.results[0], 'stdout'));
});
test('required failure, command-not-found and timeout cannot pass', (t) => {
  const root = setup(t); const config = configure(root);
  config.checks = [
    { ...config.checks[0], name: 'failure', command: [process.execPath, '-e', 'process.exit(7)'] },
    { ...config.checks[0], name: 'missing', command: ['agent-kit-nonexistent-command'] },
    { ...config.checks[0], name: 'timeout', command: [process.execPath, '-e', 'setInterval(() => {}, 1000)'], timeoutMs: 100 }
  ];
  write(root, '.agent-kit/project.json', config); const result = verify(root, { execute: true });
  assert.equal(result.passed, false); assert.equal(result.results[0].exitCode, 7);
  assert.equal(result.results[1].error, 'ENOENT'); assert.equal(result.results[2].error, 'ETIMEDOUT');
});
test('optional failure is recorded without masking required success', (t) => {
  const root = setup(t); const config = configure(root);
  config.checks.push({ ...config.checks[0], name: 'optional', required: false, command: [process.execPath, '-e', 'process.exit(1)'] });
  write(root, '.agent-kit/project.json', config); const result = verify(root, { execute: true });
  assert.equal(result.passed, true); assert.equal(result.results[1].passed, false);
});
test('installed runtime runs offline without accessing the source catalog', (t) => {
  const root = setup(t); configure(root);
  const child = spawnSync(process.execPath, ['.agent-kit/tools/bin/agent-kit.mjs', 'doctor', '--target', '.'], { cwd: root, encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr); assert.match(child.stdout, /configured/);
});
test('profile additions preserve project config and removal fails', (t) => {
  const root = setup(t); const config = configure(root);
  install(root, ['angular', 'backend'], { apply: true });
  assert.deepEqual(readJson(root, '.agent-kit/project.json'), config);
  assert.throws(() => install(root, ['angular'], { apply: true }), /removal/);
});
test('release changes require new version, upgrades create backups, downgrades fail', (t) => {
  const source = fixture(t); const root = fixture(t);
  for (const name of ['standards', '.agents', 'templates', 'src', 'bin', 'package.json', 'catalog.json']) fs.cpSync(path.join(SOURCE, name), path.join(source, name), { recursive: true });
  install(root, ['react'], { source, apply: true });
  fs.appendFileSync(path.join(source, 'standards/react.md'), '\nNew release rule.\n');
  assert.throws(() => install(root, ['react'], { source, apply: true }), /Same version/);
  const catalog = readJson(source, 'catalog.json');
  const [major, minor, patch] = catalog.version.split('.').map(Number);
  const nextVersion = `${major}.${minor}.${patch + 1}`;
  catalog.version = nextVersion; write(source, 'catalog.json', catalog);
  const pkg = readJson(source, 'package.json'); pkg.version = nextVersion; write(source, 'package.json', pkg);
  const result = install(root, ['react'], { source, apply: true });
  assert.equal(check(root).lock.version, nextVersion);
  assert.ok(fs.existsSync(path.join(root, result.backup, '.agent-kit/rules/react.md')));
  assert.throws(() => install(root, ['react'], { apply: true }), /Downgrades/);
});
test('CLI rejects unknown flags and returns nonzero on verification failure', (t) => {
  const root = setup(t); const config = configure(root);
  const run = (args) => spawnSync(process.execPath, [path.join(SOURCE, 'bin/agent-kit.mjs'), ...args], { encoding: 'utf8' });
  assert.equal(run(['install', '--target', root, '--force']).status, 1);
  config.checks[0].command = [process.execPath, '-e', 'process.exit(9)']; write(root, '.agent-kit/project.json', config);
  const child = run(['verify', '--target', root, '--execute']);
  assert.equal(child.status, 1); assert.match(child.stdout, /"passed": false/);
});
test('package/catalog mismatch cannot be installed', (t) => {
  const source = fixture(t); const root = fixture(t);
  write(source, 'catalog.json', loadCatalog()); write(source, 'package.json', { version: '9.9.9' });
  assert.throws(() => install(root, [], { source, apply: true }), /versions differ/);
  assert.deepEqual(fs.readdirSync(root), []);
});
test('report path conflict prevents executing checks', (t) => {
  const root = setup(t); configure(root); write(root, '.agent-kit/reports', 'user file');
  assert.throws(() => verify(root, { execute: true }), /Reports path/);
});
test('historical namespaced blocks upgrade without losing custom instructions', (t) => {
  const root = setup(t);
  const original = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  const legacy = original.replaceAll('<!-- agent-kit:', '<!-- legacy-agent-kit:').trimEnd();
  write(root, 'AGENTS.md', `# Keep local rules\n${legacy}\nKeep this footer.\n`);
  const lock = readJson(root, '.agent-kit/lock.json');
  lock.version = '0.1.0'; lock.agentsBlockHash = hash(legacy);
  write(root, '.agent-kit/lock.json', lock);
  assert.equal(check(root).status, 'intact');
  install(root, ['angular'], { apply: true });
  const result = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  assert.ok(result.startsWith('# Keep local rules\n'));
  assert.ok(result.endsWith('Keep this footer.\n'));
  assert.ok(result.includes('<!-- agent-kit:start -->'));
  assert.ok(!result.includes('legacy-agent-kit'));
  assert.equal(check(root).lock.version, loadCatalog().version);
});
test('historical block contents still require matching ownership hash', (t) => {
  const root = setup(t);
  const agents = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  write(root, 'AGENTS.md', agents.replaceAll('<!-- agent-kit:', '<!-- legacy-agent-kit:'));
  assert.throws(() => install(root, ['angular'], { apply: true }), /AGENTS block drift/);
});
