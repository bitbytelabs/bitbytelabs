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

const players = new Map();
const sseClients = new Set();

const broadcastPlayers = () => {
  const payload = JSON.stringify({
    type: "players",
    players: Array.from(players.values()),
  });

  sseClients.forEach((res) => {
    res.write(`data: ${payload}\n\n`);
  });
};

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.write("data: {" + "\"type\":\"connected\"}" + "\n\n");
    sseClients.add(res);
    broadcastPlayers();

    req.on("close", () => {
      sseClients.delete(res);
    });
    return;
  }

  if (req.url === "/state" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.id) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "error", message: "Missing id" }));
          return;
        }
        players.set(payload.id, {
          id: payload.id,
          name: payload.name || "Guest",
          position: payload.position || { x: 0, y: 1, z: 0 },
        });
        broadcastPlayers();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "error", message: "Invalid JSON" }));
      }
    });
    return;
  }

  const urlPath = req.url.split("?")[0].split("#")[0];
  const safePath = urlPath === "/" ? "/index.html" : urlPath;
  const resolvedPath = path.resolve(publicDir, "." + safePath);

  fs.realpath(resolvedPath, (realErr, filePath) => {
    if (realErr || !filePath.startsWith(publicDir)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden");
      return;
    }

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
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
