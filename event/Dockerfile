FROM node:18-alpine

# 작업 디렉토리 생성
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 서비스 실행 명령
CMD ["node", "dist/main.js"]
