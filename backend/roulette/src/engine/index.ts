import http from "http";
import express from "express";
import { runServer as runSocketServer } from "./socket";
import { runServer as runHttpServer } from "./http";

function runServer() {
  const port = process.env.PORT || 5000;
  
  const app = express();

  const server = http.createServer(app);
  
  runSocketServer(server);
  runHttpServer(app);
  
  
  server.listen(port, () => console.log(`Listening on ${port}`));
}

export function run() {
  return runServer();
}
