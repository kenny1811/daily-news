const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { detectImageType, verifyImage, verifyAllImages } = require('./image-verifier');

async function runTests() {
  console.log('Running image-verifier tests...');

  // 1. detectImageType unit tests
  const jpegBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  assert.strictEqual(detectImageType(jpegBuf), 'jpeg');

  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.strictEqual(detectImageType(pngBuf), 'png');

  const webpBuf = Buffer.from('RIFF\x20\x00\x00\x00WEBPVP8 ');
  assert.strictEqual(detectImageType(webpBuf), 'webp');

  const gifBuf = Buffer.from('GIF89a\x01\x00\x01\x00');
  assert.strictEqual(detectImageType(gifBuf), 'gif');

  const svgBuf = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  assert.strictEqual(detectImageType(svgBuf), 'svg');

  const invalidBuf = Buffer.from('This is not an image');
  assert.strictEqual(detectImageType(invalidBuf), null);

  // 2. HTTP Server mock tests
  const server = http.createServer((req, res) => {
    if (req.url === '/valid.png') {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(fs.readFileSync(path.join(__dirname, '..', 'favicon-32.png')));
    } else if (req.url === '/redirect') {
      res.writeHead(302, { 'Location': '/valid.png' });
      res.end();
    } else if (req.url === '/notfound.jpg') {
      res.writeHead(404);
      res.end('Not Found');
    } else if (req.url === '/corrupt.jpg') {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      const b = Buffer.alloc(120);
      b[0] = 0xff; b[1] = 0xd8; b[2] = 0xff; b[3] = 0xe0;
      res.end(b);
    } else if (req.url === '/toosmall.jpg') {
      res.writeHead(200);
      res.end('tiny');
    } else {
      res.writeHead(500);
      res.end('Server Error');
    }
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Test valid image
    const v1 = await verifyImage(`${baseUrl}/valid.png`);
    assert.strictEqual(v1.valid, true);
    assert.strictEqual(v1.status, 200);
    assert.strictEqual(v1.type, 'png');
    assert.strictEqual(v1.width, 32);
    assert.strictEqual(v1.height, 32);
    assert.strictEqual((await verifyImage(`${baseUrl}/valid.png`, { minBytes: 2000 })).valid, false);

    // Test redirect to valid image
    const v2 = await verifyImage(`${baseUrl}/redirect`);
    assert.strictEqual(v2.valid, true);
    assert.strictEqual(v2.status, 200);

    // Test 404
    const v3 = await verifyImage(`${baseUrl}/notfound.jpg`);
    assert.strictEqual(v3.valid, false);
    assert.strictEqual(v3.status, 404);

    // Test corrupt
    const v4 = await verifyImage(`${baseUrl}/corrupt.jpg`);
    assert.strictEqual(v4.valid, false);
    assert.ok(v4.reason.includes('圖片解碼失敗'));

    // Test too small
    const v5 = await verifyImage(`${baseUrl}/toosmall.jpg`);
    assert.strictEqual(v5.valid, false);
    assert.ok(v5.reason.includes('檔案過細'));

    // Test verifyAllImages
    const batch = [
      { tag: 'card1', url: `${baseUrl}/valid.png` },
      { tag: 'card2', url: `${baseUrl}/notfound.jpg` }
    ];
    const { results, failures } = await verifyAllImages(batch);
    assert.strictEqual(results.length, 2);
    assert.strictEqual(failures.length, 1);
    assert.strictEqual(failures[0].tag, 'card2');

    console.log('image-verifier tests passed successfully!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
