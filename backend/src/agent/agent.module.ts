import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentGateway } from './agent.gateway';
import { AgentController } from './agent.controller';

@Module({
  controllers: [AgentController],
  providers: [AgentService, AgentGateway],
  exports: [AgentService],
})
export class AgentModule {}
