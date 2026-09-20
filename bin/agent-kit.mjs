#!/usr/bin/env node
import { install, check, doctor, verify, loadCatalog } from '../src/kit.mjs';

const help = `Agent Kit (Node >=22)
  profiles
  install --target <directory> --profiles frontend,angular [--apply]
  check --target <directory>
  doctor --target <directory>
  verify --target <directory> [--execute]
install and verify default to read-only preview. No --force option.`;

try {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help') {
    console.log(help);
  } else {
    const allowed = { profiles: [], install: ['target', 'profiles', 'apply'], check: ['target'], doctor: ['target'], verify: ['target', 'execute'] }[command];
    if (!allowed) throw new Error(`Unknown command: ${command}`);
    const options = {};
    for (let i = 0; i < args.length; i++) {
      const key = args[i].startsWith('--') ? args[i].slice(2) : '';
      if (!allowed.includes(key) || Object.hasOwn(options, key)) throw new Error(`Unknown or repeated option: ${args[i]}`);
      if (['apply', 'execute'].includes(key)) options[key] = true;
      else {
        const value = args[++i];
        if (!value || value.startsWith('--')) throw new Error(`Missing value: --${key}`);
        options[key] = value;
      }
    }
    let result;
    if (command === 'profiles') result = loadCatalog().profiles;
    if (command === 'install') result = install(options.target, options.profiles ? options.profiles.split(',') : [], { apply: options.apply });
    if (command === 'check') { const { lock, status } = check(options.target); result = { status, version: lock.version, profiles: lock.profiles }; }
    if (command === 'doctor') { const { status, config } = doctor(options.target); result = { status, scopes: config.scopes, checks: config.checks.map((g) => g.name) }; }
    if (command === 'verify') result = verify(options.target, { execute: options.execute });
    console.log(JSON.stringify(result, null, 2));
    if (result?.executed && !result.passed) process.exitCode = 1;
  }
} catch (error) {
  console.error(`agent-kit: ${error.message}`);
  process.exitCode = 1;
}
