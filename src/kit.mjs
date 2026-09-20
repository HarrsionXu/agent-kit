import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const SOURCE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const START = '<!-- agent-kit:start -->';
const END = '<!-- agent-kit:end -->';
const LOCK = '.agent-kit/lock.json';
const CONFIG = '.agent-kit/project.json';
const frameworks = ['angular', 'vue', 'react'];
const fail = (message) => { throw new Error(message); };
export const hash = (value) => createHash('sha256').update(value).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function lstatIfPresent(file) {
  try { return fs.lstatSync(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// Reject symlinks on every component, including target ancestors. Never follow
// a user-supplied lock/config path outside the selected project.
export function safePath(root, relative = '.') {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').includes('..')) {
    fail(`Unsafe relative path: ${relative}`);
  }
  const full = path.resolve(root, relative);
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) fail(`Path escapes project: ${relative}`);
  let cursor = path.parse(full).root;
  for (const part of full.slice(cursor.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    const stat = lstatIfPresent(cursor);
    if (stat) {
      if (stat.isSymbolicLink()) fail(`Symlink is not supported: ${cursor}`);
      if (cursor !== full && !stat.isDirectory()) fail(`Parent is not a directory: ${cursor}`);
    }
  }
  return full;
}

export function targetRoot(target) {
  if (!target) fail('--target is required');
  const root = path.resolve(target);
  if ([path.parse(root).root, os.homedir()].includes(root)) fail('Refusing broad root/home target');
  safePath(root);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) fail(`Target must be an existing directory: ${root}`);
  return root;
}

const read = (root, rel) => fs.readFileSync(safePath(root, rel), 'utf8');
function readJson(root, rel) {
  try { return JSON.parse(read(root, rel)); }
  catch (error) { fail(`Cannot read ${rel}: ${error.message}`); }
}
const exists = (root, rel) => fs.existsSync(safePath(root, rel));

function walk(root, dir) {
  return fs.readdirSync(safePath(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = `${dir}/${entry.name}`;
    safePath(root, rel);
    return entry.isDirectory() ? walk(root, rel) : [rel];
  }).sort();
}

export function loadCatalog(source = SOURCE) {
  const catalog = readJson(source, 'catalog.json');
  if (catalog.schemaVersion !== 1 || !/^\d+\.\d+\.\d+$/.test(catalog.version) || !catalog.profiles?.common) fail('Invalid catalog');
  if (readJson(source, 'package.json').version !== catalog.version) fail('Package/catalog versions differ');
  for (const [name, profile] of Object.entries(catalog.profiles)) {
    if (!/^[a-z][a-z0-9-]*$/.test(name) || !Array.isArray(profile.rules) || !Array.isArray(profile.skills)) fail('Invalid profile definition');
    if (profile.rules.some((r) => typeof r !== 'string' || !/^[a-z][a-z0-9-]*$/.test(r)) || profile.skills.some((s) => typeof s !== 'string' || !/^kit-[a-z0-9-]+$/.test(s))) fail('Invalid rule or skill name');
  }
  return catalog;
}

export function selectProfiles(catalog, requested) {
  if (!Array.isArray(requested) || requested.some((p) => !Object.hasOwn(catalog.profiles, p))) fail('Unknown profile');
  const result = new Set(['common', ...requested]);
  if ([...frameworks, 'admin', 'microfrontend'].some((p) => result.has(p))) result.add('frontend');
  return [...result].sort();
}

function release(source) {
  const paths = ['catalog.json', 'package.json', ...['standards', '.agents/skills', 'templates', 'src', 'bin'].flatMap((dir) => walk(source, dir))].sort();
  return hash(paths.map((rel) => `${rel}\0${hash(read(source, rel))}`).join('\n'));
}

function managedBlock(text, required = false) {
  // Read historical namespaced markers for upgrades; write only neutral markers.
  // Ownership is still verified against the installed lock's block hash.
  const markers = [...text.matchAll(/<!-- ((?:[a-z0-9]+-)*agent-kit):(start|end) -->/g)];
  if (!markers.length && !required) return null;
  if (markers.length !== 2 || markers[0][2] !== 'start' || markers[1][2] !== 'end' || markers[0][1] !== markers[1][1]) fail('AGENTS managed markers missing or malformed');
  return text.slice(markers[0].index, markers[1].index + markers[1][0].length);
}

function block(profiles, catalog) {
  const mappings = profiles.map((name) => `- ${name}: ${catalog.profiles[name].rules.map((r) => `\`.agent-kit/rules/${r}.md\``).join(', ')}`).join('\n');
  return `${START}\n## Agent Kit\n\n任务开始先完整读取 \`.agent-kit/project.json\` 和其 documents，按 scopes 与实际修改目录选择规则。始终读取 common/workflow；匹配框架、admin 或 microfrontend 时同时读取 frontend。不要给 Angular 任务加载 Vue 实现标准。遇到范围不明、override 或规则冲突时解释并确认，不假设本区块覆盖其他有效指令。\n\n${mappings}\n\n项目根目录 \`.agents/skills/kit-*/SKILL.md\` 是按任务选择的 Skills，匹配时完整读取；未读取不得声称已使用。变更前定义验收样例，完成后交付实际检查和浏览器证据。配置未完成不能假装门禁已通过。\n\n离线检查入口：\`node .agent-kit/tools/bin/agent-kit.mjs doctor --target .\`；\`verify --target .\` 仅预览，审核命令后加 \`--execute\` 才执行。\n${END}`;
}

