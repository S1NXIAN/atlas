const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OPCODES = { TEXT: 0x01, CLOSE: 0x08, PING: 0x09, PONG: 0x0A };
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function computeAcceptKey(clientKey) {
  return crypto.createHash('sha1').update(clientKey + WS_MAGIC).digest('base64');
}

function encodeFrame(opcode, payload) {
  const fin = 0x80;
  const len = payload.length;
  let header;
  if (len < 126) { header = Buffer.alloc(2); header[0] = fin | opcode; header[1] = len; }
  else if (len < 65536) { header = Buffer.alloc(4); header[0] = fin | opcode; header[1] = 126; header.writeUInt16BE(len, 2); }
  else { header = Buffer.alloc(10); header[0] = fin | opcode; header[1] = 127; header.writeBigUInt64BE(BigInt(len), 2); }
  return Buffer.concat([header, payload]);
}

const PORT = process.env.BRAINSTORM_PORT || (49152 + Math.floor(Math.random() * 16383));
const HOST = process.env.BRAINSTORM_HOST || '127.0.0.1';
const SESSION_DIR = process.env.BRAINSTORM_DIR || '/tmp/brainstorm';
const CONTENT_DIR = path.join(SESSION_DIR, 'content');
const STATE_DIR = path.join(SESSION_DIR, 'state');
let ownerPid = process.env.BRAINSTORM_OWNER_PID ? Number(process.env.BRAINSTORM_OWNER_PID) : null;

const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json'
};

function handleRequest(req, res) {
  if (req.method === 'GET' && req.url === '/') {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.html')).sort();
    const newest = files.length > 0 ? files[files.length - 1] : null;
    let html = newest
      ? fs.readFileSync(path.join(CONTENT_DIR, newest), 'utf-8')
      : '<html><body><h1>Waiting for content...</h1></body></html>';
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}

function startServer() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });

  const server = http.createServer(handleRequest);

  fs.watch(CONTENT_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
      console.log(JSON.stringify({ type: 'file-changed', file: filename }));
    }
  });

  function shutdown(reason) {
    console.log(JSON.stringify({ type: 'server-stopped', reason }));
    server.close(() => process.exit(0));
  }

  server.listen(PORT, HOST, () => {
    const info = JSON.stringify({
      type: 'server-started', port: PORT, host: HOST,
      url: 'http://' + HOST + ':' + PORT,
      screen_dir: CONTENT_DIR, state_dir: STATE_DIR
    });
    console.log(info);
    fs.writeFileSync(path.join(STATE_DIR, 'server-info'), info + '\n');
  });
}

if (require.main === module) startServer();
module.exports = { computeAcceptKey, encodeFrame, OPCODES };
