// Count actual adopted original-post URLs, never discovery leads or platform homepages.
function platformOf(value) {
  let u; try { u = new URL(value); } catch (_) { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const p = u.pathname;
  if (['threads.com','threads.net'].includes(host) && /^\/@[^/]+\/post\/[A-Za-z0-9_-]+\/?$/.test(p)) return 'Threads';
  if (['instagram.com'].includes(host) && /^\/(?:[^/]+\/)?(?:p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?$/.test(p)) return 'Instagram';
  if (['facebook.com','m.facebook.com','web.facebook.com'].includes(host) && (
    /^\/(?:(?:groups\/)?[^/]+\/)?posts\/[A-Za-z0-9._-]+\/?$/.test(p) ||
    /^\/(?:[^/]+\/)?videos\/[0-9]+\/?$/.test(p) ||
    /^\/reel\/[0-9]+\/?$/.test(p) ||
    (/^\/(?:story|permalink)\.php$/.test(p) && /^[A-Za-z0-9._-]+$/.test(u.searchParams.get('story_fbid') || '') && /^\d+$/.test(u.searchParams.get('id') || '')) ||
    (/^\/photo(?:\.php)?\/?$/.test(p) && /^\d+$/.test(u.searchParams.get('fbid') || ''))
  )) return 'Facebook';
  return null;
}
function active(policy, date, mode) { return !!policy && `${date} ${mode}` >= policy.effectiveFrom; }
function policyFor(policy, date, mode) {
  if (!active(policy, date, mode)) return null;
  return policy.targetOnlyFrom && `${date} ${mode}` >= policy.targetOnlyFrom
    ? { ...policy, targetOnly: true }
    : policy;
}
function auditSocial(edition, policy, groups) {
  const errors = [], shortfalls = [], counts = {}, platforms = new Set();
  function check(key, urls, card) {
    const adopted = [...new Set(urls)];
    const found = adopted.map(platformOf).filter(Boolean);
    const hits = found.filter(p => policy.platforms.includes(p)), need = Math.ceil(adopted.length * policy.minRatio);
    if (policy.excludeOtherSocialPlatforms) for (const p of new Set(found)) if (!policy.platforms.includes(p)) errors.push(`${key} 採用了已停用社交來源 ${p}`);
    if (card) hits.forEach(p => platforms.add(p));
    counts[key] = { total: adopted.length, social: hits.length, required: need };
    if (hits.length < need) {
      const message = `${key} 社交原帖只有 ${hits.length}/${adopted.length}（目標 ${need}，${policy.minRatio * 100}%；差 ${need - hits.length}）`;
      shortfalls.push(message);
      if (!policy.targetOnly) errors.push(`${key} 社交原帖只有 ${hits.length}/${adopted.length}（至少 ${need}，${policy.minRatio * 100}%）`);
    }
  }
  groups.forEach(g => check(g, (edition[g] || []).map(c => c[3]), true));
  if (policy.briefs) ['ai', 'warb'].forEach(g => check(g, ((edition[g] || {}).src || []).map(s => s[1]), false));
  return { errors, shortfalls, counts, platforms: [...platforms] };
}
module.exports = { platformOf, active, auditSocial, policyFor };
