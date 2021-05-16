import { Socket } from "socket.io";
import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";
import { Session, User } from "./types";

export class Roulette extends EventEmitter {
  private sessions: Map<string, Session>
  private waiting: Set<User>;

  constructor() {
    super();
    this.sessions = new Map();
    this.waiting = new Set();
  }

  public initUser(socket: Socket): void {
    this.waiting.add({ socket: socket, isSearching: false });
    console.log(this.waiting);
  }

  public start(socket: Socket): void {
    this.waiting.forEach(user => {
      if (user.socket === socket && !user.isSearching) {
        user.isSearching = true;
        this.emit("searching", socket.id);

        const partner = this.searchPartner(socket);

        if (partner) {
          const roomId = uuidv4();
          socket.join(roomId);
          partner.socket.join(roomId);

          this.updateUserStatus(user, roomId);
          this.updateUserStatus(partner, roomId);

          this.sessions.set(roomId, { peer1: user, peer2: partner });
          this.emit("session-created", { roomId, masterId: user.socket.id });

          this.waiting.forEach(user => {
            if (user.socket.id === socket.id || user.socket.id === partner.socket.id) {
              this.waiting.delete(user);
            }
          });
        }
      }
    });

    console.log(this.waiting);
    console.log(this.sessions);
  }

  public stop(socket: Socket): void {
    this.waiting.forEach(user => {
      if (user.socket.id === socket.id && user.isSearching) {
        user.isSearching = false;
      }
    });
    console.log(this.waiting);
  }
  
  public disconnect(socket: Socket): void {
    this.waiting.forEach(user => {
      if (user.socket.id === socket.id) {
        this.waiting.delete(user);
      }
    });
    console.log(this.waiting);
  }

  private searchPartner(socket: Socket): User | undefined {
    let partner;
    this.waiting.forEach(user => {
      if (user.socket.id !== socket.id && user.isSearching) {
        partner = user;
        return;
      }
    });

    return partner;
  }
  
  private updateUserStatus(user: User, roomId: string): void {
    user.roomId = roomId;
    user.isSearching = false;
  }
}
