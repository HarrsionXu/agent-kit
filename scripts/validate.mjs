import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { SOURCE, loadCatalog, safePath } from '../src/kit.mjs';
import { validateStructureDocumentation } from './structure.mjs';

const catalog = loadCatalog();
const pkg = JSON.parse(fs.readFileSync(path.join(SOURCE, 'package.json'), 'utf8'));
assert.equal(pkg.version, catalog.version, 'Package/catalog release versions must match');
const usedRules = new Set(); const usedSkills = new Set();
for (const [name, profile] of Object.entries(catalog.profiles)) {
  assert.match(name, /^[a-z][a-z0-9-]*$/);
  assert.ok(Array.isArray(profile.rules) && Array.isArray(profile.skills));
  for (const rule of profile.rules) {
    assert.match(rule, /^[a-z][a-z0-9-]*$/);
    assert.ok(fs.readFileSync(safePath(SOURCE, `standards/${rule}.md`), 'utf8').trim().length > 100);
    usedRules.add(rule);
  }
  for (const skill of profile.skills) {
    assert.match(skill, /^kit-[a-z0-9-]+$/);
    const body = fs.readFileSync(safePath(SOURCE, `.agents/skills/${skill}/SKILL.md`), 'utf8');
    // 本仓库将 frontmatter 限定为简单的 name/description 标量。
    // 此校验器不是通用 YAML 解析器。
    const match = body.match(/^---\nname: ([a-z0-9-]+)\ndescription: ([^\n]+)\n---\n/);
    assert.ok(match, `Invalid skill frontmatter: ${skill}`);
    assert.equal(match[1], skill);
    assert.ok(match[2].length <= 1024 && match[2].length > 20);
    assert.ok(!/[<>]|: /.test(match[2]), `Quote complex YAML descriptions: ${skill}`);
    assert.ok(body.length > 300 && body.length < 18000, `Keep skill concise: ${skill}`);
    usedSkills.add(skill);
  }
}
assert.deepEqual([...usedRules].sort(), fs.readdirSync(path.join(SOURCE, 'standards')).map((x) => x.replace(/\.md$/, '')).sort());
assert.deepEqual([...usedSkills].sort(), fs.readdirSync(path.join(SOURCE, '.agents/skills')).sort());

function inspectLinks(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.agent-kit'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) inspectLinks(file);
    else if (entry.name.endsWith('.md')) {
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const link = match[1];
        if (/^(https?:|#)/.test(link)) continue;
        assert.ok(!path.isAbsolute(link), `Use portable repository links: ${file}`);
        assert.ok(fs.existsSync(path.resolve(path.dirname(file), link.split('#')[0])), `Broken link in ${file}: ${link}`);
      }
    }
  }
}
inspectLinks(SOURCE);
const structure = validateStructureDocumentation(SOURCE);
const scenarios = JSON.parse(fs.readFileSync(path.join(SOURCE, 'evals/scenarios.json'), 'utf8'));
assert.ok(Array.isArray(scenarios) && scenarios.length > 0);
assert.equal(new Set(scenarios.map((s) => s.id)).size, scenarios.length);
for (const scenario of scenarios) {
  assert.ok(scenario.id && scenario.fixture && scenario.prompt);
  assert.ok(scenario.expected.length && scenario.forbidden.length);
}
console.log(`Validated ${Object.keys(catalog.profiles).length} profiles, ${usedRules.size} rules, ${usedSkills.size} skills, ${scenarios.length} evaluation definitions, local Markdown links and docs/structure.md (${structure.files} source files). Evaluation definitions checked, not model behavior.`);
