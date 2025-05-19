import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // HTTP 애플리케이션 생성
  const app = await NestFactory.create(AppModule);
  
  // 글로벌 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정
  app.enableCors();

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('이벤트/보상 관리 API - 인증 서비스')
    .setDescription('Auth API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 환경 변수에서 설정 가져오기
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3004;
  const microservicePort = configService.get<number>('MICROSERVICE_PORT') || 3104;
  
  // 마이크로서비스 설정
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // 모든 인터페이스에서 수신
      port: microservicePort,
    },
  });

  // 마이크로서비스 시작
  await app.startAllMicroservices();
  
  // HTTP 서버 시작
  await app.listen(port);
  console.log(`Auth Service is running on HTTP port ${port} and TCP port ${microservicePort}`);
}
bootstrap();
