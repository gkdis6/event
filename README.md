# 이벤트/보상 관리 플랫폼

NestJS와 MongoDB를 기반으로 한 마이크로서비스 아키텍처를 활용한 이벤트/보상 관리 시스템입니다.

## 시스템 구성

### 마이크로서비스 구조
- **Gateway 서비스**: 모든 API 요청의 진입점, JWT 토큰 검증, 권한 관리, 라우팅
- **Auth 서비스**: 사용자 관리, 로그인, 역할 관리, JWT 발급
- **Event 서비스**: 이벤트 생성, 보상 정의, 보상 요청 처리, 조건 검증

### 주요 기능
1. **이벤트 관리**
   - 이벤트 등록/조회/수정/삭제
   - 이벤트 상태 관리 (초안, 활성, 비활성)
   - 이벤트 기간 관리

2. **보상 관리**
   - 이벤트와 연결된 보상 정의
   - 다양한 보상 유형 지원 (포인트, 아이템, 쿠폰 등)

3. **보상 요청 처리**
   - 유저의 보상 요청 접수
   - 조건 충족 여부 자동 검증
   - 중복 보상 요청 방지

4. **보상 내역 관리**
   - 유저별 보상 요청 이력
   - 관리자/감사자의 보상 내역 조회
   - 보상 상태 추적 (요청됨, 검증됨, 지급됨, 거부됨)

## 디자인 패턴 적용

### 전략 패턴 (Strategy Pattern)
1. **이벤트 조건 검증**
   - `ConditionValidator` 인터페이스와 구현체
   - 출석일수, 몬스터 처치, 친구 초대 등 다양한 조건
   - `ConditionValidatorFactory`를 통한 검증기 생성

2. **보상 처리**
   - `RewardProcessor` 인터페이스와 구현체
   - 포인트, 아이템, 쿠폰 등 다양한 보상 처리
   - `RewardProcessorFactory`를 통한 처리기 생성

## 역할 기반 권한 관리
- USER: 보상 요청 가능
- OPERATOR: 이벤트/보상 등록 관리
- AUDITOR: 보상 이력 조회만 가능
- ADMIN: 모든 기능 접근 가능

## 실행 방법

### 요구사항
- Docker & Docker Compose
- Node.js 18+ (개발 시)

### 환경 변수 설정
각 서비스별로 필요한 환경 변수를 설정하거나 기본값 사용:

**공통 환경 변수**
```
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1h
```

**MongoDB 연결 정보**
```
MONGODB_URI=mongodb://mongodb:27017/[service-name]
```

### 실행 명령어
```bash
# 전체 서비스 실행 (프로덕션 환경)
docker-compose up -d

# 개별 서비스 실행 (프로덕션 환경)
docker-compose up -d gateway
docker-compose up -d auth
docker-compose up -d event

# 개발 환경 실행 (코드 변경 시 자동 반영)
docker-compose -f docker-compose.dev.yml up --build

# 로그 확인
docker-compose logs -f
```

### 서비스 접속 정보
- Gateway API: http://localhost:3003
- Auth API: http://localhost:3004
- Event API: http://localhost:3005
- Swagger 문서: 
  - http://localhost:3003/api (Gateway)
  - http://localhost:3004/api (Auth)
  - http://localhost:3005/api (Event)

## 확장성 및 유지보수

### 새로운 이벤트 조건 추가
`ConditionType` 열거형에 새 조건 추가 후, 해당 조건의 검증기를 구현합니다:

```typescript
// 1. 새 조건 유형 추가
export enum ConditionType {
  // 기존 유형들...
  NEW_CONDITION = 'NEW_CONDITION',
}

// 2. 검증기 구현
@Injectable()
export class NewConditionValidator implements ConditionValidator {
  validate(userId: string, eventId: string, conditionData: any): Promise<boolean> {
    // 검증 로직 구현
  }
}

// 3. 팩토리에 등록
// condition-validator.factory.ts 내부에 추가
this.validators.set(ConditionType.NEW_CONDITION, this.newConditionValidator);
```

### 새로운 보상 유형 추가
`RewardType` 열거형에 새 보상 추가 후, 해당 보상의 처리기를 구현합니다:

```typescript
// 1. 새 보상 유형 추가
export enum RewardType {
  // 기존 유형들...
  NEW_REWARD = 'NEW_REWARD',
}

// 2. 처리기 구현
@Injectable()
export class NewRewardProcessor implements RewardProcessor {
  process(userId: string, rewardData: any): Promise<boolean> {
    // 보상 처리 로직 구현
  }
}

// 3. 팩토리에 등록
// reward-processor.factory.ts 내부에 추가
this.processors.set(RewardType.NEW_REWARD, this.newRewardProcessor);
```

## 개발 고려사항

개발 과정에서 아래 사항들을 고려하여 설계했습니다:

1. **확장성**: 전략 패턴을 활용하여 새로운 이벤트 조건이나 보상 유형을 쉽게 추가할 수 있도록 설계
2. **보안**: JWT 기반 인증과 역할 기반 접근 제어로 보안 강화
3. **유지보수성**: 마이크로서비스 아키텍처와 모듈화된 구조로 코드 유지보수 용이
4. **확장 가능한 비즈니스 로직**: 다양한 이벤트 조건과 보상 처리를 지원할 수 있는 유연한 구조

4. **개발 중 마주한 이슈 및 고민**
   - **MongoDB 권한 문제**: Docker Compose로 MongoDB 컨테이너 실행 시 "Operation not permitted" 오류가 발생하여, 컨테이너의 권한 설정(cap_add, security_opt, ulimits) 및 익명 볼륨 사용을 통해 해결했습니다.
   - **코드 중복 및 모노레포 고려**: 서비스 간 반복되는 코드(DTO, Enum 등)가 발생하여, Turbo와 같은 도구를 활용한 모노레포 구조로의 전환을 고려했고, 시도하였으나 swagger에 사용되는 DTO와 예시 데이터가 제대로 표시되지 않아 현재는 개별 서비스 구조를 유지하고 있습니다. 향후 프로젝트 규모가 커지면 모노레포 도입을 검토할 수 있습니다.
   - **Event Service MODULE_NOT_FOUND 오류**: `docker-compose.dev.yml` 사용 시 `event-service`에서 모듈을 찾을 수 없는 오류가 발생했습니다. 이는 개발 환경의 볼륨 마운트 설정이 Dockerfile 빌드 결과를 덮어쓰면서 발생한 문제였습니다. `docker-compose.dev.yml`의 `event` 서비스 `volumes`에 익명 볼륨 `/app/event/dist`를 추가하고 `command`를 `npm run start:prod`로 변경하여 해결했습니다.

이 시스템은 실제 프로덕션 환경에서도 활용 가능하도록 설계되었으며, 필요에 따라 기능을 확장할 수 있는 기반을 갖추고 있습니다.
