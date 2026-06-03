import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private asset: AssetService) {}

  @Get()
  list(@Query('branchId') branchId?: string) {
    return this.asset.list(branchId);
  }

  @Post()
  create(@Body() dto: { name: string; type: string; serialNumber?: string; unitId?: string; purchaseDate?: string; purchasePrice?: number; condition?: string; notes?: string }) {
    return this.asset.create(dto);
  }

  @Post(':unitId/maintenance')
  addMaintenance(@Param('unitId') unitId: string, @Body() dto: { description: string; cost?: number; type: string; scheduledAt?: string }) {
    return this.asset.addMaintenance(unitId, dto);
  }

  @Get(':unitId/history')
  history(@Param('unitId') unitId: string) {
    return this.asset.getHistory(unitId);
  }

  @Post('maintenance/:id/complete')
  completeMaintenance(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.asset.completeMaintenance(id, notes);
  }
}
