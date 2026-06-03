import { Controller, Get, Post, Body } from '@nestjs/common';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private geo: GeoService) {}

  @Get('cities') getCities() { return this.geo.getCities(); }
  @Get('regions') getRegions() { return this.geo.getRegions(); }
  @Post('visit') recordVisit(@Body() dto: { city: string; region: string }) { this.geo.recordVisit(dto.city, dto.region); return { success: true }; }
}
