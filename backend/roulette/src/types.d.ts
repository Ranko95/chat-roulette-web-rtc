import { Socket } from "socket.io";

export type Session = {
  peer1: User,
  peer2: User
}

export type User = {
  socket: Socket;
  isSearching: boolean;
  roomId?: string;
}

export type ChatMessage = {
  id: string;
  message: string;
  sessionId: string;
}

export type RTCIceCandidateOptions = {
  type: "ice-candidate",
  candidate: RTCIceCandidate
}

export interface ICustomGlobal extends NodeJS.Global {
  config: any,
}
