/**
 * 보상 처리기 인터페이스
 * 전략 패턴 구현의 기초가 되는 인터페이스
 */
export interface RewardProcessor {
  /**
   * 보상 처리 및 지급
   * @param userId 사용자 식별자
   * @param rewardData 보상 데이터
   * @returns 처리 성공 여부 및 결과 데이터
   */
  process(userId: string, rewardData: any): Promise<RewardProcessResult>;

  /**
   * 보상 설명 생성
   * @param rewardData 보상 데이터
   * @returns 사용자 표시용 보상 설명
   */
  getDescription(rewardData: any): string;
}

/**
 * 보상 처리 결과 인터페이스
 */
export interface RewardProcessResult {
  success: boolean;
  referenceId?: string;  // 보상 참조 ID (외부 시스템 ID 등)
  message?: string;      // 결과 메시지
  details?: any;         // 상세 결과 데이터
}
