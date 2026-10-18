const { platformOf } = require('./social-policy');

// An older first-hand post can support a newly published report, but the two
// timestamps and both permanent links must remain separate and inspectable.
function validateLateThreads(card, { parseHKT, floorMs, ceilMs, nowMs }) {
  const errors = [];
  if (platformOf(card[3]) !== 'Threads') errors.push('舊來源只容許 Threads 個人原帖');
  const report = card[8]?.freshReport;
  if (!report || typeof report !== 'object') return [...errors, '欠窗內新報道證據 freshReport'];
  if (!String(report.source || '').trim()) errors.push('新報道欠來源名');
  if (!String(report.newInformation || '').trim()) errors.push('欠說明新報道提供嘅新資訊');
  let url;
  try { url = new URL(report.url); } catch (_) {}
  if (!url || url.protocol !== 'https:' || url.pathname === '/' || platformOf(report.url)) errors.push('新報道 URL 必須係 https 單篇文章');
  const postAt = parseHKT(card[4]);
  if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(String(report.publishedAt || ''))) errors.push('新報道必須有確切首發時分');
  const reportAt = parseHKT(report.publishedAt);
  if (postAt === null) errors.push('舊原帖首次發放時間無法核實');
  if (reportAt === null) errors.push('新報道首次發放時間無法核實');
  else {
    if (reportAt < floorMs || reportAt > ceilMs) errors.push('新報道首次發放時間唔喺本版時間窗');
    if (reportAt > nowMs) errors.push('新報道首次發放時間係未來');
    if (postAt !== null && postAt > reportAt) errors.push('原帖時間遲過新報道');
  }
  return errors;
}

module.exports = { validateLateThreads };
