import { Socket } from "socket.io";

export type Session = {
  id: string;
  socket: Socket;
  peer?: string;
}
