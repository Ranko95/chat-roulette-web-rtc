import { Socket } from "socket.io";

export type Session = {
  peer1: User,
  peer2: User
}

export type User = {
  socket: Socket;
  isSearching: boolean;
  roomId: string | null; 
}

export type ChatMessage = {
  id: string;
  message: string;
  sessionId: string;
}
