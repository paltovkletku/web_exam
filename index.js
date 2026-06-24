import express from 'express';
import multer from 'multer';
import zlib from 'zlib';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.get('/login', (req, res) => {
  res.send('annaborisevich');
});

app.post('/zipper', upload.single('file'), (req, res) => {
  zlib.gzip(req.file.buffer, (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', 'attachment; filename="result.gz"');
    res.send(result);
  });
});

app.listen(process.env.PORT || 3000);
