import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.reservationsService.findByUser(userId);
  }
  
  @Get('group/:groupId')
  findByGroup(@Param('groupId', ParseUUIDPipe) groupId: string) {
    return this.reservationsService.findByGroup(groupId);
  }
  
  @Get('hall/:hallId')
  findByHall(@Param('hallId', ParseUUIDPipe) hallId: string) {
    return this.reservationsService.findByHall(hallId);
  }
  
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string){
    return this.reservationsService.cancel(id);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string){
    return this.reservationsService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string, @Body('reason') reason: string){
    return this.reservationsService.reject(id, reason);
  }
  
}
