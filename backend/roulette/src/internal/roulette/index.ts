import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Session, User } from "../../types";
import { Matcher } from "../matcher";

export class Roulette {
  private sessions: Map<string, Session>
  private io: Server;
  private matcher: Matcher;

  constructor({ io }: { io: Server }) {
    this.sessions = new Map();
    this.io = io;
    this.matcher = new Matcher();
    this.registerListeners();
  }

  public initUser(socket: Socket): void {
    this.matcher.addUsers([{ socket: socket, isSearching: false, roomId: null }]);
    console.log(this.matcher.waiting);
  }

  public start(socket: Socket): void {
    this.matcher.onUserStart(socket);
    console.log(this.matcher.waiting);
    console.log(this.sessions);
  }

  public stop(socket: Socket): void {
    this.matcher.onUserStop(socket);
    socket.emit("stopped");
    console.log(this.matcher.waiting);
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

      this.matcher.addUsers([peer1, peer2]);

      console.log(this.sessions);
      console.log(this.matcher.waiting);
    }
  }

  public next(socket: Socket, roomId: string): void {
    const session = this.sessions.get(roomId);

    if (session) {
      const { peer1, peer2 } = session;

      this.io.to(roomId).emit("peers-disconnected-next");

      peer1.socket.leave(roomId);
      peer2.socket.leave(roomId);

      this.updateUserStatus(peer1, null, true);
      this.updateUserStatus(peer2, null, true);

      this.sessions.delete(roomId);

      this.matcher.addUsers([peer1, peer2]);

      console.log(this.sessions);
      console.log(this.matcher.waiting);
    }
  }
  
  public disconnect(socket: Socket): void {
    this.matcher.onUserDisconnect(socket);
    console.log(this.matcher.waiting);
  }
  
  private updateUserStatus(user: User, roomId: string | null, isSearching: boolean): void {
    user.roomId = roomId;
    user.isSearching = isSearching;
  }

  private isMe(socket: Socket, id: string) {
    return socket.id === id;
  }

  private registerListeners() {
    this.matcher.on("match", () => {
      const partners = this.matcher.onMatchPartners();
      console.log(partners, "PARTNERS")
      if (partners) {
        const { peer1, peer2 } = partners;
        const roomId = uuidv4();
        peer1.socket.join(roomId);
        peer2.socket.join(roomId);

        this.updateUserStatus(peer1, roomId, false);
        this.updateUserStatus(peer2, roomId, false);

        this.sessions.set(roomId, { peer1, peer2 });

        this.io.to(roomId).emit("session-created", { roomId, masterId: peer1.socket.id });
      }
    });
  }
}
