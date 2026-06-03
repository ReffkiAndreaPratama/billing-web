import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentService } from './agent.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/agent',
})
export class AgentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private agentService: AgentService) {}

  handleConnection(client: Socket) {
    console.log(`[Agent] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Find and unregister agent
    for (const [machineId, info] of Object.entries(this.agentService.getAllAgents())) {
      if (info.socketId === client.id) {
        this.agentService.unregisterAgent(machineId);
        this.server.emit('agent:offline', { machineId, hostname: info.hostname });
        break;
      }
    }
    console.log(`[Agent] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('agent:register')
  handleRegister(client: Socket, data: { machineId: string; branchId: string; hostname: string; platform: string; arch: string }) {
    const agent = this.agentService.registerAgent({
      ...data,
      socketId: client.id,
    });

    // Join branch room
    client.join(`branch:${data.branchId}`);

    // Find unit by machineId
    const unitName = data.hostname;

    client.emit('agent:authenticated', { unitName });
    this.server.emit('agent:online', { machineId: data.machineId, hostname: data.hostname, branchId: data.branchId });

    console.log(`[Agent] Registered: ${data.hostname} (${data.machineId})`);
  }

  @SubscribeMessage('agent:system-stats')
  handleSystemStats(client: Socket, data: any) {
    this.agentService.updateStats(data.machineId, data);

    // Broadcast to branch monitoring
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(`branch:${agent.branchId}`).emit('agent:stats', {
        machineId: data.machineId,
        hostname: agent.hostname,
        stats: data,
      });
    }
  }

  @SubscribeMessage('agent:screenshot')
  handleScreenshot(client: Socket, data: { machineId: string; image: string }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(`branch:${agent.branchId}`).emit('agent:screenshot', {
        machineId: data.machineId,
        hostname: agent.hostname,
        image: data.image,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('agent:heartbeat')
  handleHeartbeat(client: Socket, data: { machineId: string; sessionId: string; remainingMinutes: number }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      agent.lastSeen = new Date();
      this.server.to(`branch:${agent.branchId}`).emit('agent:heartbeat', {
        machineId: data.machineId,
        hostname: agent.hostname,
        sessionId: data.sessionId,
        remainingMinutes: data.remainingMinutes,
      });
    }
  }

  // Commands from admin dashboard to agent
  @SubscribeMessage('admin:lock')
  handleAdminLock(client: Socket, data: { machineId: string }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(agent.socketId).emit('command:lock');
    }
  }

  @SubscribeMessage('admin:unlock')
  handleAdminUnlock(client: Socket, data: { machineId: string }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(agent.socketId).emit('command:unlock');
    }
  }

  @SubscribeMessage('admin:shutdown')
  handleAdminShutdown(client: Socket, data: { machineId: string }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(agent.socketId).emit('command:shutdown');
    }
  }

  @SubscribeMessage('admin:restart')
  handleAdminRestart(client: Socket, data: { machineId: string }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(agent.socketId).emit('command:restart');
    }
  }

  @SubscribeMessage('admin:message')
  handleAdminMessage(client: Socket, data: { machineId: string; message: string; title?: string }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(agent.socketId).emit('command:message', {
        title: data.title || 'Message from Admin',
        message: data.message,
      });
    }
  }

  @SubscribeMessage('admin:screenshot')
  handleAdminScreenshot(client: Socket, data: { machineId: string }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(agent.socketId).emit('command:screenshot');
    }
  }

  @SubscribeMessage('admin:open-app')
  handleAdminOpenApp(client: Socket, data: { machineId: string; appPath: string }) {
    const agent = this.agentService.getAgent(data.machineId);
    if (agent) {
      this.server.to(agent.socketId).emit('command:open', { appPath: data.appPath });
    }
  }

  // Broadcast to all agents in branch
  broadcastToBranch(branchId: string, event: string, data: any) {
    this.server.to(`branch:${branchId}`).emit(event, data);
  }
}
