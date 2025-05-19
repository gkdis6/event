import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Param,
  Query,
  Inject,
  HttpStatus,
  HttpException,
  All,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateEventDto } from '../dto/event/create-event.dto';
import { RequestRewardDto } from '../dto/reward/request-reward.dto';
import { UserContextInterceptor } from '../interceptors/user-context.interceptor';
import { AuthCheckInterceptor } from '../interceptors/auth-check.interceptor';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { TimeoutError } from 'rxjs';

/**
 * 이벤트 컨트롤러
 * 
 * 이벤트와 보상 관련 요청을 처리하는 컨트롤러입니다.
 * 모든 요청은 인증 서비스의 권한 검사를 통과한 후 이벤트 서비스로 전달됩니다.
 */
@ApiTags('events')
@Controller('events')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor, AuthCheckInterceptor)
export class EventController {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: '이벤트 목록 조회', description: '모든 이벤트 목록을 조회합니다.' })
  @ApiQuery({ name: 'status', required: false, description: '이벤트 상태로 필터링' })
  getAllEvents(@Request() req: any, @Query() query: any): Observable<any> {
    // Include user info in the request to filter events by user if needed
    const payload = {
      ...query,
      userId: req.user?.sub,
    };
    
    return this.eventClient
      .send({ cmd: 'get-all-events' }, payload)
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Event service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Event service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  @Get(':id')
  @ApiOperation({ summary: '이벤트 상세 조회', description: '특정 이벤트의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'id', description: '이벤트 ID' })
  getEvent(@Param('id') id: string): Observable<any> {
    return this.eventClient
      .send({ cmd: 'get-event' }, { id })
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Event service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Event service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  @Post()
  @ApiOperation({ summary: '이벤트 생성', description: '새로운 이벤트를 생성합니다.' })
  @ApiBody({ type: CreateEventDto, description: '이벤트 생성 정보' })
  createEvent(@Request() req: any, @Body() eventData: CreateEventDto): Observable<any> {
    // Include user who created the event
    const payload = {
      ...eventData,
      createdBy: req.user.sub,
    };
    
    return this.eventClient
      .send({ cmd: 'create-event' }, payload)
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Event service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Event service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  @Put(':id')
  @ApiOperation({ summary: '이벤트 수정', description: '이벤트 정보를 수정합니다.' })
  @ApiParam({ name: 'id', description: '수정할 이벤트 ID' })
  @ApiBody({ type: CreateEventDto, description: '수정할 이벤트 정보' })
  updateEvent(@Request() req: any, @Param('id') id: string, @Body() eventData: Partial<CreateEventDto>): Observable<any> {
    // Include user context for authorization check in the microservice
    const payload = {
      id,
      ...eventData,
      updatedBy: req.user.sub,
    };
    
    return this.eventClient
      .send({ cmd: 'update-event' }, payload)
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Event service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Event service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  @Delete(':id')
  @ApiOperation({ summary: '이벤트 삭제', description: '특정 이벤트를 삭제합니다.' })
  @ApiParam({ name: 'id', description: '삭제할 이벤트 ID' })
  deleteEvent(@Request() req: any, @Param('id') id: string): Observable<any> {
    // Include user for authorization checks
    const payload = {
      id,
      deletedBy: req.user.sub,
    };
    
    return this.eventClient
      .send({ cmd: 'delete-event' }, payload)
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Event service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Event service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  @Post(':id/rewards/request')
  @ApiOperation({ summary: '보상 요청', description: '이벤트 보상을 요청합니다.' })
  @ApiParam({ name: 'id', description: '이벤트 ID' })
  @ApiBody({ type: RequestRewardDto, description: '보상 요청 정보' })
  requestReward(@Request() req: any, @Param('id') eventId: string, @Body() requestData: RequestRewardDto): Observable<any> {
    // Include the user requesting the reward
    const payload = {
      eventId,
      ...requestData,
      userId: req.user.sub,
    };
    
    return this.eventClient
      .send({ cmd: 'request-reward' }, payload)
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Event service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Event service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  // Catch all other routes and proxy them to event service
  // @All('*')
  // @ApiOperation({ summary: '기타 요청 프록시', description: '정의되지 않은 나머지 모든 요청을 이벤트 서비스로 전달합니다.' })
  // proxyAll(@Request() req: any, @Param('path') path: string, @Body() body: any): Observable<any> {
  //   // Include user context
  //   const payload = {
  //     ...body,
  //     user: req.user,
  //     path,
  //   };
  //
  //   return this.eventClient
  //     .send({ cmd: 'proxy', path }, payload)
  //     .pipe(
  //       timeout(5000),
  //       catchError(err => {
  //         if (err instanceof TimeoutError) {
  //           throw new HttpException('Event service timeout', HttpStatus.GATEWAY_TIMEOUT);
  //         }
  //         throw new HttpException(err.message || 'Event service error', HttpStatus.BAD_GATEWAY);
  //       })
  //     );
  // }
}
