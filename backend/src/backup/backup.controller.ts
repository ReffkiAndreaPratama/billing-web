import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private backup: BackupService) {}

  @Post()
  create() { return this.backup.createBackup(); }

  @Get()
  list() { return this.backup.listBackups(); }

  @Post('restore/:filename')
  restore(@Param('filename') filename: string) { return this.backup.restore(filename); }

  @Delete(':filename')
  delete(@Param('filename') filename: string) { return this.backup.deleteBackup(filename); }
}
