import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  Inject, // Inject 데코레이터 추가
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventStatus } from '../../common/enums/event-status.enum';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../decorators/roles.decorator';
import { MessagePattern } from '@nestjs/microservices';
import { RewardsService } from '../../rewards/services/rewards.service'; // RewardsService 임포트

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly rewardsService: RewardsService, // RewardsService 주입
  ) {}

  @Post()
  @ApiBearerAuth()
  @Roles('OPERATOR', 'ADMIN')
  @ApiOperation({ summary: '새 이벤트 생성' })
  async create(@Body() createEventDto: CreateEventDto, @Request() req) {
    console.log(`이벤트 생성 요청: ${JSON.stringify(createEventDto)}`);
    console.log(`조건 타입: ${createEventDto.conditionType}`);
    console.log(`조건 데이터: ${JSON.stringify(createEventDto.conditionData)}`);
    
    try {
      const result = await this.eventsService.create(createEventDto, req.user.sub);
      console.log(`이벤트 생성 성공: ${result.id}`);
      return result;
    } catch (error) {
      console.error(`이벤트 생성 실패: ${error.message}`);
      throw error;
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '이벤트 목록 조회' })
  @ApiQuery({ name: 'status', enum: EventStatus, required: false })
  async findAll(@Query('status') status?: EventStatus) {
    return this.eventsService.findAll(status);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '이벤트 상세 조회' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('OPERATOR', 'ADMIN')
  @ApiOperation({ summary: '이벤트 정보 업데이트' })
  async update(@Param('id') id: string, @Body() updateEventDto: Partial<CreateEventDto>) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @Roles('OPERATOR', 'ADMIN')
  @ApiOperation({ summary: '이벤트 상태 업데이트' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EventStatus,
  ) {
    return this.eventsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '이벤트 삭제' })
  async remove(@Param('id') id: string) {
    return { success: await this.eventsService.remove(id) };
  }

  @MessagePattern({ cmd: 'get-all-events' })
  async getAllEventsMessage(data: any) {
    const { status } = data;
    return this.eventsService.findAll(status);
  }

  @MessagePattern({ cmd: 'get-event' })
  async getEventMessage(data: { id: string }) {
    const { id } = data;
    return this.eventsService.findById(id);
  }

  @MessagePattern({ cmd: 'create-event' })
  async createEventMessage(data: any) {
    const { createdBy, ...createEventDto } = data;
    return this.eventsService.create(createEventDto, createdBy);
  }

  @MessagePattern({ cmd: 'update-event' })
  async updateEventMessage(data: any) {
    const { id, updatedBy, ...updateEventDto } = data;
    return this.eventsService.update(id, updateEventDto);
  }

  @MessagePattern({ cmd: 'delete-event' })
  async deleteEventMessage(data: { id: string; deletedBy: string }) {
    const { id } = data;
    return { success: await this.eventsService.remove(id) };
  }

  @MessagePattern({ cmd: 'request-reward' })
  async requestRewardMessage(data: any) {
    const { eventId, userId, ...requestRewardDto } = data;
    
    // 보상 요청 생성
    const rewardRequest = await this.rewardsService.createRewardRequest({ eventId, ...requestRewardDto }, userId);

    // 보상 요청 처리 (비동기적으로 처리될 수 있습니다)
    // 여기서는 간단히 생성 후 바로 처리하도록 구현합니다.
    // 실제 시스템에서는 큐 등을 사용하여 비동기적으로 처리하는 것이 일반적입니다.
    // createRewardRequest의 결과는 Document 타입이므로 캐스팅합니다.
    this.rewardsService.processRewardRequest(rewardRequest) // 임시로 any로 캐스팅
      .catch(error => {
        console.error(`Error processing reward request ${rewardRequest._id}:`, error);
        // 오류 처리 로직 추가 (예: 요청 상태를 실패로 업데이트)
      });

    return {
      success: true,
      message: '보상 요청이 접수되었습니다.',
      rewardRequest,
    };
  }

  /**
   * 특정 사용자가 참여 중인 이벤트 목록과 달성률 조회
   * @param data.userId 사용자 ID
   */
  @MessagePattern({ cmd: 'get-participating-events' })
  async getParticipatingEvents(data: { userId: string }) {
    try {
      const events = await this.eventsService.findParticipatingEventsWithCompletionRate(data.userId);
      return {
        success: true,
        message: '참여 중인 이벤트 목록 조회 성공',
        events,
      };
    } catch (error) {
      console.error(`참여 중인 이벤트 조회 중 오류 발생: ${error.message}`);
      return {
        success: false,
        message: error.message || '참여 중인 이벤트 조회 중 오류가 발생했습니다.',
        statusCode: error.status || 500,
      };
    }
  }

  // @MessagePattern({ cmd: 'proxy' })
  // async proxyMessage(data: any) {
  //   // path와 기타 데이터에 따라 적절한 서비스 메소드로 라우팅
  //   throw new Error('Proxy pattern not implemented yet'); // 임시 구현
  // }

  @MessagePattern('validate_event_condition')
  async validateCondition(data: { userId: string; eventId: string }) {
    const { userId, eventId } = data;
    return this.eventsService.validateCondition(userId, eventId);
  }
}
