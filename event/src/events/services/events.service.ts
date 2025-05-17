import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateEventDto } from '../dto/create-event.dto';
import { ConditionValidatorFactory } from '../../conditions/factories/condition-validator.factory';
import { EventStatus } from '../../common/enums/event-status.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly conditionValidatorFactory: ConditionValidatorFactory,
  ) {}

  /**
   * 새 이벤트 생성
   */
  async create(createEventDto: CreateEventDto, operatorId: string): Promise<EventDocument> {
    // 조건 유형에 맞는 Validator가 있는지 확인
    const validator = this.conditionValidatorFactory.getValidator(createEventDto.conditionType);

    // 새 이벤트 생성
    const createdEvent = new this.eventModel({
      ...createEventDto,
      status: EventStatus.DRAFT, // 초기 상태는 DRAFT
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      createdBy: operatorId,
    });

    return createdEvent.save();
  }

  /**
   * 모든 이벤트 조회 (삭제되지 않은 것만)
   */
  async findAll(status?: EventStatus): Promise<EventDocument[]> {
    const query: any = { isDeleted: false };
    
    if (status) {
      query.status = status;
    }
    
    return this.eventModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * ID로 이벤트 조회
   */
  async findById(id: string): Promise<EventDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 이벤트 ID입니다');
    }

    const event = await this.eventModel.findOne({
      _id: id,
      isDeleted: false
    }).exec();
    
    if (!event) {
      throw new NotFoundException(`ID가 ${id}인 이벤트를 찾을 수 없습니다`);
    }
    
    return event;
  }

  /**
   * 이벤트 상태 업데이트
   */
  async updateStatus(id: string, status: EventStatus): Promise<EventDocument> {
    const event = await this.findById(id);
    event.status = status;
    return event.save();
  }

  /**
   * 이벤트 정보 업데이트
   */
  async update(id: string, updateEventDto: Partial<CreateEventDto>): Promise<EventDocument> {
    const event = await this.findById(id);
    
    // 시작일, 종료일 형식 변환
    if (updateEventDto.startDate) {
      updateEventDto.startDate = new Date(updateEventDto.startDate) as any;
    }
    if (updateEventDto.endDate) {
      updateEventDto.endDate = new Date(updateEventDto.endDate) as any;
    }
    
    // 조건 유형이 변경된 경우, 유효한지 확인
    if (updateEventDto.conditionType && updateEventDto.conditionType !== event.conditionType) {
      this.conditionValidatorFactory.getValidator(updateEventDto.conditionType);
    }
    
    // 업데이트 적용
    Object.assign(event, updateEventDto);
    return event.save();
  }

  /**
   * 이벤트 삭제 (soft delete)
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.eventModel.updateOne(
      { _id: id },
      { isDeleted: true }
    ).exec();
    
    return result.modifiedCount > 0;
  }

  /**
   * 특정 이벤트의 조건을 충족하는지 검증
   */
  async validateCondition(userId: string, eventId: string): Promise<boolean> {
    const event = await this.findById(eventId);
    
    // 이벤트가 활성 상태인지 확인
    if (event.status !== EventStatus.ACTIVE) {
      return false;
    }
    
    // 이벤트 기간이 유효한지 확인
    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      return false;
    }
    
    // 이벤트 조건 유형에 맞는 Validator 가져와서 검증
    const validator = this.conditionValidatorFactory.getValidator(event.conditionType);
    return validator.validate(userId, eventId.toString(), event.conditionData);
  }
}
