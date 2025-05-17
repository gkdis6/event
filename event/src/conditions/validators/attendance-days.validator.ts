import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConditionValidator } from '../interfaces/condition-validator.interface';

@Injectable()
export class AttendanceDaysValidator implements ConditionValidator {
  // 실제 구현에서는 사용자 출석 기록을 저장하는 스키마가 필요합니다
  constructor(
    // @InjectModel('UserAttendance') private readonly attendanceModel: Model<any>
  ) {}

  /**
   * 사용자의 출석 일수가 조건을 충족하는지 검증
   * @param userId 사용자 ID
   * @param eventId 이벤트 ID
   * @param conditionData 출석 조건 데이터 (requireDays: 필요 출석일)
   */
  async validate(userId: string, eventId: string, conditionData: any): Promise<boolean> {
    try {
      const { requireDays } = conditionData;

      // 실제 구현에서는 DB에서 해당 사용자의 출석 기록을 조회
      // 아래는 예시 코드입니다
      /*
      const attendanceCount = await this.attendanceModel.countDocuments({
        userId,
        eventId,
        createdAt: {
          $gte: new Date(conditionData.startDate),
          $lte: new Date(conditionData.endDate)
        }
      });

      return attendanceCount >= requireDays;
      */
      
      // 테스트를 위한 임시 로직: 홀수 userId는 충족, 짝수는 미충족
      const userIdNumber = parseInt(userId.replace(/\D/g, '') || '0', 10);
      return userIdNumber % 2 === 1;
    } catch (error) {
      console.error(`출석일 검증 중 오류 발생: ${error.message}`);
      return false;
    }
  }

  /**
   * 조건에 대한 사용자 친화적 설명 생성
   */
  getDescription(conditionData: any): string {
    const { requireDays } = conditionData;
    return `${requireDays}일 이상 출석하세요`;
  }
}
