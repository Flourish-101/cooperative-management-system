import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.auth.guards';
import { GetUser } from './decorators/get-user.decorator';
import { JwtUser } from './interfaces/jwt-user.interface';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Role } from '../../generated/prisma/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
getProfile(@GetUser() user: JwtUser) {
  return user;
}
}