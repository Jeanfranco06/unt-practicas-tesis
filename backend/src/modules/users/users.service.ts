import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, RolUsuario } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(createUserDto);
    return this.userRepo.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepo.update(id, updateUserDto);
    return this.findById(id);
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.userRepo.update(userId, { refreshToken });
  }

  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }
}