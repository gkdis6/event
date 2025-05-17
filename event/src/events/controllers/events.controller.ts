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
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventStatus } from '../../common/enums/event-status.enum';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../decorators/roles.decorator';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('OPERATOR', 'ADMIN')
  @ApiOperation({ summary: '새 이벤트 생성' })
  async create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.sub);
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

  @MessagePattern('validate_event_condition')
  async validateCondition(data: { userId: string; eventId: string }) {
    const { userId, eventId } = data;
    return this.eventsService.validateCondition(userId, eventId);
  }
}
