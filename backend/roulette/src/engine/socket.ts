import { Socket, Server } from "socket.io";

import { Roulette } from "../internal/roulette";
import vars from "../config/vars";

import { ChatMessage } from "../types";

const { apiRoot } = vars;

export function runServer(): Server {
  const io = new Server({ path: `${apiRoot}/roulette`, transports: ["websocket"] });

  const roulette = new Roulette({ io });

  io.on("connection", (socket: Socket) => {
    console.log(`a user ${socket.id} connected to the roulette server`);
    roulette.initUser(socket);

    socket.on("start", () => {
      console.log(`a user ${socket.id} started roulette`);
      roulette.start(socket);
      socket.emit("started");
    });

    socket.on("stopped", (data) => {
      console.log(`a user ${socket.id} stopped roulette`);
      if (data.sessionId) {
        roulette.disconnectPeers(socket, data.sessionId);
      } else {
        roulette.stop(socket);
      }
    });

    socket.on("next", (data) => {
      if (data.sessionId) {
        roulette.next(data.sessionId);
      }
    });

    socket.on("signaling-channel", (message) => {
      if (message.sessionId) {
        socket.to(message.sessionId).emit("peer-connection-message", message.data);
      }
    });
    
    socket.on("chat-message", (message: ChatMessage) => {
      io.to(message.sessionId).emit("chat-message", message);
    });

    socket.once("disconnect", () => {
      console.log(`a user ${socket.id} disconnected`);
      roulette.disconnect(socket);
    });
  });

  return io;
}
