import { Server } from "http";
import socketIO, { Socket } from 'socket.io';
import { Roulette } from "../roulette";
import { ChatMessage, RTCIceCandidateOptions } from "../types";

export function runServer(server: Server) {
  // @ts-ignore
  const io = socketIO(server, { path: "/api/v1/roulette", transports: ["websocket"] });

  const roulette = new Roulette();
  roulette.on("session-created", ({ roomId, masterId }) => {
    console.log(`session ${roomId} has been created!`);
    io.to(roomId).emit("session-created", { roomId, masterId });
  }); 

  io.on("connection", (socket: Socket) => {
    console.log(`a user ${socket.id} connected to the roulette server`);
    roulette.initUser(socket);

    socket.on("start", () => {
      console.log(`a user ${socket.id} started roulette`);
      roulette.start(socket);
      socket.emit("started");
    });

    socket.on("stopped", () => {
      console.log(`a user ${socket.id} stopped roulette`);
      roulette.stop(socket);
    });

    socket.on("signaling-channel", (message: RTCOfferOptions | RTCAnswerOptions | RTCIceCandidateOptions) => {
      console.log(message);
      socket.broadcast.emit("peer-connection-message", message);
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
