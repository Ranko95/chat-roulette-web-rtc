import { Socket } from "socket.io";

export type Session = {
  id: string;
  peer1: string;
  peer2: string;
}

export type User = {
  id: string;
  isSearching: boolean;
}
