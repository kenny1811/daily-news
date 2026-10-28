#!/usr/bin/env node
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const publisher = path.join(__dirname, 'morning-edition.js');
const date = '2026-10-24';
const createFixture = (initialEdition = null, initialIndex = []) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'daily-news-am-test-'));
  for (const dir of ['tools', 'data', 'docs/verification']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, '.daily-news-fixture'), 'test\n');
  fs.writeFileSync(path.join(root, 'tools', 'selfcheck.js'), `
const fs = require('fs');
if (process.env.TEST_CHECK_FAIL === '1') process.exit(1);
const args = process.argv;
const destination = args[args.indexOf('--verification-file') + 1];
fs.writeFileSync(destination, JSON.stringify([{ title: 'validated image', verification: { ok: true } }]) + '\\n');
`);
  if (initialEdition) fs.writeFileSync(path.join(root, 'data', `${date}.json`), JSON.stringify(initialEdition) + '\n');
  fs.writeFileSync(path.join(root, 'data', 'index.json'), JSON.stringify(initialIndex) + '\n');
  const candidatePath = path.join(root, 'candidate.json');
  fs.writeFileSync(candidatePath, JSON.stringify({ am: { _updated: `${date} 09:35 HKT`, hks: [] } }) + '\n');
  return { root, candidatePath, editionPath: path.join(root, 'data', `${date}.json`), indexPath: path.join(root, 'data', 'index.json'), verificationPath: path.join(root, 'docs', 'verification', `${date}-am.json`) };
};
const run = (fixture, extra = {}) => spawnSync(process.execPath, [publisher, 'publish', date, fixture.candidatePath], {
  encoding: 'utf8',
  env: { ...process.env, DAILY_NEWS_ROOT: fixture.root, DAILY_NEWS_FIXTURE: '1', ...extra }
});

test('failed candidate check leaves all live files untouched', t => {
  const f = createFixture({ pm: { headline: 'keep PM' } }, [date]);
  t.after(() => fs.rmSync(f.root, { recursive: true, force: true }));
  const before = fs.readFileSync(f.editionPath, 'utf8');
  const result = run(f, { TEST_CHECK_FAIL: '1' });
  assert.notEqual(result.status, 0);
  assert.equal(fs.readFileSync(f.editionPath, 'utf8'), before);
  assert.deepEqual(JSON.parse(fs.readFileSync(f.indexPath, 'utf8')), [date]);
  assert.equal(fs.existsSync(f.verificationPath), false);
});

test('validated AM publishes once, preserves PM, and adds the date to index', t => {
  const f = createFixture({ pm: { headline: 'keep PM' } }, []);
  t.after(() => fs.rmSync(f.root, { recursive: true, force: true }));
  const result = run(f);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const published = JSON.parse(fs.readFileSync(f.editionPath, 'utf8'));
  assert.equal(published.pm.headline, 'keep PM');
  assert.equal(published.am._updated, `${date} 09:35 HKT`);
  assert.deepEqual(JSON.parse(fs.readFileSync(f.indexPath, 'utf8')), [date]);
  assert.equal(JSON.parse(fs.readFileSync(f.verificationPath, 'utf8'))[0].verification.ok, true);
  const before = fs.readFileSync(f.editionPath, 'utf8');
  const rerun = run(f, { TEST_CHECK_FAIL: '1' });
  assert.equal(rerun.status, 0, rerun.stderr || rerun.stdout);
  assert.equal(fs.readFileSync(f.editionPath, 'utf8'), before);
});

test('interrupted multi-file publication is rolled back before retry', t => {
  const f = createFixture(null, []);
  t.after(() => fs.rmSync(f.root, { recursive: true, force: true }));
  const interrupted = run(f, { DAILY_NEWS_TEST_FAIL_AFTER: 'edition' });
  assert.equal(interrupted.status, 88);
  const retry = run(f, { TEST_CHECK_FAIL: '1' });
  assert.notEqual(retry.status, 0);
  assert.equal(fs.existsSync(f.editionPath), false);
  assert.equal(fs.existsSync(f.verificationPath), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(f.indexPath, 'utf8')), []);
});

test('real selfcheck never writes image evidence for a failing candidate', t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'daily-news-am-selfcheck-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const todayHK = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const candidatePath = path.join(temp, 'bad-candidate.json');
  const evidencePath = path.join(temp, 'should-not-exist.json');
  fs.writeFileSync(candidatePath, JSON.stringify({ am: { _updated: `${todayHK} 09:35 HKT` } }));
  const check = spawnSync(process.execPath,
    [path.join(__dirname, 'selfcheck.js'), todayHK, 'am', '--file', candidatePath, '--verification-file', evidencePath],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 30000 });
  assert.notEqual(check.status, 0, check.stderr || check.stdout);
  assert.equal(fs.existsSync(evidencePath), false);
});
