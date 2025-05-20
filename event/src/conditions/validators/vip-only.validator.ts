import { Injectable, Inject } from '@nestjs/common'; // Inject 임포트
import { ConditionValidator } from '../interfaces/condition-validator.interface';
import { ClientProxy } from '@nestjs/microservices'; // ClientProxy 임포트
import { Role } from '../../common/enums/role.enum'; // Role enum 임포트 경로 수정
import { timeout } from 'rxjs/operators'; // timeout 연산자 임포트
import { firstValueFrom } from 'rxjs'; // firstValueFrom 함수 임포트

@Injectable()
export class VipOnlyValidator implements ConditionValidator {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy, // auth 서비스 클라이언트 주입
  ) {}

  /**
   * 사용자가 VIP 조건을 충족하는지 검증 (역할 확인)
   * @param userId 사용자 ID
   * @param eventId 이벤트 ID
   * @param conditionData 조건 데이터 (필요 없을 수 있음)
   */
  async validate(userId: string, eventId: string, conditionData: any): Promise<boolean> {
    console.log(`VipOnlyValidator.validate 호출: userId=${userId}, eventId=${eventId}, conditionData=${JSON.stringify(conditionData)}`);
    
    try {
      console.log(`auth 서비스에 사용자 역할 요청: userId=${userId}`);
      
      // auth 서비스에 사용자 역할을 요청하여 VIP인지 확인
      const userResult = await firstValueFrom<{success: boolean, roles: string[]}>(
        this.authClient.send({ cmd: 'get-user-roles' }, { userId })
          .pipe(timeout(5000)) // 타임아웃 설정
      );

      console.log(`auth 서비스 응답: ${JSON.stringify(userResult)}`);

      if (!userResult || !userResult.success || !userResult.roles) {
        console.warn(`Failed to get user roles for userId: ${userId}. Result:`, userResult);
        return false; // 사용자 정보 없거나 역할 정보 조회 실패
      }

      // 사용자의 역할 목록에 VIP가 포함되어 있는지 확인
      const isVip = userResult.roles.includes(Role.VIP);
      console.log(`사용자 ${userId}의 VIP 여부: ${isVip}`);
      return isVip;

    } catch (error) {
      console.error(`VIP 조건 검증 중 오류 발생: ${error.message}`);
      console.error(`오류 상세 정보:`, error);
      
      // 연결 오류인 경우 (ECONNREFUSED 등)
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        console.error(`AUTH_SERVICE 연결 실패. 호스트: ${process.env.AUTH_SERVICE_HOST || 'auth'}, 포트: ${process.env.AUTH_SERVICE_PORT || 3104}`);
      }
      
      return false;
    }
  }

  /**
   * 조건에 대한 사용자 친화적 설명 생성
   */
  getDescription(conditionData: any): string {
    return `VIP 사용자만 참여 가능`;
  }
}