function ownedPath(rel) {
  return rel === '.agent-kit/.gitignore' || /^\.agent-kit\/(rules|tools|templates)\//.test(rel) || /^\.agents\/skills\/kit-[a-z0-9-]+\//.test(rel);
}

export function check(target) {
  const root = targetRoot(target);
  if (exists(root, 'AGENTS.override.md')) fail('Root AGENTS.override.md would override the managed entry');
  const lock = readJson(root, LOCK);
  if (lock.schemaVersion !== 1 || !/^\d+\.\d+\.\d+$/.test(lock.version) || !Array.isArray(lock.profiles) || !lock.profiles.length || !lock.profileRules || !lock.files || !Object.keys(lock.files).length || !/^[a-f0-9]{64}$/.test(lock.bundleDigest)) fail('Invalid lock');
  for (const [rel, digest] of Object.entries(lock.files)) {
    if (!ownedPath(rel) || !/^[a-f0-9]{64}$/.test(digest)) fail(`Invalid managed entry: ${rel}`);
    if (!exists(root, rel) || hash(read(root, rel)) !== digest) fail(`Managed file drift: ${rel}`);
  }
  const currentBlock = managedBlock(read(root, 'AGENTS.md'), true);
  if (hash(currentBlock) !== lock.agentsBlockHash) fail('Managed AGENTS block drift');
  return { root, lock, status: 'intact' };
}

function compareVersion(a, b) {
  const left = a.split('.').map(Number); const right = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return Math.sign(left[i] - right[i]);
  return 0;
}

