const assert = require('node:assert/strict');
const { platformOf, active, auditSocial, policyFor } = require('./social-policy');
const policy = require('./rules.json').social;
const urls = [
  'https://www.threads.com/@author/post/ABC123',
  'https://www.facebook.com/author/posts/pfbid123',
  'https://www.instagram.com/p/ABC123/'
];
assert.deepEqual(urls.map(platformOf), ['Threads', 'Facebook', 'Instagram']);
assert.equal(platformOf('https://www.facebook.com/groups/123/posts/456/'), 'Facebook');
assert.equal(platformOf('https://www.facebook.com/permalink.php?story_fbid=123&id=456'), 'Facebook');
for (const u of [
  'https://threads.com.evil.example/@author/post/ABC',
  'https://facebook.com/author',
  'https://instagram.com/explore/tags/news/',
  'https://threads.com/@author',
  'https://facebook.com/watch/',
  'http://instagram.com/p/ABC/'
]) assert.equal(platformOf(u), null, u);

assert.equal(active(policy, '2026-10-13', 'am'), false);
assert.equal(active(policy, '2026-10-13', 'pm'), true);

const card = url => ['title', '', 'author', url];
const thread = n => `https://www.threads.com/@author/post/THREAD${n}`;
const target = policyFor(policy, '2026-10-18', 'pm');
assert.equal(target.targetOnly, true);
assert.deepEqual(target.platforms, ['Threads']);

const okEdition = {
  hke: [card(thread(1)), card(thread(2)), card('https://example.com/3')],
  ai: { src: [[null, thread(3)], [null, thread(4)], [null, 'https://example.com/4'], [null, 'https://example.com/5']] },
  warb: { src: [[null, thread(5)], [null, thread(6)], [null, 'https://example.com/6']] }
};
assert.equal(auditSocial(okEdition, target, ['hke']).errors.length, 0);
assert.equal(auditSocial(okEdition, target, ['hke']).shortfalls.length, 0);

const noThreads = {
  hks: [card('https://example.com/1'), card('https://example.com/2')],
  ai: { src: [[null, 'https://example.com/3']] },
  warb: { src: [[null, 'https://example.com/4']] }
};
const audit = auditSocial(noThreads, target, ['hks']);
assert.deepEqual(audit.errors, []);
assert.equal(audit.counts.hks.required, 1);
assert.equal(audit.shortfalls.length, 3);
assert.match(audit.shortfalls[0], /差 1/);

noThreads.hks[0] = card(urls[1]);
assert.match(auditSocial(noThreads, target, ['hks']).errors.join('\n'), /停用社交來源 Facebook/);
noThreads.hks[0] = card(urls[2]);
assert.match(auditSocial(noThreads, target, ['hks']).errors.join('\n'), /停用社交來源 Instagram/);
console.log('social-policy tests passed');
