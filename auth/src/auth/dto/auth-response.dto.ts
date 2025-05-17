import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT 액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    example: {
      id: '60d5e5e9e5c9e47b1c7d5b0e',
      username: 'user123',
      email: 'user@example.com',
      role: 'USER',
    },
    description: '사용자 정보',
  })
  user: {
    id: string;
    username: string;
    email: string;
    role: Role;
  };
}
