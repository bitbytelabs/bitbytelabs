const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const contentTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  const safePath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(publicDir, safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const notFoundPath = path.join(publicDir, "404.html");
      fs.readFile(notFoundPath, (fallbackErr, fallbackData) => {
        if (fallbackErr) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not found");
          return;
        }

        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(fallbackData);
      });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
