/**
 * 이벤트 상태 열거형
 */
export enum EventStatus {
  DRAFT = 'DRAFT',           // 초안
  ACTIVE = 'ACTIVE',         // 활성화
  INACTIVE = 'INACTIVE',     // 비활성화
  ENDED = 'ENDED',           // 종료됨
  SCHEDULED = 'SCHEDULED'    // 예약됨
}
