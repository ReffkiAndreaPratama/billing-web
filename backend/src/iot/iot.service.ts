import { Injectable } from '@nestjs/common';

export interface Device { id: string; name: string; type: 'LIGHT' | 'AC' | 'TV' | 'RELAY' | 'SENSOR'; roomId: string; status: 'ON' | 'OFF'; value?: number; }
export interface Room { id: string; name: string; branchId: string; }

@Injectable()
export class IotService {
  private rooms: Room[] = [{ id: 'room-1', name: 'Room VIP 1', branchId: 'branch-1' }, { id: 'room-2', name: 'Room VIP 2', branchId: 'branch-1' }];
  private devices: Device[] = [
    { id: 'dev-1', name: 'Lampu Utama', type: 'LIGHT', roomId: 'room-1', status: 'OFF' },
    { id: 'dev-2', name: 'AC', type: 'AC', roomId: 'room-1', status: 'OFF', value: 24 },
    { id: 'dev-3', name: 'TV', type: 'TV', roomId: 'room-1', status: 'OFF' },
    { id: 'dev-4', name: 'Lampu Utama', type: 'LIGHT', roomId: 'room-2', status: 'OFF' },
    { id: 'dev-5', name: 'AC', type: 'AC', roomId: 'room-2', status: 'OFF', value: 24 },
  ];

  getRooms(): Room[] { return this.rooms; }
  getDevices(roomId?: string): Device[] {
    return roomId ? this.devices.filter(d => d.roomId === roomId) : this.devices;
  }

  setDevice(id: string, status: 'ON' | 'OFF', value?: number): Device | null {
    const device = this.devices.find(d => d.id === id);
    if (device) { device.status = status; if (value !== undefined) device.value = value; return device; }
    return null;
  }

  autoOn(roomId: string): Device[] {
    const roomDevices = this.devices.filter(d => d.roomId === roomId && d.type !== 'SENSOR');
    roomDevices.forEach(d => d.status = 'ON');
    return roomDevices;
  }

  autoOff(roomId: string): Device[] {
    const roomDevices = this.devices.filter(d => d.roomId === roomId && d.type !== 'SENSOR');
    roomDevices.forEach(d => d.status = 'OFF');
    return roomDevices;
  }

  getTemperature(roomId: string): number {
    return 24 + Math.random() * 4; // Simulated
  }
}
