const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const script = path.join(__dirname, 'evening-edition.js');
const date = '2026-10-23';

function fixture(t, existing = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'daily-news-pm-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, '.daily-news-fixture'), 'test');
  fs.mkdirSync(path.join(root, 'data'));
  fs.writeFileSync(path.join(root, 'data', 'index.json'), JSON.stringify([date]));
  fs.writeFileSync(path.join(root, 'data', `${date}.json`), JSON.stringify(existing));
  fs.writeFileSync(path.join(root, 'settings.json'), JSON.stringify({ pmView: '22:00' }));
  const candidate = path.join(root, 'candidate.json');
  fs.writeFileSync(candidate, JSON.stringify({ pm: { _updated: `${date} 21:40 HKT（夜報）` }, lastSourceCheckedAt: `${date}T21:40:00+08:00` }));
  const run = (now, action = 'finalize', extraEnv = {}) => spawnSync(process.execPath, [script, action, date, candidate], {
    encoding: 'utf8',
    env: { ...process.env, DAILY_NEWS_ROOT: root, DAILY_NEWS_FIXTURE: '1', DAILY_NEWS_NOW: now, ...extraEnv }
  });
  return { root, run };
}

test('evening finalize publishes before deadline only once', t => {
  const { root, run } = fixture(t, { am: { _updated: 'morning' } });
  const first = run(`${date}T21:40:00+08:00`);
  assert.equal(first.status, 0, first.stderr);
  const edition = JSON.parse(fs.readFileSync(path.join(root, 'data', `${date}.json`)));
  assert.equal(edition.am._updated, 'morning');
  assert.ok(edition.pm);
  const again = run(`${date}T21:41:00+08:00`);
  assert.notEqual(again.status, 0);
  assert.match(again.stderr, /Already published/);
});

test('evening finalize rejects a missed deadline without publishing', t => {
  const { root, run } = fixture(t, { am: { _updated: 'morning' } });
  const result = run(`${date}T21:46:00+08:00`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /deadline has passed/);
  const edition = JSON.parse(fs.readFileSync(path.join(root, 'data', `${date}.json`)));
  assert.equal(edition.pm, undefined);
});

test('existing published pm cannot be overwritten if its state file is missing', t => {
  const { run } = fixture(t, { pm: { _updated: 'existing' } });
  const result = run(`${date}T21:40:00+08:00`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Already published/);
});

test('interrupted publication recovers only its own writes', t => {
  const { root, run } = fixture(t, { am: { _updated: 'morning' } });
  const interrupted = run(`${date}T21:40:00+08:00`, 'finalize', { DAILY_NEWS_TEST_FAIL_AFTER: 'edition' });
  assert.equal(interrupted.status, 88);
  const resumed = run(`${date}T21:40:00+08:00`);
  assert.equal(resumed.status, 0, resumed.stderr);
  const edition = JSON.parse(fs.readFileSync(path.join(root, 'data', `${date}.json`)));
  assert.equal(edition.am._updated, 'morning');
  assert.ok(edition.pm);
});

test('recovery refuses to erase an unrelated edition change', t => {
  const { root, run } = fixture(t, { am: { _updated: 'morning' } });
  assert.equal(run(`${date}T21:40:00+08:00`, 'finalize', { DAILY_NEWS_TEST_FAIL_AFTER: 'edition' }).status, 88);
  const file = path.join(root, 'data', `${date}.json`);
  const current = JSON.parse(fs.readFileSync(file));
  current.am._updated = 'independent change';
  fs.writeFileSync(file, JSON.stringify(current));
  const resumed = run(`${date}T21:40:00+08:00`);
  assert.notEqual(resumed.status, 0);
  assert.match(resumed.stderr, /changed outside this publication/);
  assert.equal(JSON.parse(fs.readFileSync(file)).am._updated, 'independent change');
});
