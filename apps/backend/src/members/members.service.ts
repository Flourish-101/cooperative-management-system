import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberStatus } from '../../generated/prisma/enums';


@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: createMemberDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      createMemberDto.password,
      10,
    );

    // Generate member number
    const memberNumber = await this.generateMemberNumber();

    // Create both User and Member in one transaction
    const member = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createMemberDto.email,
          password: hashedPassword,
          role: createMemberDto.role,
        },
      });

      return await tx.member.create({
        data: {
          memberNumber,
          firstName: createMemberDto.firstName,
          lastName: createMemberDto.lastName,
          phone: createMemberDto.phone,
          address: createMemberDto.address,
          status: createMemberDto.status,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
              mustChangePassword: true,
            },
          },
        },
      });
    });

    return member;
  }

  async findAll() {
  return this.prisma.member.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async findOne(id: string) {
  const member = await this.prisma.member.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
        },
      },
    },
  });

  if (!member) {
    throw new NotFoundException('Member not found');
  }

  return member;
}

async update(id: string, updateMemberDto: UpdateMemberDto) {
  const member = await this.prisma.member.findUnique({
    where: { id },
  });

  if (!member) {
    throw new NotFoundException('Member not found');
  }

  return this.prisma.$transaction(async (tx) => {
    // Update the user
    await tx.user.update({
      where: {
        id: member.userId,
      },
      data: {
        email: updateMemberDto.email,
        role: updateMemberDto.role,
      },
    });

    
    // Update the member
    return tx.member.update({
      where: {
        id,
      },
      data: {
        firstName: updateMemberDto.firstName,
        lastName: updateMemberDto.lastName,
        phone: updateMemberDto.phone,
        address: updateMemberDto.address,
        status: updateMemberDto.status,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
          },
        },
      },
    });
  });
}

async remove(id: string) {
  const member = await this.prisma.member.findUnique({
    where: { id },
  });

  if (!member) {
    throw new NotFoundException('Member not found');
  }

  return this.prisma.$transaction(async (tx) => {
    // Deactivate the user
    await tx.user.update({
      where: {
        id: member.userId,
      },
      data: {
        isActive: false,
      },
    });

    // Mark the member as inactive
    return tx.member.update({
      where: {
        id,
      },
      data: {
        status: MemberStatus.INACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
          },
        },
      },
    });
  });
}
  private async generateMemberNumber(): Promise<string> {
    const lastMember = await this.prisma.member.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!lastMember) {
      return 'WIA0001';
    }

    const lastNumber = parseInt(
      lastMember.memberNumber.replace('WIA', ''),
      10,
    );

    const nextNumber = (lastNumber + 1)
      .toString()
      .padStart(4, '0');

    return `WIA${nextNumber}`;
  }
}
