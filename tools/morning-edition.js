#!/usr/bin/env node
// Validate the complete AM candidate before publishing either the edition or its index entry.
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const root = path.resolve(process.env.DAILY_NEWS_ROOT || path.resolve(__dirname, '..'));
const fixture = process.env.DAILY_NEWS_FIXTURE === '1';
if (fixture && (!root.toLowerCase().startsWith(path.resolve(os.tmpdir()).toLowerCase() + path.sep) || !fs.existsSync(path.join(root, '.daily-news-fixture')))) {
  throw Error('Fixture mode requires a marked root under the system temp directory');
}
const [,, action, date, candidatePath] = process.argv;
if (action !== 'publish' || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !candidatePath) {
  throw Error('Usage: node tools/morning-edition.js publish YYYY-MM-DD <candidate.json>');
}
const todayHK = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
if (!fixture && date !== todayHK) throw Error('Only the current Hong Kong morning edition can be published');

const dataDir = path.join(root, 'data');
const workDir = path.join(root, 'scratch', 'am-publish');
const verificationDir = path.join(root, 'docs', 'verification');
fs.mkdirSync(workDir, { recursive: true });
const editionPath = path.join(dataDir, `${date}.json`);
const indexPath = path.join(dataDir, 'index.json');
const verificationPath = path.join(verificationDir, `${date}-am.json`);
const lockPath = path.join(workDir, `${date}.lock`);
const journalPath = path.join(workDir, `${date}.journal.json`);
const readRaw = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
const parseRaw = (p, value) => value === null ? null : JSON.parse(value);
const encoded = value => JSON.stringify(value, null, 2) + '\n';
const atomicRaw = (p, value) => {
  const temp = `${p}.${process.pid}.${crypto.randomUUID()}.tmp`;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  try {
    fs.writeFileSync(temp, value, { flag: 'wx' });
    fs.renameSync(temp, p);
  } finally { fs.rmSync(temp, { force: true }); }
};
const paths = { verification: verificationPath, edition: editionPath, index: indexPath };
const recover = () => {
  const raw = readRaw(journalPath);
  if (raw === null) return;
  const journal = JSON.parse(raw);
  if (journal.phase === 'committed') {
    fs.rmSync(journalPath, { force: true });
    return;
  }
  // Never roll back a file that somebody else changed after this process stopped.
  for (const key of Object.keys(paths)) {
    const current = readRaw(paths[key]);
    if (current !== journal.before[key] && current !== journal.after[key]) {
      throw Error(`Recovery stopped: ${key} changed outside this publication; inspect journal manually`);
    }
  }
  for (const key of Object.keys(paths)) {
    if (readRaw(paths[key]) !== journal.after[key]) continue;
    if (journal.before[key] === null) fs.rmSync(paths[key], { force: true });
    else atomicRaw(paths[key], journal.before[key]);
  }
  fs.rmSync(journalPath, { force: true });
};
const lock = fn => {
  try { fs.writeFileSync(lockPath, encoded({ pid: process.pid }), { flag: 'wx' }); }
  catch (e) {
    if (e.code !== 'EEXIST') throw e;
    const previous = JSON.parse(readRaw(lockPath));
    if (!Number.isInteger(previous.pid)) throw Error('Unreadable AM lock; inspect manually');
    try { process.kill(previous.pid, 0); throw Error('Another AM publication holds the lock'); }
    catch (probe) { if (probe.code !== 'ESRCH') throw probe; }
    fs.rmSync(lockPath, { force: true });
    fs.writeFileSync(lockPath, encoded({ pid: process.pid }), { flag: 'wx' });
  }
  try { recover(); return fn(); }
  finally { fs.rmSync(lockPath, { force: true }); }
};

lock(() => {
  const originalRaw = readRaw(editionPath);
  const original = parseRaw(editionPath, originalRaw) || {};
  if (original.am) {
    console.log(`${date} am already published; left unchanged`);
    return;
  }
  const indexRaw = readRaw(indexPath);
  const index = parseRaw(indexPath, indexRaw);
  if (!Array.isArray(index)) throw Error('Invalid data/index.json');
  const candidate = JSON.parse(fs.readFileSync(path.resolve(candidatePath), 'utf8'));
  if (!candidate || typeof candidate !== 'object' || !candidate.am || typeof candidate.am !== 'object' || Object.keys(candidate).some(k => !['am', 'duplicateReviews'].includes(k))) {
    throw Error('Candidate must contain {am:{...}} and optional duplicateReviews');
  }
  if (!String(candidate.am._updated || '').includes(date)) throw Error('am._updated must identify the edition date');

  const candidateCheckPath = path.join(workDir, `${date}.${crypto.randomUUID()}.candidate.json`);
  const checkEvidencePath = path.join(workDir, `${date}.${crypto.randomUUID()}.verification.json`);
  try {
    atomicRaw(candidateCheckPath, encoded(candidate));
    const check = spawnSync(process.execPath,
      [path.join(root, 'tools', 'selfcheck.js'), date, 'am', '--file', candidateCheckPath, '--verification-file', checkEvidencePath],
      { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 180000 });
    if (check.error || check.status !== 0 || !fs.existsSync(checkEvidencePath)) {
      const details = [check.error?.message, check.stdout, check.stderr].filter(Boolean).join('\n') || 'missing verification evidence';
      throw Error('AM candidate selfcheck failed: ' + details.slice(-3000));
    }
    const evidence = JSON.parse(fs.readFileSync(checkEvidencePath, 'utf8'));
    if (!Array.isArray(evidence)) throw Error('Invalid AM image verification evidence');

    const currentEdition = readRaw(editionPath);
    const currentIndex = readRaw(indexPath);
    if (currentEdition !== originalRaw || currentIndex !== indexRaw) throw Error('Edition/index changed while candidate was checked; retry with current data');
    const nextIndex = index.includes(date) ? index : [date, ...index];
    const before = { verification: readRaw(verificationPath), edition: originalRaw, index: indexRaw };
    const after = { verification: encoded(evidence), edition: encoded({ ...original, am: candidate.am }), index: index.includes(date) ? indexRaw : encoded(nextIndex) };
    atomicRaw(journalPath, encoded({ phase: 'applying', before, after }));
    try {
      atomicRaw(verificationPath, after.verification);
      atomicRaw(editionPath, after.edition);
      if (fixture && process.env.DAILY_NEWS_TEST_FAIL_AFTER === 'edition') process.exit(88);
      if (!index.includes(date)) atomicRaw(indexPath, after.index);
      if (fixture && process.env.DAILY_NEWS_TEST_FAIL_AFTER === 'index') process.exit(88);
      atomicRaw(journalPath, encoded({ phase: 'committed', before, after }));
      fs.rmSync(journalPath, { force: true });
    } catch (e) { recover(); throw e; }
    console.log(`${date} am published after candidate selfcheck and image verification`);
  } finally {
    fs.rmSync(candidateCheckPath, { force: true });
    fs.rmSync(checkEvidencePath, { force: true });
  }
});
