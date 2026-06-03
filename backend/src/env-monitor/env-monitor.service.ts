import { Injectable } from '@nestjs/common';

export interface SensorReading { roomId: string; temperature: number; humidity: number; noise: number; airQuality: number; timestamp: Date; }

@Injectable()
export class EnvMonitorService {
  private history: SensorReading[] = [];

  read(roomId: string): SensorReading {
    const reading: SensorReading = {
      roomId,
      temperature: parseFloat((24 + Math.random() * 6).toFixed(1)),
      humidity: parseFloat((50 + Math.random() * 30).toFixed(1)),
      noise: parseFloat((30 + Math.random() * 40).toFixed(1)),
      airQuality: parseFloat((70 + Math.random() * 25).toFixed(1)),
      timestamp: new Date(),
    };
    this.history.push(reading);
    if (this.history.length > 1000) this.history.shift();
    return reading;
  }

  getHistory(roomId: string, limit = 20): SensorReading[] {
    return this.history.filter(h => h.roomId === roomId).slice(-limit);
  }

  getAlerts(): { roomId: string; type: string; message: string }[] {
    const alerts: any[] = [];
    this.history.forEach(h => {
      if (h.temperature > 35) alerts.push({ roomId: h.roomId, type: 'HIGH_TEMP', message: `Suhu tinggi! ${h.temperature}°C` });
      if (h.humidity > 80) alerts.push({ roomId: h.roomId, type: 'HIGH_HUMIDITY', message: `Kelembaban tinggi! ${h.humidity}%` });
      if (h.noise > 70) alerts.push({ roomId: h.roomId, type: 'HIGH_NOISE', message: `Kebisingan tinggi! ${h.noise}dB` });
    });
    return alerts.slice(-5);
  }
}
