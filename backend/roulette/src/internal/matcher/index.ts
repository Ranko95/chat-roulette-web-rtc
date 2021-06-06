import { EventEmitter } from "events";
import { Socket } from "socket.io";
import setToFilteredArray from "../../helpers/setToFilteredArray";
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

    const searchingUsersList = setToFilteredArray(this._waiting, (user: User) => user.isSearching);

    if (searchingUsersList.length === 0 || searchingUsersList.length === 1) {
      return null;
    }

    if (searchingUsersList.length === 2) {
      peer1 = searchingUsersList[0];
      peer2 = searchingUsersList[1];
    }

    if (searchingUsersList.length > 2) {
      const firstRandIndex = Math.floor(Math.random() * searchingUsersList.length);
      
      peer1 = searchingUsersList[firstRandIndex];
      searchingUsersList.splice(firstRandIndex, 1);

      const secondRandIndex = Math.floor(Math.random() * searchingUsersList.length);
      peer2 = searchingUsersList[secondRandIndex];
    }

    if (!peer1 || !peer2) {
      return null
    }

    this.deleteUsers([peer1, peer2]);

    return {
      peer1,
      peer2,
    };
  }

  get waiting() {
    return this._waiting;
  }
}
