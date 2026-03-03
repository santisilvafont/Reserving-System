import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationState } from './enums/reservation-state-enum';
import { User } from 'src/users/entities/user.entity';
import { GetReservationsDto } from './dto/get-reservations.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: string): Promise<Reservation> {
    const start = new Date(createReservationDto.startTime);
    const end = new Date(createReservationDto.endTime);

    if (start >= end) {
      throw new BadRequestException('The start time must be strictly before the end time.');
    }

    const hasCollision = await this.checkCollision(createReservationDto.hallId, start, end);

    if (hasCollision) {
      throw new BadRequestException('The hall is already booked and approved for the selected time slot.');
    }

    try {
      const reservation = this.reservationRepository.create({
        startTime: createReservationDto.startTime,
        endTime: createReservationDto.endTime,
        purpose: createReservationDto.purpose,
        applicationNotes: createReservationDto.applicationNotes,
        user: { id: userId },
        group: { id: createReservationDto.groupId },
        hall: { id: createReservationDto.hallId },
      });

      return await this.reservationRepository.save(reservation);
    } catch (error) {
      if (error.code === '23503') {
        throw new BadRequestException('The group or hall specified does not exist.');
      }
      throw error;
    }
  }

  findAll(currentUser: User, queryDto?: GetReservationsDto): Promise<Reservation[]> {
    const whereClause: any = currentUser.isAdmin ? {} : { state: ReservationState.APPROVED };

    if (queryDto?.startDate && queryDto?.endDate) {
      whereClause.startTime = Between(queryDto.startDate, queryDto.endDate);
    } else if (queryDto?.startDate) {
      whereClause.startTime = MoreThanOrEqual(queryDto.startDate);
    } else if (queryDto?.endDate) {
      whereClause.startTime = LessThanOrEqual(queryDto.endDate);
    }

    return this.reservationRepository.find({
      where: whereClause,
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: string, currentUser?: User): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({ where: { id } });

    if (!reservation) {
      throw new NotFoundException(`Reservation not found.`);
    }

    if (currentUser) {
      if (reservation.user.id !== currentUser.id && !currentUser.isAdmin) {
        throw new ForbiddenException('You are not allowed to view this reservation.');
      }
    }
    
    return reservation;
  }

  async findByUser(targetUserId: string, currentUser: User, queryDto: GetReservationsDto): Promise<Reservation[]> {
    if (targetUserId !== currentUser.id && !currentUser.isAdmin) {
      throw new ForbiddenException(`You can only view your own reservations.`);
    }

    const whereClause: any = { user: { id: targetUserId } };

    if (queryDto?.startDate && queryDto?.endDate) {
      whereClause.startTime = Between(queryDto.startDate, queryDto.endDate);
    } else if (queryDto?.startDate) {
      whereClause.startTime = MoreThanOrEqual(queryDto.startDate);
    } else if (queryDto?.endDate) {
      whereClause.startTime = LessThanOrEqual(queryDto.endDate);
    }

    const reservations = await this.reservationRepository.find({
      where: { user: { id: targetUserId } },
      order: { startTime: 'DESC' },
    });

    if (reservations.length === 0) {
      throw new NotFoundException(`Reservations not found.`);
    }

    return reservations;
  }

  async findByGroup(groupId: string, currentUser: User, queryDto?: GetReservationsDto): Promise<Reservation[]> {
    const whereClause: any = {
      group: { id: groupId }
    }

    if (!currentUser.isAdmin) {
      whereClause.state = ReservationState.APPROVED;
    }

    if (queryDto?.startDate && queryDto?.endDate) {
      whereClause.startTime = Between(queryDto.startDate, queryDto.endDate);
    } else if (queryDto?.startDate) {
      whereClause.startTime = MoreThanOrEqual(queryDto.startDate);
    } else if (queryDto?.endDate) {
      whereClause.startTime = LessThanOrEqual(queryDto.endDate);
    }

    const reservations = await this.reservationRepository.find({
      where: whereClause,
      order: { startTime: 'DESC' },
    });

    if (reservations.length === 0) {
      throw new NotFoundException(`Reservations not found.`);
    }
    return reservations;
  }
  
  async findByHall(hallId: string, currentUser: User, queryDto?: GetReservationsDto): Promise<Reservation[]> {
    const whereClause: any = { hall: { id: hallId } };
    
    if (!currentUser.isAdmin) {
      whereClause.state = ReservationState.APPROVED;
    }

    if (queryDto?.startDate && queryDto?.endDate) {
      whereClause.startTime = Between(queryDto.startDate, queryDto.endDate);
    } else if (queryDto?.startDate) {
      whereClause.startTime = MoreThanOrEqual(queryDto.startDate);
    } else if (queryDto?.endDate) {
      whereClause.startTime = LessThanOrEqual(queryDto.endDate);
    }

    const reservations = await this.reservationRepository.find({ 
      where: whereClause,
      order: { startTime: 'DESC' }
    });

    if (reservations.length === 0) {
      throw new NotFoundException(`No reservations found for this hall in the given range.`);
    }
    
    return reservations;
  }

  async cancel(reservationId: string, userId: string): Promise<Reservation> {

    const reservation = await this.findOne(reservationId)

    if (reservation.user.id !== userId) {
      throw new ForbiddenException(`You can only cancel your own reservations.`);
    }

    if (
      reservation.state !== ReservationState.PENDING &&
      reservation.state !== ReservationState.APPROVED
    ) {
      throw new BadRequestException(`Cannot cancel a reservation that is currently ${reservation.state}`);
    }

    reservation.state = ReservationState.CANCELED;
    return this.reservationRepository.save(reservation);

  }

  
  async approve(id: string): Promise<Reservation> {
    const reservation = await this.findOne(id)

    if (reservation.state !== ReservationState.PENDING) {
      throw new BadRequestException(`Cannot approve a reservation that is currently ${reservation.state}.`);
    }

    const hasCollision = await this.checkCollision(reservation.hall.id, reservation.startTime, reservation.endTime, reservation.id);

    if (hasCollision) {
      throw new BadRequestException('Cannot approve. Another approved reservation is already occupying this hall at this time.');
    }

    reservation.state = ReservationState.APPROVED;
    return this.reservationRepository.save(reservation);

  }

  
  async reject(id: string, rejectionReason: string): Promise<Reservation> {
    const reservation = await this.findOne(id)

    if (!rejectionReason || rejectionReason.trim() === '') {
      throw new BadRequestException('Rejection reason must be provided and cannot be empty.');
    }

    if (reservation.state !== ReservationState.PENDING) {
      throw new BadRequestException(`Cannot reject a reservation that is currently ${reservation.state}.`);
    }

    reservation.state = ReservationState.REJECTED;
    reservation.rejectionReason = rejectionReason;
    return this.reservationRepository.save(reservation);
  }

  private async checkCollision(hallId: string, startTime: Date, endTime: Date, excludeReservationId?: string): Promise<boolean> {
    const query = this.reservationRepository.createQueryBuilder('reservation')
      .where('reservation.hall.id = :hallId', { hallId })
      .andWhere('reservation.state = :state', { state: ReservationState.APPROVED })
      .andWhere('reservation.startTime < :endTime', { endTime })
      .andWhere('reservation.endTime > :startTime', { startTime });

    if (excludeReservationId) {
      query.andWhere('reservation.id != :excludeId', { excludeId: excludeReservationId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}