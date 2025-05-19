import {ApiProperty} from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'user123',
    description: '사용자 이름',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: '비밀번호',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 주소',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: '사용자 역할',
    default: Role.USER,
  })
  @IsEnum(Role)
  role?: Role;
}
