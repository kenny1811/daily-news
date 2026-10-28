const test = require('node:test');
const assert = require('node:assert/strict');
const { matchingReview } = require('./dedup-review');

const urls = ['https://one.example/story', 'https://two.example/story'];
const valid = { urls: urls.slice().reverse(), decision: 'substantive_update', reason: '原帖確認新增傷者人數及警方最新公布時間，與上一版報道有實質新進展。' };

test('a reviewed pair requires exact source URLs and a concrete reason', () => {
  assert.equal(matchingReview([valid], urls), valid);
  assert.equal(matchingReview([{ ...valid, urls: [urls[0], 'https://other.example/'] }], urls), null);
  assert.equal(matchingReview([{ ...valid, reason: '不同新聞' }], urls), null);
  assert.equal(matchingReview([{ ...valid, decision: 'same_event' }], urls), null);
});
