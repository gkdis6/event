import { IsNotEmpty, IsString, IsEnum, IsObject, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConditionType } from '../../common/enums/condition-type.enum';
import { EventStatus } from '../../common/enums/event-status.enum';

export class CreateEventDto {
  @ApiProperty({
    description: '이벤트 제목',
    example: '출석 이벤트',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: '이벤트 설명',
    example: '7일 연속 출석하면 보상을 받을 수 있습니다.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '이벤트 시작일',
    example: '2023-05-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: '이벤트 종료일',
    example: '2023-05-31T23:59:59.999Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: '이벤트 조건 타입',
    enum: ConditionType,
    example: ConditionType.ATTENDANCE_DAYS,
  })
  @IsNotEmpty()
  @IsEnum(ConditionType)
  conditionType: ConditionType;

  @ApiProperty({
    description: '이벤트 조건 데이터',
    example: { requiredDays: 7 },
  })
  @IsNotEmpty()
  @IsObject()
  conditionData: any;

  @ApiProperty({
    description: '이벤트 상태',
    enum: EventStatus,
    example: EventStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
