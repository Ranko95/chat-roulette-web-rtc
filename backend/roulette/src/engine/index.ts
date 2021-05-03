import http from "http";
import express from "express";

import { config } from "common";

import { runServer as runSocketServer } from "./socket";
import { runServer as runHttpServer } from "./http";

import { ICustomGlobal } from "../types";

declare const global: ICustomGlobal;

async function setupGlobals() {
  global.config = await config.readConfig();
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
