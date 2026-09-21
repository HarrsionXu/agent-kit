import fs from 'node:fs';
import path from 'node:path';

const START = '<!-- repository-structure:start -->';
const END = '<!-- repository-structure:end -->';

// 仅匹配本仓库约定的生成文件和私有文件排除项，不解析任意 gitignore 规则。
function ignored(name) {
  return ['.git', 'node_modules', '.agent-kit', 'coverage', '.DS_Store'].includes(name)
    || (name !== '.env.example' && (name === '.env' || name.startsWith('.env.')));
}

function documentedEntries(markdown) {
  if (markdown.split(START).length !== 2 || markdown.split(END).length !== 2) {
    throw new Error('Structure document must contain exactly one repository-structure start/end pair');
  }
  const start = markdown.indexOf(START) + START.length;
  const end = markdown.indexOf(END);
  const block = markdown.slice(start, end).trim();
  const fenced = block.match(/^```text\r?\n([\s\S]+)\r?\n```$/);
  if (end < start || !fenced) throw new Error('Structure document structure must be a fenced text tree');
  const [root, ...lines] = fenced[1].split(/\r?\n/);
  if (root !== 'agent-kit/') throw new Error('Structure document structure root must be agent-kit/');

  const entries = new Map();
  const parents = [];
  for (const line of lines) {
    if (!line.replace(/[│\s]/g, '')) continue;
    const match = line.match(/^((?:│   |    )*)(?:├── |└── )(\S+?)(\/)?(?:\s+(.+))?$/);
    if (!match) throw new Error(`Invalid Structure document tree line: ${line}`);
    const [, indent, name, slash, description] = match;
    const depth = indent.length / 4;
    if (depth > parents.length || name === '.' || name === '..' || /[\\/]/.test(name)) {
      throw new Error(`Invalid Structure document tree hierarchy: ${line}`);
    }
    parents.length = depth;
    const relative = [...parents, name].join('/');
    if (entries.has(relative)) throw new Error(`Duplicate Structure document tree entry: ${relative}`);
    if (!slash && !description?.trim()) throw new Error(`Missing file description: ${relative}`);
    entries.set(relative, slash ? 'directory' : 'file');
    if (slash) parents.push(name);
  }
  return new Map([...entries].filter(([relative]) => !relative.split('/').some(ignored)));
}

function sourceEntries(root, relative = '', entries = new Map()) {
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (ignored(entry.name)) continue;
    const next = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Source tree must not contain symlinks: ${next}`);
    entries.set(next, entry.isDirectory() ? 'directory' : 'file');
    if (entry.isDirectory()) sourceEntries(root, next, entries);
  }
  return entries;
}

export function validateStructureDocumentation(root) {
  const documented = documentedEntries(fs.readFileSync(path.join(root, 'docs/structure.md'), 'utf8'));
  const actual = sourceEntries(root);
  const missing = [...actual.keys()].filter((entry) => !documented.has(entry)).sort();
  const stale = [...documented.keys()].filter((entry) => !actual.has(entry)).sort();
  const wrongType = [...actual.keys()].filter((entry) => documented.has(entry) && actual.get(entry) !== documented.get(entry)).sort();
  const errors = [
    missing.length && `Undocumented paths: ${missing.join(', ')}`,
    stale.length && `Stale paths: ${stale.join(', ')}`,
    wrongType.length && `File/directory mismatches: ${wrongType.join(', ')}`,
  ].filter(Boolean);
  if (errors.length) throw new Error(`Update docs/structure.md in the same change.\n${errors.join('\n')}`);
  return { files: [...actual.values()].filter((type) => type === 'file').length };
}
