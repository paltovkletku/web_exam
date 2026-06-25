import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import zlib from 'zlib';
import { promisify } from 'util';

const app = express();
const gzip = promisify(zlib.gzip);

app.use(cors());

async function sendGzip(buffer, res) {
  const compressed = await gzip(buffer);
  res.type('application/gzip');
  res.setHeader('Content-Disposition', 'attachment; filename=result.gz');
  res.end(compressed);
}

app.get('/login', (req, res) => {
  res.send('annaborisevich');
});

app.post('/zipper', (req, res) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    const chunks = [];
    const bb = busboy({ headers: req.headers });

    bb.on('file', (_, file) => {
      file.on('data', chunk => chunks.push(chunk));
    });

    bb.on('finish', async () => {
      try {
        await sendGzip(Buffer.concat(chunks), res);
      } catch {
        res.status(500).send('Compression error');
      }
    });

    req.pipe(bb);
    return;
  }

  const chunks = [];

  req.on('data', chunk => chunks.push(chunk));

  req.on('end', async () => {
    try {
      await sendGzip(Buffer.concat(chunks), res);
    } catch {
      res.status(500).send('Compression error');
    }
  });
});

app.listen(process.env.PORT || 3000);
