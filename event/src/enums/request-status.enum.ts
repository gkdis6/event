/**
 * 보상 요청 상태 열거형
 */
export enum RequestStatus {
  PENDING = 'PENDING',           // 대기 중
  VALIDATED = 'VALIDATED',       // 조건 검증 완료
  PROCESSING = 'PROCESSING',     // 처리 중
  COMPLETED = 'COMPLETED',       // 완료
  REJECTED = 'REJECTED',         // 거부됨
  FAILED = 'FAILED'              // 실패
}
