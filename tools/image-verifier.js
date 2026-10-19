const https = require('https');
const http = require('http');

function fetchBuffer(url, options = {}) {
  const { headers = {}, timeout = 15000, maxRedirects = 5 } = options;
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const mod = u.protocol === 'https:' ? https : http;
      const opts = {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          ...headers
        }
      };
      const req = mod.request(opts, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (maxRedirects <= 0) {
            return resolve({ status: res.statusCode, error: 'Too many redirects', buffer: Buffer.alloc(0) });
          }
          let loc = res.headers.location;
          if (!loc.startsWith('http')) {
            loc = new URL(loc, url).href;
          }
          return fetchBuffer(loc, { ...options, maxRedirects: maxRedirects - 1 }).then(resolve);
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          resolve({ status: res.statusCode, headers: res.headers, buffer: buf });
        });
      });
      req.on('error', (err) => resolve({ status: 0, error: err.message, buffer: Buffer.alloc(0) }));
      req.setTimeout(timeout, () => {
        req.destroy();
        resolve({ status: 0, error: 'timeout', buffer: Buffer.alloc(0) });
      });
      req.end();
    } catch (e) {
      resolve({ status: 0, error: e.message, buffer: Buffer.alloc(0) });
    }
  });
}

function detectImageType(buf) {
  if (!buf || buf.length < 8) return null;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  // WebP: RIFF ... WEBP
  if (buf.length >= 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  // GIF: GIF87a or GIF89a
  if (buf.slice(0, 6).toString().startsWith('GIF8')) return 'gif';
  // SVG
  const snippet = buf.slice(0, 512).toString('utf8');
  if (snippet.includes('<svg')) return 'svg';
  // AVIF: ftypavif
  if (buf.length >= 12 && buf.slice(4, 12).toString().includes('avif')) return 'avif';

  return null;
}

async function verifyImage(url, options = {}) {
  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    return { valid: false, status: 0, reason: '無效或非 HTTP(S) URL' };
  }

  const res = await fetchBuffer(url, options);
  if (res.status !== 200) {
    return {
      valid: false,
      status: res.status,
      reason: `HTTP ${res.status || '連線失敗'}${res.error ? ` (${res.error})` : ''}`
    };
  }

  const buf = res.buffer;
  if (!buf || buf.length < 80) {
    return {
      valid: false,
      status: res.status,
      bytes: buf ? buf.length : 0,
      reason: `檔案過細 (${buf ? buf.length : 0} bytes)`
    };
  }

  const type = detectImageType(buf);
  if (!type) {
    return {
      valid: false,
      status: res.status,
      bytes: buf.length,
      reason: '二進制格式檢查失敗 (非合法 JPEG/PNG/WEBP/GIF/SVG 格式)'
    };
  }

  return {
    valid: true,
    status: 200,
    type,
    bytes: buf.length
  };
}

async function verifyAllImages(items, concurrency = 8) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      const item = items[idx];
      const ver = await verifyImage(item.url);
      results[idx] = { ...item, verification: ver };
    }
  }

  const workers = [];
  const count = Math.min(concurrency, items.length);
  for (let i = 0; i < count; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  const failures = results.filter(r => !r.verification.valid);
  return { results, failures };
}

module.exports = {
  fetchBuffer,
  detectImageType,
  verifyImage,
  verifyAllImages
};
