import { Module } from '@nestjs/common';
import { InternetMgmtService } from './internet-mgmt.service';
import { InternetMgmtController } from './internet-mgmt.controller';
@Module({ controllers: [InternetMgmtController], providers: [InternetMgmtService], exports: [InternetMgmtService] })
export class InternetMgmtModule {}
