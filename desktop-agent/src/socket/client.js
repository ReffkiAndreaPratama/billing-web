const { io } = require('socket.io-client');
const EventEmitter = require('events');

class SocketClient extends EventEmitter {
  constructor(serverUrl, machineId, branchId) {
    super();
    this.serverUrl = serverUrl;
    this.machineId = machineId;
    this.branchId = branchId;
    this.socket = null;
    this.reconnectTimer = null;
    this.authenticated = false;

    this.connect();
  }

  connect() {
    console.log(`🔌 Connecting to ${this.serverUrl}...`);

    this.socket = io(this.serverUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: {
        machineId: this.machineId,
        branchId: this.branchId,
        type: 'desktop-agent',
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 30000,
    });

    this.socket.on('connect', () => {
      console.log(`✅ Connected to server (socket: ${this.socket.id})`);
      this.emit('connected');

      // Register as desktop agent
      this.socket.emit('agent:register', {
        machineId: this.machineId,
        branchId: this.branchId,
        hostname: require('os').hostname(),
        platform: require('os').platform(),
        arch: require('os').arch(),
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ Disconnected: ${reason}`);
      this.authenticated = false;
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error(`⚠️ Connection error: ${err.message}`);
    });

    this.socket.on('agent:authenticated', (data) => {
      this.authenticated = true;
      console.log(`🔑 Authenticated as ${data.unitName || 'unknown unit'}`);
    });

    // Session events
    this.socket.on('session:start', (data) => this.emit('session:start', data));
    this.socket.on('session:end', () => this.emit('session:end'));
    this.socket.on('session:warning', (data) => this.emit('session:warning', data));

    // Remote commands
    this.socket.on('command:lock', () => this.emit('command:lock'));
    this.socket.on('command:unlock', () => this.emit('command:unlock'));
    this.socket.on('command:shutdown', () => this.emit('command:shutdown'));
    this.socket.on('command:restart', () => this.emit('command:restart'));
    this.socket.on('command:message', (data) => this.emit('command:message', data));
    this.socket.on('command:screenshot', () => this.emit('command:screenshot'));
    this.socket.on('command:open', (data) => this.emit('command:open', data));
  }

  sendSystemStats(stats) {
    if (this.socket?.connected) {
      this.socket.emit('agent:system-stats', {
        machineId: this.machineId,
        ...stats,
        timestamp: new Date().toISOString(),
      });
    }
  }

  sendScreenshot(dataUrl) {
    if (this.socket?.connected) {
      this.socket.emit('agent:screenshot', {
        machineId: this.machineId,
        image: dataUrl,
        timestamp: new Date().toISOString(),
      });
    }
  }

  sendSessionHeartbeat(sessionId, remainingMinutes) {
    if (this.socket?.connected) {
      this.socket.emit('agent:heartbeat', {
        machineId: this.machineId,
        sessionId,
        remainingMinutes,
        timestamp: new Date().toISOString(),
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

module.exports = { SocketClient };
