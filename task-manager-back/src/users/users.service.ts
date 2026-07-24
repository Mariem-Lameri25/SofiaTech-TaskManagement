import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';
import * as bcrypt from 'bcrypt';
import { GetUsersDto } from './dto/get-user.dto';
import { MailService } from '../mailer/mailer.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    let plainPassword = userData.password;
    if (userData.password && !userData.password.startsWith('$2b$')) {
      plainPassword = userData.password;
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);
    // Send welcome email with credentials
    if (userData.email && plainPassword) {
      await this.mailService.sendWelcomeEmail(userData.email, plainPassword);
    }
    return savedUser;
  }

  async findAllPaginated(query: GetUsersDto) {
  const { page = 1, limit = 10, search, role, sortBy, sortOrder } = query;

  const qb = this.userRepository.createQueryBuilder('user');

  if (search) {
    qb.andWhere(
      `(
        user.firstname LIKE :search 
        OR user.lastname LIKE :search 
        OR user.email LIKE :search 
        OR user.phoneNumber LIKE :search
      )`,
      { search: `%${search}%` }
    );
  }

  if (role) {
    qb.andWhere('user.role = :role', { role });
  }

  qb.skip((page - 1) * limit)
    .take(limit);

  // Restrict sorting to allowed fields
  const allowedSortFields = ['firstname', 'lastname', 'email', 'role'];
  if (sortBy && allowedSortFields.includes(sortBy)) {
    qb.orderBy(`user.${sortBy}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
  } else {
    qb.orderBy('user.id_user', 'DESC');
  }

  const [data, total] = await qb.getManyAndCount();

  return { data, total, page, limit };
}


  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id_user: id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

 async update(id: number, updateData: Partial<User>): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id_user: id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  // Mise à jour des champs simples
  user.firstname = updateData.firstname ?? user.firstname;
  user.lastname = updateData.lastname ?? user.lastname;
  user.email = updateData.email ?? user.email;
  user.phoneNumber = updateData.phoneNumber ?? user.phoneNumber;
  user.avatar = updateData.avatar ?? user.avatar;

  // Gestion des tokens de réinitialisation
  if (updateData.resetPasswordToken !== undefined) {
    user.resetPasswordToken = updateData.resetPasswordToken;
  }
  if (updateData.resetPasswordTokenExpires !== undefined) {
    user.resetPasswordTokenExpires = updateData.resetPasswordTokenExpires;
  }
  if (updateData.resetPasswordTokenUsed !== undefined) {
    user.resetPasswordTokenUsed = updateData.resetPasswordTokenUsed;
  }

  // Gestion du mot de passe avec détection du hachage
  if (updateData.password && updateData.password.trim() !== '') {
    const trimmedPassword = updateData.password.trim();
    
    // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
    if (trimmedPassword.startsWith('$2b$') || trimmedPassword.startsWith('$2a$')) {
      // Password is already hashed, use it directly
      console.log('🔑 Using pre-hashed password');
      user.password = trimmedPassword;
    } else {
      // Password is plain text, hash it
      console.log('🔑 Hashing plain text password');
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(trimmedPassword, salt);
    }
  }

  return await this.userRepository.save(user);
}

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return this.userRepository.save(user);
  }

  async updateAvatar(id: number, avatarUrl: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id_user: id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.avatar = avatarUrl;
    return this.userRepository.save(user);
  }

  async updatePasswordRaw(id: number, hashedPassword: string): Promise<void> {
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async findByResetToken(token: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }
}
