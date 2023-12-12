const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8096;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define root for home page
app.get("/", function (req, res) {
  fs.readdir("public/", function (err, files) {
    if (err) {
      res.write(err.message);
      res.end();
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });

    res.write(`
      <html >
        <head>
          <title>MediaCenter</title>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
          <style>
            * {
              user-select: none;
            }

            html {
              font-family: monospace;
              background: black;
              color: white;
            }

            body {
              max-width: 1024px;
              display: block;
              margin: auto;
              padding: 50px;
            }

            main {
              display: flex;
              width: 100%;
              flex-wrap: wrap;
              gap: 25px;
            }

            article {
              flex: 1 0 350px;
            }

            img {
              width: 100%;
              border-bottom: solid 1px white;
              opacity: 0.8;
            }

            img:hover {
              opacity: 1;
            }

            h1 {
              text-align: center;
              text-transform: uppercase;
            }

            a {
              text-decoration: none;
              color: yellow;
            }
          </style>
        </head>
        <body>
          <h1>Bienvenue au centre de médias</h1>

          <main>
          ${files.filter(f => f.endsWith(".jpg")).map(file => `
            <article>
              <a href="${file.replace(".jpg", ".mp4")}">
                <img src="${file}"/>
                <h2>${file.replace(".jpg", "")}</h2>
              </a>
            </article>
          `)}
          </main>
        </body>
      </html>
    `.replace(/,/g, ""));

    res.end();
  });
});

// Endpoint for video
app.get(/\*.mp4/, function (req, res) {
  let range = req.headers.range;
  if (!range) {
    range = "0";
  }
  const videoPath = path.join(__dirname, 'public', req.path)
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
