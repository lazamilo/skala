import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const port = +process.env.PORT || 4317;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.otf':'font/otf','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const type = types[path.extname(f)] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const [s, en] = range.replace('bytes=', '').split('-'); const start = +s, end = en ? +en : st.size - 1;
      res.writeHead(206, {'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1});
      return fs.createReadStream(f, {start, end}).pipe(res);
    }
    res.writeHead(200, {'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes'});
    fs.createReadStream(f).pipe(res);
  });
}).listen(port, () => console.log('http://localhost:' + port));
