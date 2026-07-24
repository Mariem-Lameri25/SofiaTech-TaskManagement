import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  
  @Get('test')
  @UseGuards(AuthGuard('jwt'))
  testAuth(@Request() req) {
    console.log('Auth test - User object:', req.user);
    return {
      message: 'JWT authentication working!',
      user: req.user,
    };
  }

  @Get('ping')
  ping() {
    console.log('✅ Ping route hit');
    return { message: 'pong' };
  }

@Public()
@Post('forgot-password')
forgotPassword(@Body() dto: ForgotPasswordDto) {
  return this.authService.forgotPassword(dto);
}

@Public()
@Post('reset-password/:token')
async resetPassword(
  @Param('token') token: string,
  @Body() dto: ResetPasswordDto,
) {
  return this.authService.resetPassword(token, dto);
}

@UseGuards(AuthGuard('jwt'))
@Get('me')
getCurrentUser(@Request() req) {
  return this.authService.getCurrentUser(req.user.id);
}

// 🔹 Nouvelle route pour invalider le lien dès la première ouverture
  @Public()
  @Get('check-reset-token/:token')
  async checkResetToken(@Param('token') token: string) {
    const result = await this.authService.checkResetToken(token);
    if (!result) {
      throw new UnauthorizedException('Lien invalide ou déjà utilisé');
    }
    return { message: 'Token valide' };
  }

  
  
}
