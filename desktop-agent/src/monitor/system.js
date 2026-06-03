const si = require('systeminformation');
const EventEmitter = require('events');

class SystemMonitor extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
    this.currentStats = null;
  }

  start(intervalMs = 5000) {
    console.log(`📊 System monitoring started (interval: ${intervalMs}ms)`);

    // Immediate first run
    this.collect();

    this.interval = setInterval(() => {
      this.collect();
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async getCurrentStats() {
    if (this.currentStats) return this.currentStats;
    return this.collect();
  }

  async collect() {
    try {
      const [cpu, mem, disk, networkStats, osInfo, processes, temp] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.osInfo(),
        si.processes(),
        si.cpuTemperature(),
      ]);

      const activeWindow = await this.getActiveWindow();

      this.currentStats = {
        cpu: {
          load: Math.round(cpu.currentLoad * 100) / 100,
          cores: cpu.cpus.length,
          temp: temp.main || null,
        },
        memory: {
          total: mem.total,
          used: mem.used,
          free: mem.free,
          usagePercent: Math.round((mem.used / mem.total) * 100 * 100) / 100,
        },
        disk: disk.map(d => ({
          mount: d.mount,
          total: d.size,
          used: d.used,
          free: d.available,
          usagePercent: d.use,
        })),
        network: networkStats.map(n => ({
          interface: n.iface,
          rxSec: n.rx_sec,
          txSec: n.tx_sec,
        })),
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          hostname: osInfo.hostname,
          uptime: Math.floor(require('os').uptime()),
        },
        processes: {
          total: processes.all,
          running: processes.running,
        },
        activeWindow: activeWindow || null,
        timestamp: new Date().toISOString(),
      };

      this.emit('stats', this.currentStats);
      return this.currentStats;
    } catch (err) {
      console.error('Monitor collection error:', err.message);
    }
  }

  async getActiveWindow() {
    try {
      const activeWin = require('active-win');
      const result = await activeWin();
      if (result) {
        return {
          title: result.title,
          application: result.owner?.name || result.owner?.processId || 'unknown',
        };
      }
    } catch {
      // active-win may not be available on all platforms
    }
    return null;
  }
}

module.exports = { SystemMonitor };
