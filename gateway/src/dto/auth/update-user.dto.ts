import {PartialType, OmitType, ApiExtraModels} from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsArray, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enums/role.enum';

@ApiExtraModels()
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiProperty({
    description: '사용자 역할',
    enum: Role,
    isArray: true,
    example: [Role.USER, Role.OPERATOR],
    required: false
  })
  @IsOptional()
  @IsArray()
  roles?: Role[];

  @ApiProperty({
    description: '활성화 상태',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: '새 비밀번호',

    example: 'newPassword123',
    required: false
  })
  @IsOptional()
  @IsString()
  newPassword?: string;
}
