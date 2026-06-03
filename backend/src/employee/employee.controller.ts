import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private employee: EmployeeService) {}

  @Get()
  list(@Query('branchId') branchId?: string) {
    return this.employee.list(branchId);
  }

  @Post()
  create(@Body() dto: { name: string; phone: string; email?: string; position: string; branchId: string; salary?: number; userId?: string }) {
    return this.employee.create(dto);
  }

  @Post('clock-in')
  clockIn(@Body('employeeId') employeeId: string) {
    return this.employee.clockIn(employeeId);
  }

  @Post('clock-out/:id')
  clockOut(@Param('id') id: string) {
    return this.employee.clockOut(id);
  }

  @Get('attendance')
  attendance(@Query('branchId') branchId?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.employee.attendance(branchId, from, to);
  }
}
