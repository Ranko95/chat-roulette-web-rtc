import { Server } from "http";
import socketIO, { Socket } from 'socket.io';

export function runServer(server: Server) {
  //@ts-ignore
  const io = socketIO(server, { path: "api/v1/roulette/io", transports: ["websockets"] });
  
  io.on("connection", (socket: Socket) => {
    console.log("a user connected to the roulette server");
  });

  return io;
}
