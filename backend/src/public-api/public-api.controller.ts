import { Controller, Get } from '@nestjs/common';
import { PublicApiService } from './public-api.service';

@Controller('api-docs')
export class PublicApiController {
  constructor(private api: PublicApiService) {}

  @Get()
  getDocs(): object {
    return this.api.getDocs();
  }
}
