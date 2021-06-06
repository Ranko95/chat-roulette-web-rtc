import { EventEmitter } from "events";
import { Socket } from "socket.io";
import { User } from "../../types";

export class Matcher extends EventEmitter {
  private _waiting: Set<User>;

  constructor() {
    super();
    this._waiting = new Set();
  }

  public addUsers(users: User[]): void {
    users.forEach(user => this._waiting.add(user));
    this.emit("match");
  }

  public deleteUsers(users: User[]): void {
    users.forEach(user => this._waiting.delete(user));
  }

  public onUserStart(socket: Socket): void {
    this._waiting.forEach(user => {
      if (user.socket === socket && !user.isSearching) {
        user.isSearching = true;
      }
    });
    
    this.emit("match");
  }

  public onUserStop(socket: Socket): void {
    this._waiting.forEach(user => {
      if (user.socket.id === socket.id && user.isSearching) {
        user.isSearching = false;
      }
    });
  }

  public onUserDisconnect(socket: Socket): void {
    this._waiting.forEach(user => {
      if (user.socket.id === socket.id) {
        this.waiting.delete(user);
      }
    });
  }

  public onMatchPartners(): { peer1: User, peer2: User } | null {
    let peer1: User | undefined;
    let peer2: User | undefined;

    for (const user of this._waiting) {
      if (peer1 && peer2) {
        break;
      }

      if (user.isSearching && !peer1)  {
        peer1 = user;
        continue;
      }

      if (user.isSearching && !peer2) {
        peer2 = user;
        continue;
      }
    }

    if (!peer1 || !peer2) {
      return null;
    }

    this.deleteUsers([peer1, peer2]);

    return {
      peer1,
      peer2,
    }
  }

  get waiting() {
    return this._waiting;
  }
}
