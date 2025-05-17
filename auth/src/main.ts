import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
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

  // 환경 변수에서 포트 설정 가져오기
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3004;
  
  await app.listen(port);
  console.log(`Auth Service is running on port ${port}`);
}
bootstrap();
