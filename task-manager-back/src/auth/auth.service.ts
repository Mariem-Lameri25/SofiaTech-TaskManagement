import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mailer/mailer.service';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(createUserDto.email);
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const hash = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });

    return this.login({ email: user.email, password: createUserDto.password });
  }

 async login(loginDto: LoginDto) {
  const cleanEmail = loginDto.email.trim().toLowerCase();
  console.log('📩 Cleaned email:', cleanEmail);
  console.log('🔑 Attempting login with password:', loginDto.password);

  const user = await this.usersService.findByEmail(cleanEmail);
  console.log('🔍 User found:', user ? 'Yes' : 'No');
  
  if (user) {
    console.log('🔍 User ID:', user.id_user);
    console.log('🔍 Stored password hash:', user.password);
  }

  if (!user) throw new UnauthorizedException('Invalid credentials (email)');

  const match = await bcrypt.compare(loginDto.password, user.password);
  console.log('🔑 Password match result:', match);
  console.log('🔑 Plain password:', loginDto.password);
  console.log('🔑 Hash from DB:', user.password);

  if (!match) {
    // Additional debugging
    console.error('❌ Password mismatch details:');
    console.error('- Input password length:', loginDto.password.length);
    console.error('- Hash length:', user.password.length);
    console.error('- Hash starts with $2b$:', user.password.startsWith('$2b$'));
    
    throw new UnauthorizedException('Invalid credentials (password)');
  }

  const payload = { sub: user.id_user, email: user.email, role: user.role };
  const token = await this.jwtService.signAsync(payload);
  
  return { 
    access_token: token,
    user: {
      id: user.id_user,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber
    }
  };
}

  // ✅ NEW: Get current user method
  ////async getCurrentUser(userId: number) {
   // const user = await this.usersService.findOne(userId);
    
    // Return user without password
    ////const { password, ...userWithoutPassword } = user;
    //return userWithoutPassword;
 // }

   async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    // On crée un token JWT court (tu peux aussi utiliser random token)
    const token = this.jwtService.sign(
      { sub: user.id_user, email: user.email },
      {
        secret: this.configService.get('JWT_RESET_SECRET'),
        expiresIn: '15m',
      },
    );

    // sauvegarde le token côté DB et marque 'used' = false
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await this.usersService.update(user.id_user, {
      resetPasswordToken: token,
      resetPasswordTokenExpires: expiresAt,
      resetPasswordTokenUsed: false
    });

    await this.mailService.sendResetPassword(user.email, token);
    return { message: 'Reset link sent to your email' };
  }


  /**
   * 🔹 Vérifie et invalide immédiatement le token
   */
  async checkResetToken(token: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) throw new UnauthorizedException('Invalid reset token');

    if (user.resetPasswordTokenUsed) {
      throw new UnauthorizedException('This link has already been used');
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (
      user.resetPasswordTokenExpires &&
      user.resetPasswordTokenExpires < new Date()
    ) {
      throw new UnauthorizedException('Token expired');
    }

    try {
      this.jwtService.verify(token, {
        secret: this.configService.get('JWT_RESET_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Do NOT mark as used here; just validate
    return { message: 'Token valid' };
  }
/**
   * 🔹 Réinitialisation du mot de passe (token déjà validé avant)
   */
  async resetPassword(token: string, dto: ResetPasswordDto) {
  if (dto.password !== dto.confirmPassword) {
    throw new BadRequestException('Passwords do not match');
  }

  const user = await this.usersService.findByResetToken(token);
  if (!user) {
    throw new UnauthorizedException('Invalid reset token');
  }
  if (user.resetPasswordTokenUsed) {
    throw new UnauthorizedException('This link has already been used');
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  console.log('🔑 New hashed password generated:', hashedPassword);

  // Use updatePasswordRaw to avoid double hashing
  await this.usersService.updatePasswordRaw(user.id_user, hashedPassword);
  
  // Update the reset token fields separately
  await this.usersService.update(user.id_user, {
    resetPasswordTokenUsed: true,
    resetPasswordToken: null,
    resetPasswordTokenExpires: null,
  });

  // Verify the password was updated correctly
  const verifyUser = await this.usersService.findOne(user.id_user);
  console.log('🔍 Verification - stored password hash:', verifyUser.password);
  
  const testMatch = await bcrypt.compare(dto.password, verifyUser.password);
  console.log('🧪 Final password test:', testMatch);

  if (!testMatch) {
    throw new BadRequestException('Password update verification failed');
  }

  return { message: 'Password reset successful' };
}



async getCurrentUser(userId: number) {
  const user = await this.usersService.findOne(userId);

  // Supprimer le mot de passe avant de retourner l'objet user
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

}

