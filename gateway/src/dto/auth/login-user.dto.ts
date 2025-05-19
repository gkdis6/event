import {ApiExtraModels, ApiProperty} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

@ApiExtraModels()
export class LoginUserDto {
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
  password: string;
}