function atomicWrite(root, rel, content) {
  const dest = safePath(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const temp = `${dest}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temp, content, { flag: 'wx', mode: fs.existsSync(dest) ? fs.statSync(dest).mode : 0o644 });
    fs.renameSync(temp, dest);
  } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}

export function install(target, requested = [], { apply = false, source = SOURCE } = {}) {
  const root = targetRoot(target);
  if (root === source) fail('Do not install the release into its own source repository');
  if (exists(root, 'AGENTS.override.md')) fail('Root AGENTS.override.md must be reconciled first');
  const catalog = loadCatalog(source);
  const profiles = selectProfiles(catalog, requested);
  const bundleDigest = release(source);
  const old = exists(root, LOCK) ? check(root).lock : null;
  if (old) {
    if (compareVersion(catalog.version, old.version) < 0) fail('Downgrades are not supported');
    if (old.version === catalog.version && old.bundleDigest !== bundleDigest) fail('Same version has different release content; publish a new version');
    if (old.profiles.some((p) => !profiles.includes(p))) fail('Profile removal is not supported in v1');
  }
  const files = { '.agent-kit/.gitignore': 'reports/\nbackups/\n' };
  const profileRules = {};
  for (const name of profiles) {
    const profile = catalog.profiles[name];
    profileRules[name] = profile.rules;
    for (const rule of profile.rules) files[`.agent-kit/rules/${rule}.md`] = read(source, `standards/${rule}.md`);
    for (const skill of profile.skills) {
      for (const rel of walk(source, `.agents/skills/${skill}`)) files[rel] = read(source, rel);
    }
  }
  for (const rel of [...walk(source, 'bin'), ...walk(source, 'src')]) files[`.agent-kit/tools/${rel}`] = read(source, rel);
  for (const rel of walk(source, 'templates')) files[`.agent-kit/${rel}`] = read(source, rel);
  if (old && Object.keys(old.files).some((rel) => !Object.hasOwn(files, rel))) fail('Release retires managed files; manual migration required');

  const agents = exists(root, 'AGENTS.md') ? read(root, 'AGENTS.md') : '';
  const previousBlock = managedBlock(agents);
  if (previousBlock && !old) fail('Unowned managed AGENTS block');
  const nextBlock = block(profiles, catalog);
  const nextAgents = previousBlock ? agents.replace(previousBlock, nextBlock) : `${agents}${agents && !agents.endsWith('\n') ? '\n' : ''}${agents ? '\n' : ''}${nextBlock}\n`;
  const lock = { schemaVersion: 1, version: catalog.version, bundleDigest, profiles, profileRules, files: Object.fromEntries(Object.entries(files).map(([rel, text]) => [rel, hash(text)])), agentsBlockHash: hash(nextBlock) };
  // Build the entire plan before writing even a directory.
  const writes = [];
  const add = (rel, content, owned = false) => {
    const full = safePath(root, rel);
    if (fs.existsSync(full)) {
      if (!fs.statSync(full).isFile()) fail(`Expected file: ${rel}`);
      if (!owned) fail(`Unowned file collision: ${rel}`);
      if (read(root, rel) === content) return;
    }
    writes.push({ path: rel, content });
  };
  for (const [rel, text] of Object.entries(files)) add(rel, text, Boolean(old?.files[rel]));
  add('AGENTS.md', nextAgents, true);
  add(LOCK, json(lock), Boolean(old));
  if (!exists(root, CONFIG)) add(CONFIG, json({ schemaVersion: 1, configured: false, scopes: [{ path: '.', profiles }], documents: ['.agent-kit/project.md'], checks: [] }));
  if (!exists(root, '.agent-kit/project.md')) add('.agent-kit/project.md', read(source, 'templates/project.md'));
  // Validate backup/report directories even if they do not yet exist.
  safePath(root, '.agent-kit/backups');
  const result = { target: root, version: catalog.version, profiles, applied: apply, files: writes.map((w) => w.path) };
  if (!apply || !writes.length) return result;
  const backup = `.agent-kit/backups/${Date.now()}-${randomUUID()}`;
  const manifest = { created: [], restoredFrom: [] };
  for (const item of writes) {
    if (exists(root, item.path)) {
      atomicWrite(root, `${backup}/${item.path}`, read(root, item.path));
      manifest.restoredFrom.push(item.path);
    } else manifest.created.push(item.path);
  }
  atomicWrite(root, `${backup}/manifest.json`, json(manifest));
  for (const item of writes) atomicWrite(root, item.path, item.content);
  return { ...result, backup };
}

function validateConfig(root, lock) {
  const config = readJson(root, CONFIG);
  if (config.schemaVersion !== 1 || config.configured !== true) fail('Project is not configured: complete project.md and project.json first');
  if (!Array.isArray(config.scopes) || !config.scopes.length) fail('At least one scope is required');
  const selectedScopes = [];
  for (const scope of config.scopes) {
    if (typeof scope?.path !== 'string') fail('Scope path must be explicit');
    const full = safePath(root, scope.path);
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) fail(`Scope directory missing: ${scope.path}`);
    if (!Array.isArray(scope.profiles) || !scope.profiles.length || scope.profiles.some((p) => !lock.profiles.includes(p))) fail(`Scope uses uninstalled profiles: ${scope.path}`);
    const selected = frameworks.filter((p) => scope.profiles.includes(p));
    if (selected.length > 1) fail(`Conflicting frameworks in scope: ${scope.path}`);
    for (const prev of selectedScopes) {
      const overlaps = full === prev.full || full.startsWith(`${prev.full}${path.sep}`) || prev.full.startsWith(`${full}${path.sep}`);
      if (overlaps && selected[0] && prev.framework && selected[0] !== prev.framework) fail('Overlapping framework scopes');
    }
    selectedScopes.push({ full, framework: selected[0] });
    for (let cursor = full; ; cursor = path.dirname(cursor)) {
      if (exists(root, path.relative(root, path.join(cursor, 'AGENTS.override.md')))) fail(`AGENTS.override.md blocks scope: ${scope.path}`);
      if (cursor === root) break;
    }
  }
  if (!Array.isArray(config.documents) || !config.documents.length) fail('Project documents are required');
  for (const doc of config.documents) if (!fs.statSync(safePath(root, doc)).isFile() || !read(root, doc).trim()) fail(`Empty or invalid project document: ${doc}`);
  if (!Array.isArray(config.checks) || !config.checks.length) fail('No verification checks configured');
  const names = new Set();
  for (const gate of config.checks) {
    if (typeof gate.name !== 'string' || !gate.name.trim() || names.has(gate.name)) fail('Check names must be nonempty and unique');
    names.add(gate.name);
    if (gate.risk !== 'local' || typeof gate.required !== 'boolean') fail(`Check must declare local risk and required: ${gate.name}`);
    if (!Array.isArray(gate.command) || !gate.command.length || gate.command.some((x) => typeof x !== 'string' || !x.length || x.includes('\0'))) fail(`Invalid argv: ${gate.name}`);
    if (!Number.isInteger(gate.timeoutMs) || gate.timeoutMs < 100 || gate.timeoutMs > 600000) fail(`Invalid timeout: ${gate.name}`);
    if (typeof gate.cwd !== 'string' || !fs.statSync(safePath(root, gate.cwd)).isDirectory()) fail(`Invalid cwd: ${gate.name}`);
  }
  if (!config.checks.some((gate) => gate.required)) fail('At least one required check is needed');
  const reports = safePath(root, '.agent-kit/reports');
  if (fs.existsSync(reports) && !fs.statSync(reports).isDirectory()) fail('Reports path is not a directory');
  return config;
}

export function doctor(target) {
  const { root, lock } = check(target);
  const config = validateConfig(root, lock);
  return { root, lock, config, status: 'configured' };
}

export function verify(target, { execute = false } = {}) {
  const { root, lock, config } = doctor(target);
  if (!execute) return { executed: false, target: root, checks: config.checks };
  const startedAt = new Date().toISOString();
  const results = config.checks.map((gate) => {
    const started = Date.now();
    const child = spawnSync(gate.command[0], gate.command.slice(1), { cwd: safePath(root, gate.cwd), shell: false, timeout: gate.timeoutMs, killSignal: 'SIGKILL', stdio: 'inherit' });
    return { name: gate.name, command: gate.command, cwd: gate.cwd, required: gate.required, exitCode: child.status, signal: child.signal, error: child.error?.code ?? null, passed: child.status === 0 && !child.error, durationMs: Date.now() - started };
  });
  const passed = results.every((r) => !r.required || r.passed);
  const report = { schemaVersion: 1, executed: true, passed, startedAt, finishedAt: new Date().toISOString(), kitVersion: lock.version, bundleDigest: lock.bundleDigest, configDigest: hash(json(config)), results, note: 'Only configured commands were verified; browser and real business validation are not implied.' };
  const reportPath = `.agent-kit/reports/${Date.now()}-${randomUUID()}.json`;
  atomicWrite(root, reportPath, json(report));
  return { ...report, reportPath: path.join(root, reportPath) };
}
