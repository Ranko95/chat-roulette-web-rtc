import http from "http";
import express from "express";

const readConfig = require("common").config;

import { runServer as runSocketServer } from "./socket";
import { runServer as runHttpServer } from "./http";

async function setupGlobals() {
  //@ts-ignore
  global.config = await readConfig();
}

function runServer() {
  const port = process.env.PORT || 80;
  
  const app = express();

  const server = http.createServer(app);
  
  runSocketServer(server);
  runHttpServer(app);
  
  server.listen(port, () => console.log(`> Listening on ${port}`));
}

export async function run() {
  await setupGlobals();
  return runServer();
}
