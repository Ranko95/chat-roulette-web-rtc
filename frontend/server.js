const express = require("express");
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");

const port = parseInt(process.env.PORT, 10) || 80;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const apiHost = process.env.API_HOST || "http://proxy";

app.prepare().then(async () => {
  const server = express();

  server.use("/api", createProxyMiddleware({ target: apiHost, changeOrigin: true, ws: true }));

  server.use("/", express.static("public"));

  server.all("*", (req, res) => handle(req, res));

  server.listen(port, (err) => {
    if (err) {
      throw error;
    }

    console.log(`> Frontend is ready on port ${port}`);
  });
});
