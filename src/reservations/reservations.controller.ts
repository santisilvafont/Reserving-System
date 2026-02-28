import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/users/entities/user.entity';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @GetUser('id', ParseUUIDPipe) userId: string
  ) {
    return this.reservationsService.create(createReservationDto, userId);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.reservationsService.findAll(user);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseUUIDPipe) targetUserId: string, 
    @GetUser() user: User
  ) {
    return this.reservationsService.findByUser(targetUserId, user);
  }
  
  @Get('group/:groupId')
  findByGroup(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @GetUser() user: User
  ) {
    return this.reservationsService.findByGroup(groupId, user);
  }
  
  @Get('hall/:hallId')
  findByHall(
    @Param('hallId', ParseUUIDPipe) hallId: string,
    @GetUser() user: User
  ) {
    return this.reservationsService.findByHall(hallId, user);
  }
  
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ) {
    return this.reservationsService.findOne(id, user);
  }

  @Patch(':id/cancel')
  cancel(
    @GetUser('id', ParseUUIDPipe) userId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.reservationsService.cancel(id, userId);
  }

  @Roles('admin')
  @Patch(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string){
    return this.reservationsService.approve(id);
  }

  @Roles('admin')
  @Patch(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string, @Body('reason') reason: string){
    return this.reservationsService.reject(id, reason);
  }
  
}
