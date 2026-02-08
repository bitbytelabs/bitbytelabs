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

  let pathname;
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch (error) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad request");
    return;
  }

  const safePath = pathname === "/" ? "/index.html" : pathname;
  const resolvedPath = path.resolve(publicDir, `.${safePath}`);

  if (!resolvedPath.startsWith(`${publicDir}${path.sep}`)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(resolvedPath);
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
