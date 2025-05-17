import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: '사용자 등록' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '모든 사용자 조회 (관리자용)' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 조회' })
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.username);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '특정 사용자 조회' })
  async findOne(@Param('id') id: string, @Request() req) {
    // 관리자이거나 자신의 정보만 조회 가능
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    const isAdmin = req.user.roles.includes(Role.ADMIN);
    const isSelf = req.user.sub === user.id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 정보 업데이트' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // 관리자이거나 자신의 정보만 수정 가능
    const targetUser = await this.usersService.findById(id);

    if (!targetUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    const isAdmin = req.user.roles.includes(Role.ADMIN);
    const isSelf = req.user.sub === id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    // 일반 사용자는 자신의 역할을 변경할 수 없음
    if (!isAdmin && updateUserDto.roles) {
      throw new ForbiddenException('역할 변경 권한이 없습니다');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 삭제 (관리자용)' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
