function matchingReview(reviews, urls) {
  if (!Array.isArray(reviews) || !Array.isArray(urls) || urls.length !== 2) return null;
  const pair = urls.slice().sort();
  return reviews.find(r =>
    Array.isArray(r?.urls) && r.urls.length === 2 &&
    r.urls.slice().sort().every((u, i) => u === pair[i]) &&
    ['different_events', 'substantive_update'].includes(r.decision) &&
    typeof r.reason === 'string' && r.reason.trim().length >= 20
  ) || null;
}

module.exports = { matchingReview };
