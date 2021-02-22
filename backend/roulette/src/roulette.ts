import { Socket } from "socket.io";
import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";
import { getLastItem } from "./helpers";
import { Session, User } from "./types";

export class Roulette extends EventEmitter {
  private sessions: Map<string, Session>;
  private waiting: Set<User>;

  constructor() {
    super();
    this.sessions = new Map();
    this.waiting = new Set();
  }

  initUser(socket: Socket) {
    this.waiting.add({ id:socket.id, isSearching: false });
    console.log(this.waiting);
  }

  start(socket: Socket) {
    this.waiting.forEach(user => {
      if (user.id === socket.id && !user.isSearching) {
        user.isSearching = true;
        this.emit("searching", socket.id);
      }
    });
    console.log(this.waiting);
  }

  stop(socket: Socket) {
    this.waiting.forEach(user => {
      if (user.id === socket.id && user.isSearching) {
        user.isSearching = false;
      }
    });
    console.log(this.waiting);
  }
  
  disconnect(socket: Socket) {
    this.waiting.forEach(user => {
      if (user.id === socket.id) {
        this.waiting.delete(user);
      }
    });
    console.log(this.waiting);
  }

  searchPartner(socket: Socket) {
    return getLastItem(this.waiting);
  }

  createSession() {

  }
}
