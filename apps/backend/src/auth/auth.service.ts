import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
     constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
  console.log('Step 1: Login request received');

  const { email, password } = loginDto;

  console.log('Step 2: Looking up user');

  const user = await this.prisma.user.findUnique({
    where: {
      email,
    },
  });

  console.log('User:', user);

  if (!user || !user.isActive) {
    throw new UnauthorizedException('Invalid email or password');
  }

  console.log('Step 3: Comparing password');

  const passwordMatches = await bcrypt.compare(
    password,
    user.password,
  );

  console.log('Password matches:', passwordMatches);

  if (!passwordMatches) {
    throw new UnauthorizedException('Invalid email or password');
  }

  console.log('Step 4: Generating JWT');

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = await this.jwtService.signAsync(payload);

  console.log('Step 5: Success');

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
}
}
