import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto, UpdateUnitDto } from './unit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitController {
  constructor(private unit: UnitService) {}

  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.unit.findAll(branchId);
  }

  @Get('map/:branchId')
  getMap(@Param('branchId') branchId: string) {
    return this.unit.getMap(branchId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.unit.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OWNER', 'SUPERADMIN')
  create(@Body() dto: CreateUnitDto) {
    return this.unit.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OWNER', 'SUPERADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.unit.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.unit.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER', 'SUPERADMIN')
  delete(@Param('id') id: string) {
    return this.unit.delete(id);
  }
}
