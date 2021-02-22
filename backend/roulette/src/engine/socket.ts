import { Server } from "http";
import socketIO, { Socket } from 'socket.io';
import { Roulette } from "../roulette";

export function runServer(server: Server) {
  //@ts-ignore
  const io = socketIO(server, { transports: ["websocket"] });

  const roulette = new Roulette();
  roulette.on("searching", (id) => console.log(`A user ${id} started searching`));

  io.on("connection", (socket: Socket) => {
    console.log(`a user ${socket.id} connected to the roulette server`);
    roulette.initUser(socket);

    socket.on("start", () => {
      console.log(`a user ${socket.id} started roulette`);
      roulette.start(socket);
      socket.emit("started");
    });

    socket.on("stopped",() => {
      console.log(`a user ${socket.id} stopped roulette`);
      roulette.stop(socket);
    });

    socket.once("disconnect", () => {
      console.log(`a user ${socket.id} disconnected`);
      roulette.disconnect(socket);
    });
  });

  return io;
}
