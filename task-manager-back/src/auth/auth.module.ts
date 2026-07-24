import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AppMailerModule } from 'src/mailer/mailer.module';

@Module({
imports: [
ConfigModule, 
UsersModule,
PassportModule.register({ defaultStrategy: 'jwt' }),
JwtModule.registerAsync({
imports: [ConfigModule],
inject: [ConfigService],
useFactory: async (config: ConfigService) => ({
secret: config.get<string>('JWT_SECRET_KEY'),
signOptions: { expiresIn: '1d' },
}),
}),
AppMailerModule,
],
controllers: [AuthController],
providers: [AuthService, JwtStrategy],
exports: [JwtModule, PassportModule],
})
export class AuthModule {}