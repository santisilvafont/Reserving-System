import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    try {
      const reservation = this.reservationRepository.create({
        startTime: createReservationDto.startTime,
        endTime: createReservationDto.endTime,
        purpose: createReservationDto.purpose,
        applicationNotes: createReservationDto.applicationNotes,
        user: { id: createReservationDto.userId },
        group: { id: createReservationDto.groupId },
        hall: { id: createReservationDto.hallId },
      });

      return await this.reservationRepository.save(reservation);
    } catch (error) {
      if (error.code === '23503') {
        throw new BadRequestException('The user, group, or hall specified does not exist.');
      }
      throw error;
    }
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find();
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException(`Reservation not found.`);
    }
    return reservation;
  }
  async findByUser(userId: string): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.find({
      where: { user: { id: userId } },
      order: { startTime: 'DESC' },
    });

    if (reservations.length === 0) {
      throw new NotFoundException(`Reservation not found.`);
    }
    return reservations;
  }

  async findByGroup(groupId: string): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.find({
      where: { group: { id: groupId } },
      order: { startTime: 'DESC' },
    });

    if (reservations.length === 0) {
      throw new NotFoundException(`Reservation not found.`);
    }
    return reservations;
  }
  
  async findByHall(hallId: string): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.find({
      where: { hall: { id: hallId } },
      order: { startTime: 'DESC' },
    });
    if (reservations.length === 0) {
      throw new NotFoundException(`Reservation not found.`);
    }
    return reservations;
  }
}