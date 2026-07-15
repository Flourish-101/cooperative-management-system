import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
 imports: [
  ConfigModule,
  PrismaModule,
  PassportModule,

  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.getOrThrow<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: '1d',
      },
    }),
  }),
],
  providers: [AuthService, JwtStrategy, RolesGuard, ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
