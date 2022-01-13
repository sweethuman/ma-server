import {Namespace, Socket, SocketService, SocketSession} from "@tsed/socketio";
import jwt from "jsonwebtoken";
import {Student} from "../model/Student";
import {UserService} from "./UserService";

@SocketService()
export class StudentSocket {
  @Namespace nsp: Namespace;

  constructor(private userService: UserService) {}

  public clients: Map<string, {socket: Socket; email: string}> = new Map();

  $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession) {
    try {
      const payload = jwt.verify(socket.handshake.auth.token, "secret", {
        audience: "yoursite.net",
        issuer: "accounts.examplesoft.com"
      });
      this.clients.set(socket.id, {socket, email: payload.sub});
    } catch (e) {
      console.log(`${socket.id} not authorized`);
      socket.disconnect(true);
      return new Error("not authorized");
    }
  }

  $onDisconnect(@Socket socket: Socket) {
    this.clients.delete(socket.id);
  }

  broadcastStudent(event: "deleted" | "created" | "updated", payload: Partial<Student> & {id: string}) {
    for (const client of this.clients.values()) {
      const user = this.userService.findByEmail(client.email);
      if (user?.assetIds.findIndex((element) => element === payload.id) !== -1) {
        client.socket.emit("student", {
          event,
          payload: {
            item: payload
          }
        });
      }
    }
  }
}
