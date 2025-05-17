/**
 * 이벤트 조건 검증기 인터페이스
 * 전략 패턴 구현의 기초가 되는 인터페이스
 */
export interface ConditionValidator {
  /**
   * 조건이 충족되었는지 검증
   * @param userId 사용자 식별자
   * @param eventId 이벤트 식별자
   * @param conditionData 조건에 필요한 데이터
   * @returns 조건 충족 여부 (boolean)
   */
  validate(userId: string, eventId: string, conditionData: any): Promise<boolean>;

  /**
   * 조건 설명 생성
   * @param conditionData 조건 데이터
   * @returns 사용자 표시용 조건 설명
   */
  getDescription(conditionData: any): string;
}
