import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/billing',
})
export class BillingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clientRooms = new Map<string, string[]>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.clientRooms.set(client.id, []);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clientRooms.delete(client.id);
  }

  @SubscribeMessage('joinBranch')
  handleJoinBranch(client: Socket, branchId: string) {
    const room = `branch:${branchId}`;
    client.join(room);
    const rooms = this.clientRooms.get(client.id) || [];
    rooms.push(room);
    this.clientRooms.set(client.id, rooms);
  }

  @SubscribeMessage('leaveBranch')
  handleLeaveBranch(client: Socket, branchId: string) {
    client.leave(`branch:${branchId}`);
  }

  emitUnitUpdate(unitId: string, status: string, session?: any) {
    this.server.emit('unit:update', { unitId, status, session });
  }

  emitTimerUpdate(sessionId: string, remainingMinutes: number, totalCost: number) {
    this.server.emit('billing:timer', { sessionId, remainingMinutes, totalCost });
  }

  emitNewTransaction(transaction: any) {
    this.server.emit('transaction:new', transaction);
  }

  emitBillingStarted(session: any) {
    this.server.emit('billing:started', session);
  }

  emitBillingEnded(sessionId: string) {
    this.server.emit('billing:ended', { sessionId });
  }

  emitBillingPaused(session: any) {
    this.server.emit('billing:paused', session);
  }

  emitBillingResumed(session: any) {
    this.server.emit('billing:resumed', session);
  }

  emitBranchUpdate(branchId: string, event: string, data: any) {
    this.server.to(`branch:${branchId}`).emit(event, data);
  }

  emitNotification(message: string, type = 'info') {
    this.server.emit('notification', { message, type });
  }
}
