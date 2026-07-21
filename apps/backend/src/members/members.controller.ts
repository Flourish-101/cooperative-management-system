import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';

import { JwtAuthGuard } from '../auth/guards/jwt.auth.guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

import { Role } from '../../generated/prisma/enums';
import { UpdateMemberDto } from './dto/update-member.dto';


@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
update(
  @Param('id') id: string,
  @Body() updateMemberDto: UpdateMemberDto,
) {
  return this.membersService.update(id, updateMemberDto);
}

@Delete(':id')
remove(@Param('id') id: string) {
  return this.membersService.remove(id);
}
}