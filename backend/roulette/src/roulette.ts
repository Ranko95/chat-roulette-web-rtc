import { Server, Socket } from "socket.io";
import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";
import { Session, User } from "./types";

export class Roulette extends EventEmitter {
  private sessions: Map<string, Session>
  private waiting: Set<User>;
  private io: Server;

  constructor({ io }: { io: Server }) {
    super();
    this.sessions = new Map();
    this.waiting = new Set();
    this.io = io;
  }

  public initUser(socket: Socket): void {
    this.waiting.add({ socket: socket, isSearching: false, roomId: null });
    console.log(this.waiting);
  }

  public start(socket: Socket): void {
    this.waiting.forEach(user => {
      if (user.socket === socket && !user.isSearching) {
        user.isSearching = true;

        const partner = this.searchPartner(socket);

        if (partner) {
          const roomId = uuidv4();
          socket.join(roomId);
          partner.socket.join(roomId);

          this.updateUserStatus(user, roomId, false);
          this.updateUserStatus(partner, roomId, false);

          this.sessions.set(roomId, { peer1: user, peer2: partner });

          this.waiting.forEach(user => {
            if (user.socket.id === socket.id || user.socket.id === partner.socket.id) {
              this.waiting.delete(user);
            }
          });

          this.io.to(roomId).emit("session-created", { roomId, masterId: user.socket.id });
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
    socket.emit("stopped");
    console.log(this.waiting);
  }

  public disconnectPeers(socket: Socket, roomId: string): void {
    const session = this.sessions.get(roomId);

    if (session) {
      const { peer1, peer2 } = session;

      this.io.to(roomId).emit("peers-disconnected", { initiatorId: socket.id });

      peer1.socket.leave(roomId);
      peer2.socket.leave(roomId);

      this.updateUserStatus(peer1, null, !this.isMe(socket, peer1.socket.id));
      this.updateUserStatus(peer2, null, !this.isMe(socket, peer2.socket.id));

      this.sessions.delete(roomId);

      this.waiting.add(peer1);
      this.waiting.add(peer2);

      console.log(this.sessions);
      console.log(this.waiting);
    }
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
  
  private updateUserStatus(user: User, roomId: string | null, isSearching: boolean): void {
    user.roomId = roomId;
    user.isSearching = isSearching;
  }

  private isMe(socket: Socket, id: string) {
    return socket.id === id;
  }
}
