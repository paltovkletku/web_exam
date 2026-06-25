import express from "express";
import cors from "cors";
import busboy from "busboy";
import zlib from "zlib";

const app = express();

app.use(cors());

app.get("/login", (_, res) => {
  res.send("annaborisevich");
});

app.post("/zipper", (req, res) => {
  const bb = busboy({ headers: req.headers });
  const chunks = [];

  bb.on("file", (_, file) => {
    file.on("data", chunk => chunks.push(chunk));
  });

  bb.on("close", () => {
  const compressed = zlib.gzipSync(Buffer.concat(chunks));

  res.type("application/gzip");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=result.gz"
  );

  res.end(compressed);
});

  req.pipe(bb);
});

app.listen(process.env.PORT || 3000);
