import {Namespace, SocketService} from "@tsed/socketio";

@SocketService()
export class StudentSocket {
  @Namespace nsp: Namespace;

  broadcastStudent(event: "deleted" | "created" | "updated", payload: any) {
    this.nsp.emit("student", {event, payload});
  }
}
