import http from "http";
import { runServer as runSocketServer } from "./socket";

function runServer() {
  const port = process.env.PORT || 5000;

  const server = http.createServer();

  const io = runSocketServer(server);
  
  server.listen(port, () => console.log(`Listening on ${port}`));
}

export function run() {
  return runServer();
}
