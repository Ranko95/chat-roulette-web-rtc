import { Server } from "http";
import socketIO, { Socket } from 'socket.io';

export function runServer(server: Server) {
  //@ts-ignore
  const io = socketIO(server, { transports: ["websocket"] });

  io.on("connection", (socket: Socket) => {
    console.log("a user connected to the roulette server");

    socket.once("disconnect", () => {
      console.log("a user disconnected");
    })
  });

  return io;
}
