import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsOptional,
  IsObject,
  IsNumber,
  Min
} from 'class-validator';
import { RewardType } from '../../common/enums/reward-type.enum';

export class CreateRewardDto {
  @ApiProperty({ 
    example: '60d5e5e9e5c9e47b1c7d5b0e', 
    description: '이벤트 ID' 
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ 
    example: '게임 내 골드 1000개', 
    description: '보상 이름' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: '게임 내에서 사용할 수 있는 골드입니다.', 
    description: '보상 설명',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    enum: RewardType,
    example: RewardType.CASH_POINT, 
    description: '보상 타입'
  })
  @IsEnum(RewardType)
  @IsNotEmpty()
  type: RewardType;

  @ApiProperty({ 
    example: { amount: 1000 }, 
    description: '보상 상세 데이터'
  })
  @IsObject()
  @IsNotEmpty()
  rewardData: Record<string, any>;

  @ApiProperty({ 
    example: 1, 
    description: '보상 수량',
    default: 1
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
