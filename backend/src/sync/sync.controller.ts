import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post()
  sync(@Body() body: { operations: any[] }) { return this.syncService.sync(body.operations || []); }

  @Get('conflicts')
  getConflicts() { return this.syncService.getConflicts(); }

  @Post('resolve/:id')
  resolve(@Param('id') id: string, @Body('resolution') resolution: 'local' | 'remote') {
    return this.syncService.resolveConflict(id, resolution);
  }
}
