import { Socket } from "socket.io";
import { Session } from "./types";

export class Roulette {
  private sessions: Map<string, Session>;
  private waiting: Array<string>;

  constructor() {
    this.sessions = new Map();
    this.waiting = [];
  }

  init(socket: Socket) {
    
  }
}
