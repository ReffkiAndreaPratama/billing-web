import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, { userId: string; role: string; socketId: string }>();

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (token) {
      // In production, verify JWT here
      console.log(`Authenticated client: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [key, val] of this.onlineUsers.entries()) {
      if (val.socketId === client.id) {
        this.onlineUsers.delete(key);
        this.server.emit('user:offline', { userId: val.userId });
        break;
      }
    }
  }

  getOnlineCount(): number {
    return this.onlineUsers.size;
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    for (const [, val] of this.onlineUsers.entries()) {
      if (val.userId === userId) {
        this.server.to(val.socketId).emit(event, data);
        break;
      }
    }
  }
}
