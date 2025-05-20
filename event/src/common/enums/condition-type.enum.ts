/**
 * 이벤트 조건 타입 열거형
 */
export enum ConditionType {
  ATTENDANCE_DAYS = 'ATTENDANCE_DAYS',      // 출석 일수
  MONSTER_KILL = 'MONSTER_KILL',            // 특정 몬스터 200마리 잡기
  INVITE_FRIENDS = 'INVITE_FRIENDS',        // 친구 초대
  PLAY_TIME = 'PLAY_TIME',                  // 접속 100시간
  DEFEAT_BOSS_WEEKLY = 'DEFEAT_BOSS_WEEKLY', // 주간 보스 2주 연속 처치
  // VIP_ONLY = 'VIP_ONLY'                     // VIP 사용자만 참여 가능
}
