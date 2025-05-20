FROM node:18-alpine

# 작업 디렉토리 생성
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY . .
RUN npm install

# 애플리케이션 빌드
RUN npm run build

# TCP 마이크로서비스 포트 노출
EXPOSE 3104
