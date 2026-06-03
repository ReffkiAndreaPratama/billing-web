import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { IotService } from './iot.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('iot')
@UseGuards(JwtAuthGuard)
export class IotController {
  constructor(private iot: IotService) {}

  @Get('rooms') getRooms() { return this.iot.getRooms(); }
  @Get('devices') getDevices(@Param('roomId') roomId?: string) { return this.iot.getDevices(roomId); }
  @Get('devices/:roomId') getDevicesByRoom(@Param('roomId') roomId: string) { return this.iot.getDevices(roomId); }

  @Post('device/:id/control')
  control(@Param('id') id: string, @Body() dto: { status: 'ON' | 'OFF'; value?: number }) {
    return this.iot.setDevice(id, dto.status, dto.value);
  }

  @Post('room/:roomId/auto-on')
  autoOn(@Param('roomId') roomId: string) { return this.iot.autoOn(roomId); }

  @Post('room/:roomId/auto-off')
  autoOff(@Param('roomId') roomId: string) { return this.iot.autoOff(roomId); }

  @Get('temperature/:roomId')
  temperature(@Param('roomId') roomId: string) { return { roomId, temperature: this.iot.getTemperature(roomId) }; }
}
