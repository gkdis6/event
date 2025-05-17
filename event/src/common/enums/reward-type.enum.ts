/**
 * 보상 타입 열거형
 */
export enum RewardType {
  CASH_POINT = 'CASH_POINT',             // 현금성 포인트
  ITEM = 'ITEM',                         // 게임 아이템
  PHYSICAL_PRODUCT = 'PHYSICAL_PRODUCT', // 실물 상품
  COUPON_INTERNAL = 'COUPON_INTERNAL',   // 내부 쿠폰
  COUPON_EXTERNAL = 'COUPON_EXTERNAL',   // 외부 쿠폰
  LOTTERY = 'LOTTERY',                   // 추첨 기회
}
