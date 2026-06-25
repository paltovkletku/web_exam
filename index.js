import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import zlib from 'zlib';
import { promisify } from 'util';

const app = express();
const gzipAsync = promisify(zlib.gzip);

app.use(cors());

app.get('/login', (req, res) => {
  res.type('text/plain');
  res.send('annaborisevich');
});

app.post('/zipper', (req, res) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    let fileBuffer = null;
    const bb = busboy({ headers: req.headers });

    bb.on('file', (_name, file, _info) => {
      const chunks = [];
      file.on('data', (chunk) => { chunks.push(chunk); });
      file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    bb.on('field', (_name, val) => {
      if (fileBuffer === null) fileBuffer = Buffer.from(val);
    });

    bb.on('finish', async () => {
      try {
        const compressed = await gzipAsync(fileBuffer || Buffer.from(''));
        res.setHeader('Content-Type', 'application/gzip');
        res.setHeader('Content-Disposition', 'attachment; filename=result.gz');
        res.end(compressed);
      } catch (err) {
        res.status(500).send('Compression error');
      }
    });

    req.pipe(bb);
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => { chunks.push(chunk); });
  req.on('end', async () => {
    try {
      const compressed = await gzipAsync(Buffer.concat(chunks));
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', 'attachment; filename=result.gz');
      res.end(compressed);
    } catch (err) {
      res.status(500).send('Compression error');
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3000);
