import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

/**
 * 권한 모듈
 * 
 * 게이트웨이로부터 오는 권한 검증 요청을 처리합니다.
 */
@Module({
  imports: [UsersModule],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
