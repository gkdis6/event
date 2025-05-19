import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RequestRewardDto {
  @ApiProperty({
    example: '60d5e5e9e5c9e47b1c7d5b0e',
    description: '이벤트 ID'
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    example: '60d5e5e9e5c9e47b1c7d5b0f',
    description: '보상 ID'
  })
  @IsString()
  @IsNotEmpty()
  rewardId: string;
}
