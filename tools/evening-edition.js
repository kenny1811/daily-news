#!/usr/bin/env node
// Atomic handoff for the two evening automation phases. No network or notification calls.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { spawnSync } = require('child_process');

const root = path.resolve(process.env.DAILY_NEWS_ROOT || path.resolve(__dirname, '..'));
const fixture = process.env.DAILY_NEWS_FIXTURE === '1';
if (fixture && (!root.toLowerCase().startsWith(path.resolve(os.tmpdir()).toLowerCase() + path.sep) || !fs.existsSync(path.join(root, '.daily-news-fixture')))) throw Error('Fixture mode requires a marked root under the system temp directory');
const dataDir = path.join(root, 'data');
const stateDir = path.join(root, 'scratch', 'pm-refresh');
const [,, action, date, candidatePath] = process.argv;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
if (!['stage', 'finalize', 'correct', 'inspect'].includes(action) || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw Error('Invalid action/date');
const hourHK = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', hourCycle: 'h23' }).format(new Date());
const previous = new Date(today + 'T00:00:00Z');
previous.setUTCDate(previous.getUTCDate() - 1);
const previousDay = previous.toISOString().slice(0, 10);
if (date !== today && !(hourHK < 3 && date === previousDay) && !fixture) throw Error('Only the current Hong Kong edition (or previous evening before 03:00) can be changed');
fs.mkdirSync(stateDir, { recursive: true });
const editionPath = path.join(dataDir, `${date}.json`);
const statePath = path.join(stateDir, `${date}.json`);
const draftPath = path.join(stateDir, `${date}.draft.json`);
const lockPath = path.join(stateDir, `${date}.lock`);
const journalPath = path.join(stateDir, `${date}.journal.json`);
const read = p => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
if (!fixture && action !== 'inspect') {
  const gate = read(path.join(stateDir, 'enabled.json'));
  if (!gate || gate.status !== 'active' || !gate.draftTaskId || !gate.refreshTaskId || !gate.syncTaskId) throw Error('Two-stage automation activation gate is closed');
}
const atomic = (p, value) => {
  const tmp = `${p}.${process.pid}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
  try { fs.renameSync(tmp, p); } catch (e) { fs.rmSync(tmp, { force: true }); throw e; }
};
const raw = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
const restore = (p, v) => {
  if (v === null) { fs.rmSync(p, { force: true }); return; }
  const tmp = p + '.' + crypto.randomUUID() + '.restore';
  fs.writeFileSync(tmp, v, { flag: 'wx' });
  fs.renameSync(tmp, p);
};
const recover = () => {
  const j = read(journalPath);
  if (!j) return;
  if (j.phase !== 'committed') {
    restore(editionPath, j.before.edition);
    restore(path.join(dataDir, 'index.json'), j.before.index);
    restore(statePath, j.before.state);
  }
  fs.rmSync(journalPath, { force: true });
};
const locked = fn => {
  try { fs.writeFileSync(lockPath, JSON.stringify({ pid: process.pid }), { flag: 'wx' }); }
  catch (e) {
    if (e.code !== 'EEXIST') throw e;
    const old = read(lockPath);
    if (!old || !Number.isInteger(old.pid)) throw Error('Unreadable lock; inspect manually');
    try { process.kill(old.pid, 0); throw Error('Another run holds lock'); }
    catch (probe) { if (probe.code !== 'ESRCH') throw probe; }
    fs.rmSync(lockPath, { force: true });
    fs.writeFileSync(lockPath, JSON.stringify({ pid: process.pid }), { flag: 'wx' });
  }
  try { recover(); return fn(); } finally { fs.rmSync(lockPath, { force: true }); }
};
const state = () => read(statePath) || {};
const candidate = p => {
  if (!p) throw Error('Candidate file required');
  const v = read(path.resolve(p));
  if (!v || !v.pm || typeof v.pm !== 'object' || Object.keys(v).some(k => !['pm', 'lastSourceCheckedAt'].includes(k))) throw Error('Candidate must contain pm and optional lastSourceCheckedAt');
  return v;
};
const validate = next => {
  if (fixture && process.env.DAILY_NEWS_VALIDATE_FIXTURE !== '1') return;
  const tmpCandidate = path.join(stateDir, `.validate-${date}-${crypto.randomUUID()}.json`);
  try {
    atomic(tmpCandidate, next);
    const result = spawnSync(process.execPath, [path.join(root, 'tools', 'selfcheck.js'), date, 'pm', '--file', tmpCandidate], { cwd: root, encoding: 'utf8' });
    if (result.status !== 0) throw Error('Candidate selfcheck failed: ' + (result.stderr || result.stdout || '').slice(-1000));
  } finally { fs.rmSync(tmpCandidate, { force: true }); }
};
if (action === 'inspect') {
  locked(() => console.log(JSON.stringify({ date, state: state(), draft: fs.existsSync(draftPath), publishedPm: !!read(editionPath)?.pm })));
} else if (action === 'stage') {
  const c = candidate(candidatePath);
  locked(() => {
    if (state().finalizedAt) throw Error('Already finalized');
    atomic(draftPath, c);
    atomic(statePath, { ...state(), stagedAt: new Date().toISOString() });
  });
} else if (action === 'finalize' || action === 'correct') {
  locked(() => {
    const previous = state();
    if (action === 'finalize' && previous.finalizedAt) throw Error('Already finalized');
    if (action === 'correct' && (!previous.finalizedAt || process.argv[5] !== '--authorized-correction' || !process.argv[6])) throw Error('Correction requires an existing final, authorization flag and reason');
    const c = candidate(candidatePath || draftPath);
    const pm = c.pm;
    const lastSourceCheckedAt = Date.parse(c.lastSourceCheckedAt || '');
    if (!fixture && (!Number.isFinite(lastSourceCheckedAt) || lastSourceCheckedAt > Date.now() || Date.now() - lastSourceCheckedAt > 15 * 60000)) throw Error('Final candidate requires a real recent lastSourceCheckedAt');
    if (!pm._updated || !String(pm._updated).includes(date)) throw Error('pm._updated must identify current edition');
    const original = read(editionPath) || {};
    const indexPath = path.join(dataDir, 'index.json');
    const index = read(indexPath) || [];
    if (!Array.isArray(index)) throw Error('Invalid index');
    const next = { ...original, pm };
    const nextIndex = index.includes(date) ? index : [date, ...index];
    validate(next);
    const before = { edition: raw(editionPath), index: raw(indexPath), state: raw(statePath) };
    if (action === 'correct') {
      const versionPath = path.join(stateDir, `${date}.version-${previous.version || 1}.json`);
      if (!fs.existsSync(versionPath)) atomic(versionPath, original);
    }
    atomic(journalPath, { phase: 'applying', before });
    try {
      atomic(editionPath, next);
      if (fixture && process.env.DAILY_NEWS_TEST_FAIL_AFTER === 'edition') process.exit(88);
      if (!index.includes(date)) atomic(indexPath, nextIndex);
      if (fixture && process.env.DAILY_NEWS_TEST_FAIL_AFTER === 'index') process.exit(88);
      atomic(statePath, { ...previous, finalizedAt: new Date().toISOString(), validatedAt: new Date().toISOString(), lastSourceCheckedAt: c.lastSourceCheckedAt, version: action === 'correct' ? (previous.version || 1) + 1 : 1, correctionReason: action === 'correct' ? process.argv[6] : undefined });
      if (fixture && process.env.DAILY_NEWS_TEST_FAIL_AFTER === 'state') process.exit(88);
      atomic(journalPath, { phase: 'committed' });
      fs.rmSync(journalPath, { force: true });
    } catch (e) { recover(); throw e; }
  });
}
