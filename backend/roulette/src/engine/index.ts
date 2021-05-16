import { runServer as runSocketServer } from "./socket";
import vars from "../config/vars";

const { port } = vars;

function runServer() {
  const io = runSocketServer();
  
  io.listen(parseInt(port));

  console.log(`> Socket server listening on port ${port}`)
}

export async function run() {
  return runServer();
}
