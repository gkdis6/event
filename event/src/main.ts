import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 마이크로서비스 설정 추가
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      port: 3005,
    },
  });
  
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
    .setTitle('이벤트/보상 관리 API - 이벤트 서비스')
    .setDescription('Event API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 환경 변수에서 포트 설정 가져오기
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3005;
  
  // 마이크로서비스 시작
  await app.startAllMicroservices();
  console.log(`Event Service Microservice is running on port 3005`);
  
  // HTTP 서버 시작
  await app.listen(port);
  console.log(`Event Service HTTP is running on port ${port}`);
}
bootstrap();
