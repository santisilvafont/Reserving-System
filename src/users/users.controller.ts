import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.update(targetUserId, updateUserDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.remove(targetUserId, currentUser);
  }

  @Post(':id/groups/:groupId')
  async addGroupToUser(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.addGroupToUser(targetUserId, groupId, currentUser);
  }

  @Delete(':id/groups/:groupId')
  async removeGroupToUser(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.removeGroupFromUser(targetUserId, groupId, currentUser);
  }

  @Roles('admin')
  @Patch(':id/role')
  async toggleAdminRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isAdmin') isAdmin: boolean,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.toggleAdminRole(id, isAdmin, currentUser);
  }

  @Roles('admin')
  @Patch(':id/status')
  async toggleActiveStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.toggleActiveStatus(id, isActive);
  }
}
